import express from "express";
import { createStaff, deleteStaff, getAllStaff, inviteStaff, updateStaff } from "../controllers/staff.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";
import allowRoles from "../middlewares/role.middleware.js";
const staffRouter = express.Router();

staffRouter.post("/create-staff", verifyUser, allowRoles(["admin", "owner"]), createStaff)
staffRouter.post("/invite-staff", verifyUser, allowRoles(["admin", "owner"]), inviteStaff)
staffRouter.put("/update-staff/:staffId", verifyUser, allowRoles(["admin", "owner", "agent"]), updateStaff)
staffRouter.get("/all-staff", verifyUser, getAllStaff)
staffRouter.delete("/delete-staff/:staffId", verifyUser, allowRoles(["admin", "owner", "agent"]), deleteStaff)
staffRouter.post("/accept-invite", inviteStaff)

export default staffRouter;