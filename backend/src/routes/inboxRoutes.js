import express from "express";
import { validateRequest } from "../middlewares/zodValidation.js";
import { csrfMiddleware } from "../middlewares/csrfMiddleware.js";
import { idParamSchema } from "../validators/idParams.schema.js";
import { inboxCaptureSchema, inboxListSchema, inboxRerouteSchema } from "../validators/inbox.schema.js";
import {
  captureInbox,
  getInboxItems,
  removeInboxItem,
  rerouteInbox,
  retryInbox,
} from "../controllers/inboxControllers.js";

const inboxRoutes = express.Router();

inboxRoutes.use((req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }
  return csrfMiddleware(req, res, next);
});

inboxRoutes.get("/items", validateRequest(inboxListSchema, "query"), getInboxItems);
inboxRoutes.post("/items", validateRequest(inboxCaptureSchema, "body"), captureInbox);
inboxRoutes.post("/items/:id/retry", validateRequest(idParamSchema, "params"), retryInbox);
inboxRoutes.post("/items/:id/reroute", validateRequest(idParamSchema, "params"), validateRequest(inboxRerouteSchema, "body"), rerouteInbox);
inboxRoutes.delete("/items/:id", validateRequest(idParamSchema, "params"), removeInboxItem);

export default inboxRoutes;
