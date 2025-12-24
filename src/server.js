import express from "express";
import "dotenv/config";
import { connectDB, disconnectDB } from "./config/db.js";
import { textRoutes } from "./routes/test.js";

// conncet to the database
connectDB();

// setup our app

const app = express();

// express middleware

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// api endpoints

// testing api

app.use("/", textRoutes);

// port and listening

app.listen(process.env.PORT || 5555, () => {
  console.log(`server connected on port ${process.env.PORT}`);
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
