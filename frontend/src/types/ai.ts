export type AiTaskSuggestion = {
  title: string;
  description: string | null;
  priority: "low" | "medium" | "high" | "urgent";
  status: "todo";
  estimatedTime: number | null;
  duration?: number | null;
  startDate?: string | null;
  dueDate: string | null;
  tags: string[];
};

export interface AiTaskPlan {
  intent: "task_breakdown";
  summary: string;
  tasks: AiTaskSuggestion[];
}

export interface AiIdeaPlan {
  summary: string;
  recommendation: "task" | "note" | "dream";
  suggestedTags: string[];
  suggestedTasks: AiTaskSuggestion[];
}

export interface AiNoteAnalysis {
  summary: string;
  keyInsights: string[];
  suggestedTags: string[];
  suggestedTasks: AiTaskSuggestion[];
}

export interface AiJournalReflection {
  summary: string;
  suggestedTags: string[];
  extractedTasks: AiTaskSuggestion[];
  entry: import("./journal").JournalEntry;
}

export interface AiDreamIntelligence {
  summary: string;
  suggestedMilestones: Array<{
    title: string;
    description?: string | null;
  }>;
  suggestedTasks: AiTaskSuggestion[];
  dream: import("./dream").Dream;
}

export interface AiFocusCoach {
  summary: string;
  coaching: string[];
  taskOrder: Array<{
    taskId: string;
    title: string;
    reason: string;
  }>;
}

export interface AiSubtaskPlan {
  summary: string;
  subtasks: Array<{
    title: string;
  }>;
}

export interface AiDashboardSummary {
  summary: string;
  priorities: string[];
  blockers: string[];
  momentum: string;
}

export interface AiLedgerInsight {
  summary: string;
  momentum: string;
  streakDays: number;
  peakExecutionWindow: string;
  strongestTags: string[];
  risks: string[];
  recommendations: string[];
}

export interface AiTaskEnrichment {
  summary: string;
  task: AiTaskSuggestion & {
    title?: string;
  };
}
