import express from "express";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";

import "dotenv/config";
import { connectDB, disconnectDB } from "./config/db.js";
import { authRoute } from "./routes/authRoutes.js";
import { env } from "./validators/env.schema.js";
import noteRoutes from "./routes/notesRoutes.js";
import { authMiddleware } from "./middlewares/authMiddleware.js";
import tagRoutes from "./routes/tagsRoutes.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import tasksRoutes from "./routes/tasksRoutes.js";
import dreamRoutes from "./routes/dreamRoutes.js";
import ledgerRoutes from "./routes/ledgerRoutes.js";
import journalRoutes from "./routes/journalRoutes.js";
import { startLedgerCron } from "./jobs/ledgerCron.js";
import focusRoutes from "./routes/focusRoutes.js";
import ideaRoutes from "./routes/ideaRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import inboxRoutes from "./routes/inboxRoutes.js";
import calendarRoutes from "./routes/calendarRoutes.js";
import insightsRoutes from "./routes/insightsRoutes.js";
import knowledgeRoutes from "./routes/knowledgeRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";

// connect to the database
connectDB();

// Start scheduled jobs
startLedgerCron();

// setup our app
const app = express();

// 1. Security Headers
app.use(helmet());

// 2. Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// 3. Compression
app.use(compression());

// 4. Rate Limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests from this IP, please try again after 15 minutes" },
});

app.set("trust proxy", 1);

// express middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5000",
      "https://pkmanager.vercel.app",
      env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 5. Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// api endpoints
app.use("/auth", authLimiter, authRoute);
app.use("/note", authMiddleware, noteRoutes);
app.use("/tag", authMiddleware, tagRoutes);
app.use("/task", authMiddleware, tasksRoutes);
app.use("/user", userRoutes);
app.use("/dream", authMiddleware, dreamRoutes);
app.use("/ledger", authMiddleware, ledgerRoutes);
app.use("/journal", authMiddleware, journalRoutes);
app.use("/focus", authMiddleware, focusRoutes);
app.use("/idea", authMiddleware, ideaRoutes);
app.use("/ai", authMiddleware, aiRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/inbox", authMiddleware, inboxRoutes);
app.use("/calendar", authMiddleware, calendarRoutes);
app.use("/insights", authMiddleware, insightsRoutes);
app.use("/knowledge", knowledgeRoutes);
app.use("/project", authMiddleware, projectRoutes);
app.use("/settings", authMiddleware, settingsRoutes);

// 6. 404 Not Found Handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// 7. Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(`[Server Error] ${err.stack || err.message}`);
  
  res.status(statusCode).json({
    error: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// port and listening
const server = app.listen(env.PORT || 5555, () => {
  console.log(`server connected on port ${env.PORT}`);
});

// ERROR HANDLING

// handle unhandled promise rejections (e.g database connection errors)
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

// Handle uncaught exception
process.on("uncaughtException", async (err) => {
  console.error("Uncaught Exception:", err);
  await disconnectDB();
  process.exit(1);
});

// Graceful shutdown (signal err)
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
});
