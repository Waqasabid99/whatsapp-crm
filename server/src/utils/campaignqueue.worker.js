/**
 * campaignQueue.worker.js
 *
 * In-process campaign dispatch queue built on Node's EventEmitter +
 * a simple async FIFO. No Redis / BullMQ required — drop-in ready.
 *
 * Architecture
 * ─────────────
 *  ┌──────────────────┐        ┌──────────────────────┐
 *  │  launchCampaign  │──add──▶│   CampaignQueue       │
 *  │  (controller)    │        │  (EventEmitter FIFO)  │
 *  └──────────────────┘        └────────┬─────────────┘
 *                                       │ per-contact job
 *                                       ▼
 *                              ┌──────────────────────┐
 *                              │  dispatchContact()    │
 *                              │  • calls Meta API     │
 *                              │  • updates DB         │
 *                              │  • emits socket event │
 *                              └──────────────────────┘
 *
 * Rate limiting
 * ─────────────
 * Meta's Cloud API enforces per-phone-number message limits.
 * The queue drains at DISPATCH_CONCURRENCY concurrent sends with a
 * DISPATCH_DELAY_MS pause between each burst to stay within limits.
 * Both are configurable via environment variables.
 *
 * Pause / Resume / Cancel
 * ────────────────────────
 * The worker checks the campaign's DB status before every send.
 * If it sees PAUSED or CANCELLED it stops processing remaining contacts
 * and leaves them as PENDING so a future resume can continue.
 */

import EventEmitter from "events";
import axios from "axios";
import { prisma } from "../db.js";
import { emitMessageStatusUpdate, emitConversationUpdate } from "../socket.js";
import { buildTemplatePayload } from "./buildTemplatePayload.js";

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

const DISPATCH_CONCURRENCY = parseInt(process.env.CAMPAIGN_CONCURRENCY || "5", 10);
const DISPATCH_DELAY_MS = parseInt(process.env.CAMPAIGN_DELAY_MS || "200", 10);
const MAX_RETRIES = parseInt(process.env.CAMPAIGN_MAX_RETRIES || "2", 10);
const GRAPH_API_VERSION = process.env.WHATSAPP_API_VERSION || "v24.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

// ─────────────────────────────────────────────────────────────────────────────
// Internal queue state
// ─────────────────────────────────────────────────────────────────────────────

const emitter = new EventEmitter();
emitter.setMaxListeners(50);

/** @type {Map<string, { running: boolean, paused: boolean }>} */
const activeCampaigns = new Map();

// ─────────────────────────────────────────────────────────────────────────────
// Public API — called from the controller
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Enqueue a campaign for dispatch.
 * Call this after setting campaign status → RUNNING in the controller.
 *
 * @param {string}      campaignId
 * @param {object|null} io          - Socket.io server instance (optional)
 */
export const enqueueCampaign = (campaignId, io = null) => {
    if (activeCampaigns.get(campaignId)?.running) {
        console.log(`[Queue] Campaign ${campaignId} is already running — skipping enqueue`);
        return;
    }

    activeCampaigns.set(campaignId, { running: true, paused: false });
    console.log(`[Queue] Enqueued campaign: ${campaignId}`);

    // Run asynchronously — do not await so the controller returns immediately
    processCampaign(campaignId, io).catch((err) => {
        console.error(`[Queue] Unhandled error in campaign ${campaignId}:`, err);
        activeCampaigns.delete(campaignId);
    });
};

/**
 * Signal the worker to pause a running campaign.
 * The controller should also update DB status → PAUSED before calling this.
 */
export const pauseCampaignQueue = (campaignId) => {
    const state = activeCampaigns.get(campaignId);
    if (state) {
        state.paused = true;
        console.log(`[Queue] Pause signal sent to campaign: ${campaignId}`);
    }
};

/**
 * Resume a paused campaign.
 * The controller should update DB status → RUNNING before calling this.
 */
export const resumeCampaignQueue = (campaignId, io = null) => {
    const state = activeCampaigns.get(campaignId);
    if (state) {
        state.paused = false;
        state.running = true;
        console.log(`[Queue] Resuming campaign: ${campaignId}`);
        processCampaign(campaignId, io).catch(console.error);
    } else {
        // Not tracked yet (e.g. after server restart) — start fresh
        enqueueCampaign(campaignId, io);
    }
};

/**
 * Cancel a campaign — worker will stop after the current in-flight batch.
 */
export const cancelCampaignQueue = (campaignId) => {
    const state = activeCampaigns.get(campaignId);
    if (state) {
        state.running = false;
        state.paused = false;
        activeCampaigns.delete(campaignId);
        console.log(`[Queue] Cancel signal sent to campaign: ${campaignId}`);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// Core processor
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Load all PENDING contacts for a campaign and dispatch them in batches,
 * respecting pause/cancel signals between each batch.
 */
const processCampaign = async (campaignId, io) => {
    console.log(`[Queue] Processing campaign: ${campaignId}`);

    try {
        // ── Load campaign + credentials ─────────────────────────────────────────
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
            include: { template: true },
        });

        if (!campaign) {
            console.error(`[Queue] Campaign not found: ${campaignId}`);
            activeCampaigns.delete(campaignId);
            return;
        }

        if (campaign.status !== "RUNNING") {
            console.log(`[Queue] Campaign ${campaignId} is not RUNNING (${campaign.status}) — aborting`);
            activeCampaigns.delete(campaignId);
            return;
        }

        const whatsappAccount = await prisma.whatsAppAccount.findFirst({
            where: { workspaceId: campaign.workspaceId, status: "connected" },
            orderBy: { createdAt: "asc" },
        });

        if (!whatsappAccount) {
            console.error(`[Queue] No connected WhatsApp account for workspace ${campaign.workspaceId}`);
            await failCampaign(campaignId, "No connected WhatsApp account");
            activeCampaigns.delete(campaignId);
            return;
        }

        const accessToken = whatsappAccount.credentials?.accessToken;
        const phoneNumberId = whatsappAccount.phoneNumberId;

        if (!accessToken || !phoneNumberId) {
            await failCampaign(campaignId, "Missing WhatsApp credentials");
            activeCampaigns.delete(campaignId);
            return;
        }

        // ── Load all PENDING contacts ───────────────────────────────────────────
        const pendingContacts = await prisma.campaignContact.findMany({
            where: { campaignId, status: "PENDING" },
            include: {
                contact: { select: { id: true, phoneNumber: true, name: true, isOptOut: true } },
            },
            orderBy: { createdAt: "asc" },
        });

        if (pendingContacts.length === 0) {
            console.log(`[Queue] No PENDING contacts for campaign ${campaignId} — marking complete`);
            await completeCampaign(campaignId);
            activeCampaigns.delete(campaignId);
            return;
        }

        console.log(`[Queue] Dispatching ${pendingContacts.length} contacts for campaign ${campaignId}`);

        // ── Dispatch in batches ─────────────────────────────────────────────────
        for (let i = 0; i < pendingContacts.length; i += DISPATCH_CONCURRENCY) {
            // Check pause / cancel signal before every batch
            const state = activeCampaigns.get(campaignId);
            if (!state || !state.running) {
                console.log(`[Queue] Campaign ${campaignId} cancelled — stopping dispatch`);
                return;
            }
            if (state.paused) {
                console.log(`[Queue] Campaign ${campaignId} paused — stopping dispatch (will resume)`);
                return;
            }

            // Also re-check DB status to catch external pause/cancel from another server instance
            const freshStatus = await prisma.campaign.findUnique({
                where: { id: campaignId },
                select: { status: true },
            });

            if (!freshStatus || !["RUNNING"].includes(freshStatus.status)) {
                console.log(`[Queue] Campaign ${campaignId} DB status is ${freshStatus?.status} — stopping`);
                activeCampaigns.delete(campaignId);
                return;
            }

            const batch = pendingContacts.slice(i, i + DISPATCH_CONCURRENCY);

            // Dispatch all contacts in this batch concurrently
            await Promise.allSettled(
                batch.map((cc) =>
                    dispatchContact({
                        campaignContact: cc,
                        campaign,
                        whatsappAccount,
                        accessToken,
                        phoneNumberId,
                        io,
                    })
                )
            );

            // Rate-limit pause between batches
            if (i + DISPATCH_CONCURRENCY < pendingContacts.length) {
                await sleep(DISPATCH_DELAY_MS);
            }
        }

        // ── All contacts processed — check if campaign is complete ──────────────
        const remainingPending = await prisma.campaignContact.count({
            where: { campaignId, status: "PENDING" },
        });

        if (remainingPending === 0) {
            await completeCampaign(campaignId);
        }

        activeCampaigns.delete(campaignId);
        console.log(`[Queue] Campaign ${campaignId} dispatch finished`);

    } catch (error) {
        console.error(`[Queue] processCampaign error for ${campaignId}:`, error);
        activeCampaigns.delete(campaignId);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// Per-contact dispatch
// ─────────────────────────────────────────────────────────────────────────────

const dispatchContact = async ({
    campaignContact,
    campaign,
    whatsappAccount,
    accessToken,
    phoneNumberId,
    io,
}) => {
    const { id: ccId, contact, resolvedVariables, retryCount } = campaignContact;

    // Skip opted-out contacts
    if (contact.isOptOut) {
        await prisma.campaignContact.update({
            where: { id: ccId },
            data: { status: "OPTED_OUT" },
        });
        await prisma.campaign.update({
            where: { id: campaign.id },
            data: { optedOutCount: { increment: 1 } },
        });
        console.log(`[Queue] Skipped opted-out contact: ${contact.id}`);
        return;
    }

    try {
        // ── Build Meta API payload ────────────────────────────────────────────────
        const requestBody = buildTemplatePayload({
            toPhoneNumber: contact.phoneNumber,
            template: campaign.template,
            variables: resolvedVariables ?? {},
        });

        // ── POST to Meta Cloud API ───────────────────────────────────────────────
        const response = await axios.post(
            `${GRAPH_BASE}/${phoneNumberId}/messages`,
            requestBody,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                timeout: 10_000,
            }
        );

        const providerMessageId = response.data?.messages?.[0]?.id;
        const now = new Date();

        // ── Persist message to Message table (for conversation threading) ────────
        const conversation = await findOrCreateConversation({
            workspaceId: campaign.workspaceId,
            contactId: contact.id,
            whatsappAccountId: whatsappAccount.id,
        });

        const message = await prisma.message.create({
            data: {
                conversationId: conversation.id,
                workspaceId: campaign.workspaceId,
                direction: "OUTBOUND",
                status: "SENT",
                sentAt: now,
                providerMessageId,
                payload: {
                    campaignId: campaign.id,
                    templateId: campaign.templateId,
                    variables: resolvedVariables,
                },
                text: campaign.template?.name
                    ? `[Template: ${campaign.template.name}]`
                    : null,
            },
        });

        // ── Update CampaignContact ───────────────────────────────────────────────
        await prisma.$transaction([
            prisma.campaignContact.update({
                where: { id: ccId },
                data: { status: "SENT", providerMessageId, sentAt: now },
            }),
            prisma.campaign.update({
                where: { id: campaign.id },
                data: { sentCount: { increment: 1 } },
            }),
            prisma.conversation.update({
                where: { id: conversation.id },
                data: { lastMessageAt: now },
            }),
        ]);

        // ── Emit socket event ────────────────────────────────────────────────────
        if (io) {
            emitMessageStatusUpdate(io, campaign.workspaceId, message.id, "SENT", now);
            emitConversationUpdate(io, campaign.workspaceId, {
                id: conversation.id,
                lastMessageAt: now,
            });
        }

        console.log(`[Queue] Sent to ${contact.phoneNumber} — provider: ${providerMessageId}`);

    } catch (error) {
        const errMsg = error.response?.data?.error?.message || error.message || "Unknown error";
        console.error(`[Queue] Failed to send to contact ${contact.id}:`, errMsg);

        const shouldRetry = retryCount < MAX_RETRIES;

        await prisma.$transaction([
            prisma.campaignContact.update({
                where: { id: ccId },
                data: shouldRetry
                    ? {
                        retryCount: { increment: 1 },
                        error: errMsg,
                        // Keep status PENDING so it will be retried on next processCampaign call
                    }
                    : {
                        status: "FAILED",
                        failedAt: new Date(),
                        error: errMsg,
                        retryCount: { increment: 1 },
                    },
            }),
            ...(!shouldRetry
                ? [
                    prisma.campaign.update({
                        where: { id: campaign.id },
                        data: { failedCount: { increment: 1 } },
                    }),
                ]
                : []),
        ]);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Find an existing open conversation or create a new one for campaign messages */
const findOrCreateConversation = async ({ workspaceId, contactId, whatsappAccountId }) => {
    const existing = await prisma.conversation.findFirst({
        where: {
            workspaceId,
            contactId,
            whatsappAccountId,
            status: { in: ["OPEN", "RESOLVED"] },
        },
        orderBy: { createdAt: "desc" },
    });

    if (existing) return existing;

    return prisma.conversation.create({
        data: {
            workspaceId,
            contactId,
            whatsappAccountId,
            status: "OPEN",
            unreadCount: 0,
            lastMessageAt: new Date(),
        },
    });
};

/** Mark campaign as COMPLETED and stamp completedAt */
const completeCampaign = async (campaignId) => {
    await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: "COMPLETED", completedAt: new Date() },
    });
    console.log(`[Queue] Campaign ${campaignId} marked COMPLETED`);
};

/** Mark campaign as FAILED (no WhatsApp account / bad credentials) */
const failCampaign = async (campaignId, reason) => {
    await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: "CANCELLED" },
    });
    console.error(`[Queue] Campaign ${campaignId} failed: ${reason}`);
};

/** Tiny delay helper */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ─────────────────────────────────────────────────────────────────────────────
// Scheduled campaign poller
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Poll the DB every minute for SCHEDULED campaigns whose scheduledAt has passed
 * and launch them automatically.
 *
 * Call startScheduledCampaignPoller(io) once in index.js after the server starts.
 */
export const startScheduledCampaignPoller = (io) => {
    const POLL_INTERVAL_MS = 60_000; // 1 minute

    const poll = async () => {
        try {
            const now = new Date();

            const due = await prisma.campaign.findMany({
                where: {
                    status: "SCHEDULED",
                    scheduledAt: { lte: now },
                },
                select: { id: true },
            });

            for (const { id } of due) {
                console.log(`[Poller] Auto-launching scheduled campaign: ${id}`);

                await prisma.campaign.update({
                    where: { id },
                    data: { status: "RUNNING", startedAt: now },
                });

                enqueueCampaign(id, io);
            }
        } catch (err) {
            console.error("[Poller] Error polling for scheduled campaigns:", err);
        }
    };

    // Run once immediately on startup, then every POLL_INTERVAL_MS
    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);

    console.log("[Poller] Scheduled campaign poller started (60s interval)");
    return interval; // return so caller can clearInterval on graceful shutdown
};