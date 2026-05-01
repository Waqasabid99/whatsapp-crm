import { prisma } from "../db.js";

const hasAssignedConversation = async (req, res, next) => {
    const user = req.user;
    try {

        if (user.role === "admin" || user.role === "owner" || user.role === "manager") {
            const conversations = await prisma.conversation.findMany({
                where: {
                    workspaceId: user.workspaceId,
                    status: {
                        not: "ARCHIVED"
                    },
                    deletedAt: null
                },
                include: {
                    contact: true,
                    assignee: {
                        select: {
                            id: true,
                            role: true,
                            user: {
                                select: { id: true, name: true, email: true },
                            },
                        },
                    },
                    messages: {
                        orderBy: { createdAt: "desc" },
                        take: 1,
                        select: {
                            id: true,
                            text: true,
                            sender: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    templates: true,
                                },
                            },
                            createdAt: true,
                        },
                    },
                    _count: { select: { messages: true } },
                },
                orderBy: { lastMessageAt: "desc" },
            });

            req.conversations = {
                conversations,
            };
            return next();
        };

        const membership = await prisma.membership.findUnique({
            where: {
                userId_workspaceId: {
                    userId: user.user.id,
                    workspaceId: user.workspaceId
                },
            },
            select: {
                id: true
            }
        });

        if (!membership) {
            return res.status(403).json({ success: false, message: "You are not a member of this workspace" });
        }

        const conversations = await prisma.conversation.findMany({
            where: {
                assigneeId: membership.id,
                workspaceId: user.workspaceId,
                status: {
                    not: "ARCHIVED"
                },
                deletedAt: null
            },
            include: {
                contact: true,
                assignee: {
                    select: {
                        id: true,
                        role: true,
                        user: {
                            select: { id: true, name: true, email: true },
                        },
                    },
                },
                messages: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    select: {
                        id: true,
                        text: true,
                        sender: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                templates: true,
                            },
                        },
                        createdAt: true,
                    },
                },
                _count: { select: { messages: true } },
            },
            orderBy: { lastMessageAt: "desc" },
        });

        if (!conversations) {
            return res.status(403).json({ success: false, message: "You don't have any assigned conversations" });
        }

        req.conversations = {
            conversations,
        };
        next();
    } catch (error) {
        console.error("Error while fetching conversation:", error);
        return res.status(500).json({ success: false, message: "Error while fetching conversation" });
    }
}

export default hasAssignedConversation;