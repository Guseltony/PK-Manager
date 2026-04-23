import express from "express";
import { getEntryForDate, updateEntry, getTimeline } from "../controllers/journalControllers.js";

const journalRoutes = express.Router();

journalRoutes.get("/entry", getEntryForDate);
journalRoutes.get("/timeline", getTimeline);
journalRoutes.put("/update/:id", updateEntry);

export default journalRoutes;
