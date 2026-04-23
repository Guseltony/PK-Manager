import { Tag } from "./tag";

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
  tags: { tag: Tag }[];
  userId: string;
  noteId: string | null;
  noteIds?: string[];
  dreamId: string | null;
  projectId?: string | null;
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
  notes?: { note: { id: string; title: string; updatedAt?: string; contentType?: string } }[];
  dream?: { id: string; title: string };
  project?: { id: string; title: string; status: "not_started" | "in_progress" | "completed" | "paused"; dreamId: string; progress: number };
}

export type NewTask = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'subtasks' | 'activities' | 'note' | 'dream' | 'aiScore' | 'suggestedAt' | 'completedAt' | 'tags'> & {
  tags: { tag: Partial<Tag> }[];
  noteIds?: string[];
};
