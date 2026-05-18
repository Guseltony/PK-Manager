import { Tag } from "./tag";
import { Task } from "./task";

export interface Milestone {
  id: string;
  dreamId?: string;
  title: string;
  description?: string | null;
  completed: boolean;
  weight: number;
  targetDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface MilestoneArchitecture {
  milestoneId: string;
  taskIds: string[];
  noteIds: string[];
  requireLinkedTasksComplete: boolean;
  requireNotesOnLinkedTasks: boolean;
}

export type MilestoneArchitectureMap = Record<string, MilestoneArchitecture>;

export interface DreamInsight {
  id: string;
  message: string;
  type: "warning" | "suggestion" | "progress" | "prediction";
  createdAt: string;
}

export interface DreamActivity {
  id: string;
  action: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface DreamNote {
  id: string;
  title: string;
  updatedAt: string;
}

export interface Dream {
  parentDreamId?: string | null;
  parent?: { id: string; title: string; parentDreamId?: string | null } | null;
  children?: Dream[];
  _count?: { children?: number; tasks?: number; milestones?: number };

  id: string;
  title: string;
  description?: string;
  sourceInboxId?: string | null;
  status: "active" | "paused" | "completed";
  category?: string;
  priority: "low" | "medium" | "high" | "urgent";
  targetDate?: string;
  progress: number;
  healthScore: number;
  tags?: { tag: Tag }[];
  aiScore?: number;
  tasks?: Task[];
  notes?: DreamNote[];
  milestones?: Milestone[];
  insights?: DreamInsight[];
  activities?: DreamActivity[];
  createdAt: string;
  updatedAt: string;
}
