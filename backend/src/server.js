import express from "express";
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

// express middleware

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5000"],
    credentials: true, // IMPORTANT if using cookies
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// api endpoints

app.use("/auth", authRoute);
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
  console.log("SIGTERMreceived, shutting down gracefully");
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
});
