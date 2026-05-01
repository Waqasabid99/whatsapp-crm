import express from "express";
import { addCampaignContacts, cancelCampaign, createCampaign, deleteCampaign, duplicateCampaign, getCampaignAnalytics, getCampaignById, getCampaignContacts, getCampaigns, getCampaignsOverview, launchCampaign, pauseCampaign, removeCampaignContact, resumeCampaign, updateCampaign, updateContactDeliveryStatus } from "../controllers/campaigns.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";
const campaignsRouter = express.Router();

campaignsRouter.use(verifyUser);

// Crud operations
campaignsRouter.get("/", getCampaigns);
campaignsRouter.get("/:id", getCampaignById);
campaignsRouter.post("/", createCampaign);
campaignsRouter.patch("/:id", updateCampaign);
campaignsRouter.delete("/:id", deleteCampaign);

// LifeCycle operations
//  - Launch Campaign
//  - Pause Campaign
//  - Cancel Campaign
campaignsRouter.post("/:id/launch", launchCampaign);
campaignsRouter.post("/:id/resume", resumeCampaign);
campaignsRouter.post("/:id/pause", pauseCampaign);
campaignsRouter.post("/:id/cancel", cancelCampaign);

// Contact operations 
//  - Get contacts
//  - Add contacts
//  - Remove contacts
//  - Update contact status
campaignsRouter.get("/:id/contacts", getCampaignContacts);
campaignsRouter.post("/:id/contacts", addCampaignContacts);
campaignsRouter.delete("/:id/contacts/:contactId", removeCampaignContact);
campaignsRouter.patch("/:id/contacts/:contactId/status", updateContactDeliveryStatus);

// Analytics operations
// - Get campaign analytics
// - Get campaign analytics overview
// - Duplicate campaign
campaignsRouter.get("/:id/analytics", getCampaignAnalytics);
campaignsRouter.get("/analytics/overview", getCampaignsOverview);
campaignsRouter.post("/:id/duplicate", duplicateCampaign);

export default campaignsRouter;
