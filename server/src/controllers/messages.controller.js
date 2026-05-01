import { prisma } from "../db.js";
import { sendWhatsAppMessage, sendWhatsAppTemplate } from "./whatsappSend.controller.js";

// Get messages of a conversation
const getMessagesByConversation = async (req, res) => {
  try {
    const { workspaceId } = req.user;
    const { id: conversationId } = req.params;

    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, workspaceId, deletedAt: null },
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId, workspaceId, isDeleted: false },  // ✅ isDeleted (not deletedAt)
      include: {
        attachments: true,
        sender: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    res.json({ success: true, messages });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Send a message in a conversation (staff → contact via HTTP REST)
const sendMessage = async (req, res) => {
  try {
    const { workspaceId, id: userId } = req.user;
    const { id: conversationId } = req.params;
    const { text, payload, attachments = [] } = req.body;

    if (!text && !payload && attachments.length === 0) {
      return res.status(400).json({ success: false, message: "Message content required" });
    }

    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, workspaceId, deletedAt: null, status: "OPEN" },
      include: {
        contact: true,
      },
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found or closed" });
    }

    const message = await prisma.$transaction(async (tx) => {
      const msg = await tx.message.create({
        data: {
          conversationId,
          workspaceId,
          senderId: userId,
          direction: "OUTBOUND",
          status: "SENT",
          sentAt: new Date(),
          text,
          payload,
          attachments: {
            create: attachments.map((a) => ({
              url: a.url,
              filename: a.filename,
              mimeType: a.mimeType,
              size: a.size,
              meta: a.meta,
            })),
          },
        },
        include: {
          attachments: true,
          sender: { select: { id: true, name: true, email: true } },
        },
      });

      await tx.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
      });

      return msg;
    });

    // Forward message to WhatsApp via provider API
    await sendWhatsAppMessage({
      messageId: message.id,
      conversationId: conversation.id,
      workspaceId: conversationId?.workspaceId,
      toPhoneNumber: conversation.contact.phoneNumber,
      text: message.text,
      payload: message.payload,
      io: req.app.get("io"),
    })

    // Emit real-time event so all connected staff see the new message instantly
    const io = req.app.get("io");
    if (io) {
      io.to(`workspace:${workspaceId}`).emit("message:created", {
        message,
        conversationId,
      });
    }

    res.status(201).json({ success: true, messageData: message });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Send Template Message
const sendTemplateMessage = async (req, res) => {
  try {
    const { workspaceId, id: userId } = req.user;
    const { conversationId, templateId, variables } = req.body;

    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, workspaceId, deletedAt: null, status: "OPEN" }, include: {
        contact: true,
      },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found or closed",
      });
    }

    const template = await prisma.template.findFirst({
      where: { id: templateId, workspaceId, status: "APPROVED" },
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found or not approved",
      });
    }

    const payload = {
      templateId,
      type: template.type,
      components: template.components,
      variables,
    };

    const message = await prisma.$transaction(async (tx) => {
      const msg = await tx.message.create({
        data: {
          workspaceId,
          conversationId,
          senderId: userId,
          direction: "OUTBOUND",
          status: "SENT",
          sentAt: new Date(),
          payload,
        },
        include: {
          sender: { select: { id: true, name: true, email: true } },
        },
      });

      await tx.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
      });

      return msg;
    });

    // Forward template message to WhatsApp via provider API
    await sendWhatsAppTemplate({
      messageId: message.id,
      conversationId: conversation.id,
      workspaceId: conversation.workspaceId,
      toPhoneNumber: conversation.contact.phoneNumber,
      templateId: template.id,
      variables: message.payload.variables,
      io: req.app.get("io"),
    })

    // Broadcast template message to all staff in workspace
    const io = req.app.get("io");
    if (io) {
      io.to(`workspace:${workspaceId}`).emit("message:created", {
        message,
        conversationId,
      });
    }

    res.status(201).json({ success: true, messageData: message });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Mark a message as read
const markAsRead = async (req, res) => {
  try {
    const { workspaceId } = req.user;
    const { id: messageId } = req.params;

    const message = await prisma.message.findFirst({
      where: { id: messageId, workspaceId, isDeleted: false },  // ✅ isDeleted
      include: { conversation: true },
    });

    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    if (message.status === "READ") {
      return res.json({ success: true });
    }

    const readAt = new Date();

    await prisma.$transaction(async (tx) => {
      await tx.message.update({
        where: { id: messageId },
        data: { status: "READ", readAt },
      });

      if (message.direction === "INBOUND" && message.conversation.unreadCount > 0) {
        await tx.conversation.update({
          where: { id: message.conversationId },
          data: { unreadCount: { decrement: 1 } },
        });
      }
    });

    // ✅ Broadcast read receipt to all staff
    const io = req.app.get("io");
    if (io) {
      io.to(`workspace:${workspaceId}`).emit("message:status:update", {
        messageId,
        status: "READ",
        timestamp: readAt,
      });
    }

    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Mark a message as delivered
const markMessageAsDelivered = async (req, res) => {
  try {
    const { workspaceId } = req.user;
    const { id: messageId } = req.params;

    const message = await prisma.message.findFirst({
      where: { id: messageId, workspaceId, isDeleted: false },  // ✅ isDeleted
    });

    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    if (["DELIVERED", "READ"].includes(message.status)) {
      return res.status(200).json({ success: true, message: "Message already delivered" });
    }

    if (message.status === "FAILED") {
      return res.status(400).json({
        success: false,
        message: "Failed messages cannot be marked as delivered",
      });
    }

    const deliveredAt = new Date();

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: { status: "DELIVERED", deliveredAt },
    });

    // ✅ Broadcast delivery status to all staff
    const io = req.app.get("io");
    if (io) {
      io.to(`workspace:${workspaceId}`).emit("message:status:update", {
        messageId,
        status: "DELIVERED",
        timestamp: deliveredAt,
      });
    }

    return res.status(200).json({ success: true, message: "Message marked as delivered", messageData: updatedMessage });
  } catch (error) {
    console.error("Mark message as delivered error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Mark a message as failed
const markMessageAsFailed = async (req, res) => {
  try {
    const { workspaceId } = req.user;
    const { id: messageId } = req.params;
    const { error: failureReason } = req.body;

    const message = await prisma.message.findFirst({
      where: { id: messageId, workspaceId, isDeleted: false },  // ✅ isDeleted
    });

    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    if (message.status === "FAILED") {
      return res.status(200).json({ success: true, message: "Message already marked as failed" });
    }

    const failedAt = new Date();

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        status: "FAILED",
        failedAt,
        error: failureReason || "Message delivery failed",
      },
    });

    // ✅ Broadcast failure status to all staff
    const io = req.app.get("io");
    if (io) {
      io.to(`workspace:${workspaceId}`).emit("message:status:update", {
        messageId,
        status: "FAILED",
        timestamp: failedAt,
        error: failureReason,
      });
    }

    return res.status(200).json({ success: true, message: "Message marked as failed", messageData: updatedMessage });
  } catch (error) {
    console.error("Mark message as failed error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export {
  getMessagesByConversation,
  sendMessage,
  sendTemplateMessage,
  markAsRead,
  markMessageAsDelivered,
  markMessageAsFailed,
};