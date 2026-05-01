import { prisma } from "../db.js";
import { autoAssignConversation } from "./assignment.controller.js";
import { emitIncomingMessage, emitConversationUpdate } from "../socket.js";

// Receive Inbound Message (e.g. from WhatsApp webhook or internal simulation)
export const receiveInboundMessage = async (req, res) => {
  try {
    const { workspaceId } = req.user;
    const {
      conversationId,
      contactId,
      text,
      payload,
      attachments = [],
    } = req.body;

    if (!text && !payload && attachments.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Inbound message content required",
      });
    }

    // -----------------------------------------------------------------
    // 1. Validate that the contact belongs to this workspace
    // -----------------------------------------------------------------
    const contact = await prisma.contact.findFirst({
      where: { id: contactId, workspaceId },
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    // -----------------------------------------------------------------
    // 2. Validate or create a conversation
    // -----------------------------------------------------------------
    let conversation = null;

    if (conversationId) {
      conversation = await prisma.conversation.findFirst({
        where: { id: conversationId, workspaceId, deletedAt: null },
      });
    }

    if (!conversation) {
      if (!contactId) {
        return res.status(400).json({
          success: false,
          message: "contactId is required for new conversations",
        });
      }

      // Option B: auto-lookup the workspace's first active WhatsApp account
      const whatsappAccount = await prisma.whatsAppAccount.findFirst({
        where: { workspaceId, status: "active" },
        orderBy: { createdAt: "asc" },
      });

      if (!whatsappAccount) {
        return res.status(422).json({
          success: false,
          message: "No active WhatsApp account found for this workspace",
        });
      }

      conversation = await prisma.conversation.create({
        data: {
          workspaceId,
          contactId,
          whatsappAccountId: whatsappAccount.id,
          status: "OPEN",
          unreadCount: 0,
          lastMessageAt: new Date(),
        },
      });
    }

    // -----------------------------------------------------------------
    // 3. Create the inbound message (in a transaction)
    // -----------------------------------------------------------------
    const message = await prisma.$transaction(async (tx) => {
      const msg = await tx.message.create({
        data: {
          conversationId: conversation.id,
          workspaceId,
          direction: "INBOUND",
          status: "DELIVERED",
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
        include: { attachments: true },
      });

      const updatedConversation = await tx.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessageAt: new Date(),
          unreadCount: { increment: 1 },
        },
      });

      // Stash updated conversation for emit below
      conversation = updatedConversation;

      return msg;
    });

    // -----------------------------------------------------------------
    // 4. Emit real-time socket events so staff see the new message live
    // -----------------------------------------------------------------
    const io = req.app.get("io");
    if (io) {
      // New inbound message notification
      emitIncomingMessage(io, workspaceId, conversation.id, message);

      // Updated conversation metadata (unreadCount, lastMessageAt)
      emitConversationUpdate(io, workspaceId, {
        id: conversation.id,
        unreadCount: conversation.unreadCount,
        lastMessageAt: conversation.lastMessageAt,
      });
    }

    // -----------------------------------------------------------------
    // 5. Auto-assign conversation based on assignment rules
    // -----------------------------------------------------------------
    await autoAssignConversation({ conversationId: conversation.id });

    return res.status(201).json({
      success: true,
      message: "Inbound message received",
      conversationId: conversation.id,
      messageData: message,
    });

  } catch (error) {
    console.error("Inbound message error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
