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

// conncet to the database
connectDB();

// setup our app

const app = express();

// express middleware

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true, // IMPORTANT if using cookies
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// api endpoints

app.use("/auth", authRoute);
app.use("api/note", authMiddleware, noteRoutes);
app.use("api/tag", authMiddleware, tagRoutes);

// port and listening

app.listen(env.PORT || 5555, () => {
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
