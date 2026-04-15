import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../libs/api";
import { FocusOverview, FocusSession } from "../types/focus";

const focusOverviewKey = ["focusOverview"];

export function useFocus() {
  const queryClient = useQueryClient();

  const focusOverviewQuery = useQuery<FocusOverview>({
    queryKey: focusOverviewKey,
    queryFn: async () => {
      const { data } = await api.get<{ data: FocusOverview }>("/focus/overview");
      return data.data;
    },
  });

  const invalidateFocus = async () => {
    await queryClient.invalidateQueries({ queryKey: focusOverviewKey });
    await queryClient.invalidateQueries({ queryKey: ["tasks"] });
  };

  const startSessionMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{ data: FocusSession }>("/focus/sessions");
      return data.data;
    },
    onSuccess: invalidateFocus,
  });

  const endSessionMutation = useMutation({
    mutationFn: async ({
      sessionId,
      durationSeconds,
    }: {
      sessionId: string;
      durationSeconds?: number;
    }) => {
      const { data } = await api.post<{ data: FocusSession }>(`/focus/sessions/${sessionId}/end`, {
        durationSeconds,
      });
      return data.data;
    },
    onSuccess: invalidateFocus,
  });

  const completeTaskMutation = useMutation({
    mutationFn: async ({
      sessionId,
      taskId,
      durationSeconds,
    }: {
      sessionId: string;
      taskId: string;
      durationSeconds?: number;
    }) => {
      const { data } = await api.post(`/focus/sessions/${sessionId}/tasks/${taskId}/complete`, {
        durationSeconds,
      });
      return data.data;
    },
    onSuccess: invalidateFocus,
  });

  const skipTaskMutation = useMutation({
    mutationFn: async ({
      sessionId,
      taskId,
    }: {
      sessionId: string;
      taskId: string;
    }) => {
      const { data } = await api.post(`/focus/sessions/${sessionId}/tasks/${taskId}/skip`);
      return data.data;
    },
    onSuccess: invalidateFocus,
  });

  return {
    overview: focusOverviewQuery.data,
    tasks: focusOverviewQuery.data?.tasks ?? [],
    activeSession: focusOverviewQuery.data?.activeSession ?? null,
    analytics: focusOverviewQuery.data?.analytics,
    isLoading: focusOverviewQuery.isLoading,
    refetch: focusOverviewQuery.refetch,
    startSession: startSessionMutation.mutateAsync,
    endSession: endSessionMutation.mutateAsync,
    completeTask: completeTaskMutation.mutateAsync,
    skipTask: skipTaskMutation.mutateAsync,
    isStartingSession: startSessionMutation.isPending,
    isEndingSession: endSessionMutation.isPending,
    isCompletingTask: completeTaskMutation.isPending,
    isSkippingTask: skipTaskMutation.isPending,
  };
}
