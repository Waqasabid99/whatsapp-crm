/**
 * Build the WhatsApp Cloud API template message payload.
 *
 * Maps stored template components (from DB / Meta template sync) into the
 * correct format for the /messages endpoint.
 *
 * Supported:
 *   • BODY     — text with {{variables}}
 *   • HEADER   — text | image | video | document | location
 *   • FOOTER   — static text (no variables per Meta spec)
 *   • BUTTONS  — quick_reply | url | phone_number | copy_code | flow | mpms
 *
 * @param {string} toPhoneNumber  – E.164 phone number
 * @param {object} template       – Prisma Template row (with components[], name, language)
 * @param {object} variables      – { "1": "John", "2": "Order #123" }  (1-based keys)
 * @param {object} attachments    – Optional header media overrides { image: { link: "..." } }
 */
export const buildTemplatePayload = ({ toPhoneNumber, template, variables = {}, attachments = {} }) => {
    const components = [];

    if (!Array.isArray(template?.components)) {
        throw new Error("Template components missing or invalid");
    }

    // ── 1. BODY (variables resolved) ──────────────────────────────────────────
    const bodyComp = template.components.find((c) => c.type === "BODY");
    if (bodyComp) {
        const params = resolveComponentParameters(bodyComp, variables, "body");
        if (params.length > 0) {
            components.push({ type: "body", parameters: params });
        }
    }

    // ── 2. HEADER (text | image | video | document | location) ────────────────
    const headerComp = template.components.find((c) => c.type === "HEADER");
    if (headerComp) {
        const params = buildHeaderParameters(headerComp, variables, attachments);
        if (params.length > 0) {
            components.push({ type: "header", parameters: params });
        }
    }

    // ── 3. FOOTER (static text only — no variables per Meta spec) ─────────────
    const footerComp = template.components.find((c) => c.type === "FOOTER");
    if (footerComp) {
        // Meta's send API accepts footer but ignores parameters; we include it
        // only if the template definition requires it (some templates have no footer)
        components.push({ type: "footer", parameters: [] });
    }

    // ── 4. BUTTONS (quick_reply | url | phone_number | copy_code | flow | mpms)
    const buttonComps = template.components.filter((c) => c.type === "BUTTONS");
    for (const btnComp of buttonComps) {
        if (!Array.isArray(btnComp.buttons)) continue;

        for (const btn of btnComp.buttons) {
            const btnParam = buildButtonParameter(btn, variables);
            if (btnParam) {
                components.push({
                    type: "button",
                    sub_type: btnParam.sub_type,
                    index: btnParam.index,
                    parameters: btnParam.parameters,
                });
            }
        }
    }

    return {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: toPhoneNumber,
        type: "template",
        template: {
            name: template.name,
            language: { code: template.language || "en_US" },
            components,
        },
    };
};

// ─────────────────────────────────────────────────────────────────────────────
// Parameter Resolvers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolve {{N}} placeholders in a component's text using 1-based variable keys.
 * Returns an array of Meta parameter objects.
 */
export const resolveComponentParameters = (comp, variables, _componentType) => {
    if (!comp?.text) return [];

    // Extract all {{1}}, {{2}}, etc. in order of appearance
    const placeholders = [...comp.text.matchAll(/\{\{(\d+)\}\}/g)];
    if (placeholders.length === 0) return [];

    return placeholders.map(([, key]) => {
        const value = variables[key] ?? "";
        return { type: "text", text: String(value) };
    });
};

/**
 * Build header parameters based on format type.
 */
export const buildHeaderParameters = (headerComp, variables, attachments) => {
    const format = headerComp.format?.toUpperCase();

    // If caller provided an attachment override, use it (e.g. dynamic image per recipient)
    if (attachments.image && ["IMAGE", "TEXT"].includes(format)) {
        return [{ type: "image", image: attachments.image }];
    }
    if (attachments.video && ["VIDEO", "TEXT"].includes(format)) {
        return [{ type: "video", video: attachments.video }];
    }
    if (attachments.document && ["DOCUMENT", "TEXT"].includes(format)) {
        return [{ type: "document", document: attachments.document }];
    }

    switch (format) {
        case "TEXT": {
            return resolveComponentParameters(headerComp, variables, "header");
        }
        case "IMAGE": {
            // For static images defined in template, Meta requires the URL in parameters
            // If stored in comp.example, extract it; otherwise expect caller to provide attachments
            const url = headerComp.example?.header_handle?.[0] || headerComp.example?.header_url?.[0];
            if (!url) throw new Error("Header IMAGE requires a URL (provide via attachments.image.link)");
            return [{ type: "image", image: { link: url } }];
        }
        case "VIDEO": {
            const url = headerComp.example?.header_handle?.[0] || headerComp.example?.header_url?.[0];
            if (!url) throw new Error("Header VIDEO requires a URL (provide via attachments.video.link)");
            return [{ type: "video", video: { link: url } }];
        }
        case "DOCUMENT": {
            const url = headerComp.example?.header_handle?.[0] || headerComp.example?.header_url?.[0];
            if (!url) throw new Error("Header DOCUMENT requires a URL (provide via attachments.document.link)");
            return [{ type: "document", document: { link: url, filename: headerComp.example?.filename || "document.pdf" } }];
        }
        case "LOCATION": {
            // Location headers are static in template; no variables
            return [];
        }
        default:
            // Unknown format — attempt text fallback
            return resolveComponentParameters(headerComp, variables, "header");
    }
};

/**
 * Build button parameter for send API.
 * Only certain button types require parameters at send time.
 */
export const buildButtonParameter = (btn, variables) => {
    const type = btn.type?.toUpperCase();

    switch (type) {
        case "URL": {
            // URL buttons with {{1}} in the URL need the variable substituted at send time
            const hasVar = btn.url?.includes("{{1}}");
            if (!hasVar) return null; // Static URL — no params needed

            const value = variables["1"] ?? "";
            return {
                sub_type: "url",
                index: btn.index ?? 0,
                parameters: [{ type: "text", text: String(value) }],
            };
        }
        case "COPY_CODE": {
            const code = variables["1"] ?? btn.example?.[0] ?? "";
            return {
                sub_type: "copy_code",
                index: btn.index ?? 0,
                parameters: [{ type: "coupon_code", coupon_code: String(code) }],
            };
        }
        case "QUICK_REPLY":
        case "PHONE_NUMBER":
        case "FLOW":
        case "MPM":
        case "CATALOG":
        case "OTP": {
            // These don't need send-time parameters
            return null;
        }
        default:
            return null;
    }
};