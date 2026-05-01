import express from "express";
import {  getMessagesByConversation, markAsRead, markMessageAsDelivered, markMessageAsFailed, sendMessage } from "../controllers/messages.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";
const messageRouter = express.Router();

// Get messages of a conversation
messageRouter.get("/:id/messages", verifyUser, getMessagesByConversation);
// Send a message in a conversation
messageRouter.post("/:id/messages", verifyUser, sendMessage);
// Mark messages as read
messageRouter.post("/:id/messages/read", verifyUser, markAsRead);
// Mark messages as delivered
messageRouter.post("/:id/messages/delivered", verifyUser, markMessageAsDelivered);
// Mark a message as failed
messageRouter.post("/:id/messages/:messageId/failed", verifyUser, markMessageAsFailed);

export default messageRouter;