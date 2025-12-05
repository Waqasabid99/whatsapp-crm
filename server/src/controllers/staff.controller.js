import { prisma } from "../db.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendInviteEmail } from "../utils/sendEmail.js";
import { hashPassword, verifyPassword } from "../utils/constants.js";

// Create staff
const createStaff = async (req, res) => {
  try {
    const { workspaceId } = req.user;
    const { name, email, password, role } = req.body;

    // Only admin can create staff
    const requester = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: req.user.user.id,
          workspaceId,
        },
      },
    });

    if (!requester || requester.role !== "ADMIN" && requester.role !== "OWNER")
      return res.status(403).json({ message: "Only admin and owner can create staff." });

    const allowedRoles = ["AGENT", "VIEWER"];
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
      success: true,
      message: "Staff member created.",
      staff: { user, membership },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error." });
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
          userId: req.user.user.id,
          workspaceId,
        },
      },
    });

    const workspaceName = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { name: true },
    });

    if (!requester || requester.role !== "ADMIN" && requester.role !== "OWNER")
      return res.status(403).json({ message: "Only admin and owner can invite staff." });

    const allowedRoles = ["AGENT", "VIEWER"];
    if (!allowedRoles.includes(role))
      return res.status(400).json({ message: "Invalid staff role." });

    const inviteToken = crypto.randomUUID();

    const invite = await prisma.invite.create({
      data: { email, token: inviteToken, workspaceId, role },
    });

    // Send invite email
    await sendInviteEmail(email, workspaceName, inviteToken);

    return res.status(200).json({
      success: true,
      message: "Invitation sent.",
      invite,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// Update Staff
const updateStaff = async (req, res) => {
  try {
    const { workspaceId, role: requesterRole } = req.user;
    const { staffId } = req.params;
    const { name, email, currentPassword, password, role } = req.body;

    // Find membership entry
    const membership = await prisma.membership.findUnique({
      where: { userId_workspaceId: { userId: staffId, workspaceId } },
      include: { user: true },
    });

    if (!membership || membership.workspaceId !== workspaceId) {
      return res.status(404).json({ success: false, message: "Staff member not found." });
    }

    // Prevent modifying OWNER user in any way
    if (membership.role === "OWNER") {
      return res.status(403).json({
        success: false,
        message: "OWNER role cannot be modified.",
      });
    }

    // Validate role change
    const allowedRoles = ["AGENT", "VIEWER", "ADMIN"];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role." });
    }

    // Prevent upgrading AGENT/VIEWER → OWNER
    if (role === "OWNER") {
      return res.status(403).json({
        success: false,
        message: "You cannot assign OWNER role.",
      });
    }

    // Prevent making another ADMIN unless requester is OWNER
    if (role === "ADMIN" && requesterRole !== "OWNER") {
      return res.status(403).json({
        success: false,
        message: "Only OWNER can assign ADMIN role.",
      });
    }

    // Build user update payload
    const userData = {};

    if (name) userData.name = name;

    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== membership.userId) {
        return res.status(400).json({ success: false, message: "Email already in use." });
      }
      userData.email = email;
    }

    // Password update logic
    if (currentPassword || password) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password is required to change password.",
        });
      }

      const match = await verifyPassword(
        currentPassword,
        membership.user.password
      );

      if (!match) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect.",
        });
      }

      if (!password || password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "New password must be at least 6 characters.",
        });
      }

      userData.password = await hashPassword(password);
    }

    // Update user record
    if (Object.keys(userData).length > 0) {
      await prisma.user.update({
        where: { id: membership.userId },
        data: userData,
      });
    }

    // Update role
    let updatedMembership = membership;
    if (role) {
      updatedMembership = await prisma.membership.update({
        where: { id: membership.id },
        data: { role },
        include: { user: true },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Staff member updated successfully.",
      staff: updatedMembership,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error." });
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

// Delete Staff
const deleteStaff = async (req, res) => {
  try {
    const { workspaceId, id: requesterId, role: requesterRole } = req.user;
    const { staffId } = req.params; // this is userId

    // Find membership by (userId + workspaceId)
    const membership = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: staffId,
          workspaceId,
        },
      },
      include: { user: true },
    });

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found.",
      });
    }

    // Prevent deleting OWNER
    if (membership.role === "OWNER") {
      return res.status(403).json({
        success: false,
        message: "OWNER cannot be deleted.",
      });
    }

    // Prevent deleting yourself
    if (membership.userId === requesterId) {
      return res.status(403).json({
        success: false,
        message: "You cannot delete your own account.",
      });
    }

    // If staff is ADMIN, only OWNER can delete
    if (membership.role === "ADMIN" && requesterRole !== "OWNER") {
      return res.status(403).json({
        success: false,
        message: "Only OWNER can delete an ADMIN.",
      });
    }

    // Delete membership properly
    const deleted = await prisma.membership.delete({
      where: { id: membership.id },
      include: { user: true },
    });

     // Check if user has any other workspace memberships
    const remainingMemberships = await prisma.membership.count({
      where: { userId: staffId },
    });

    if (remainingMemberships === 0) {
      await prisma.user.delete({
        where: { id: staffId },
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Staff deleted successfully.",
      deleted,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
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
  updateStaff,
  getAllStaff,
  deleteStaff,
  acceptInvite,
};
