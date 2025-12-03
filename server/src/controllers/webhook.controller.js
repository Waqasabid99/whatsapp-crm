import { prisma } from "../db.js";
import { incrementUsage } from "../utils/constants.js";

// Webhook Verification (GET)
const verifyWebhook = (req, res) => {
  try {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    const verifyToken = process.env.WEBHOOK_VERIFY_TOKEN;

    if (mode === "subscribe" && token === verifyToken) {
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

// Webhook Handler (POST)
const handleWebhook = async (req, res) => {
  try {
    // Respond immediately to acknowledge receipt
    res.status(200).send("EVENT_RECEIVED");

    const body = req.body;

    // Validate webhook payload
    if (!body.object || body.object !== "whatsapp_business_account") {
      console.log("Not a WhatsApp business account event");
      return;
    }

    // Process each entry
    for (const entry of body.entry) {
      const wabaId = entry.id;

      // Find the WhatsApp account in database
      const whatsappAccount = await prisma.whatsAppAccount.findFirst({
        where: { accountId: wabaId },
        include: { workspace: true },
      });

      if (!whatsappAccount) {
        console.error(`WhatsApp account not found for WABA ID: ${wabaId}`);
        continue;
      }

      // Store webhook event
      await prisma.webhookEvent.create({
        data: {
          workspaceId: whatsappAccount.workspaceId,
          provider: "WHATSAPP_CLOUD",
          payload: entry,
          status: "pending",
          meta: {
            wabaId: wabaId,
            receivedFrom: "meta",
          },
        },
      });

      // Process changes (messages, statuses, etc.)
      for (const change of entry.changes) {
        const changeType = change.field;

        if (changeType === "messages") {
          await processMessageWebhook(change.value, whatsappAccount);
        } else if (changeType === "message_status") {
          await processStatusWebhook(change.value, whatsappAccount);
        }
      }
    }
  } catch (error) {
    console.error("Webhook handling error:", error);
  }
};

// Process Incoming Message
const processMessageWebhook = async (messageData, whatsappAccount) => {
  try {
    if (!messageData.messages || messageData.messages.length === 0) {
      return;
    }

    const incomingMessage = messageData.messages[0];
    const from = incomingMessage.from; // Customer phone number
    const messageId = incomingMessage.id;
    const timestamp = new Date(parseInt(incomingMessage.timestamp) * 1000);

    // Find or create contact
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

    // Find or create conversation
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
          unreadCount: 1,
        },
      });
    } else {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessageAt: timestamp,
          unreadCount: { increment: 1 },
          status: "OPEN",
        },
      });
    }

    // Extract message content
    const messageType = incomingMessage.type;
    let messageText = null;

    if (messageType === "text") {
      messageText = incomingMessage.text.body;
    } else if (["image", "video", "audio", "document"].includes(messageType)) {
      messageText = incomingMessage[messageType].caption || null;
      // Handle media attachments (would need to download from WhatsApp)
    }

    // Create message in database
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        workspaceId: whatsappAccount.workspaceId,
        direction: "INBOUND",
        status: "DELIVERED",
        text: messageText,
        providerMessageId: messageId,
        payload: incomingMessage,
        createdAt: timestamp,
        deliveredAt: timestamp,
      },
    });

    // Increment usage count for messages
    await incrementUsage(whatsappAccount.workspaceId, "MESSAGES_PER_MONTH");

    console.log(`Message processed: ${messageId}`);
  } catch (error) {
    console.error("Error processing message webhook:", error);
  }
};

// Process Message Status Updates
const processStatusWebhook = async (statusData, whatsappAccount) => {
  try {
    if (!statusData.statuses || statusData.statuses.length === 0) {
      return;
    }

    const status = statusData.statuses[0];
    const messageId = status.id;
    const newStatus = status.status; // sent, delivered, read, failed

    // Find message by provider ID
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

    // Update message status
    const updateData = {
      status: newStatus.toUpperCase(),
    };

    if (newStatus === "sent") {
      updateData.sentAt = new Date(parseInt(status.timestamp) * 1000);
    } else if (newStatus === "delivered") {
      updateData.deliveredAt = new Date(parseInt(status.timestamp) * 1000);
    } else if (newStatus === "read") {
      updateData.readAt = new Date(parseInt(status.timestamp) * 1000);
    } else if (newStatus === "failed") {
      updateData.error = status.errors?.[0]?.message || "Message failed";
    }

    await prisma.message.update({
      where: { id: message.id },
      data: updateData,
    });

    console.log(`Message status updated: ${messageId} -> ${newStatus}`);
  } catch (error) {
    console.error("Error processing status webhook:", error);
  }
};

export { verifyWebhook, handleWebhook };