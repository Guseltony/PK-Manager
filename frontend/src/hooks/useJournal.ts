import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../libs/api";
import { JournalEntry, UpdateJournalPayload } from "../types/journal";
import dayjs from "dayjs";

export function useJournal(date?: Date) {
  const queryClient = useQueryClient();
  const dateStr = dayjs(date || new Date()).format("YYYY-MM-DD");

  const { data: entry, isLoading } = useQuery<JournalEntry>({
    queryKey: ["journal", dateStr],
    queryFn: async () => {
      const { data } = await api.get<{ data: JournalEntry }>(`/journal/entry?date=${dateStr}`);
      return data.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateJournalPayload }) => {
      const { data } = await api.put<{ data: JournalEntry }>(`/journal/update/${id}`, payload);
      return data.data;
    },
    onSuccess: (updatedEntry) => {
      queryClient.setQueryData(["journal", dateStr], updatedEntry);
    },
  });

  return {
    entry,
    isLoading,
    updateEntry: updateMutation.mutate,
    isSaving: updateMutation.isPending,
  };
}

export function useJournalTimeline(limit = 10, skip = 0) {
  const { data: timeline, isLoading } = useQuery<JournalEntry[]>({
    queryKey: ["journalTimeline", limit, skip],
    queryFn: async () => {
      const { data } = await api.get<{ data: JournalEntry[] }>(`/journal/timeline?limit=${limit}&skip=${skip}`);
      return data.data;
    },
  });

  return { timeline: timeline || [], isLoading };
}
