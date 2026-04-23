import type { Task } from "./task";

export type ProjectStatus = "not_started" | "in_progress" | "completed" | "paused";

export interface Project {
  id: string;
  userId: string;
  dreamId: string;
  title: string;
  description: string | null;
  status: ProjectStatus;
  progress: number;
  createdAt: string;
  updatedAt: string;
  dream: {
    id: string;
    title: string;
    status: "active" | "paused" | "completed";
    priority: "low" | "medium" | "high" | "urgent";
    progress: number;
    targetDate: string | null;
  };
  tasks: Task[];
  taskSummary: {
    total: number;
    completed: number;
    active: number;
  };
  health: {
    state: "healthy" | "stalled" | "overloaded" | "underdefined";
    flags: string[];
    recommendations: string[];
  };
  stalledDays: number;
}

export interface CreateProjectInput {
  title: string;
  description?: string | null;
  status?: ProjectStatus;
  dreamId: string;
}

export interface GeneratedProjectsPayload {
  dream: {
    id: string;
    title: string;
  };
  created: Project[];
  suggestions: CreateProjectInput[];
  missingAreas: string[];
}
