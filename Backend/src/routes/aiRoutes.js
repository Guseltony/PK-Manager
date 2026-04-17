import express from "express";
import { validateRequest } from "../middlewares/zodValidation.js";
import { csrfMiddleware } from "../middlewares/csrfMiddleware.js";
import { idParamSchema } from "../validators/idParams.schema.js";
import { aiTaskPlanRequestSchema } from "../validators/ai.schema.js";
import {
  analyzeNoteWithAi,
  coachFocusWithAi,
  enrichTaskWithAiController,
  generateTaskSubtasksWithAi,
  getDashboardSummaryWithAi,
  generateDreamIntelligenceWithAi,
  planIdeaWithAi,
  planTasksWithAi,
  reflectJournalWithAi,
} from "../controllers/aiControllers.js";

const aiRoutes = express.Router();

aiRoutes.use((req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }
  return csrfMiddleware(req, res, next);
});

aiRoutes.post("/tasks/plan", validateRequest(aiTaskPlanRequestSchema, "body"), planTasksWithAi);
aiRoutes.get("/dashboard/summary", getDashboardSummaryWithAi);
aiRoutes.post("/tasks/:id/subtasks", validateRequest(idParamSchema, "params"), generateTaskSubtasksWithAi);
aiRoutes.post("/tasks/:id/enrich", validateRequest(idParamSchema, "params"), enrichTaskWithAiController);
aiRoutes.post("/ideas/:id/plan", validateRequest(idParamSchema, "params"), planIdeaWithAi);
aiRoutes.post("/notes/:id/analyze", validateRequest(idParamSchema, "params"), analyzeNoteWithAi);
aiRoutes.post("/journal/:id/reflect", validateRequest(idParamSchema, "params"), reflectJournalWithAi);
aiRoutes.post("/dreams/:id/intelligence", validateRequest(idParamSchema, "params"), generateDreamIntelligenceWithAi);
aiRoutes.get("/focus/coach", coachFocusWithAi);

export default aiRoutes;
