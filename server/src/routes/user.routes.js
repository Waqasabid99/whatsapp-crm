import express from "express";
import { getMyProfile, updateProfile } from "../controllers/user.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";
const userRouter = express.Router();

userRouter.get("/getUser", verifyUser, getMyProfile);
userRouter.post("/updateProfile", verifyUser, updateProfile);

export default userRouter;