import { z } from "zod";

export const taskSuggestionSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().nullable().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  status: z.literal("todo").default("todo"),
  estimatedTime: z.number().int().positive().nullable().optional(),
  duration: z.number().int().min(0).nullable().optional(),
  startDate: z.string().datetime().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
});

export const taskPlanResponseSchema = z.object({
  intent: z.literal("task_breakdown").default("task_breakdown"),
  summary: z.string().trim().min(1),
  tasks: z.array(taskSuggestionSchema).min(1).max(7),
});

export const aiTaskPlanRequestSchema = z.object({
  input: z.string().trim().min(1),
  sourceType: z.enum(["goal", "idea", "note", "journal", "task_request", "general"]).default("general"),
});

export const noteAnalysisResponseSchema = z.object({
  summary: z.string().trim().min(1),
  keyInsights: z.array(z.string().trim().min(1)).max(6).default([]),
  suggestedTags: z.array(z.string().trim().min(1)).max(8).default([]),
  suggestedTasks: z.array(taskSuggestionSchema).max(7).default([]),
});

export const ideaPlanResponseSchema = z.object({
  summary: z.string().trim().min(1),
  recommendation: z.enum(["task", "note", "dream"]),
  suggestedTags: z.array(z.string().trim().min(1)).max(8).default([]),
  suggestedTasks: z.array(taskSuggestionSchema).max(7).default([]),
});

export const journalReflectionResponseSchema = z.object({
  summary: z.string().trim().min(1),
  insights: z.array(z.object({
    type: z.enum(["pattern", "suggestion", "reflection"]),
    message: z.string().trim().min(1),
  })).max(6).default([]),
  suggestedTags: z.array(z.string().trim().min(1)).max(8).default([]),
  extractedTasks: z.array(taskSuggestionSchema).max(7).default([]),
});

export const dreamIntelligenceResponseSchema = z.object({
  summary: z.string().trim().min(1),
  healthScore: z.number().min(0).max(100).nullable().optional(),
  aiScore: z.number().min(0).max(100).nullable().optional(),
  insights: z.array(z.object({
    type: z.enum(["warning", "suggestion", "progress", "prediction"]),
    message: z.string().trim().min(1),
  })).max(6).default([]),
  suggestedMilestones: z.array(z.object({
    title: z.string().trim().min(1),
    description: z.string().trim().nullable().optional(),
  })).max(5).default([]),
  suggestedTasks: z.array(taskSuggestionSchema).max(7).default([]),
});

export const focusCoachResponseSchema = z.object({
  summary: z.string().trim().min(1),
  coaching: z.array(z.string().trim().min(1)).max(6).default([]),
  taskOrder: z.array(z.object({
    taskId: z.string().trim().min(1),
    title: z.string().trim().min(1),
    reason: z.string().trim().min(1),
  })).max(5).default([]),
});

export const aiSubtaskPlanResponseSchema = z.object({
  summary: z.string().trim().min(1),
  subtasks: z.array(z.object({
    title: z.string().trim().min(1),
  })).min(1).max(8),
});

export const aiTaskEnrichmentResponseSchema = z.object({
  summary: z.string().trim().min(1),
  task: taskSuggestionSchema.extend({
    title: z.string().trim().min(1).optional(),
  }),
});

export const aiDashboardSummaryResponseSchema = z.object({
  summary: z.string().trim().min(1),
  priorities: z.array(z.string().trim().min(1)).max(5).default([]),
  blockers: z.array(z.string().trim().min(1)).max(4).default([]),
  momentum: z.string().trim().min(1),
});

export const aiLedgerInsightResponseSchema = z.object({
  summary: z.string().trim().min(1),
  momentum: z.string().trim().min(1),
  streakDays: z.number().int().min(0),
  peakExecutionWindow: z.string().trim().min(1),
  strongestTags: z.array(z.string().trim().min(1)).max(6).default([]),
  risks: z.array(z.string().trim().min(1)).max(5).default([]),
  recommendations: z.array(z.string().trim().min(1)).max(5).default([]),
});

export const createManyAiTasksSchema = z.object({
  tasks: z.array(taskSuggestionSchema).min(1).max(20),
  noteId: z.string().uuid().nullable().optional(),
  noteIds: z.array(z.string().uuid()).optional(),
  dreamId: z.string().uuid().nullable().optional(),
  projectId: z.string().uuid().nullable().optional(),
});

export const inboxRoutingResponseSchema = z.object({
  type: z.enum(["task", "idea", "note", "journal", "dream"]),
  title: z.string().trim().min(1),
  content: z.string().trim().min(1),
  tags: z.array(z.string().trim().min(1)).max(8).default([]),
  priority: z.enum(["low", "medium", "high", "urgent"]).nullable().optional(),
  confidence: z.number().min(0).max(1).default(0.6),
  links: z.object({
    dreams: z.array(z.string().trim().min(1)).default([]),
    tasks: z.array(z.string().trim().min(1)).default([]),
    notes: z.array(z.string().trim().min(1)).default([]),
    ideas: z.array(z.string().trim().min(1)).default([]),
  }).default({
    dreams: [],
    tasks: [],
    notes: [],
    ideas: [],
  }),
  suggested_actions: z.array(z.string().trim().min(1)).max(6).default([]),
});

export const calendarSuggestionResponseSchema = z.object({
  summary: z.string().trim().min(1),
  suggestions: z.array(z.object({
    taskId: z.string().trim().min(1),
    title: z.string().trim().min(1),
    recommendedStart: z.string().datetime(),
    recommendedEnd: z.string().datetime(),
    reason: z.string().trim().min(1),
  })).max(5).default([]),
  overloadWarnings: z.array(z.string().trim().min(1)).max(5).default([]),
  emptyDaySignals: z.array(z.string().trim().min(1)).max(5).default([]),
});
