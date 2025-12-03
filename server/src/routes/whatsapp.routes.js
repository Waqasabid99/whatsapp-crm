import express from "express";
import { connectWhatsApp, disconnectWhatsApp, whatsappCallback } from "../controllers/whatsapp.controller.js";
import { handleWebhook, verifyWebhook } from "../controllers/webhook.controller.js";
const WhatsappRouter = express.Router();

// Connect WhatsApp Account
WhatsappRouter.get("/whatsapp/connect/:userId", connectWhatsApp)
WhatsappRouter.get('/whatsapp/callback', whatsappCallback);
WhatsappRouter.get('/webhook', verifyWebhook);
WhatsappRouter.post('/webhook', handleWebhook);
WhatsappRouter.post('/whatsapp/:accountId/disconnect', disconnectWhatsApp);

export default WhatsappRouter;