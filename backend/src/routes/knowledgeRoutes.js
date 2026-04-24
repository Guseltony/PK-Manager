import express from "express";
import { validateRequest } from "../middlewares/zodValidation.js";
import { knowledgeGraphQuerySchema } from "../validators/knowledge.schema.js";
import { fetchKnowledgeGraph } from "../controllers/knowledgeControllers.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";
const knowledgeRoutes = express.Router();

knowledgeRoutes.get("/graph", authMiddleware, validateRequest(knowledgeGraphQuerySchema, "query"), fetchKnowledgeGraph);

export default knowledgeRoutes;
