import { prisma } from "../db.js";
import {
  generateRefreshToken,
  generateToken,
  hashPassword,
  safeUser,
  verifyPassword,
} from "../utils/constants.js";

const createUser = async (req, res) => {
  try {
    const { name, email, password, workspaceName, selectedPlanSlug } = req.body;

    if (!name || !email || !password || !workspaceName || !selectedPlanSlug) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true },
    });

    // Create workspace
    const workspace = await prisma.workspace.create({
      data: {
        name: workspaceName,
        slug: workspaceName.replace(/\s+/g, "-").toLowerCase() + "-" + user.id,
      },
    });

    // Create membership (OWNER)
    await prisma.membership.create({
      data: {
        role: "OWNER",
        workspaceId: workspace.id,
        userId: user.id,
      },
    });

    // Fetch the selected plan
    const plan = await prisma.plan.findUnique({
      where: { slug: selectedPlanSlug },
      include: { featureLimits: true },
    });

    if (!plan) {
      return res
        .status(400)
        .json({ success: false, message: "Selected plan not found" });
    }

    // Create subscription for the workspace
    const now = new Date();
    const subscription = await prisma.subscription.create({
      data: {
        workspaceId: workspace.id,
        planId: plan.id,
        status: "ACTIVE",
        currentPeriodStart: now,
        currentPeriodEnd: new Date(
          now.setMonth(now.getMonth() + 1) // assuming monthly billing
        ),
      },
    });

    // Initialize usage for all features of this plan
    const usageData = plan.featureLimits.map((feature) => ({
      workspaceId: workspace.id,
      key: feature.key,
      periodStart: new Date(),
      periodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      count: 0,
    }));

    await prisma.usage.createMany({
      data: usageData,
    });

    // Generate tokens
    const accessToken = generateToken({ userId: user.id });
    const refreshTokenValue = generateRefreshToken({ userId: user.id });

    // Store refresh token in DB
    await prisma.refreshToken.create({
      data: {
        token: refreshTokenValue,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Send tokens as HttpOnly cookies
    res
      .status(200)
      .cookie("accessToken", accessToken, { httpOnly: true, secure: false })
      .cookie("refreshToken", refreshTokenValue, {
        httpOnly: true,
        secure: false,
      })
      .json({ success: true, message: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
    console.log("Something went wrong", error);
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // 2. Validate password
    const validPassword = await verifyPassword(password, user.password);
    if (!validPassword)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    // 3. Delete old refresh tokens (optional security enhancement)
    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });

    // 4. Fetch user workspaces + subscription + plan
    const memberships = await prisma.membership.findMany({
      where: { userId: user.id },
      include: {
        workspace: {
          include: {
            plans: {
              // ← use "plans" instead of "subscription"
              include: {
                plan: true, // include the plan details for each subscription
              },
            },
          },
        },
      },
    });

    // Format workspace data
    const workspaces = memberships.map((m) => ({
      id: m.workspace.id,
      name: m.workspace.name,
      slug: m.workspace.slug,
      role: m.role,
      subscription: m.workspace.subscription
        ? {
            status: m.workspace.subscription.status,
            renewsAt: m.workspace.subscription.renewsAt,
            plan: {
              name: m.workspace.subscription.plan.name,
              slug: m.workspace.subscription.plan.slug,
              priceCents: m.workspace.subscription.plan.priceCents,
              billingInterval: m.workspace.subscription.plan.billingInterval,
            },
          }
        : null,
    }));

    // 5. Generate auth tokens
    const accessToken = generateToken({ userId: user.id });
    const refreshTokenValue = generateRefreshToken({ userId: user.id });

    // 6. Store refresh token in DB
    await prisma.refreshToken.create({
      data: {
        token: refreshTokenValue,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // 7. Send tokens via HttpOnly cookies
    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      })
      .cookie("refreshToken", refreshTokenValue, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      });

    // 8. Respond with user + workspace data
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: safeUser(user),
      workspaces,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken)
    return res.status(401).json({ message: "No refresh token provided" });

  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });
  if (
    !tokenRecord ||
    tokenRecord.expiresAt < new Date() ||
    tokenRecord.revoked
  ) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  const user = await prisma.user.findUnique({
    where: { id: tokenRecord.userId },
  });
  if (!user) return res.status(404).json({ message: "User not found" });

  const newAccessToken = generateToken({ userId: user.id });
  const newRefreshToken = generateRefreshToken({ userId: user.id });

  // Rotate refresh token
  await prisma.refreshToken.update({
    where: { token: refreshToken },
    data: {
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  res
    .cookie("accessToken", newAccessToken, { httpOnly: true, secure: false })
    .cookie("refreshToken", newRefreshToken, { httpOnly: true, secure: false })
    .json({ accessToken: newAccessToken });
};

export { createUser, refreshAccessToken, loginUser };
