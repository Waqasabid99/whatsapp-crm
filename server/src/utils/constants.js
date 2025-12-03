import "dotenv/config"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import {prisma} from "../db.js"

const saltRounds = process.env.ENVIRONMENT === "production" ? process.env.SALT_ROUNDS : 10
const secret = process.env.ENVIRONMENT === "production" ? process.env.JWT_SECRET : "secretforproject"
const refreshSecret = process.env.ENVIRONMENT === "production" ? process.env.JWT_REFRESH_SECRET : "secretforproject"
const hashPassword = async (password) => {
    return await bcrypt.hash(password, saltRounds)
}

const verifyPassword = async (password, hash) => {
    return await bcrypt.compare(password, hash)
}

const generateToken = (payload) => {
    return jwt.sign(payload, secret, { expiresIn: process.env.ENVIRONMENT === "production" ? process.env.JWT_EXPIRATION : "1h" })
}

const verifyToken = (token) => {
    return jwt.verify(token, secret)
}

const generateRefreshToken = (payload) => {
    return jwt.sign(payload, refreshSecret, { expiresIn: process.env.ENVIRONMENT === "production" ? process.env.REFRESH_TOKEN_EXPIRATION : "7d" })
}

const safeUser = (user) => ({
  id: user.id,
  email: user.email,
  name: user.name,
});

// Helper: Increment Usage
const incrementUsage = async (workspaceId, featureKey) => {
  try {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    await prisma.usage.upsert({
      where: {
        workspaceId_key_periodStart: {
          workspaceId: workspaceId,
          key: featureKey,
          periodStart: periodStart,
        },
      },
      update: {
        count: { increment: 1 },
      },
      create: {
        workspaceId: workspaceId,
        key: featureKey,
        periodStart: periodStart,
        periodEnd: periodEnd,
        count: 1,
      },
    });
  } catch (error) {
    console.error("Error incrementing usage:", error);
  }
};


export { hashPassword, verifyPassword, generateToken, verifyToken, generateRefreshToken, safeUser, incrementUsage }