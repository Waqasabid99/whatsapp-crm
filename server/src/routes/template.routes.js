import express from "express";
import { 
  createTemplate, 
  deleteTemplate, 
  getTemplates, 
  sendTemplateMessage, 
  submitToWhatsapp, 
  syncTemplatesFromWhatsapp, 
  handleWebhook 
} from "../controllers/templates.controller.js";

import { verifyUser } from "../middlewares/auth.middleware.js";

const templateRouter = express.Router();

templateRouter.get("/get-templates", verifyUser, getTemplates);
templateRouter.post("/create-template", verifyUser, createTemplate);
templateRouter.post("/submit-to-whatsapp/:templateId", submitToWhatsapp);
templateRouter.get("/sync-templates", verifyUser, syncTemplatesFromWhatsapp);
templateRouter.post("/send-template-message", verifyUser, sendTemplateMessage);
templateRouter.delete("/delete-template/:templateId", verifyUser, deleteTemplate);

templateRouter.post("/webhook", handleWebhook);

export default templateRouter;