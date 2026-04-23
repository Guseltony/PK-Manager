import express from "express";
import { validateRequest } from "../middlewares/zodValidation.js";
import { idParamSchema } from "../validators/idParams.schema.js";
import { csrfMiddleware } from "../middlewares/csrfMiddleware.js";
import {
  allUserProjects,
  createNewProject,
  deleteExistingProject,
  generateDreamProjects,
  getSingleProject,
  updateExistingProject,
} from "../controllers/projectControllers.js";
import {
  createProjectSchema,
  generateProjectsSchema,
  updateProjectSchema,
} from "../validators/project.schema.js";

const projectRoutes = express.Router();

projectRoutes.use((req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }
  return csrfMiddleware(req, res, next);
});

projectRoutes.get("/get", allUserProjects);
projectRoutes.post("/create", validateRequest(createProjectSchema, "body"), createNewProject);
projectRoutes.get("/get/:id", validateRequest(idParamSchema, "params"), getSingleProject);
projectRoutes.put(
  "/update/:id",
  validateRequest(idParamSchema, "params"),
  validateRequest(updateProjectSchema, "body"),
  updateExistingProject,
);
projectRoutes.delete("/delete/:id", validateRequest(idParamSchema, "params"), deleteExistingProject);
projectRoutes.post(
  "/dream/:dreamId/generate",
  validateRequest(generateProjectsSchema, "body"),
  generateDreamProjects,
);

export default projectRoutes;
