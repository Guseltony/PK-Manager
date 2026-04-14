import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/zodValidation.js";
import {
  createNewDream,
  allUserDreams,
  getSingleDream,
  updateExistingDream,
  createMilestone,
  toggleMilestoneStatus
} from "../controllers/dreamControllers.js";
import { createDreamSchema, updateDreamSchema, createMilestoneSchema } from "../validators/dream.schema.js";
import { idParamSchema } from "../validators/idParams.schema.js";

const dreamRoutes = express.Router();

// All routes require authentication
// dreamRoutes.use(authMiddleware);

dreamRoutes.post("/create", validateRequest(createDreamSchema, "body"), createNewDream);
dreamRoutes.get("/all", allUserDreams);
dreamRoutes.get("/get/:id", validateRequest(idParamSchema, "params"), getSingleDream);
dreamRoutes.put("/update/:id", validateRequest(idParamSchema, "params"), validateRequest(updateDreamSchema, "body"), updateExistingDream);

// Milestones
dreamRoutes.post("/:id/milestones", validateRequest(idParamSchema, "params"), validateRequest(createMilestoneSchema, "body"), createMilestone);
dreamRoutes.put("/:id/milestones/:milestoneId", validateRequest(idParamSchema, "params"), toggleMilestoneStatus);

export default dreamRoutes;
