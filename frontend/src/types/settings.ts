export type AiStrictnessLevel = "low" | "medium" | "high";
export type AiProactivenessLevel = "passive" | "active" | "autonomous";
export type AiReasoningDepth = "fast" | "balanced" | "deep";
export type AutoInsightFrequency = "real_time" | "hourly" | "daily";
export type InboxRoutingSensitivity = "strict" | "flexible";
export type TaskPrioritizationMode = "manual" | "ai_assisted" | "fully_automated";
export type DeadlineEnforcementLevel = "soft" | "medium" | "strict";
export type LedgerStrictnessLevel = "soft" | "balanced" | "strict";
export type FailureVisibilityLevel = "hidden" | "user_only" | "dashboard_and_insights";
export type DreamProgressSensitivity = "low" | "medium" | "high";

export interface Settings {
  id: string;
  userId: string;
  aiStrictness: AiStrictnessLevel;
  aiProactiveness: AiProactivenessLevel;
  aiReasoningDepth: AiReasoningDepth;
  autoTaskGenerationFromDreams: boolean;
  autoLinkingKnowledgeGraph: boolean;
  autoInsightFrequency: AutoInsightFrequency;
  inboxRoutingSensitivity: InboxRoutingSensitivity;
  taskPrioritizationMode: TaskPrioritizationMode;
  deadlineEnforcement: DeadlineEnforcementLevel;
  ledgerStrictness: LedgerStrictnessLevel;
  failureVisibility: FailureVisibilityLevel;
  autoProjectGeneration: boolean;
  autoTaskBreakdownFromDreams: boolean;
  dreamProgressSensitivity: DreamProgressSensitivity;
  taskReminders: boolean;
  focusSessionAlerts: boolean;
  dailyInsightSummaries: boolean;
  missedJournalReminders: boolean;
  createdAt: string;
  updatedAt: string;
}
