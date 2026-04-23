import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../libs/api";
import {
  CalendarDayDetails,
  CalendarOverview,
  CalendarSuggestionsResponse,
  CalendarView,
  PlannedFocusBlock,
} from "../types/calendar";

export function useCalendar(view: CalendarView, date: string) {
  const queryClient = useQueryClient();

  const overviewQuery = useQuery<CalendarOverview>({
    queryKey: ["calendarOverview", view, date],
    queryFn: async () => {
      const { data } = await api.get<{ data: CalendarOverview }>("/calendar/overview", {
        params: { view, date },
      });
      return data.data;
    },
  });

  const dayDetailsQuery = useQuery<CalendarDayDetails>({
    queryKey: ["calendarDay", date],
    queryFn: async () => {
      const { data } = await api.get<{ data: CalendarDayDetails }>("/calendar/day", {
        params: { date },
      });
      return data.data;
    },
  });

  const suggestionsQuery = useQuery<CalendarSuggestionsResponse>({
    queryKey: ["calendarSuggestions", date],
    queryFn: async () => {
      const { data } = await api.get<{ data: CalendarSuggestionsResponse }>("/calendar/suggestions", {
        params: { date },
      });
      return data.data;
    },
  });

  const invalidateCalendar = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["calendarOverview"] }),
      queryClient.invalidateQueries({ queryKey: ["calendarDay"] }),
      queryClient.invalidateQueries({ queryKey: ["calendarSuggestions"] }),
      queryClient.invalidateQueries({ queryKey: ["tasks"] }),
      queryClient.invalidateQueries({ queryKey: ["focusOverview"] }),
      queryClient.invalidateQueries({ queryKey: ["ledgerSummaries"] }),
      queryClient.invalidateQueries({ queryKey: ["journal"] }),
      queryClient.invalidateQueries({ queryKey: ["journalTimeline"] }),
    ]);
  };

  const rescheduleTaskMutation = useMutation({
    mutationFn: async ({ id, startDate, dueDate }: { id: string; startDate?: string | null; dueDate?: string | null }) => {
      const { data } = await api.put<{ data: unknown }>(`/calendar/tasks/${id}/reschedule`, {
        startDate,
        dueDate,
      });
      return data.data;
    },
    onSuccess: invalidateCalendar,
  });

  const createFocusBlockMutation = useMutation({
    mutationFn: async (payload: {
      taskId?: string | null;
      title: string;
      description?: string | null;
      plannedStart: string;
      plannedEnd: string;
    }) => {
      const { data } = await api.post<{ data: PlannedFocusBlock }>("/calendar/focus-blocks", payload);
      return data.data;
    },
    onSuccess: invalidateCalendar,
  });

  const updateFocusBlockMutation = useMutation({
    mutationFn: async ({ id, ...payload }: Partial<PlannedFocusBlock> & { id: string }) => {
      const { data } = await api.put<{ data: PlannedFocusBlock }>(`/calendar/focus-blocks/${id}`, payload);
      return data.data;
    },
    onSuccess: invalidateCalendar,
  });

  const deleteFocusBlockMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/calendar/focus-blocks/${id}`);
      return id;
    },
    onSuccess: invalidateCalendar,
  });

  return {
    overview: overviewQuery.data,
    dayDetails: dayDetailsQuery.data,
    suggestions: suggestionsQuery.data,
    isLoading:
      overviewQuery.isLoading || dayDetailsQuery.isLoading || suggestionsQuery.isLoading,
    rescheduleTask: rescheduleTaskMutation.mutateAsync,
    createFocusBlock: createFocusBlockMutation.mutateAsync,
    updateFocusBlock: updateFocusBlockMutation.mutateAsync,
    deleteFocusBlock: deleteFocusBlockMutation.mutateAsync,
    isRescheduling: rescheduleTaskMutation.isPending,
    isCreatingFocusBlock: createFocusBlockMutation.isPending,
    isUpdatingFocusBlock: updateFocusBlockMutation.isPending,
    isDeletingFocusBlock: deleteFocusBlockMutation.isPending,
  };
}
