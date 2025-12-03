import { Router } from 'express';
import { authCheck, createUser, loginUser, logout, refreshAccessToken } from '../controllers/auth.controller.js';
const authRouter = Router();

authRouter.post("/register", createUser)
authRouter.post("/refresh-token", refreshAccessToken)
authRouter.post("/login", loginUser)
authRouter.get("/check", authCheck)
authRouter.post("/logout", logout)

export default authRouter