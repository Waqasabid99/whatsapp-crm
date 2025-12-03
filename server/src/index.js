import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet"
import authRouter from "./routes/auth.routes.js";
import WhatsappRouter from "./routes/whatsapp.routes.js";
const app = express();
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

app.use(helmet())

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
// Static
app.use(express.static("public"));

// Routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use("/users/auth", authRouter);
app.use("/api", WhatsappRouter)
app.listen(port, () => {
  console.log(`App listening on port http://localhost:${port}`);
});
