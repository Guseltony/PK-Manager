import { JournalEntry } from "./journal";
import { DailySummary } from "./ledger";
import { Task } from "./task";

export type CalendarView = "day" | "week" | "month";
export type CalendarEventType = "task" | "focus" | "journal" | "ledger";

export interface CalendarEvent {
  id: string;
  eventType: CalendarEventType;
  sourceId: string;
  title: string;
  startsAt: string;
  endsAt: string;
  editable: boolean;
  status: string;
  meta?: Record<string, unknown>;
}

export interface CalendarDayCell {
  date: string;
  events: CalendarEvent[];
  hasJournal: boolean;
  productivityScore: number;
  completedTasks: number;
  missingJournal: boolean;
}

export interface CalendarOverview {
  view: CalendarView;
  range: {
    start: string;
    end: string;
  };
  days: CalendarDayCell[];
  events: CalendarEvent[];
}

export interface PlannedFocusBlock {
  id: string;
  userId: string;
  taskId?: string | null;
  title: string;
  description?: string | null;
  plannedStart: string;
  plannedEnd: string;
  status: "planned" | "completed" | "canceled";
  aiScore?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarDayDetails {
  date: string;
  plannedTasks: Task[];
  completedTasks: Task[];
  plannedFocusBlocks: PlannedFocusBlock[];
  focusSessions: Array<{
    id: string;
    startedAt: string;
    endedAt?: string | null;
    completedCount: number;
    selectedTaskIds: string[];
    completedTaskIds: string[];
  }>;
  journal?: JournalEntry | null;
  ledger?: DailySummary | null;
  missingJournal: boolean;
  productivityScore: number;
  overloadWarning?: string | null;
  emptyProductivitySignal?: string | null;
}

export interface CalendarSuggestion {
  taskId: string;
  title: string;
  recommendedStart: string;
  recommendedEnd: string;
  reason: string;
}

export interface CalendarSuggestionsResponse {
  summary: string;
  suggestions: CalendarSuggestion[];
  overloadWarnings: string[];
  emptyDaySignals: string[];
}
