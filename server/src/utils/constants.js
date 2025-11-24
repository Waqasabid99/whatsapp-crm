import "dotenv/config"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

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


export { hashPassword, verifyPassword, generateToken, verifyToken, generateRefreshToken, safeUser }