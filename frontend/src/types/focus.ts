import { Task } from "./task";

export interface FocusHistoryEntry {
  id: string;
  date: string;
  sessions: number;
  tasksCompleted: number;
  totalFocusTime: number;
  avgFocusScore?: number | null;
}

export interface FocusAnalytics {
  streakDays: number;
  totalCompleted: number;
  totalSessions: number;
  averageScore: number;
  history: FocusHistoryEntry[];
}

export interface FocusSession {
  id: string;
  userId: string;
  startedAt: string;
  endedAt?: string | null;
  selectedTaskIds: string[];
  completedTaskIds: string[];
  skippedTaskIds: string[];
  completedCount: number;
}

export interface FocusTask extends Task {
  focusScore: number;
  urgencyLabel: string;
  focusReasons: string[];
  focusMeta?: {
    aiScore?: number | null;
    skipCount: number;
    lastSkippedAt?: string | null;
    focusSelectedAt?: string | null;
    completedInFocusCount: number;
  } | null;
}

export interface FocusOverview {
  tasks: FocusTask[];
  activeSession?: FocusSession | null;
  analytics: FocusAnalytics;
}
