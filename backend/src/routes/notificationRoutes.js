import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  registerDeviceToken,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", getNotifications);
router.post("/register-token", registerDeviceToken);
router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", markAsRead);
router.delete("/:id", deleteNotification);

export default router;
