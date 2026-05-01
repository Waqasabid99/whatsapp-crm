import express from "express";
import { archiveConversation, assignConversation, getConversationById, getConversations, reopenConversation, resolveConversation } from "../controllers/conversation.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";
import hasAssignedConversation from "../middlewares/assignment.middleware.js";
const conversationRouter = express.Router();

// Get all conversations
conversationRouter.use(verifyUser);

conversationRouter.get("/conversations", hasAssignedConversation, getConversations);
// Get a specific conversation by ID
conversationRouter.get("/conversations/:id", getConversationById);
// Assign a conversation to an agent
conversationRouter.post("/conversations/:id/assign", assignConversation);
// Resolve a conversation
conversationRouter.post("/conversations/:id/resolve", resolveConversation);
// Reopen a conversation
conversationRouter.post("/conversations/:id/reopen", reopenConversation);
// Archive a conversation
conversationRouter.post("/conversations/:id/archive", archiveConversation);

export default conversationRouter;