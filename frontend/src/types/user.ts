export interface User {
  id: string;
  name: string;
  email: string;
  username?: string | null;
  avatar?: string | null;
  provider: "EMAIL" | "GOOGLE";
  googleId?: string | null;
  emailVerified: boolean;
  verifiedAt?: string | null;
  settings?: {
    aiStrictness: string;
    aiProactiveness: string;
    autoTaskGenerationFromDreams: boolean;
    autoLinkingKnowledgeGraph: boolean;
    taskPrioritizationMode: string;
    focusSessionAlerts: boolean;
    dailyInsightSummaries: boolean;
  } | null;
  _count?: {
    session: number;
    notes: number;
    tasks: number;
    dreams: number;
    projects: number;
    inboxItems: number;
    ideas: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  notesCount: number;
  tasksCount: number;
  dreamsCount: number;
  projectsCount: number;
  ideasCount: number;
  inboxCount: number;
  completedTasksCount: number;
  activeTasksCount: number;
  recurringTasksCount: number;
  focusSessionsCount: number;
  ledgerEntriesCount: number;
  focusMinutesTotal: number;
  completedThisWeek: number;
  dueTodayCount: number;
  plannedFocusBlocksCount: number;
  lastTaskCompletedAt: string | null;
  lastTaskCompletedTitle: string | null;
  lastFocusSessionAt: string | null;
  lastFocusSessionCompletedCount: number;
  lastInboxCaptureAt: string | null;
  lastInboxCaptureStatus: string | null;
  lastInboxCaptureType: string | null;
  lastNoteUpdatedAt: string | null;
  lastNoteUpdatedTitle: string | null;
}

export interface UpdateUserPayload {
  name?: string;
  username?: string;
  avatar?: string;
  email?: string;
}

export interface UserProfile extends User {
  stats: UserStats;
}
