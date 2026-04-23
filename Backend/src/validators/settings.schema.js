import { z } from "zod";

export const updateSettingsSchema = z.object({
  aiStrictness: z.enum(["low", "medium", "high"]).optional(),
  aiProactiveness: z.enum(["passive", "active", "autonomous"]).optional(),
  aiReasoningDepth: z.enum(["fast", "balanced", "deep"]).optional(),
  autoTaskGenerationFromDreams: z.boolean().optional(),
  autoLinkingKnowledgeGraph: z.boolean().optional(),
  autoInsightFrequency: z.enum(["real_time", "hourly", "daily"]).optional(),
  inboxRoutingSensitivity: z.enum(["strict", "flexible"]).optional(),
  taskPrioritizationMode: z.enum(["manual", "ai_assisted", "fully_automated"]).optional(),
  deadlineEnforcement: z.enum(["soft", "medium", "strict"]).optional(),
  ledgerStrictness: z.enum(["soft", "balanced", "strict"]).optional(),
  failureVisibility: z.enum(["hidden", "user_only", "dashboard_and_insights"]).optional(),
  autoProjectGeneration: z.boolean().optional(),
  autoTaskBreakdownFromDreams: z.boolean().optional(),
  dreamProgressSensitivity: z.enum(["low", "medium", "high"]).optional(),
  taskReminders: z.boolean().optional(),
  focusSessionAlerts: z.boolean().optional(),
  dailyInsightSummaries: z.boolean().optional(),
  missedJournalReminders: z.boolean().optional(),
});
