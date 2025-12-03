import express from "express";
import { getWorkspaces } from "../controllers/workspace.controller.js";
const workspaceRouter = express.Router();

workspaceRouter.get("/getWorkspaces/:userId", getWorkspaces);

export default workspaceRouter;