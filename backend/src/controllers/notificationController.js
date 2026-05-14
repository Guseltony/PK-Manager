import { NotificationService } from "../services/notificationService.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await NotificationService.getUserNotifications(req.user.id);
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await NotificationService.markAsRead(id, req.user.id);
    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await NotificationService.markAllAsRead(req.user.id);
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await NotificationService.deleteNotification(id, req.user.id);
    res.status(200).json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const registerDeviceToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "Token is required" });

    await NotificationService.registerDeviceToken(req.user.id, token);
    res.status(200).json({ success: true, message: "Device token registered" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
