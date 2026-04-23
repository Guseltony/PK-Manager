import express from "express";
import { csrfMiddleware } from "../middlewares/csrfMiddleware.js";
import { getSettings, resetSettings, updateSettings } from "../controllers/settingsControllers.js";
import { validateRequest } from "../middlewares/zodValidation.js";
import { updateSettingsSchema } from "../validators/settings.schema.js";

const settingsRoutes = express.Router();

settingsRoutes.use((req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }
  return csrfMiddleware(req, res, next);
});

settingsRoutes.get("/get", getSettings);
settingsRoutes.put("/update", validateRequest(updateSettingsSchema, "body"), updateSettings);
settingsRoutes.post("/reset", resetSettings);

export default settingsRoutes;
