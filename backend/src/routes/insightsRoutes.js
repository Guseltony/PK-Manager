import express from "express";
import { validateRequest } from "../middlewares/zodValidation.js";
import { insightListQuerySchema } from "../validators/insights.schema.js";
import { fetchInsightsOverview } from "../controllers/insightsControllers.js";

const insightsRoutes = express.Router();

insightsRoutes.get("/overview", validateRequest(insightListQuerySchema, "query"), fetchInsightsOverview);

export default insightsRoutes;

