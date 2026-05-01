import express from "express";
import {
  getAssignmentRule,
  createOrUpdateAssignmentRule,
  reassignConversation,
  getAssignmentStats,
} from "../controllers/assignment.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";

const assignmentRouter = express.Router();

// All routes require authentication
assignmentRouter.use(verifyUser);

// Get assignment rule for workspace
assignmentRouter.get("/rule", getAssignmentRule);

// Create or update assignment rule
assignmentRouter.post("/rule", createOrUpdateAssignmentRule);
assignmentRouter.put("/rule", createOrUpdateAssignmentRule);
// Manually trigger reassignment for a conversation
assignmentRouter.post("/conversations/:id/reassign", reassignConversation);

// Get assignment statistics
assignmentRouter.get("/stats", getAssignmentStats);

export default assignmentRouter;