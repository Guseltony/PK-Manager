import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../libs/api";
import {
  AiDashboardSummary,
  AiDreamIntelligence,
  AiFocusCoach,
  AiIdeaPlan,
  AiLedgerInsight,
  AiJournalReflection,
  AiNoteAnalysis,
  AiSubtaskPlan,
  AiTaskPlan,
  AiTaskEnrichment,
  AiTaskSuggestion,
} from "../types/ai";
import { Task } from "../types/task";

export function useTaskPlanner() {
  const queryClient = useQueryClient();

  const planMutation = useMutation({
    mutationFn: async ({ input, sourceType }: { input: string; sourceType?: "goal" | "idea" | "note" | "journal" | "task_request" | "general" }) => {
      const { data } = await api.post<{ data: AiTaskPlan }>("/ai/tasks/plan", { input, sourceType });
      return data.data;
    },
  });

  const createManyMutation = useMutation({
    mutationFn: async ({ tasks, noteId, noteIds, dreamId }: { tasks: AiTaskSuggestion[]; noteId?: string | null; noteIds?: string[]; dreamId?: string | null }) => {
      const { data } = await api.post<{ data: Task[] }>("/task/create-many", { tasks, noteId, noteIds, dreamId });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["dreams"] });
    },
  });

  return {
    planTasks: planMutation.mutateAsync,
    createSuggestedTasks: createManyMutation.mutateAsync,
    isPlanning: planMutation.isPending,
    isCreatingSuggestedTasks: createManyMutation.isPending,
  };
}

export function useIdeaAI() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ideaId: string) => {
      const { data } = await api.post<{ data: AiIdeaPlan }>(`/ai/ideas/${ideaId}/plan`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
    },
  });
}

export function useNoteAI() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: string) => {
      const { data } = await api.post<{ data: AiNoteAnalysis }>(`/ai/notes/${noteId}/analyze`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

export function useJournalAI(dateKey?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (journalId: string) => {
      const { data } = await api.post<{ data: AiJournalReflection }>(`/ai/journal/${journalId}/reflect`);
      return data.data;
    },
    onSuccess: (result) => {
      if (dateKey) {
        queryClient.setQueryData(["journal", dateKey], result.entry);
      }
      queryClient.invalidateQueries({ queryKey: ["journalTimeline"] });
    },
  });
}

export function useDreamAI() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dreamId: string) => {
      const { data } = await api.post<{ data: AiDreamIntelligence }>(`/ai/dreams/${dreamId}/intelligence`);
      return data.data;
    },
    onSuccess: (result) => {
      queryClient.setQueryData(["dream", result.dream.id], result.dream);
      queryClient.invalidateQueries({ queryKey: ["dreams"] });
    },
  });
}

export function useFocusCoach() {
  return useQuery<AiFocusCoach>({
    queryKey: ["focusCoach"],
    queryFn: async () => {
      const { data } = await api.get<{ data: AiFocusCoach }>("/ai/focus/coach");
      return data.data;
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useTaskSubtasksAI() {
  return useMutation({
    mutationFn: async (taskId: string) => {
      const { data } = await api.post<{ data: AiSubtaskPlan }>(`/ai/tasks/${taskId}/subtasks`);
      return data.data;
    },
  });
}

export function useTaskEnrichmentAI() {
  return useMutation({
    mutationFn: async (taskId: string) => {
      const { data } = await api.post<{ data: AiTaskEnrichment }>(`/ai/tasks/${taskId}/enrich`);
      return data.data;
    },
  });
}

export function useDashboardSummary() {
  return useQuery<AiDashboardSummary>({
    queryKey: ["dashboardSummary"],
    queryFn: async () => {
      const { data } = await api.get<{ data: AiDashboardSummary }>("/ai/dashboard/summary");
      return data.data;
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useLedgerInsights() {
  return useQuery<AiLedgerInsight>({
    queryKey: ["ledgerInsights"],
    queryFn: async () => {
      const { data } = await api.get<{ data: AiLedgerInsight }>("/ai/ledger/insights");
      return data.data;
    },
    staleTime: 1000 * 60 * 10,
  });
}
