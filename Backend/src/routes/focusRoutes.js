import express from "express";
import {
  fetchFocusOverview,
  createFocusSession,
  closeFocusSession,
  completeSessionTask,
  skipSessionTask,
} from "../controllers/focusControllers.js";
import { validateRequest } from "../middlewares/zodValidation.js";
import { csrfMiddleware } from "../middlewares/csrfMiddleware.js";
import {
  focusSessionActionSchema,
  focusSessionParamSchema,
  focusTaskActionSchema,
  focusTaskParamSchema,
} from "../validators/focus.schema.js";

const focusRoutes = express.Router();

focusRoutes.use((req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }
  return csrfMiddleware(req, res, next);
});

focusRoutes.get("/overview", fetchFocusOverview);
focusRoutes.post("/sessions", createFocusSession);
focusRoutes.post(
  "/sessions/:sessionId/end",
  validateRequest(focusSessionParamSchema, "params"),
  validateRequest(focusSessionActionSchema, "body"),
  closeFocusSession,
);
focusRoutes.post(
  "/sessions/:sessionId/tasks/:taskId/complete",
  validateRequest(focusTaskParamSchema, "params"),
  validateRequest(focusTaskActionSchema, "body"),
  completeSessionTask,
);
focusRoutes.post(
  "/sessions/:sessionId/tasks/:taskId/skip",
  validateRequest(focusTaskParamSchema, "params"),
  skipSessionTask,
);

export default focusRoutes;
