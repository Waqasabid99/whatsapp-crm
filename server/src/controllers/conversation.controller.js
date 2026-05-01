import { prisma } from "../db.js";
import { emitConversationUpdate } from "../socket.js";

// Get all conversations for the workspace
const getConversations = async (req, res) => {
  try {
    const { conversations } = req.conversations;

    const formattedConversations = conversations.map((conv) => ({
      ...conv,
      lastMessage: conv.messages[0] || null,
      messages: undefined,
    }));

    return res.status(200).json({
      success: true,
      message: "Conversations fetched successfully",
      conversations: formattedConversations,
    });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get a specific conversation by ID (with full message list)
const getConversationById = async (req, res) => {
  try {
    const { workspaceId } = req.user;
    const { id } = req.params;

    const conversation = await prisma.conversation.findFirst({
      where: { id, workspaceId, deletedAt: null },
      include: {
        contact: true,
        assignee: {
          select: {
            id: true,
            role: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
        messages: {
          where: { isDeleted: false },   // isDeleted (not deletedAt on Message)
          orderBy: { createdAt: "asc" },
          include: {
            attachments: true,
            sender: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Conversation fetched successfully",
      conversation,
    });
  } catch (error) {
    console.error("Get conversation by ID error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Assign a conversation to a staff member
const assignConversation = async (req, res) => {
  try {
    const { workspaceId } = req.user;
    const { id } = req.params;
    const { membershipId } = req.body;

    if (!membershipId) {
      return res.status(400).json({ success: false, message: "membershipId is required" });
    }

    const conversation = await prisma.conversation.findFirst({
      where: { id, workspaceId, deletedAt: null },
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    const membership = await prisma.membership.findFirst({
      where: {
        id: membershipId,
        workspaceId,
        isActive: true,
        role: { in: ["OWNER", "ADMIN", "AGENT"] },
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (!membership) {
      return res.status(404).json({ success: false, message: "Invalid assignee" });
    }

    const updatedConversation = await prisma.conversation.update({
      where: { id },
      data: { assigneeId: membershipId },
      include: {
        assignee: {
          select: {
            id: true,
            role: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    // ✅ Broadcast assignment change to all staff in the workspace
    const io = req.app.get("io");
    if (io) {
      emitConversationUpdate(io, workspaceId, {
        id: updatedConversation.id,
        assigneeId: membershipId,
        assignee: updatedConversation.assignee,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Conversation assigned successfully",
      conversation: updatedConversation,
    });
  } catch (error) {
    console.error("Assign conversation error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Resolve a conversation
const resolveConversation = async (req, res) => {
  try {
    const { workspaceId } = req.user;
    const { id } = req.params;

    const conversation = await prisma.conversation.findFirst({
      where: { id, workspaceId, deletedAt: null, status: "OPEN" },
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: "Open conversation not found" });
    }

    const resolvedAt = new Date();

    const updatedConversation = await prisma.conversation.update({
      where: { id },
      data: { status: "RESOLVED", resolvedAt },
    });

    // ✅ Broadcast resolved status to all staff
    const io = req.app.get("io");
    if (io) {
      emitConversationUpdate(io, workspaceId, {
        id: updatedConversation.id,
        status: "RESOLVED",
        resolvedAt,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Conversation resolved successfully",
      conversation: updatedConversation,
    });
  } catch (error) {
    console.error("Resolve conversation error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Archive a conversation
const archiveConversation = async (req, res) => {
  try {
    const { workspaceId } = req.user;
    const { id } = req.params;

    const conversation = await prisma.conversation.findFirst({
      where: { id, workspaceId, deletedAt: null, status: { not: "ARCHIVED" } },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found or already archived",
      });
    }

    const updatedConversation = await prisma.conversation.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });

    // ✅ Broadcast archived status to all staff
    const io = req.app.get("io");
    if (io) {
      emitConversationUpdate(io, workspaceId, {
        id: updatedConversation.id,
        status: "ARCHIVED",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Conversation archived successfully",
      conversation: updatedConversation,
    });
  } catch (error) {
    console.error("Archive conversation error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Reopen a resolved or archived conversation
const reopenConversation = async (req, res) => {
  try {
    const { workspaceId } = req.user;
    const { id } = req.params;

    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        workspaceId,
        deletedAt: null,
        status: { in: ["RESOLVED", "ARCHIVED"] },
      },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found or cannot be reopened",
      });
    }

    const updatedConversation = await prisma.conversation.update({
      where: { id },
      data: { status: "OPEN", resolvedAt: null },
    });

    // ✅ Broadcast reopened status to all staff
    const io = req.app.get("io");
    if (io) {
      emitConversationUpdate(io, workspaceId, {
        id: updatedConversation.id,
        status: "OPEN",
        resolvedAt: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Conversation reopened successfully",
      conversation: updatedConversation,
    });
  } catch (error) {
    console.error("Reopen conversation error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export {
  getConversations,
  getConversationById,
  assignConversation,
  resolveConversation,
  archiveConversation,
  reopenConversation,
};
