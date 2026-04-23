import express from "express";
import { fetchLedgerLogs, fetchLedgerSummaries } from "../controllers/ledgerControllers.js";

const ledgerRoutes = express.Router();

ledgerRoutes.get("/logs", fetchLedgerLogs);
ledgerRoutes.get("/summaries", fetchLedgerSummaries);

export default ledgerRoutes;
