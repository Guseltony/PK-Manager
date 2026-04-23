import express from "express";
import {
  allUserTasks,
  createNewTask,
  createManyNewTasks,
  getSingleTask,
  updateExistingTask,
  deleteExistingTask,
  createSubtask,
  updateExistingSubtask,
  deleteExistingSubtask,
} from "../controllers/taskControllers.js";
import { validateRequest } from "../middlewares/zodValidation.js";
import { createTaskSchema, updateTaskSchema } from "../validators/task.schema.js";
import { idParamSchema } from "../validators/idParams.schema.js";
import { csrfMiddleware } from "../middlewares/csrfMiddleware.js";
import { createManyAiTasksSchema } from "../validators/ai.schema.js";

const tasksRoutes = express.Router();

tasksRoutes.use((req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }
  return csrfMiddleware(req, res, next);
});

tasksRoutes.get("/get", allUserTasks);

tasksRoutes.post(
  "/create",
  validateRequest(createTaskSchema, "body"),
  createNewTask
);

tasksRoutes.post(
  "/create-many",
  validateRequest(createManyAiTasksSchema, "body"),
  createManyNewTasks
);

tasksRoutes.get(
  "/get/:id",
  validateRequest(idParamSchema, "params"),
  getSingleTask
);

tasksRoutes.put(
  "/update/:id",
  validateRequest(idParamSchema, "params"),
  validateRequest(updateTaskSchema, "body"),
  updateExistingTask
);

tasksRoutes.delete(
  "/delete/:id",
  validateRequest(idParamSchema, "params"),
  deleteExistingTask
);

// Subtasks
tasksRoutes.post(
  "/:id/subtasks",
  validateRequest(idParamSchema, "params"),
  createSubtask
);

tasksRoutes.put(
  "/:id/subtasks/:subtaskId",
  validateRequest(idParamSchema, "params"),
  updateExistingSubtask
);

tasksRoutes.delete(
  "/:id/subtasks/:subtaskId",
  validateRequest(idParamSchema, "params"),
  deleteExistingSubtask
);

export default tasksRoutes;
