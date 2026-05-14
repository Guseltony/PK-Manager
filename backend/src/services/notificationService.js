import { prisma } from "../config/db.js";
import { getIO } from "../libs/socket.js";
import { messaging } from "../libs/firebase.js";

export class NotificationService {
  /**
   * Create a notification and send it via socket + Push (FCM)
   * @param {Object} data - { userId, title, message, type, link }
   */
  static async sendNotification({ userId, title, message, type = "INFO", link = null }) {
    try {
      // 1. Save to Database
      const notification = await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
          link,
        },
      });

      // 2. Emit via Socket.io
      const io = getIO();
      if (io) {
        io.to(userId).emit("new_notification", notification);
      }

      // 3. Send via Firebase Cloud Messaging (Push)
      if (messaging) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { deviceTokens: true },
        });

        if (user?.deviceTokens?.length > 0) {
          const payload = {
            notification: {
              title,
              body: message,
            },
            data: {
              type,
              link: link || "",
              notificationId: notification.id,
            },
            tokens: user.deviceTokens,
          };

          const response = await messaging.sendEachForMulticast(payload);
          console.log(`Push notification sent: ${response.successCount} success, ${response.failureCount} failure`);

          // Cleanup invalid tokens if any
          if (response.failureCount > 0) {
            const failedTokens = [];
            response.responses.forEach((resp, idx) => {
              if (!resp.success) {
                // Token might be invalid or expired
                failedTokens.push(user.deviceTokens[idx]);
              }
            });

            if (failedTokens.length > 0) {
              await prisma.user.update({
                where: { id: userId },
                data: {
                  deviceTokens: {
                    set: user.deviceTokens.filter(t => !failedTokens.includes(t)),
                  },
                },
              });
            }
          }
        }
      }

      return notification;
    } catch (error) {
      console.error("Error sending notification:", error);
      throw error;
    }
  }

  /**
   * Get all notifications for a user
   */
  static async getUserNotifications(userId) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  /**
   * Mark a notification as read
   */
  static async markAsRead(notificationId, userId) {
    return prisma.notification.update({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId, userId) {
    return prisma.notification.delete({
      where: { id: notificationId, userId },
    });
  }

  /**
   * Register a device token for FCM push notifications
   */
  static async registerDeviceToken(userId, token) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { deviceTokens: true },
    });

    if (!user.deviceTokens.includes(token)) {
      return prisma.user.update({
        where: { id: userId },
        data: {
          deviceTokens: {
            push: token,
          },
        },
      });
    }
    return user;
  }
}
