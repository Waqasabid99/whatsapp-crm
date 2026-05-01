/**
 * whatsappSend.controller.js
 *
 * Handles all outbound message delivery to WhatsApp via Meta's Cloud API.
 * Called from messages_controller.js (REST) and socket.js (WebSocket).
 * NOT a controller — no req/res — just a reusable async service.
 */

import axios from "axios";
import { prisma } from "../db.js";
import { emitMessageStatusUpdate } from "../socket.js";

const GRAPH_API_VERSION = "v24.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

// ─────────────────────────────────────────────────────────────────────────────
// Core sender — resolves credentials from DB, calls Meta, updates message status
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Send a plain-text or media message outbound via WhatsApp Cloud API.
 *
 * @param {object} opts
 * @param {string} opts.messageId        - DB Message.id (already saved as SENT)
 * @param {string} opts.conversationId
 * @param {string} opts.workspaceId
 * @param {string} opts.toPhoneNumber    - E.164 recipient number
 * @param {string|null} opts.text        - Plain text body (optional if media)
 * @param {object|null} opts.payload     - Raw payload override (for templates etc.)
 * @param {object|null} opts.io          - Socket.io instance for status broadcasts
 * @returns {Promise<{success: boolean, providerMessageId?: string, error?: string}>}
 */
export const sendWhatsAppMessage = async ({
  messageId,
  conversationId,
  workspaceId,
  toPhoneNumber,
  text,
  payload = null,
  io = null,
}) => {
  try {
    // ── 1. Load the workspace's active WhatsApp account ──────────────────────
    const whatsappAccount = await prisma.whatsAppAccount.findFirst({
      where: { workspaceId, status: "connected" },
      orderBy: { createdAt: "asc" },
    });

    if (!whatsappAccount) {
      throw new Error("No connected WhatsApp account found for this workspace");
    }

    const accessToken = whatsappAccount.credentials?.accessToken;
    const phoneNumberId = whatsappAccount.phoneNumberId;

    if (!accessToken || !phoneNumberId) {
      throw new Error("WhatsApp account is missing credentials or phoneNumberId");
    }

    // ── 2. Build the Meta API request body ───────────────────────────────────
    let requestBody;

    if (payload?.templateId) {
      // Template message — payload was built in sendTemplateMessage controller
      requestBody = buildTemplatePayload(toPhoneNumber, payload);
    } else if (text) {
      // Plain text message
      requestBody = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: toPhoneNumber,
        type: "text",
        text: { body: text, preview_url: false },
      };
    } else {
      throw new Error("No text or template payload to send");
    }

    // ── 3. POST to Meta Cloud API ─────────────────────────────────────────────
    const response = await axios.post(
      `${GRAPH_BASE}/${phoneNumberId}/messages`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const providerMessageId = response.data?.messages?.[0]?.id;

    // ── 4. Update DB: stamp providerMessageId + status SENT ──────────────────
    await prisma.message.update({
      where: { id: messageId },
      data: {
        providerMessageId,
        status: "SENT",
        sentAt: new Date(),
      },
    });

    // ── 5. Broadcast status update to staff ───────────────────────────────────
    if (io) {
      emitMessageStatusUpdate(io, workspaceId, messageId, "SENT", new Date());
    }

    console.log(`[WhatsApp] Message sent: ${messageId} → provider ID ${providerMessageId}`);
    return { success: true, providerMessageId };

  } catch (error) {
    const errMsg =
      error.response?.data?.error?.message || error.message || "Unknown error";

    console.error(`[WhatsApp] Failed to send message ${messageId}:`, errMsg);

    // ── Mark message as FAILED in DB ─────────────────────────────────────────
    try {
      await prisma.message.update({
        where: { id: messageId },
        data: {
          status: "FAILED",
          failedAt: new Date(),
          error: errMsg,
        },
      });

      if (io) {
        emitMessageStatusUpdate(io, workspaceId, messageId, "FAILED", new Date());
      }
    } catch (dbErr) {
      console.error("[WhatsApp] Could not mark message as FAILED:", dbErr.message);
    }

    return { success: false, error: errMsg };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Template message sender (convenience wrapper)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Send an approved WhatsApp template message.
 * Resolves the template from DB, builds the payload, and calls sendWhatsAppMessage.
 *
 * @param {object} opts
 * @param {string} opts.messageId
 * @param {string} opts.conversationId
 * @param {string} opts.workspaceId
 * @param {string} opts.toPhoneNumber
 * @param {string} opts.templateId       - DB Template.id
 * @param {object[]} opts.variables       - Array of variable substitutions
 * @param {object|null} opts.io
 */
export const sendWhatsAppTemplate = async ({
  messageId,
  conversationId,
  workspaceId,
  toPhoneNumber,
  templateId,
  variables = [],
  io = null,
}) => {
  const template = await prisma.template.findFirst({
    where: { id: templateId, workspaceId, status: "APPROVED" },
  });

  if (!template) {
    throw new Error("Template not found or not approved");
  }

  const payload = {
    templateId,
    templateName: template.name,
    language: template.language || "en_US",
    components: template.components,
    variables,
  };

  return sendWhatsAppMessage({
    messageId,
    conversationId,
    workspaceId,
    toPhoneNumber,
    text: null,
    payload,
    io,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Payload builders
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a Meta-compatible template message body.
 * Assumes variables is an array like: [{ type: "text", text: "John" }, ...]
 */
const buildTemplatePayload = (toPhoneNumber, payload) => {
  const components = [];

  if (payload.variables && payload.variables.length > 0) {
    components.push({
      type: "body",
      parameters: payload.variables.map((v) =>
        typeof v === "string" ? { type: "text", text: v } : v
      ),
    });
  }

  return {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: toPhoneNumber,
    type: "template",
    template: {
      name: payload.templateName,
      language: { code: payload.language || "en_US" },
      components,
    },
  };
};