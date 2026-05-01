import { prisma } from "../db.js";

// Auto-assign conversation based on workspace assignment rules
const autoAssignConversation = async ({ conversationId }) => {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { workspace: true },
    });

    if (!conversation) {
      console.error(`Conversation not found: ${conversationId}`);
      return null;
    }

    // Skip if already assigned
    if (conversation.assigneeId) {
      console.log(`Conversation ${conversationId} already assigned`);
      return conversation;
    }

    const workspaceId = conversation.workspaceId;

    // Get assignment rule for workspace
    let assignmentRule = await prisma.assignmentRule.findUnique({
      where: { workspaceId },
    });

    // If no rule exists, create default round-robin rule
    if (!assignmentRule) {
      assignmentRule = await prisma.assignmentRule.create({
        data: {
          workspaceId,
          strategy: "ROUND_ROBIN",
          allowedRoles: process.env.ALLOWED_ROLES || ["OWNER", "ADMIN", "AGENT"],
          active: true,
        },
      });
    }

    // Skip if rule is not active
    if (!assignmentRule.active) {
      console.log(`Assignment rule not active for workspace ${workspaceId}`);
      return conversation;
    }

    // Get available agents
    const availableAgents = await prisma.membership.findMany({
      where: {
        workspaceId,
        role: { in: assignmentRule.allowedRoles },
        isActive: true,
      },
      orderBy: { joinedAt: "asc" },
    });

    if (availableAgents.length === 0) {
      console.log(`No available agents for workspace ${workspaceId}`);

      // Try fallback agent if configured
      if (assignmentRule.fallbackAgentId) {
        const fallbackAgent = await prisma.membership.findFirst({
          where: {
            id: assignmentRule.fallbackAgentId,
            workspaceId,
            isActive: true,
          },
        });

        if (fallbackAgent) {
          return await assignConversationToAgent(conversationId, fallbackAgent.id);
        }
      }

      return conversation;
    }

    // Select agent based on strategy
    let selectedAgent;

    switch (assignmentRule.strategy) {
      case "ROUND_ROBIN":
        selectedAgent = await selectAgentRoundRobin(availableAgents, assignmentRule);
        break;

      case "LOAD_BALANCE":
        selectedAgent = await selectAgentLoadBalance(availableAgents, workspaceId);
        break;

      case "LEAST_ACTIVE":
        selectedAgent = await selectAgentLeastActive(availableAgents, workspaceId);
        break;

      default:
        selectedAgent = availableAgents[0];
    }

    if (selectedAgent) {
      return await assignConversationToAgent(conversationId, selectedAgent.id);
    }

    return conversation;
  } catch (error) {
    console.error("Auto-assign conversation error:", error);
    return null;
  }
};

// Round-robin selection
const selectAgentRoundRobin = async (agents, assignmentRule) => {
  const currentIndex = assignmentRule.lastIndex;
  const nextIndex = (currentIndex + 1) % agents.length;

  // Update last index
  await prisma.assignmentRule.update({
    where: { id: assignmentRule.id },
    data: { lastIndex: nextIndex },
  });

  return agents[nextIndex];
};

// Load balance - assign to agent with least open conversations
const selectAgentLoadBalance = async (agents, workspaceId) => {
  const agentLoads = await Promise.all(
    agents.map(async (agent) => {
      const openConversations = await prisma.conversation.count({
        where: {
          workspaceId,
          assigneeId: agent.id,
          status: "OPEN",
        },
      });

      return { agent, load: openConversations };
    })
  );

  // Sort by load and return agent with least conversations
  agentLoads.sort((a, b) => a.load - b.load);
  return agentLoads[0].agent;
};

// Least active - assign to agent who hasn't received a conversation recently
const selectAgentLeastActive = async (agents, workspaceId) => {
  const agentActivities = await Promise.all(
    agents.map(async (agent) => {
      const lastAssignment = await prisma.conversation.findFirst({
        where: {
          workspaceId,
          assigneeId: agent.id,
        },
        orderBy: { updatedAt: "desc" },
        select: { updatedAt: true },
      });

      return {
        agent,
        lastActivity: lastAssignment?.updatedAt || new Date(0),
      };
    })
  );

  // Sort by last activity (oldest first) and return least active
  agentActivities.sort((a, b) => a.lastActivity - b.lastActivity);
  return agentActivities[0].agent;
};

// Helper function to assign conversation to agent
const assignConversationToAgent = async (conversationId, membershipId) => {
  try {
    const updatedConversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: { assigneeId: membershipId },
      include: {
        assignee: {
          select: {
            id: true,
            role: true,
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    console.log(`Conversation ${conversationId} assigned to ${membershipId}`);
    return updatedConversation;
  } catch (error) {
    console.error("Error assigning conversation:", error);
    return null;
  }
};

// Get assignment rule for workspace
const getAssignmentRule = async (req, res) => {
  try {
    const { workspaceId } = req.user;

    let assignmentRule = await prisma.assignmentRule.findUnique({
      where: { workspaceId },
    });

    // Create default if doesn't exist
    if (!assignmentRule) {
      assignmentRule = await prisma.assignmentRule.create({
        data: {
          workspaceId,
          strategy: "ROUND_ROBIN",
          allowedRoles: ["OWNER", "ADMIN", "AGENT"],
          active: true,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Assignment rule fetched successfully",
      assignmentRule,
    });
  } catch (error) {
    console.error("Get assignment rule error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Create or update assignment rule
const createOrUpdateAssignmentRule = async (req, res) => {
  try {
    const { workspaceId } = req.user;
    const { strategy, allowedRoles, fallbackAgentId, active } = req.body;

    // Validate strategy
    const validStrategies = ["ROUND_ROBIN", "LOAD_BALANCE", "LEAST_ACTIVE"];
    if (strategy && !validStrategies.includes(strategy)) {
      return res.status(400).json({
        success: false,
        message: "Invalid strategy. Must be ROUND_ROBIN, LOAD_BALANCE, or LEAST_ACTIVE",
      });
    }

    // Validate roles
    const validRoles = ["OWNER", "ADMIN", "AGENT"];
    if (allowedRoles && !allowedRoles.every(role => validRoles.includes(role))) {
      return res.status(400).json({
        success: false,
        message: "Invalid roles. Must be OWNER, ADMIN, or AGENT",
      });
    }

    // Validate fallback agent if provided
    if (fallbackAgentId) {
      const fallbackAgent = await prisma.membership.findFirst({
        where: {
          id: fallbackAgentId,
          workspaceId,
          isActive: true,
        },
      });

      if (!fallbackAgent) {
        return res.status(404).json({
          success: false,
          message: "Fallback agent not found or inactive",
        });
      }
    }

    // Check if rule exists
    const existingRule = await prisma.assignmentRule.findUnique({
      where: { workspaceId },
    });

    let assignmentRule;

    if (existingRule) {
      // Update existing rule
      assignmentRule = await prisma.assignmentRule.update({
        where: { workspaceId },
        data: {
          ...(strategy && { strategy }),
          ...(allowedRoles && { allowedRoles }),
          ...(fallbackAgentId !== undefined && { fallbackAgentId }),
          ...(active !== undefined && { active }),
          lastIndex: strategy === "ROUND_ROBIN" ? 0 : existingRule.lastIndex,
        },
      });
    } else {
      // Create new rule
      assignmentRule = await prisma.assignmentRule.create({
        data: {
          workspaceId,
          strategy: strategy || "ROUND_ROBIN",
          allowedRoles: allowedRoles || ["OWNER", "ADMIN", "AGENT"],
          fallbackAgentId: fallbackAgentId || null,
          active: active !== undefined ? active : true,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Assignment rule saved successfully",
      assignmentRule,
    });
  } catch (error) {
    console.error("Create/update assignment rule error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Manually reassign conversation
const reassignConversation = async (req, res) => {
  try {
    const { workspaceId } = req.user;
    const { id: conversationId } = req.params;

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        workspaceId,
        deletedAt: null,
      },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Trigger auto-assignment
    const updatedConversation = await autoAssignConversation({
      conversationId,
    });

    if (!updatedConversation || !updatedConversation.assigneeId) {
      return res.status(400).json({
        success: false,
        message: "No available agents to assign",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Conversation reassigned successfully",
      conversation: updatedConversation,
    });
  } catch (error) {
    console.error("Reassign conversation error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get assignment statistics
const getAssignmentStats = async (req, res) => {
  try {
    const { workspaceId } = req.user;

    const agents = await prisma.membership.findMany({
      where: {
        workspaceId,
        role: { in: ["OWNER", "ADMIN", "AGENT"] },
        isActive: true,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    const stats = await Promise.all(
      agents.map(async (agent) => {
        const openCount = await prisma.conversation.count({
          where: {
            workspaceId,
            assigneeId: agent.id,
            status: "OPEN",
          },
        });

        const resolvedCount = await prisma.conversation.count({
          where: {
            workspaceId,
            assigneeId: agent.id,
            status: "RESOLVED",
          },
        });

        const totalCount = await prisma.conversation.count({
          where: {
            workspaceId,
            assigneeId: agent.id,
          },
        });

        return {
          agent: {
            id: agent.id,
            name: agent.user.name,
            email: agent.user.email,
            role: agent.role,
          },
          openConversations: openCount,
          resolvedConversations: resolvedCount,
          totalConversations: totalCount,
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: "Assignment statistics fetched successfully",
      stats,
    });
  } catch (error) {
    console.error("Get assignment stats error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export {
  autoAssignConversation,
  getAssignmentRule,
  createOrUpdateAssignmentRule,
  reassignConversation,
  getAssignmentStats,
};