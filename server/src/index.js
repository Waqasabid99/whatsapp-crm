import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { initializeSocket } from "./socket.js";

// routes
import authRouter from "./routes/auth.routes.js";
import WhatsappRouter from "./routes/whatsapp.routes.js";
import workspaceRouter from "./routes/workspace.routes.js";
import userRouter from "./routes/user.routes.js";
import staffRouter from "./routes/staff.routes.js";
import contactRouter from "./routes/contact.routes.js";
import templateRouter from "./routes/template.routes.js";
import conversationRouter from "./routes/conversation.routes.js";
import messageRouter from "./routes/message.routes.js";
import assignmentRouter from "./routes/assignment.routes.js";
import seedRoutes from './seed.ts'
import campaignsRouter from "./routes/campaigns.routes.js";
import { startScheduledCampaignPoller } from "./utils/campaignqueue.worker.js";

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with full auth + event handling from socket.js
const io = initializeSocket(server);

// Make io available to all controllers via req.app.get("io")
app.set("io", io);

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(cookieParser());
app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Routes
app.get("/", (req, res) => res.send("Server Started"));
app.use("/api", WhatsappRouter);
app.use("/seed", seedRoutes);
app.use("/user", userRouter);
app.use("/users/auth", authRouter);
app.use("/workspace", workspaceRouter);
app.use("/staff", staffRouter);
app.use("/contact", contactRouter);
app.use("/template", templateRouter);
app.use("/conversation", conversationRouter);
app.use("/message", messageRouter);
app.use("/assignment", assignmentRouter);
app.use("/campaign", campaignsRouter);

// Start server
const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  startScheduledCampaignPoller(io);
});