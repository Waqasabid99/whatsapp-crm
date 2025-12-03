import jwt from "jsonwebtoken";
import { prisma } from "../db.js";

const verifyUser = async (req, res, next) => {
  try {
    const token = req.headers?.authorization?.split(" ")[1] || req.cookies?.accessToken;
    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.ENVIRONMENT === "production" ? process.env.JWT_SECRET : "secretforproject");

    // decoded contains { userId, email, role }
    if (!decoded?.userId) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    // find actual user in db
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    req.user = user;
    next();

  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export { verifyUser };