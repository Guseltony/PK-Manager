export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  status: TaskStatus;
}

export interface ActivityLog {
  id: string;
  taskId: string;
  action: string;
  timestamp: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate: string | null;
  estimatedTime: number | null;
  tags: string[];
  userId: string;
  noteId: string | null;
  dreamId: string | null;
  aiScore: number | null;
  suggestedAt: string | null;
  completedAt: string | null;
  startDate: string | null;
  duration: number | null;
  createdAt: string;
  updatedAt: string;
  subtasks?: Subtask[];
  activities?: ActivityLog[];
  note?: { id: string; title: string };
  dream?: { id: string; title: string };
}

export type NewTask = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'subtasks' | 'activities' | 'note' | 'dream' | 'aiScore' | 'suggestedAt' | 'completedAt'>;
