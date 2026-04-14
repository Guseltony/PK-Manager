export interface TaskCompletionLog {
  id: string;
  taskId?: string;
  title: string;
  description?: string;
  status: string;
  priority: "low" | "medium" | "high" | "urgent";
  duration?: number;
  tags: string[];
  goalId?: string;
  noteId?: string;
  completedAt: string;
  createdAt: string;
  dream?: { title: string; category?: string };
  note?: { title: string };
}

export interface DailySummary {
  id: string;
  date: string;
  totalTasks: number;
  completedTasks: number;
  totalDuration?: number;
  productivityScore?: number;
}
