import "dotenv/config";
import express from "express";
import http from "http"
import cors from "cors";
import helmet from "helmet"
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import WhatsappRouter from "./routes/whatsapp.routes.js";
import workspaceRouter from "./routes/workspace.routes.js";
import { initSocket } from "./socket/socket.server.js";
import userRouter from "./routes/user.routes.js";
import staffRouter from "./routes/staff.routes.js";
const app = express();
const server = http.createServer(app);
const port = process.env.ENVIRONMENT === "production" ? process.env.PORT : 5000;

// Middlewares
app.use(
  cors({
    origin:
      process.env.ENVIRONMENT === "production"
        ? process.env.ORIGIN_URL
        : "http://localhost:5173",
    credentials: true,
  })
);
// Cookie parser
app.use(cookieParser());
// Socket IO 
initSocket(server);

app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
// Static
app.use(express.static("public"));

// Routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use("/api", WhatsappRouter);
app.use("/user", userRouter);
app.use("/users/auth", authRouter);
app.use("/workspace", workspaceRouter);
app.use("/staff", staffRouter);
server.listen(port, () => {
  console.log(`App listening on port http://localhost:${port}`);
});
