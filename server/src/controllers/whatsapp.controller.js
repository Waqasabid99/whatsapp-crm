import { prisma } from "../db.js";
import axios from "axios";
import crypto from "crypto";

// Connect WhatsApp Account — returns the OAuth URL for the frontend to redirect to
const connectWhatsApp = async (req, res) => {
  try {
    const { userId } = req.params;
    const appId = process.env.APP_ID;
    const redirectUri = encodeURIComponent(process.env.REDIRECT_URI);
    const state = userId;

    // Scopes: whatsapp_business_manage_events is not a valid Meta scope — removed.
    // business_management is required to read WABA details and phone numbers.
    const whatsappAuthUrl =
      `https://www.facebook.com/v24.0/dialog/oauth` +
      `?client_id=${appId}` +
      `&redirect_uri=${redirectUri}` +
      `&state=${state}` +
      `&scope=business_management,whatsapp_business_management,whatsapp_business_messaging`;

    res.status(200).json({ success: true, url: whatsappAuthUrl });
  } catch (error) {
    console.error("Error connecting WhatsApp:", error);
    res
      .status(500)
      .json({ success: false, message: "Server Error. Please try again." });
  }
};

const whatsappCallback = async (req, res) => {
  // userId is extracted from the verified JWT via auth middleware, not from `state`
  // `state` is kept for CSRF validation if needed but we rely on the session user
  const userId = req.user.user.id;
  const frontendUrl = process.env.ORIGIN_URL || "http://localhost:5173";

  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Missing authorization code",
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Missing authorization code or user ID",
      });
    }

    // ── Verify user and resolve their OWNER workspace ────────────────────────
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          where: { role: "OWNER" },
          include: { workspace: true },
        },
      },
    });

    if (!user || user.memberships.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found or no workspace available",
      });
    }

    const workspace = user.memberships[0].workspace;

    // ── STEP 1: Exchange code for access token ────────────────────────────────
    const tokenResponse = await axios.get(
      "https://graph.facebook.com/v24.0/oauth/access_token",
      {
        params: {
          client_id: process.env.APP_ID,
          client_secret: process.env.APP_SECRET,
          code,
          redirect_uri: process.env.REDIRECT_URI,
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) {
      return res.status(500).json({
        success: false,
        message: "Failed to obtain access token from Meta",
      });
    }

    console.log("Access token obtained successfully");

    // ── STEP 2: Debug token to extract WABA ID from granted scopes ────────────
    const debugTokenResponse = await axios.get(
      "https://graph.facebook.com/v24.0/debug_token",
      {
        params: {
          input_token: accessToken,
          access_token: `${process.env.APP_ID}|${process.env.APP_SECRET}`,
        },
      }
    );

    const tokenData = debugTokenResponse.data.data;
    const grantedScopes = tokenData.granular_scopes || [];

    console.log("Granted scopes:", JSON.stringify(grantedScopes, null, 2));

    let wabaId = null;
    for (const scope of grantedScopes) {
      if (
        scope.scope === "whatsapp_business_management" ||
        scope.scope === "whatsapp_business_messaging"
      ) {
        if (scope.target_ids && scope.target_ids.length > 0) {
          wabaId = scope.target_ids[0];
          break;
        }
      }
    }

    if (!wabaId) {
      return res.status(404).json({
        success: false,
        message:
          "No WhatsApp Business Account found in permissions. " +
          "Please ensure you've selected a WhatsApp Business Account during login.",
      });
    }

    console.log("WABA ID found:", wabaId);

    // ── STEP 3: Fetch phone number from WABA ──────────────────────────────────
    const phoneNumbersResponse = await axios.get(
      `https://graph.facebook.com/v24.0/${wabaId}/phone_numbers`,
      { params: { access_token: accessToken } }
    );

    const phoneNumbers = phoneNumbersResponse.data.data;
    if (!phoneNumbers || phoneNumbers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No phone numbers found for this WhatsApp Business Account",
      });
    }

    const phoneNumberData = phoneNumbers[0];
    // Schema field: phoneNumberId (top-level, not inside credentials)
    const phoneNumberId = phoneNumberData.id;
    const phoneNumber = phoneNumberData.display_phone_number;
    const displayName = phoneNumberData.verified_name;

    console.log("Phone number details:", {
      phoneNumberId,
      phoneNumber,
      displayName,
    });

    // ── STEP 4: Upsert WhatsApp account in DB ─────────────────────────────────
    // Schema fields used:
    //   wabaId        — WhatsApp Business Account ID  (NOT accountId)
    //   phoneNumberId — top-level field on the model  (NOT inside credentials)
    //   credentials   — stores only the access token + scopes (encrypted at app layer)
    //   status        — "connected" | "pending" | "error" | "disconnected"
    const existingAccount = await prisma.whatsAppAccount.findFirst({
      where: { workspaceId: workspace.id, phoneNumber },
    });

    let whatsappAccount;
    let isNewAccount = false;
    if (existingAccount) {
      whatsappAccount = await prisma.whatsAppAccount.update({
        where: { id: existingAccount.id },
        data: {
          displayName,
          wabaId, // schema field (was wrongly "accountId")
          phoneNumberId, // top-level schema field
          credentials: {
            accessToken,
            tokenScopes: grantedScopes,
          },
          connectedAt: new Date(),
          disconnectedAt: null,
          status: "connected",
          webhookVerified: false,
          metadata: {
            lastSync: new Date().toISOString(),
            apiVersion: "v24.0",
          },
        },
      });
    } else {
      whatsappAccount = await prisma.whatsAppAccount.create({
        data: {
          workspaceId: workspace.id,
          provider: "WHATSAPP_CLOUD",
          phoneNumber,
          displayName,
          wabaId, // schema field
          phoneNumberId, // top-level schema field
          credentials: {
            accessToken,
            tokenScopes: grantedScopes,
          },
          connectedAt: new Date(),
          status: "connected",
          webhookVerified: false,
          metadata: {
            lastSync: new Date().toISOString(),
            apiVersion: "v24.0",
          },
        },
      });
      isNewAccount = true;
    }

    console.log("WhatsApp account saved to database:", whatsappAccount.id);

    // ── STEP 5: Subscribe to Meta webhooks ────────────────────────────────────
    try {
      const webhookResponse = await axios.post(
        `https://graph.facebook.com/v24.0/${wabaId}/subscribed_apps`,
        {},
        { params: { access_token: accessToken } }
      );

      console.log("Webhook subscription response:", webhookResponse.data);

      await prisma.whatsAppAccount.update({
        where: { id: whatsappAccount.id },
        data: { webhookVerified: true },
      });
    } catch (webhookError) {
      // Non-fatal — operator can re-subscribe manually from the dashboard
      console.error(
        "Webhook subscription failed:",
        webhookError.response?.data || webhookError.message
      );
    }

    // ── STEP 6: Update usage counter for WHATSAPP_ACCOUNTS ───────────────────
    // The plan tracks how many WhatsApp accounts a workspace is allowed.
    // Increment the usage record for the current billing period.
    try {
      const now = new Date();
      const usageRecord = await prisma.usage.findFirst({
        where: {
          workspaceId: workspace.id,
          key: "WHATSAPP_ACCOUNTS",
          periodStart: { lte: now },
          periodEnd: { gte: now },
        },
      });

      if (usageRecord) {
        await prisma.usage.update({
          where: { id: usageRecord.id },
          data: { count: { increment: 1 } },
        });
      } else {
        // No usage row yet for this period — this can happen if the subscription
        // was created before usage rows were initialised; create a new one.
        console.warn(
          "No active WHATSAPP_ACCOUNTS usage record found for workspace:",
          workspace.id
        );
      }
    } catch (usageError) {
      // Non-fatal — don't block the connection flow over a usage counter
      console.error("Failed to update WHATSAPP_ACCOUNTS usage:", usageError);
    }

    // Only create API key for brand-new connections
    let apiKeyPlaintext = null;
    if (isNewAccount) {
      apiKeyPlaintext = `waba_${crypto.randomBytes(32).toString("hex")}`;
      const keyPrefix = apiKeyPlaintext.slice(0, 8);
      const keyHash = crypto
        .createHash("sha256")
        .update(apiKeyPlaintext)
        .digest("hex");

      await prisma.apiKey.create({
        data: {
          workspaceId: workspace.id,
          name: `WhatsApp API Key - ${phoneNumber}`,
          keyHash,
          keyPrefix,
          scopes: ["WHATSAPP_API"],
          isActive: true,
          createdById: user.id,
        },
      });
    } else {
      console.warn("Not creating API key for existing WhatsApp account");
    }

    // ── STEP 7: Audit log ─────────────────────────────────────────────────────
    // Schema: AuditLog uses `changes` (Json), NOT `payload`
    await prisma.auditLog.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        action: "whatsapp_account.connected",
        resource: `WhatsAppAccount:${whatsappAccount.id}`,
        changes: {
          phoneNumber,
          displayName,
          wabaId,
          phoneNumberId,
        },
        ipAddress: req.ip || req.socket?.remoteAddress,
      },
    });

    // ── STEP 8: Redirect to frontend success page ─────────────────────────────
    console.log(apiKeyPlaintext)
    const redirectUrl =
      `${frontendUrl}/dashboard/workspace/${workspace.id}/home` +
      `?success=true&message=WhatsApp+account+connected+successfully&wabaId=${wabaId}&apiKey=${apiKeyPlaintext}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("WhatsApp callback error:", error);
    if (error.response) {
      console.error(
        "Meta API error:",
        JSON.stringify(error.response.data, null, 2)
      );
    }

    const errorMessage = encodeURIComponent(
      error.response?.data?.error?.message ||
        "Failed to connect WhatsApp account"
    );
    res.redirect(
      `${frontendUrl}/dashboard/workspace/${userId}/home?error=true&message=${errorMessage}`
    );
  }
};

// Disconnect WhatsApp Account
const disconnectWhatsApp = async (req, res) => {
  try {
    const { accountId } = req.params;
    const userId = req.user.userId; // consistent with whatsappCallback

    const whatsappAccount = await prisma.whatsAppAccount.findUnique({
      where: { id: accountId },
      include: { workspace: { include: { memberships: true } } },
    });

    if (!whatsappAccount) {
      return res
        .status(404)
        .json({ success: false, message: "WhatsApp account not found" });
    }

    // Authorisation: only OWNER or ADMIN may disconnect
    const membership = whatsappAccount.workspace.memberships.find(
      (m) => m.userId === userId
    );

    if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
      return res
        .status(403)
        .json({ success: false, message: "Insufficient permissions" });
    }

    // Mark as disconnected (soft — keep the record for audit history)
    await prisma.whatsAppAccount.update({
      where: { id: accountId },
      data: {
        disconnectedAt: new Date(),
        status: "disconnected",
        webhookVerified: false,
      },
    });

    // Decrement WHATSAPP_ACCOUNTS usage for the current billing period
    try {
      const now = new Date();
      const usageRecord = await prisma.usage.findFirst({
        where: {
          workspaceId: whatsappAccount.workspaceId,
          key: "WHATSAPP_ACCOUNTS",
          periodStart: { lte: now },
          periodEnd: { gte: now },
        },
      });

      if (usageRecord && usageRecord.count > 0) {
        await prisma.usage.update({
          where: { id: usageRecord.id },
          data: { count: { decrement: 1 } },
        });
      }
    } catch (usageError) {
      console.error("Failed to decrement WHATSAPP_ACCOUNTS usage:", usageError);
    }

    // Audit log — schema uses `changes`, not `payload`
    await prisma.auditLog.create({
      data: {
        workspaceId: whatsappAccount.workspaceId,
        userId,
        action: "whatsapp_account.disconnected",
        resource: `WhatsAppAccount:${accountId}`,
        changes: {
          phoneNumber: whatsappAccount.phoneNumber,
          wabaId: whatsappAccount.wabaId,
        },
        ipAddress: req.ip || req.socket?.remoteAddress,
      },
    });

    res.status(200).json({
      success: true,
      message: "WhatsApp account disconnected successfully",
    });
  } catch (error) {
    console.error("Error disconnecting WhatsApp:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export { connectWhatsApp, whatsappCallback, disconnectWhatsApp };
