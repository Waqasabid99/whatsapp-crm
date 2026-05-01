import { prisma } from "../db.js";
import {
    enqueueCampaign,
    pauseCampaignQueue,
    resumeCampaignQueue,
    cancelCampaignQueue,
} from "../utils/campaignqueue.worker.js";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const IMMUTABLE_STATUSES = ["RUNNING", "COMPLETED", "CANCELLED"];

const resolveVariables = (text, variables = {}) => {
    if (!text) return "";
    return text.replace(/\{\{(\d+)\}\}/g, (_, key) => variables[key] ?? `{{${key}}}`);
};

const buildTemplateComponents = (components, variables = {}) => {
    if (!Array.isArray(components)) return [];

    return components.map((comp) => {
        if (comp.type === "BODY") {
            const resolved = resolveVariables(comp.text, variables);
            const params = Object.values(variables).map((v) => ({ type: "text", text: String(v) }));
            return { ...comp, text: resolved, parameters: params };
        }
        return comp;
    });
};

// ─────────────────────────────────────────────────────────────────────────────
// CAMPAIGNS — CRUD
// ─────────────────────────────────────────────────────────────────────────────

const getCampaigns = async (req, res) => {
    try {
        const { workspaceId } = req.user;
        const { status, page = 1, limit = 20 } = req.query;

        const where = { workspaceId };
        if (status) where.status = status;

        const skip = (Number(page) - 1) * Number(limit);

        const [campaigns, total] = await Promise.all([
            prisma.campaign.findMany({
                where,
                include: {
                    template: { select: { id: true, name: true, language: true, status: true } },
                    audienceGroup: { select: { id: true, name: true, color: true } },
                    _count: { select: { contacts: true } },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: Number(limit),
            }),
            prisma.campaign.count({ where }),
        ]);

        return res.status(200).json({
            success: true,
            message: "Campaigns fetched successfully",
            campaigns,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        console.error("GET CAMPAIGNS ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const getCampaignById = async (req, res) => {
    try {
        const { workspaceId } = req.user;
        const { id } = req.params;

        const campaign = await prisma.campaign.findFirst({
            where: { id, workspaceId },
            include: {
                template: true,
                audienceGroup: { select: { id: true, name: true, color: true } },
                contacts: {
                    include: {
                        contact: {
                            select: {
                                id: true,
                                name: true,
                                phoneNumber: true,
                                email: true,
                                avatarUrl: true,
                                isOptOut: true,
                            },
                        },
                    },
                    orderBy: { createdAt: "asc" },
                },
            },
        });

        if (!campaign) {
            return res.status(404).json({ success: false, message: "Campaign not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Campaign fetched successfully",
            campaign,
        });
    } catch (error) {
        console.error("GET CAMPAIGN BY ID ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const createCampaign = async (req, res) => {
    try {
        const { workspaceId } = req.user;
        const {
            name,
            description,
            templateId,
            audienceGroupId,
            contactIds,
            audienceFilter,
            settings,
            scheduledAt,
            timezone,
            variables,
        } = req.body;

        if (!name?.trim()) {
            return res.status(400).json({ success: false, message: "Campaign name is required" });
        }
        if (!templateId) {
            return res.status(400).json({ success: false, message: "templateId is required" });
        }
        if (!audienceGroupId && (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0)) {
            return res.status(400).json({
                success: false,
                message: "Provide either audienceGroupId or a non-empty contactIds array",
            });
        }

        const template = await prisma.template.findFirst({
            where: { id: templateId, workspaceId, status: "APPROVED" },
        });
        if (!template) {
            return res.status(404).json({ success: false, message: "Template not found or not yet approved" });
        }

        if (audienceGroupId) {
            const group = await prisma.contactGroup.findFirst({ where: { id: audienceGroupId, workspaceId } });
            if (!group) return res.status(404).json({ success: false, message: "Audience group not found" });
        }

        let resolvedContactIds = [];
        if (audienceGroupId) {
            const members = await prisma.contactGroupMember.findMany({
                where: { groupId: audienceGroupId },
                select: { contactId: true },
            });
            resolvedContactIds = members.map((m) => m.contactId);
        } else {
            resolvedContactIds = contactIds;
        }

        const eligibleContacts = await prisma.contact.findMany({
            where: { id: { in: resolvedContactIds }, workspaceId, isOptOut: false, deletedAt: null },
            select: { id: true },
        });
        const eligibleIds = eligibleContacts.map((c) => c.id);

        const initialStatus = scheduledAt ? "SCHEDULED" : "DRAFT";

        const campaign = await prisma.$transaction(async (tx) => {
            const created = await tx.campaign.create({
                data: {
                    workspaceId,
                    name: name.trim(),
                    description: description?.trim() ?? null,
                    status: initialStatus,
                    templateId,
                    audienceGroupId: audienceGroupId ?? null,
                    audienceFilter: audienceFilter ?? null,
                    settings: settings ?? null,
                    scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
                    timezone: timezone ?? null,
                    totalRecipients: eligibleIds.length,
                },
            });

            if (eligibleIds.length > 0) {
                await tx.campaignContact.createMany({
                    data: eligibleIds.map((contactId) => ({
                        campaignId: created.id,
                        contactId,
                        status: "PENDING",
                        resolvedVariables: variables ?? {},
                    })),
                    skipDuplicates: true,
                });
            }

            return created;
        });

        const full = await prisma.campaign.findUnique({
            where: { id: campaign.id },
            include: {
                template: { select: { id: true, name: true, language: true } },
                audienceGroup: { select: { id: true, name: true } },
                _count: { select: { contacts: true } },
            },
        });

        return res.status(201).json({ success: true, message: "Campaign created successfully", campaign: full });
    } catch (error) {
        console.error("CREATE CAMPAIGN ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const updateCampaign = async (req, res) => {
    try {
        const { workspaceId } = req.user;
        const { id } = req.params;

        const campaign = await prisma.campaign.findFirst({ where: { id, workspaceId } });
        if (!campaign) return res.status(404).json({ success: false, message: "Campaign not found" });

        if (IMMUTABLE_STATUSES.includes(campaign.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot edit a campaign that is ${campaign.status.toLowerCase()}`,
            });
        }

        const { name, description, templateId, audienceGroupId, audienceFilter, settings, scheduledAt, timezone } = req.body;

        if (templateId && templateId !== campaign.templateId) {
            const template = await prisma.template.findFirst({ where: { id: templateId, workspaceId, status: "APPROVED" } });
            if (!template) return res.status(404).json({ success: false, message: "Template not found or not approved" });
        }

        if (audienceGroupId && audienceGroupId !== campaign.audienceGroupId) {
            const group = await prisma.contactGroup.findFirst({ where: { id: audienceGroupId, workspaceId } });
            if (!group) return res.status(404).json({ success: false, message: "Audience group not found" });
        }

        const updatedStatus = scheduledAt ? "SCHEDULED" : campaign.status;

        const updated = await prisma.campaign.update({
            where: { id },
            data: {
                ...(name && { name: name.trim() }),
                ...(description !== undefined && { description: description?.trim() ?? null }),
                ...(templateId && { templateId }),
                ...(audienceGroupId !== undefined && { audienceGroupId: audienceGroupId ?? null }),
                ...(audienceFilter !== undefined && { audienceFilter: audienceFilter ?? null }),
                ...(settings !== undefined && { settings: settings ?? null }),
                ...(scheduledAt !== undefined && { scheduledAt: scheduledAt ? new Date(scheduledAt) : null }),
                ...(timezone !== undefined && { timezone: timezone ?? null }),
                status: updatedStatus,
            },
            include: {
                template: { select: { id: true, name: true, language: true } },
                audienceGroup: { select: { id: true, name: true } },
                _count: { select: { contacts: true } },
            },
        });

        return res.status(200).json({ success: true, message: "Campaign updated successfully", campaign: updated });
    } catch (error) {
        console.error("UPDATE CAMPAIGN ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const deleteCampaign = async (req, res) => {
    try {
        const { workspaceId } = req.user;
        const { id } = req.params;
        const campaign = await prisma.campaign.findFirst({ where: { id, workspaceId } });
        if (!campaign) return res.status(404).json({ success: false, message: "Campaign not found" });

        const deletable = ["DRAFT"];
        if (!deletable.includes(campaign.status)) {
            return res.status(400).json({ success: false, message: `Cannot delete a campaign with status: ${campaign.status}` });
        }

        await prisma.campaign.delete({ where: { id } });

        return res.status(200).json({ success: true, message: "Campaign deleted successfully" });
    } catch (error) {
        console.error("DELETE CAMPAIGN ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// CAMPAIGN LIFECYCLE — STATUS TRANSITIONS (queue-integrated)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /campaigns/:id/launch
 * Transitions DRAFT | SCHEDULED | PAUSED → RUNNING and enqueues the campaign.
 */
const launchCampaign = async (req, res) => {
    try {
        const { workspaceId } = req.user;
        const { id } = req.params;

        const campaign = await prisma.campaign.findFirst({
            where: { id, workspaceId },
            include: {
                template: true,
                contacts: {
                    where: { status: "PENDING" },
                    include: {
                        contact: { select: { id: true, phoneNumber: true, isOptOut: true } },
                    },
                },
            },
        });

        if (!campaign) {
            return res.status(404).json({ success: false, message: "Campaign not found" });
        }

        const launchable = ["DRAFT", "SCHEDULED", "PAUSED"];
        if (!launchable.includes(campaign.status)) {
            return res.status(400).json({
                success: false,
                message: `Campaign cannot be launched from status: ${campaign.status}`,
            });
        }

        if (campaign.contacts.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No pending contacts to send to. Add recipients before launching.",
            });
        }

        if (!campaign.template || campaign.template.status !== "APPROVED") {
            return res.status(400).json({
                success: false,
                message: "Campaign template is not approved. Please use an approved template.",
            });
        }

        // Verify a connected WhatsApp account exists before committing
        const whatsappAccount = await prisma.whatsAppAccount.findFirst({
            where: { workspaceId, status: "connected" },
        });

        if (!whatsappAccount) {
            return res.status(422).json({
                success: false,
                message: "No connected WhatsApp account found. Please connect one before launching.",
            });
        }

        // Transition to RUNNING in DB first, then hand off to the queue
        const updated = await prisma.campaign.update({
            where: { id },
            data: { status: "RUNNING", startedAt: new Date() },
        });

        // Hand off to background queue — non-blocking
        const io = req.app.get("io");
        enqueueCampaign(id, io);

        return res.status(200).json({
            success: true,
            message: "Campaign launched — messages are being dispatched in the background",
            campaign: updated,
        });
    } catch (error) {
        console.error("LAUNCH CAMPAIGN ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * POST /campaigns/:id/pause
 * Transitions RUNNING → PAUSED and signals the queue worker to stop.
 */
const pauseCampaign = async (req, res) => {
    try {
        const { workspaceId } = req.user;
        const { id } = req.params;

        const campaign = await prisma.campaign.findFirst({ where: { id, workspaceId } });
        if (!campaign) return res.status(404).json({ success: false, message: "Campaign not found" });

        if (campaign.status !== "RUNNING") {
            return res.status(400).json({ success: false, message: "Only a RUNNING campaign can be paused" });
        }

        const updated = await prisma.campaign.update({
            where: { id },
            data: { status: "PAUSED" },
        });

        // Signal the in-process queue worker to stop after current batch
        pauseCampaignQueue(id);

        return res.status(200).json({ success: true, message: "Campaign paused", campaign: updated });
    } catch (error) {
        console.error("PAUSE CAMPAIGN ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * POST /campaigns/:id/resume
 * Transitions PAUSED → RUNNING and re-enqueues remaining PENDING contacts.
 */
const resumeCampaign = async (req, res) => {
    try {
        const { workspaceId } = req.user;
        const { id } = req.params;

        const campaign = await prisma.campaign.findFirst({ where: { id, workspaceId } });
        if (!campaign) return res.status(404).json({ success: false, message: "Campaign not found" });

        if (campaign.status !== "PAUSED") {
            return res.status(400).json({ success: false, message: "Only a PAUSED campaign can be resumed" });
        }

        const pendingCount = await prisma.campaignContact.count({
            where: { campaignId: id, status: "PENDING" },
        });

        if (pendingCount === 0) {
            // Nothing left to send — mark complete
            const updated = await prisma.campaign.update({
                where: { id },
                data: { status: "COMPLETED", completedAt: new Date() },
            });
            return res.status(200).json({ success: true, message: "Campaign already complete", campaign: updated });
        }

        const updated = await prisma.campaign.update({
            where: { id },
            data: { status: "RUNNING" },
        });

        const io = req.app.get("io");
        resumeCampaignQueue(id, io);

        return res.status(200).json({
            success: true,
            message: `Campaign resumed — ${pendingCount} pending contacts will now be processed`,
            campaign: updated,
        });
    } catch (error) {
        console.error("RESUME CAMPAIGN ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * POST /campaigns/:id/cancel
 * Transitions DRAFT | SCHEDULED | RUNNING | PAUSED → CANCELLED.
 */
const cancelCampaign = async (req, res) => {
    try {
        const { workspaceId } = req.user;
        const { id } = req.params;

        const campaign = await prisma.campaign.findFirst({ where: { id, workspaceId } });
        if (!campaign) return res.status(404).json({ success: false, message: "Campaign not found" });

        const cancellable = ["DRAFT", "SCHEDULED", "RUNNING", "PAUSED"];
        if (!cancellable.includes(campaign.status)) {
            return res.status(400).json({
                success: false,
                message: `Campaign with status ${campaign.status} cannot be cancelled`,
            });
        }

        const updated = await prisma.campaign.update({
            where: { id },
            data: { status: "CANCELLED" },
        });

        // Signal queue worker to abort
        cancelCampaignQueue(id);

        return res.status(200).json({ success: true, message: "Campaign cancelled", campaign: updated });
    } catch (error) {
        console.error("CANCEL CAMPAIGN ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// CAMPAIGN CONTACTS
// ─────────────────────────────────────────────────────────────────────────────

const getCampaignContacts = async (req, res) => {
    try {
        const { workspaceId } = req.user;
        const { id } = req.params;
        const { status, page = 1, limit = 50 } = req.query;

        const campaign = await prisma.campaign.findFirst({ where: { id, workspaceId } });
        if (!campaign) return res.status(404).json({ success: false, message: "Campaign not found" });

        const where = { campaignId: id };
        if (status) where.status = status;

        const skip = (Number(page) - 1) * Number(limit);

        const [contacts, total] = await Promise.all([
            prisma.campaignContact.findMany({
                where,
                include: {
                    contact: {
                        select: { id: true, name: true, phoneNumber: true, email: true, avatarUrl: true, isOptOut: true },
                    },
                },
                orderBy: { createdAt: "asc" },
                skip,
                take: Number(limit),
            }),
            prisma.campaignContact.count({ where }),
        ]);

        return res.status(200).json({
            success: true,
            message: "Campaign contacts fetched successfully",
            contacts,
            pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
        });
    } catch (error) {
        console.error("GET CAMPAIGN CONTACTS ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const addCampaignContacts = async (req, res) => {
    try {
        const { workspaceId } = req.user;
        const { id } = req.params;
        const { contactIds, audienceGroupId, variables } = req.body;

        const campaign = await prisma.campaign.findFirst({ where: { id, workspaceId } });
        if (!campaign) return res.status(404).json({ success: false, message: "Campaign not found" });

        if (campaign.status !== "DRAFT") {
            return res.status(400).json({ success: false, message: "Contacts can only be added to a DRAFT campaign" });
        }

        let resolvedContactIds = [];

        if (audienceGroupId) {
            const members = await prisma.contactGroupMember.findMany({
                where: { groupId: audienceGroupId, group: { workspaceId } },
                select: { contactId: true },
            });
            resolvedContactIds = members.map((m) => m.contactId);
        } else if (Array.isArray(contactIds) && contactIds.length > 0) {
            resolvedContactIds = contactIds;
        } else {
            return res.status(400).json({ success: false, message: "Provide contactIds or audienceGroupId" });
        }

        const eligible = await prisma.contact.findMany({
            where: { id: { in: resolvedContactIds }, workspaceId, isOptOut: false, deletedAt: null },
            select: { id: true },
        });
        const eligibleIds = eligible.map((c) => c.id);

        if (eligibleIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No eligible contacts found (all may be opted-out or invalid)",
            });
        }

        await prisma.$transaction(async (tx) => {
            await tx.campaignContact.createMany({
                data: eligibleIds.map((contactId) => ({
                    campaignId: id,
                    contactId,
                    status: "PENDING",
                    resolvedVariables: variables ?? {},
                })),
                skipDuplicates: true,
            });

            const count = await tx.campaignContact.count({ where: { campaignId: id } });
            await tx.campaign.update({ where: { id }, data: { totalRecipients: count } });
        });

        return res.status(200).json({ success: true, message: `${eligibleIds.length} contact(s) added to campaign` });
    } catch (error) {
        console.error("ADD CAMPAIGN CONTACTS ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const removeCampaignContact = async (req, res) => {
    try {
        const { workspaceId } = req.user;
        const { id, contactId } = req.params;

        const campaign = await prisma.campaign.findFirst({ where: { id, workspaceId } });
        if (!campaign) return res.status(404).json({ success: false, message: "Campaign not found" });

        if (campaign.status !== "DRAFT") {
            return res.status(400).json({ success: false, message: "Contacts can only be removed from a DRAFT campaign" });
        }

        const record = await prisma.campaignContact.findFirst({ where: { campaignId: id, contactId } });
        if (!record) return res.status(404).json({ success: false, message: "Contact not found in this campaign" });

        await prisma.$transaction(async (tx) => {
            await tx.campaignContact.delete({ where: { id: record.id } });
            const count = await tx.campaignContact.count({ where: { campaignId: id } });
            await tx.campaign.update({ where: { id }, data: { totalRecipients: count } });
        });

        return res.status(200).json({ success: true, message: "Contact removed from campaign" });
    } catch (error) {
        console.error("REMOVE CAMPAIGN CONTACT ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELIVERY STATUS UPDATE (webhook / internal worker callback)
// ─────────────────────────────────────────────────────────────────────────────

const updateContactDeliveryStatus = async (req, res) => {
    try {
        const { workspaceId } = req.user;
        const { id, contactId } = req.params;
        const { status, providerMessageId, error: errorMsg } = req.body;

        const VALID_STATUSES = ["SENT", "DELIVERED", "READ", "FAILED", "OPTED_OUT"];
        if (!status || !VALID_STATUSES.includes(status)) {
            return res.status(400).json({ success: false, message: `status must be one of: ${VALID_STATUSES.join(", ")}` });
        }

        const campaign = await prisma.campaign.findFirst({ where: { id, workspaceId } });
        if (!campaign) return res.status(404).json({ success: false, message: "Campaign not found" });

        const record = await prisma.campaignContact.findFirst({ where: { campaignId: id, contactId } });
        if (!record) return res.status(404).json({ success: false, message: "Contact not found in this campaign" });

        const now = new Date();
        const statusTimestamps = {
            SENT: { sentAt: now },
            DELIVERED: { deliveredAt: now },
            READ: { readAt: now },
            FAILED: { failedAt: now, error: errorMsg ?? null },
            OPTED_OUT: {},
        };

        await prisma.$transaction(async (tx) => {
            await tx.campaignContact.update({
                where: { id: record.id },
                data: {
                    status,
                    providerMessageId: providerMessageId ?? record.providerMessageId,
                    ...statusTimestamps[status],
                    ...(status === "FAILED" && { retryCount: { increment: 1 } }),
                },
            });

            const counterField = { SENT: "sentCount", DELIVERED: "deliveredCount", READ: "readCount", FAILED: "failedCount", OPTED_OUT: "optedOutCount" }[status];
            if (counterField) {
                await tx.campaign.update({ where: { id }, data: { [counterField]: { increment: 1 } } });
            }

            const pendingCount = await tx.campaignContact.count({ where: { campaignId: id, status: "PENDING" } });
            if (pendingCount === 0 && campaign.status === "RUNNING") {
                await tx.campaign.update({ where: { id }, data: { status: "COMPLETED", completedAt: now } });
            }
        });

        return res.status(200).json({ success: true, message: "Delivery status updated" });
    } catch (error) {
        console.error("UPDATE DELIVERY STATUS ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────────────────────────────────────────

const getCampaignAnalytics = async (req, res) => {
    try {
        const { workspaceId } = req.user;
        const { id } = req.params;

        const campaign = await prisma.campaign.findFirst({
            where: { id, workspaceId },
            select: {
                id: true, name: true, status: true, totalRecipients: true,
                sentCount: true, deliveredCount: true, readCount: true,
                failedCount: true, optedOutCount: true, startedAt: true,
                completedAt: true, createdAt: true,
            },
        });

        if (!campaign) return res.status(404).json({ success: false, message: "Campaign not found" });

        const breakdown = await prisma.campaignContact.groupBy({
            by: ["status"],
            where: { campaignId: id },
            _count: { status: true },
        });

        const statusMap = Object.fromEntries(breakdown.map((b) => [b.status, b._count.status]));
        const total = campaign.totalRecipients || 1;

        return res.status(200).json({
            success: true,
            message: "Campaign analytics fetched successfully",
            analytics: {
                ...campaign,
                rates: {
                    deliveryRate: ((campaign.deliveredCount / total) * 100).toFixed(2),
                    readRate: ((campaign.readCount / total) * 100).toFixed(2),
                    failureRate: ((campaign.failedCount / total) * 100).toFixed(2),
                    optOutRate: ((campaign.optedOutCount / total) * 100).toFixed(2),
                },
                breakdown: {
                    PENDING: statusMap["PENDING"] ?? 0,
                    SENT: statusMap["SENT"] ?? 0,
                    DELIVERED: statusMap["DELIVERED"] ?? 0,
                    READ: statusMap["READ"] ?? 0,
                    FAILED: statusMap["FAILED"] ?? 0,
                    OPTED_OUT: statusMap["OPTED_OUT"] ?? 0,
                },
            },
        });
    } catch (error) {
        console.error("GET CAMPAIGN ANALYTICS ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const getCampaignsOverview = async (req, res) => {
    try {
        const { workspaceId } = req.user;
        const { from, to } = req.query;

        const dateFilter = {};
        if (from) dateFilter.gte = new Date(from);
        if (to) dateFilter.lte = new Date(to);

        const where = { workspaceId, ...(Object.keys(dateFilter).length && { createdAt: dateFilter }) };

        const [totals, byStatus] = await Promise.all([
            prisma.campaign.aggregate({
                where,
                _count: { id: true },
                _sum: { totalRecipients: true, sentCount: true, deliveredCount: true, readCount: true, failedCount: true, optedOutCount: true },
            }),
            prisma.campaign.groupBy({ by: ["status"], where, _count: { status: true } }),
        ]);

        const statusBreakdown = Object.fromEntries(byStatus.map((b) => [b.status, b._count.status]));
        const totalSent = totals._sum.sentCount || 1;

        return res.status(200).json({
            success: true,
            message: "Campaigns overview fetched successfully",
            overview: {
                totalCampaigns: totals._count.id,
                totalRecipients: totals._sum.totalRecipients ?? 0,
                totalSent: totals._sum.sentCount ?? 0,
                totalDelivered: totals._sum.deliveredCount ?? 0,
                totalRead: totals._sum.readCount ?? 0,
                totalFailed: totals._sum.failedCount ?? 0,
                totalOptedOut: totals._sum.optedOutCount ?? 0,
                rates: {
                    deliveryRate: (((totals._sum.deliveredCount ?? 0) / totalSent) * 100).toFixed(2),
                    readRate: (((totals._sum.readCount ?? 0) / totalSent) * 100).toFixed(2),
                    failureRate: (((totals._sum.failedCount ?? 0) / totalSent) * 100).toFixed(2),
                },
                byStatus: statusBreakdown,
            },
        });
    } catch (error) {
        console.error("GET CAMPAIGNS OVERVIEW ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// DUPLICATE
// ─────────────────────────────────────────────────────────────────────────────

const duplicateCampaign = async (req, res) => {
    try {
        const { workspaceId } = req.user;
        const { id } = req.params;

        const source = await prisma.campaign.findFirst({
            where: { id, workspaceId },
            include: {
                contacts: {
                    where: { status: "PENDING" },
                    select: { contactId: true, resolvedVariables: true },
                },
            },
        });

        if (!source) return res.status(404).json({ success: false, message: "Campaign not found" });

        const clone = await prisma.$transaction(async (tx) => {
            const created = await tx.campaign.create({
                data: {
                    workspaceId,
                    name: `${source.name} (Copy)`,
                    description: source.description,
                    status: "DRAFT",
                    templateId: source.templateId,
                    audienceGroupId: source.audienceGroupId,
                    audienceFilter: source.audienceFilter ?? undefined,
                    settings: source.settings ?? undefined,
                    scheduledAt: null,
                    timezone: source.timezone,
                    totalRecipients: source.contacts.length,
                },
            });

            if (source.contacts.length > 0) {
                await tx.campaignContact.createMany({
                    data: source.contacts.map((c) => ({
                        campaignId: created.id,
                        contactId: c.contactId,
                        status: "PENDING",
                        resolvedVariables: c.resolvedVariables ?? {},
                    })),
                    skipDuplicates: true,
                });
            }

            return created;
        });

        return res.status(201).json({ success: true, message: "Campaign duplicated successfully", campaign: clone });
    } catch (error) {
        console.error("DUPLICATE CAMPAIGN ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export {
    // CRUD
    getCampaigns,
    getCampaignById,
    createCampaign,
    updateCampaign,
    deleteCampaign,

    // Lifecycle
    launchCampaign,
    pauseCampaign,
    resumeCampaign,   // ← new (was missing)
    cancelCampaign,

    // Contacts
    getCampaignContacts,
    addCampaignContacts,
    removeCampaignContact,
    updateContactDeliveryStatus,

    // Analytics
    getCampaignAnalytics,
    getCampaignsOverview,

    // Utility
    duplicateCampaign,
};