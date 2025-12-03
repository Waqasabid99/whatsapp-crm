import { prisma } from "../db.js";
import axios from "axios";

// Connect WhatsApp Account
const connectWhatsApp = async (req, res) => {
  try {
    const { userId } = req.params;
    // Generate the WhatsApp OAuth URL
    const appId = process.env.APP_ID;
    const redirectUri = encodeURIComponent(process.env.REDIRECT_URI);
    const state = userId;
    const whatsappAuthUrl = `https://www.facebook.com/v24.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&state=${state}&scope=whatsapp_business_manage_events,whatsapp_business_management,whatsapp_business_messaging`;

    res.status(200).json({ success: true, url: whatsappAuthUrl });
  } catch (error) {
    console.error("Error connecting WhatsApp:", error);
    res
      .status(500)
      .json({ success: false, message: "Server Error. Please try again." });
  }
};

const whatsappCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    const userId = state; // userId passed as state parameter

    // Validate required parameters
    if (!code || !userId) {
      return res.status(400).json({
        success: false,
        message: "Missing authorization code or user ID",
      });
    }

    // Verify user exists
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

    // STEP 1: Exchange code for access token
    const tokenResponse = await axios.get(
      "https://graph.facebook.com/v24.0/oauth/access_token",
      {
        params: {
          client_id: process.env.APP_ID,
          client_secret: process.env.APP_SECRET,
          code: code,
          redirect_uri: process.env.REDIRECT_URI,
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    if (!accessToken) {
      return res.status(500).json({
        success: false,
        message: "Failed to obtain access token",
      });
    }

    console.log("Access Token obtained successfully");

    // STEP 2: Get granted permissions and scopes
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
    
    console.log("Granted Scopes:", JSON.stringify(grantedScopes, null, 2));

    // Extract WABA ID from granted scopes
    let wabaId = null;
    for (const scope of grantedScopes) {
      if (scope.scope === "whatsapp_business_management" || 
          scope.scope === "whatsapp_business_messaging") {
        // The target_ids contain the WABA IDs
        if (scope.target_ids && scope.target_ids.length > 0) {
          wabaId = scope.target_ids[0];
          break;
        }
      }
    }

    if (!wabaId) {
      return res.status(404).json({
        success: false,
        message: "No WhatsApp Business Account found in permissions. Please ensure you've selected a WhatsApp Business Account during login.",
      });
    }

    console.log("WABA ID found:", wabaId);

    // STEP 3: Fetch Phone Number ID
    const phoneNumbersResponse = await axios.get(
      `https://graph.facebook.com/v24.0/${wabaId}/phone_numbers`,
      {
        params: {
          access_token: accessToken,
        },
      }
    );

    if (
      !phoneNumbersResponse.data.data ||
      phoneNumbersResponse.data.data.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message: "No phone numbers found for this WhatsApp Business Account",
      });
    }

    const phoneNumberData = phoneNumbersResponse.data.data[0];
    const phoneNumberId = phoneNumberData.id;
    const phoneNumber = phoneNumberData.display_phone_number;
    const displayName = phoneNumberData.verified_name;

    console.log("Phone Number Details:", {
      phoneNumberId,
      phoneNumber,
      displayName,
    });

    // STEP 4: Store WhatsApp Account in Database
    const existingAccount = await prisma.whatsAppAccount.findFirst({
      where: {
        workspaceId: workspace.id,
        phoneNumber: phoneNumber,
      },
    });

    let whatsappAccount;

    if (existingAccount) {
      // Update existing account
      whatsappAccount = await prisma.whatsAppAccount.update({
        where: { id: existingAccount.id },
        data: {
          displayName: displayName,
          accountId: wabaId,
          credentials: {
            accessToken: accessToken,
            phoneNumberId: phoneNumberId,
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
      // Create new account
      whatsappAccount = await prisma.whatsAppAccount.create({
        data: {
          workspaceId: workspace.id,
          provider: "WHATSAPP_CLOUD",
          phoneNumber: phoneNumber,
          displayName: displayName,
          accountId: wabaId,
          credentials: {
            accessToken: accessToken,
            phoneNumberId: phoneNumberId,
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
    }

    console.log("WhatsApp Account saved to database");

    // STEP 5: Subscribe to Webhooks
    try {
      const webhookResponse = await axios.post(
        `https://graph.facebook.com/v24.0/${wabaId}/subscribed_apps`,
        {},
        {
          params: {
            access_token: accessToken,
          },
        }
      );

      console.log("Webhook subscription response:", webhookResponse.data);

      // Update webhook verification status
      await prisma.whatsAppAccount.update({
        where: { id: whatsappAccount.id },
        data: { webhookVerified: true },
      });
    } catch (webhookError) {
      console.error("Webhook subscription failed:", webhookError.response?.data || webhookError.message);
      // Continue even if webhook subscription fails - can be done manually
    }

    // STEP 6: Create Audit Log
    await prisma.auditLog.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        action: "WHATSAPP_ACCOUNT_CONNECTED",
        resource: `WhatsAppAccount:${whatsappAccount.id}`,
        payload: {
          phoneNumber: phoneNumber,
          displayName: displayName,
          wabaId: wabaId,
        },
        ipAddress: req.ip || req.connection.remoteAddress,
      },
    });

    // STEP 7: Redirect to Success Page
    const frontendUrl = process.env.ORIGIN_URL || "http://localhost:5173";
    const redirectUrl = `${frontendUrl}/dashboard/workspace/${userId}/home?success=true&message=WhatsApp account connected successfully&wabaId=${wabaId}`;

    res.redirect(redirectUrl);
  } catch (error) {
    console.error("WhatsApp callback error:", error);

    // Log error details
    if (error.response) {
      console.error("API Error Response:", JSON.stringify(error.response.data, null, 2));
    }

    // Redirect to error page
    const frontendUrl = process.env.ORIGIN_URL || "http://localhost:5173";
    const errorMessage = encodeURIComponent(
      error.response?.data?.error?.message || "Failed to connect WhatsApp account"
    );
    const redirectUrl = `${frontendUrl}/dashboard/workspace/${userId}/home?error=true&message=${errorMessage}`;

    res.redirect(redirectUrl);
  }
};

// Disconnect WhatsApp Account
const disconnectWhatsApp = async (req, res) => {
  try {
    const { accountId } = req.params;
    const userId = req.user.userId; // From auth middleware

    // Find the WhatsApp account
    const whatsappAccount = await prisma.whatsAppAccount.findUnique({
      where: { id: accountId },
      include: { workspace: { include: { memberships: true } } },
    });

    if (!whatsappAccount) {
      return res.status(404).json({
        success: false,
        message: "WhatsApp account not found",
      });
    }

    // Check if user has permission
    const membership = whatsappAccount.workspace.memberships.find(
      (m) => m.userId === userId
    );

    if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
    }

    // Update account status
    await prisma.whatsAppAccount.update({
      where: { id: accountId },
      data: {
        disconnectedAt: new Date(),
        status: "disconnected",
        webhookVerified: false,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        workspaceId: whatsappAccount.workspaceId,
        userId: userId,
        action: "WHATSAPP_ACCOUNT_DISCONNECTED",
        resource: `WhatsAppAccount:${accountId}`,
        payload: {
          phoneNumber: whatsappAccount.phoneNumber,
        },
        ipAddress: req.ip || req.connection.remoteAddress,
      },
    });

    res.status(200).json({
      success: true,
      message: "WhatsApp account disconnected successfully",
    });
  } catch (error) {
    console.error("Error disconnecting WhatsApp:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export { connectWhatsApp, whatsappCallback, disconnectWhatsApp };