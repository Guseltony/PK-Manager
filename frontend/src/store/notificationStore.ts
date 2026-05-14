import { create } from "zustand";
import { Notification } from "../types/notification";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
    }),
  addNotification: (notification) =>
    set((state) => {
      const newNotifications = [notification, ...state.notifications];
      return {
        notifications: newNotifications,
        unreadCount: newNotifications.filter((n) => !n.isRead).length,
      };
    }),
  markAsRead: (id) =>
    set((state) => {
      const newNotifications = state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      );
      return {
        notifications: newNotifications,
        unreadCount: newNotifications.filter((n) => !n.isRead).length,
      };
    }),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),
  deleteNotification: (id) =>
    set((state) => {
      const newNotifications = state.notifications.filter((n) => n.id !== id);
      return {
        notifications: newNotifications,
        unreadCount: newNotifications.filter((n) => !n.isRead).length,
      };
    }),
}));
