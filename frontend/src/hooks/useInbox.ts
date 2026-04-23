import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../libs/api";
import { InboxItem, InboxListResponse } from "../types/inbox";

const inboxKey = ["inbox"];

export function useInbox() {
  const queryClient = useQueryClient();

  const listQuery = useQuery<InboxListResponse>({
    queryKey: inboxKey,
    queryFn: async () => {
      const { data } = await api.get<{ data: InboxListResponse }>("/inbox/items");
      return data.data;
    },
  });

  const invalidateAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: inboxKey }),
      queryClient.invalidateQueries({ queryKey: ["tasks"] }),
      queryClient.invalidateQueries({ queryKey: ["ideas"] }),
      queryClient.invalidateQueries({ queryKey: ["notes"] }),
      queryClient.invalidateQueries({ queryKey: ["dreams"] }),
      queryClient.invalidateQueries({ queryKey: ["journal"] }),
      queryClient.invalidateQueries({ queryKey: ["journalTimeline"] }),
    ]);
  };

  const captureMutation = useMutation({
    mutationFn: async ({ rawInput, source }: { rawInput: string; source?: string }) => {
      const { data } = await api.post<{ data: InboxItem }>("/inbox/items", { rawInput, source });
      return data.data;
    },
    onSuccess: invalidateAll,
  });

  const retryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post<{ data: InboxItem }>(`/inbox/items/${id}/retry`);
      return data.data;
    },
    onSuccess: invalidateAll,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/inbox/items/${id}`);
      return id;
    },
    onSuccess: invalidateAll,
  });

  return {
    inbox: listQuery.data,
    queue: listQuery.data?.queue ?? [],
    history: listQuery.data?.history ?? [],
    items: listQuery.data?.items ?? [],
    isLoading: listQuery.isLoading,
    refetch: listQuery.refetch,
    captureInbox: captureMutation.mutateAsync,
    retryInboxItem: retryMutation.mutateAsync,
    deleteInboxItem: deleteMutation.mutateAsync,
    isCapturing: captureMutation.isPending,
    isRetrying: retryMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

