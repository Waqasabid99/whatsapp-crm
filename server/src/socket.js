import { Server } from "socket.io";
import { prisma } from "./db.js";
import jwt from "jsonwebtoken";
import { sendWhatsAppMessage } from "./controllers/whatsappSend.controller.js";

// Initialize Socket.io
export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  // -------------------------------------------------------
  // Authentication middleware — validates JWT on every connect
  // -------------------------------------------------------
  io.use(async (socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie;
      if (!cookieHeader) {
        return next(new Error("Authentication error: no cookies"));
      }

      // Parse cookie header manually since express middleware hasn't run here
      const cookies = cookieHeader.split(';').reduce((acc, cookieStr) => {
        const [key, ...val] = cookieStr.trim().split('=');
        acc[key] = decodeURIComponent(val.join('='));
        return acc;
      }, {});

      const token = cookies.accessToken;

      if (!token) {
        return next(new Error("Authentication error: no accessToken cookie"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }, // <-- Fixed from id to userId to match auth.controller logic
        include: {
          memberships: {
            where: { isActive: true },
            include: { workspace: true },
          },
        },
      });

      if (!user) {
        return next(new Error("User not found"));
      }

      // Attach user data to socket for use in all handlers
      socket.userId = user.id;
      socket.workspaceId = user.memberships[0]?.workspaceId;
      socket.userName = user.name;

      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`[Socket] Connected: ${socket.userId} | workspace: ${socket.workspaceId}`);

    // Auto-join the workspace room on connect
    socket.join(`workspace:${socket.workspaceId}`);

    // =====================================================
    // ROOM MANAGEMENT
    // =====================================================

    // Join a specific conversation room (for targeted conversation-level emits)
    socket.on("join_conversation", (conversationId) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`[Socket] ${socket.userId} joined conversation:${conversationId}`);
    });

    socket.on("leave_conversation", (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // =====================================================
    // CONVERSATION EVENTS
    // =====================================================

    // Get all conversations for the workspace
    socket.on("conversation:list", async () => {
      try {
        const conversations = await prisma.conversation.findMany({
          where: {
            workspaceId: socket.workspaceId,
            status: { not: "ARCHIVED" },
            deletedAt: null,
          },
          include: {
            contact: true,
            assignee: {
              select: {
                id: true,
                role: true,
                user: {
                  select: { id: true, name: true, email: true },
                },
              },
            },
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: {
                id: true,
                text: true,
                direction: true,
                status: true,
                createdAt: true,
              },
            },
            _count: { select: { messages: true } },
          },
          orderBy: { lastMessageAt: "desc" },
        });

        const formattedConversations = conversations.map((conv) => ({
          ...conv,
          lastMessage: conv.messages[0] || null,
          messages: undefined,
        }));

        socket.emit("conversation:list", {
          success: true,
          conversations: formattedConversations,
        });
      } catch (error) {
        console.error("[Socket] conversation:list error:", error);
        socket.emit("conversation:list", {
          success: false,
          error: "Failed to fetch conversations",
        });
      }
    });

    // Get messages for a specific conversation
    socket.on("conversation:messages", async (data) => {
      try {
        const { conversationId } = data;

        const conversation = await prisma.conversation.findFirst({
          where: {
            id: conversationId,
            workspaceId: socket.workspaceId,
            deletedAt: null,
          },
        });

        if (!conversation) {
          return socket.emit("conversation:messages", {
            success: false,
            error: "Conversation not found",
          });
        }

        const messages = await prisma.message.findMany({
          where: {
            conversationId,
            workspaceId: socket.workspaceId,
            isDeleted: false,   // ✅ matches schema field (not deletedAt)
          },
          include: {
            attachments: true,
            sender: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: "asc" },
        });

        socket.emit("conversation:messages", { success: true, messages });
      } catch (error) {
        console.error("[Socket] conversation:messages error:", error);
        socket.emit("conversation:messages", {
          success: false,
          error: "Failed to fetch messages",
        });
      }
    });

    // Mark all messages in a conversation as read
    socket.on("conversation:markRead", async (data) => {
      try {
        const { conversationId } = data;

        const unreadMessages = await prisma.message.findMany({
          where: {
            conversationId,
            workspaceId: socket.workspaceId,
            direction: "INBOUND",
            status: { not: "READ" },
            isDeleted: false,   // ✅ matches schema field
          },
        });

        if (unreadMessages.length === 0) return;

        await prisma.$transaction([
          prisma.message.updateMany({
            where: {
              conversationId,
              workspaceId: socket.workspaceId,
              direction: "INBOUND",
              status: { not: "READ" },
            },
            data: { status: "READ", readAt: new Date() },
          }),
          prisma.conversation.update({
            where: { id: conversationId },
            data: { unreadCount: 0 },
          }),
        ]);

        // Broadcast updated conversation to workspace
        io.to(`workspace:${socket.workspaceId}`).emit("conversation:update", {
          conversation: { id: conversationId, unreadCount: 0 },
        });

        // Broadcast read-receipt for every message
        unreadMessages.forEach((msg) => {
          io.to(`workspace:${socket.workspaceId}`).emit("message:status:update", {
            messageId: msg.id,
            status: "READ",
            timestamp: new Date(),
          });
        });
      } catch (error) {
        console.error("[Socket] conversation:markRead error:", error);
      }
    });

    // =====================================================
    // MESSAGE EVENTS
    // =====================================================

    // Staff sends a message to a contact
    socket.on("message:send", async (data) => {
      try {
        const { conversationId, text, payload, attachments = [] } = data;

        if (!text && !payload && attachments.length === 0) {
          return socket.emit("message:error", {
            success: false,
            error: "Message content required",
          });
        }

        const conversation = await prisma.conversation.findFirst({
          where: {
            id: conversationId,
            workspaceId: socket.workspaceId,
            deletedAt: null,
            status: "OPEN",
          },
          include: { contact: true },
        });

        if (!conversation) {
          return socket.emit("message:error", {
            success: false,
            error: "Conversation not found or closed",
          });
        }

        const message = await prisma.$transaction(async (tx) => {
          const msg = await tx.message.create({
            data: {
              conversationId,
              workspaceId: socket.workspaceId,
              senderId: socket.userId,
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

        // Broadcast new message to all staff in the workspace
        io.to(`workspace:${socket.workspaceId}`).emit("message:created", {
          message,
          conversationId,
        });

        // Forward message to WhatsApp via provider API
        await sendWhatsAppMessage({
          messageId: message.id,
          conversationId: conversation.id,
          workspaceId: socket.workspaceId,
          toPhoneNumber: conversation.contact.phoneNumber,
          text: message.text,
          payload: message.payload,
          io,
        });

        console.log(`[Socket] message:send — saved: ${message.id}`);
      } catch (error) {
        console.error("[Socket] message:send error:", error);
        socket.emit("message:error", {
          success: false,
          error: "Failed to send message",
        });
      }
    });

    // Mark a single message as read
    socket.on("message:read", async (data) => {
      try {
        const { messageId } = data;

        const message = await prisma.message.findFirst({
          where: {
            id: messageId,
            workspaceId: socket.workspaceId,
            isDeleted: false,   // matches schema field
          },
          include: { conversation: true },
        });

        if (!message || message.status === "READ") return;

        await prisma.$transaction(async (tx) => {
          await tx.message.update({
            where: { id: messageId },
            data: { status: "READ", readAt: new Date() },
          });

          if (message.direction === "INBOUND" && message.conversation.unreadCount > 0) {
            await tx.conversation.update({
              where: { id: message.conversationId },
              data: { unreadCount: { decrement: 1 } },
            });
          }
        });

        io.to(`workspace:${socket.workspaceId}`).emit("message:status:update", {
          messageId,
          status: "READ",
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("[Socket] message:read error:", error);
      }
    });

    // Mark message as delivered
    socket.on("message:delivered", async (data) => {
      try {
        const { messageId } = data;

        const message = await prisma.message.findFirst({
          where: {
            id: messageId,
            workspaceId: socket.workspaceId,
            isDeleted: false,   // ✅ matches schema field
          },
        });

        if (!message || ["DELIVERED", "READ"].includes(message.status)) return;

        await prisma.message.update({
          where: { id: messageId },
          data: { status: "DELIVERED", deliveredAt: new Date() },
        });

        io.to(`workspace:${socket.workspaceId}`).emit("message:status:update", {
          messageId,
          status: "DELIVERED",
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("[Socket] message:delivered error:", error);
      }
    });

    // Mark message as failed
    socket.on("message:failed", async (data) => {
      try {
        const { messageId, error: errorMessage } = data;

        const message = await prisma.message.findFirst({
          where: {
            id: messageId,
            workspaceId: socket.workspaceId,
            isDeleted: false,   // ✅ matches schema field
          },
        });

        if (!message) return;

        await prisma.message.update({
          where: { id: messageId },
          data: {
            status: "FAILED",
            error: errorMessage || "Message delivery failed",
          },
        });

        io.to(`workspace:${socket.workspaceId}`).emit("message:status:update", {
          messageId,
          status: "FAILED",
          timestamp: new Date(),
          error: errorMessage,
        });
      } catch (error) {
        console.error("[Socket] message:failed error:", error);
      }
    });

    // =====================================================
    // TYPING INDICATORS
    // =====================================================

    socket.on("typing:start", (data) => {
      const { conversationId } = data;
      socket.to(`workspace:${socket.workspaceId}`).emit("typing:start", {
        conversationId,
        userId: socket.userId,
        userName: socket.userName,
      });
    });

    socket.on("typing:stop", (data) => {
      const { conversationId } = data;
      socket.to(`workspace:${socket.workspaceId}`).emit("typing:stop", {
        conversationId,
        userId: socket.userId,
      });
    });

    // =====================================================
    // DISCONNECT
    // =====================================================

    socket.on("disconnect", () => {
      console.log(`[Socket] Disconnected: ${socket.userId}`);
    });
  });

  return io;
};

// -------------------------------------------------------
// Helper emitters — called from HTTP controllers so
// REST API actions still broadcast real-time updates
// -------------------------------------------------------

/** Broadcast a new inbound message to all staff in the workspace */
export const emitIncomingMessage = (io, workspaceId, conversationId, message) => {
  io.to(`workspace:${workspaceId}`).emit("message:receive", {
    message,
    conversationId,
  });
};

/** Broadcast a conversation field update (status, unreadCount, assignee…) */
export const emitConversationUpdate = (io, workspaceId, conversation) => {
  io.to(`workspace:${workspaceId}`).emit("conversation:update", {
    conversation,
  });
};

/** Broadcast a message status change to all staff in the workspace */
export const emitMessageStatusUpdate = (io, workspaceId, messageId, status, timestamp) => {
  io.to(`workspace:${workspaceId}`).emit("message:status:update", {
    messageId,
    status,
    timestamp,
  });
};