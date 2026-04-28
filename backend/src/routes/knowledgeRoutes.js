import express from "express";
import { validateRequest } from "../middlewares/zodValidation.js";
import { knowledgeGraphQuerySchema, manualKnowledgeEdgeSchema } from "../validators/knowledge.schema.js";
import { addManualKnowledgeEdge, fetchKnowledgeGraph } from "../controllers/knowledgeControllers.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";
const knowledgeRoutes = express.Router();

knowledgeRoutes.get("/graph", authMiddleware, validateRequest(knowledgeGraphQuerySchema, "query"), fetchKnowledgeGraph);
knowledgeRoutes.post("/edges/manual", authMiddleware, validateRequest(manualKnowledgeEdgeSchema), addManualKnowledgeEdge);

export default knowledgeRoutes;
