import { prisma } from "../db.js";

const getWorkspaces = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    const workspaces = await prisma.workspace.findMany({
      where: {
        memberships: {
          some: {
            userId: userId,
          },
        },
      },
    });

    res.status(200).json({ success: true, workspaces });
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export { getWorkspaces };