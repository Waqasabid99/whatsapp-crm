import { Router } from 'express';
import { createUser, loginUser, refreshAccessToken } from '../controllers/auth.controller.js';
const authRouter = Router();

authRouter.post("/register", createUser)
authRouter.post("/refresh-token", refreshAccessToken)
authRouter.post("/login", loginUser)

export default authRouter