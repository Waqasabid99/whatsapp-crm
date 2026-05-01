import { prisma } from "../db.js";
import { incrementUsage } from "../utils/constants.js";
import { autoAssignConversation } from "./assignment.controller.js";

// ── Webhook Verification (GET) ────────────────────────────────────────────────
const verifyWebhook = (req, res) => {
  try {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === process.env.WEBHOOK_VERIFY_TOKEN) {
      console.log("Webhook verified successfully");
      res.status(200).send(challenge);
    } else {
      console.error("Webhook verification failed");
      res.status(403).json({ success: false, message: "Forbidden" });
    }
  } catch (error) {
    console.error("Webhook verification error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── Webhook Handler (POST) ────────────────────────────────────────────────────
const handleWebhook = async (req, res) => {
  // Always acknowledge immediately — Meta will retry if we don't respond in time
  res.status(200).send("EVENT_RECEIVED");

  try {
    const body = req.body;

    if (!body.object || body.object !== "whatsapp_business_account") {
      console.log("Ignored: not a whatsapp_business_account event");
      return;
    }

    for (const entry of body.entry) {
      const wabaId = entry.id;

      // Schema fix: field is `wabaId`, NOT `accountId`
      const whatsappAccount = await prisma.whatsAppAccount.findFirst({
        where: { wabaId },
      });

      if (!whatsappAccount) {
        console.error(`No WhatsApp account linked to WABA ID: ${wabaId}`);
        continue;
      }

      // Persist the raw webhook event for auditability / replay
      // Schema: WebhookEvent has `eventType String?` — populate it from change.field
      // We create one event record per entry (not per change) — the full entry is the payload
      const firstChangeField = entry.changes?.[0]?.field ?? null;
      const webhookEvent = await prisma.webhookEvent.create({
        data: {
          workspaceId: whatsappAccount.workspaceId,
          provider: "WHATSAPP_CLOUD",
          eventType: firstChangeField,       // e.g. "messages" or "statuses"
          payload: entry,                    // raw Meta payload
          status: "pending",
          meta: {
            wabaId,
            receivedFrom: "meta",
          },
        },
      });

      let processingError = null;

      try {
        for (const change of entry.changes) {
          const changeType = change.field;

          if (changeType === "messages") {
            await processMessageWebhook(change.value, whatsappAccount);
          } else if (changeType === "statuses") {
            // Fix: Meta sends "statuses" NOT "message_status"
            await processStatusWebhook(change.value, whatsappAccount);
          } else {
            console.log(`Unhandled webhook change type: ${changeType}`);
          }
        }
      } catch (processingErr) {
        processingError = processingErr;
        console.error("Error processing webhook entry:", processingErr);
      }

      // Mark the webhook event as processed (or failed) — was never done before
      await prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: {
          status: processingError ? "failed" : "processed",
          processedAt: processingError ? undefined : new Date(),
          error: processingError ? String(processingError.message) : undefined,
        },
      });
    }
  } catch (error) {
    console.error("Webhook handling error:", error);
  }
};

// ── Process Incoming Message ──────────────────────────────────────────────────
const processMessageWebhook = async (messageData, whatsappAccount) => {
  try {
    if (!messageData.messages || messageData.messages.length === 0) return;

    const incomingMessage = messageData.messages[0];
    const from = incomingMessage.from; // E.164 customer phone number
    const messageId = incomingMessage.id;
    const timestamp = new Date(parseInt(incomingMessage.timestamp) * 1000);

    // ── Deduplicate early — before any writes ─────────────────────────────────
    const existingMessage = await prisma.message.findFirst({
      where: {
        workspaceId: whatsappAccount.workspaceId,
        providerMessageId: messageId,
      },
    });

    if (existingMessage) {
      console.log(`Duplicate message ignored: ${messageId}`);
      return;
    }

    // ── Find or create contact ────────────────────────────────────────────────
    let contact = await prisma.contact.findFirst({
      where: {
        workspaceId: whatsappAccount.workspaceId,
        phoneNumber: from,
      },
    });

    if (!contact) {
      const contactName = messageData.contacts?.[0]?.profile?.name || from;
      contact = await prisma.contact.create({
        data: {
          workspaceId: whatsappAccount.workspaceId,
          phoneNumber: from,
          name: contactName,
          lastSeenAt: timestamp,
        },
      });
    } else {
      await prisma.contact.update({
        where: { id: contact.id },
        data: { lastSeenAt: timestamp },
      });
    }

    // ── Find or create conversation ───────────────────────────────────────────
    let conversation = await prisma.conversation.findFirst({
      where: {
        workspaceId: whatsappAccount.workspaceId,
        whatsappAccountId: whatsappAccount.id,
        contactId: contact.id,
        status: { in: ["OPEN", "RESOLVED"] },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          workspaceId: whatsappAccount.workspaceId,
          whatsappAccountId: whatsappAccount.id,
          contactId: contact.id,
          status: "OPEN",
          lastMessageAt: timestamp,
          // Schema: lastInboundAt tracks the Meta 24-hour customer service window
          lastInboundAt: timestamp,
          unreadCount: 1,
        },
      });

      // Auto-assign only on new conversations
      await autoAssignConversation({ conversationId: conversation.id });
    } else {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessageAt: timestamp,
          // Schema: always refresh lastInboundAt on every inbound message
          // so the 24-hr messaging window is correctly tracked
          lastInboundAt: timestamp,
          unreadCount: { increment: 1 },
          // Re-open resolved conversations when the customer writes again
          status: "OPEN",
        },
      });
    }

    // ── Extract message text ──────────────────────────────────────────────────
    const messageType = incomingMessage.type;
    let messageText = null;

    if (messageType === "text") {
      messageText = incomingMessage.text?.body ?? null;
    } else if (["image", "video", "audio", "document"].includes(messageType)) {
      messageText = incomingMessage[messageType]?.caption ?? null;
    }

    // ── Persist message ───────────────────────────────────────────────────────
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        workspaceId: whatsappAccount.workspaceId,
        direction: "INBOUND",
        type: messageType,
        status: "DELIVERED",
        text: messageText,
        providerMessageId: messageId,
        payload: incomingMessage,
        createdAt: timestamp,
        deliveredAt: timestamp,
      },
    });

    // ── Increment metered usage ───────────────────────────────────────────────
    await incrementUsage(whatsappAccount.workspaceId, "MESSAGES_PER_MONTH");

    console.log(`Inbound message processed: ${messageId}`);
  } catch (error) {
    console.error("Error processing message webhook:", error);
    throw error; // re-throw so handleWebhook can mark the event as failed
  }
};

// ── Process Message Status Updates ───────────────────────────────────────────
const processStatusWebhook = async (statusData, whatsappAccount) => {
  try {
    // Meta sends the field as "statuses" (an array), not "message_status"
    if (!statusData.statuses || statusData.statuses.length === 0) return;

    const status = statusData.statuses[0];
    const messageId = status.id;
    const newStatus = status.status; // "sent" | "delivered" | "read" | "failed"

    const message = await prisma.message.findFirst({
      where: {
        workspaceId: whatsappAccount.workspaceId,
        providerMessageId: messageId,
      },
    });

    if (!message) {
      console.log(`Message not found for status update: ${messageId}`);
      return;
    }

    // Build the update payload — map Meta status strings to schema enum values
    // Schema MessageStatus: PENDING | SENT | DELIVERED | READ | FAILED
    const statusTimestamp = new Date(parseInt(status.timestamp) * 1000);

    const updateData = {
      status: newStatus.toUpperCase(), // "sent" → "SENT", etc.
    };

    if (newStatus === "sent") {
      updateData.sentAt = statusTimestamp;
    } else if (newStatus === "delivered") {
      updateData.deliveredAt = statusTimestamp;
    } else if (newStatus === "read") {
      updateData.readAt = statusTimestamp;
    } else if (newStatus === "failed") {
      // Schema has both `failedAt DateTime?` and `error String?` — set both
      updateData.failedAt = statusTimestamp;
      updateData.error = status.errors?.[0]?.message || "Message delivery failed";
    }

    await prisma.message.update({
      where: { id: message.id },
      data: updateData,
    });

    console.log(`Message status updated: ${messageId} → ${newStatus}`);
  } catch (error) {
    console.error("Error processing status webhook:", error);
    throw error; // re-throw so handleWebhook can mark the event as failed
  }
};

export { verifyWebhook, handleWebhook };