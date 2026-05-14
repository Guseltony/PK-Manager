export type NotificationType =
  | "INFO"
  | "SUCCESS"
  | "WARNING"
  | "ERROR"
  | "TASK_REMINDER"
  | "DREAM_UPDATE"
  | "IDEA_INSIGHT"
  | "SYSTEM";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string;
  createdAt: string;
  updatedAt: string;
}
