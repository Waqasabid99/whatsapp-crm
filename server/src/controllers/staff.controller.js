import { prisma } from "../db.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendInviteEmail } from "../utils/sendEmail.js";

// Create staff
const createStaff = async (req, res) => {
  try {
    const { workspaceId } = req.user;
    const { name, email, password, role } = req.body;

    // Only admin can create staff
    const requester = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: req.user.id,
          workspaceId,
        },
      },
    });

    if (!requester || requester.role !== "ADMIN")
      return res.status(403).json({ message: "Only admin can create staff." });

    const allowedRoles = ["ADMIN", "AGENT", "VIEWER"];
    if (!allowedRoles.includes(role))
      return res.status(400).json({ message: "Invalid staff role." });

    // Check if user exists
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: await bcrypt.hash(password, 10),
        },
      });
    }

    // Add membership
    const membership = await prisma.membership.upsert({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId,
        },
      },
      update: { role, isActive: true },
      create: { userId: user.id, workspaceId, role },
    });

    return res.status(201).json({
      message: "Staff member created.",
      staff: { user, membership },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error." });
  }
};

// Invite staff
const inviteStaff = async (req, res) => {
  try {
    const { workspaceId } = req.user;
    const { email, role } = req.body;

    const requester = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: req.user.id,
          workspaceId,
        },
      },
    });

    if (!requester || requester.role !== "ADMIN")
      return res.status(403).json({ message: "Only admin can invite staff." });

    const allowedRoles = ["ADMIN", "AGENT", "VIEWER"];
    if (!allowedRoles.includes(role))
      return res.status(400).json({ message: "Invalid staff role." });

    const inviteToken = crypto.randomUUID();

    const invite = await prisma.invite.create({
      data: { email, token: inviteToken, workspaceId, role },
    });

    // Send invite email
    await sendInviteEmail(email, inviteToken);

    return res.status(200).json({
      message: "Invitation sent.",
      invite,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error." });
  }
};

// Update staff role
const updateStaffRole = async (req, res) => {
  try {
    const { workspaceId } = req.user;
    const { membershipId } = req.params;
    const { role } = req.body;

    const allowedRoles = ["ADMIN", "AGENT", "VIEWER"];
    if (!allowedRoles.includes(role))
      return res.status(400).json({ message: "Invalid role." });

    const requesterMembership = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: req.user.id,
          workspaceId,
        },
      },
    });

    if (!requesterMembership || requesterMembership.role !== "ADMIN")
      return res.status(403).json({ message: "Only admin can update roles." });

    const target = await prisma.membership.findUnique({
      where: { id: membershipId },
    });
    if (!target || target.workspaceId !== workspaceId)
      return res.status(404).json({ message: "Staff member not found." });

    const updated = await prisma.membership.update({
      where: { id: membershipId },
      data: { role },
    });

    return res.status(200).json({
      message: "Staff role updated.",
      updated,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error." });
  }
};

// Get all staff
const getAllStaff = async (req, res) => {
  try {
    const { workspaceId } = req.user;
    const staff = await prisma.membership.findMany({
      where: {
        workspaceId,
        role: {
          in: ["AGENT", "VIEWER"]
        }
      },
      include: { user: true },
    });

    return res.status(200).json({
      success: true,
      message: "Staff fetched successfully",
      staff,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// Delete staff
const deleteStaff = async (req, res) => {
  try {
    const { workspaceId } = req.user;
    const { staffId } = req.params;

    // Check if staff exists and belongs to workspace
    const target = await prisma.membership.findUnique({
      where: { id: staffId },
    });
    if (!target || target.workspaceId !== workspaceId)
      return res.status(404).json({ message: "Staff member not found." });

    const deleted = await prisma.membership.delete({ where: { id: staffId } });

    return res.status(200).json({
      success: true,
      message: "Staff deleted successfully",
      deleted,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// acceptInvite
const acceptInvite = async (req, res) => {
  try {
    const { token, name, password } = req.body;

    // Find invite
    const invite = await prisma.invite.findUnique({
      where: { token },
      include: { workspace: true },
    });

    if (!invite) {
      return res.status(404).json({ message: "Invalid invite token." });
    }

    if (invite.accepted) {
      return res.status(400).json({ message: "Invite already accepted." });
    }

    // Check if user exists
    let user = await prisma.user.findUnique({ where: { email: invite.email } });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          name,
          email: invite.email,
          password: await bcrypt.hash(password, 10),
        },
      });
    } else if (!user.password) {
      // If user exists but has no password (SSO/API user)
      await prisma.user.update({
        where: { id: user.id },
        data: { name, password: await bcrypt.hash(password, 10) },
      });
    }

    // Add membership to workspace
    await prisma.membership.upsert({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId: invite.workspaceId,
        },
      },
      update: { role: invite.role, isActive: true },
      create: {
        userId: user.id,
        workspaceId: invite.workspaceId,
        role: invite.role,
      },
    });

    // Mark invite as accepted
    await prisma.invite.update({
      where: { id: invite.id },
      data: { accepted: true, acceptedAt: new Date() },
    });

    return res.status(200).json({
      message: "Invite accepted successfully. You can now login.",
      workspace: invite.workspace,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error." });
  }
};

export {
  createStaff,
  inviteStaff,
  updateStaffRole,
  getAllStaff,
  deleteStaff,
  acceptInvite,
};
