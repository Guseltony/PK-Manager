import express from "express";
import { validateRequest } from "../middlewares/zodValidation.js";
import {
  createNewDream,
  createChildDream,
  allUserDreams,
  dreamTree,
  getSingleDream,
  updateExistingDream,
  updateDreamParent,
  createMilestone,
  toggleMilestoneStatus,
  deleteDreamMilestone,
} from "../controllers/dreamControllers.js";
import {
  createDreamSchema,
  updateDreamSchema,
  createMilestoneSchema,
  setDreamParentSchema,
} from "../validators/dream.schema.js";
import { idParamSchema } from "../validators/idParams.schema.js";

const dreamRoutes = express.Router();

// Core

dreamRoutes.post("/create", validateRequest(createDreamSchema, "body"), createNewDream);
dreamRoutes.get("/all", allUserDreams);
dreamRoutes.get("/tree", dreamTree);
dreamRoutes.get("/get/:id", validateRequest(idParamSchema, "params"), getSingleDream);
dreamRoutes.put(
  "/update/:id",
  validateRequest(idParamSchema, "params"),
  validateRequest(updateDreamSchema, "body"),
  updateExistingDream,
);

dreamRoutes.post(
  "/:id/children",
  validateRequest(idParamSchema, "params"),
  validateRequest(createDreamSchema, "body"),
  createChildDream,
);

dreamRoutes.patch(
  "/:id/parent",
  validateRequest(idParamSchema, "params"),
  validateRequest(setDreamParentSchema, "body"),
  updateDreamParent,
);

// Milestones

dreamRoutes.post(
  "/:id/milestones",
  validateRequest(idParamSchema, "params"),
  validateRequest(createMilestoneSchema, "body"),
  createMilestone,
);
dreamRoutes.put(
  "/:id/milestones/:milestoneId",
  validateRequest(idParamSchema, "params"),
  toggleMilestoneStatus,
);
dreamRoutes.delete(
  "/:id/milestones/:milestoneId",
  validateRequest(idParamSchema, "params"),
  deleteDreamMilestone,
);

export default dreamRoutes;