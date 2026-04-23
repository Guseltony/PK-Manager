import express from "express";
import { validateRequest } from "../middlewares/zodValidation.js";
import { csrfMiddleware } from "../middlewares/csrfMiddleware.js";
import { idParamSchema } from "../validators/idParams.schema.js";
import {
  calendarDateQuerySchema,
  calendarOverviewQuerySchema,
  createFocusBlockSchema,
  rescheduleTaskSchema,
  updateFocusBlockSchema,
} from "../validators/calendar.schema.js";
import {
  createCalendarFocusBlock,
  deleteCalendarFocusBlock,
  fetchCalendarDayDetails,
  fetchCalendarOverview,
  fetchCalendarSuggestions,
  rescheduleTaskFromCalendar,
  updateCalendarFocusBlock,
} from "../controllers/calendarControllers.js";

const calendarRoutes = express.Router();

calendarRoutes.use((req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }
  return csrfMiddleware(req, res, next);
});

calendarRoutes.get("/overview", validateRequest(calendarOverviewQuerySchema, "query"), fetchCalendarOverview);
calendarRoutes.get("/day", validateRequest(calendarDateQuerySchema, "query"), fetchCalendarDayDetails);
calendarRoutes.get("/suggestions", validateRequest(calendarDateQuerySchema, "query"), fetchCalendarSuggestions);
calendarRoutes.put(
  "/tasks/:id/reschedule",
  validateRequest(idParamSchema, "params"),
  validateRequest(rescheduleTaskSchema, "body"),
  rescheduleTaskFromCalendar,
);
calendarRoutes.post(
  "/focus-blocks",
  validateRequest(createFocusBlockSchema, "body"),
  createCalendarFocusBlock,
);
calendarRoutes.put(
  "/focus-blocks/:id",
  validateRequest(idParamSchema, "params"),
  validateRequest(updateFocusBlockSchema, "body"),
  updateCalendarFocusBlock,
);
calendarRoutes.delete(
  "/focus-blocks/:id",
  validateRequest(idParamSchema, "params"),
  deleteCalendarFocusBlock,
);

export default calendarRoutes;
