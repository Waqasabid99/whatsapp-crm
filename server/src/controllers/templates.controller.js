import axios from "axios";
import { prisma } from "../db.js";

const WABA_ID = process.env.WHATSAPP_WABA_ID;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;

const api = axios.create({
  baseURL: `https://graph.facebook.com/v24.0`,
  headers: {
    Authorization: `Bearer ${WHATSAPP_TOKEN}`,
    "Content-Type": "application/json"
  }
});

// Helper: extract placeholders from components (looks for BODY component)
const extractPlaceholders = (components) => {
  const body = Array.isArray(components)
    ? components.find(c => c.type === "BODY")
    : null;
  return [...new Set(body?.text?.match(/{{\d+}}/g) || [])];
};

// Helper: derive TemplateType enum from components
const deriveTemplateType = (components) => {
  if (!Array.isArray(components)) return "TEXT";
  const types = components.map(c => c.type?.toUpperCase());
  if (types.includes("BUTTONS")) return "BUTTON";
  if (types.includes("QUICK_REPLY")) return "REPLY";
  if (types.some(t => ["IMAGE", "VIDEO", "DOCUMENT", "HEADER"].includes(t))) return "MEDIA";
  return "TEXT";
};

// Helper: map WhatsApp status string to TemplateStatus enum
const mapStatus = (waStatus) => {
  if (waStatus === "APPROVED") return "APPROVED";
  if (waStatus === "REJECTED") return "REJECTED";
  return "PENDING";
};

// Create Template
const createTemplate = async (req, res) => {
  try {
    const { name, language, category, components } = req.body;
    const workspaceId = req.user.workspaceId;

    if (!name || !language || !category || !components)
      return res.status(400).json({ success: false, message: "Missing fields." });

    if (!Array.isArray(components))
      return res.status(400).json({ success: false, message: "Invalid components format." });

    // Extract placeholders and store in `variables` (schema field)
    const placeholders = extractPlaceholders(components);
    const templateType = deriveTemplateType(components);

    const template = await prisma.template.create({
      data: {
        name,
        language,
        category,
        components,
        variables: placeholders.length ? placeholders : null, // schema field is `variables Json?`
        type: templateType,                                    // TemplateType enum
        status: "PENDING",                                     // TemplateStatus enum default
        workspaceId,
        createdById: req.user.id
      }
    });

    res.status(201).json({ success: true, message: "Template draft created.", template });
  } catch (err) {
    console.error("CREATE TEMPLATE ERROR:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// Submit Template for Approval
const submitToWhatsapp = async (req, res) => {
  try {
    const { templateId } = req.params;
    const template = await prisma.template.findUnique({ where: { id: templateId } });

    if (!template) return res.status(404).json({ success: false, message: "Template not found." });

    const payload = {
      name: template.name.toLowerCase().replace(/\s/g, "_"),
      category: template.category,
      language: template.language.replace("-", "_"),
      components: template.components
    };

    const response = await api.post(`/${WABA_ID}/message_templates`, payload);

    await prisma.template.update({
      where: { id: templateId },
      data: { providerTemplateId: response.data.id }
    });

    res.json({ success: true, message: "Template submitted.", providerId: response.data.id });
  } catch (err) {
    console.error("SUBMIT TEMPLATE ERROR:", err?.response?.data || err);
    res.status(500).json({ success: false, message: "WhatsApp API error.", error: err.response?.data });
  }
};

// Webhook for Status Update
const handleWebhook = async (req, res) => {
  try {
    const entry = req.body?.entry?.[0];
    if (!entry) return res.sendStatus(200);

    for (const change of entry.changes || []) {
      const providerTemplateId = change.value?.message_template_id;
      const event = change.value?.event;           // e.g. "APPROVED" | "REJECTED"
      const reason = change.value?.reason ?? null; // rejection reason if present

      if (!providerTemplateId) continue;

      const newStatus = mapStatus(event);

      // Update the template using the correct `status` enum and `rejectionReason` fields
      await prisma.template.updateMany({
        where: { providerTemplateId: String(providerTemplateId) },
        data: {
          status: newStatus,
          rejectionReason: newStatus === "REJECTED" ? reason : null
        }
      });

      // Find the workspace that owns this template so we can attach it to WebhookEvent
      const template = await prisma.template.findFirst({
        where: { providerTemplateId: String(providerTemplateId) },
        select: { workspaceId: true }
      });

      if (template) {
        await prisma.webhookEvent.create({
          data: {
            workspaceId: template.workspaceId,   // required non-nullable field
            provider: "WHATSAPP_CLOUD",           // required Provider enum
            eventType: "template_status_update",  // correct field name (was `type`)
            payload: change.value,
            status: "processed"
          }
        });
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("WEBHOOK ERROR:", err);
    res.sendStatus(200);
  }
};

// Sync Templates from WhatsApp
const syncTemplatesFromWhatsapp = async (req, res) => {
  try {
    const r = await api.get(`/${WABA_ID}/message_templates`);
    const templates = r.data.data || [];

    for (const t of templates) {
      const placeholders = extractPlaceholders(t.components); // uses BODY component correctly
      const templateType = deriveTemplateType(t.components);
      const templateStatus = mapStatus(t.status);

      await prisma.template.upsert({
        where: { providerTemplateId: t.id },
        update: {
          status: templateStatus,                              // TemplateStatus enum (not `approved`)
          components: t.components,
          rejectionReason: templateStatus === "REJECTED"
            ? (t.rejected_reason ?? null)
            : null
        },
        create: {
          providerTemplateId: t.id,
          name: t.name,
          language: t.language,
          category: t.category,                              // was missing — non-nullable field
          components: t.components,
          variables: placeholders.length ? placeholders : null, // correct field (was `placeholders`)
          type: templateType,                                // TemplateType enum (was missing)
          status: templateStatus,                            // TemplateStatus enum (was `approved: bool`)
          rejectionReason: templateStatus === "REJECTED"
            ? (t.rejected_reason ?? null)
            : null,
          workspaceId: req.user.workspaceId
        }
      });
    }

    res.json({ success: true, message: "Synced", count: templates.length });
  } catch (err) {
    console.error("SYNC ERROR:", err?.response?.data || err);
    res.status(500).json({ success: false, message: "Sync failed.", error: err.response?.data });
  }
};

// Send Message using Template
const sendTemplateMessage = async (req, res) => {
  try {
    const { to, templateName, parameters = [], language = "en_US" } = req.body;

    const payload = {
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: templateName,
        language: { code: language },
        components: [{ type: "body", parameters: parameters.map(v => ({ type: "text", text: v })) }]
      }
    };

    const r = await api.post("/messages", payload);
    res.json({ success: true, message: "Sent", data: r.data });
  } catch (err) {
    console.error("SEND ERROR:", err?.response?.data || err);
    res.status(500).json({ success: false, error: err.response?.data });
  }
};

// Get All Templates
const getTemplates = async (req, res) => {
  try {
    const templates = await prisma.template.findMany({
      where: { workspaceId: req.user.workspaceId },
      orderBy: { createdAt: "desc" }
    });

    res.json({ success: true, templates });
  } catch {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// Delete Template
const deleteTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;

    // Ownership check: ensure the template belongs to the requesting workspace
    const template = await prisma.template.findFirst({
      where: {
        id: templateId,
        workspaceId: req.user.workspaceId   // security fix: was missing entirely
      }
    });

    if (!template)
      return res.status(404).json({ success: false, message: "Template not found." });

    await prisma.template.delete({ where: { id: templateId } });
    res.json({ success: true, message: "Deleted" });
  } catch {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

export {
  createTemplate,
  submitToWhatsapp,
  handleWebhook,
  syncTemplatesFromWhatsapp,
  sendTemplateMessage,
  getTemplates,
  deleteTemplate
};