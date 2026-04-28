import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../libs/api";
import { Idea, IdeaCreationData, IdeaMergePayload } from "../types/idea";

export function useIdeas() {
  const queryClient = useQueryClient();

  const { data: ideas, isLoading, error } = useQuery<Idea[]>({
    queryKey: ["ideas"],
    queryFn: async () => {
      const response = await api.get<{ data: Idea[] }>("/idea/all");
      return response.data.data;
    },
  });

  const createIdeaMutation = useMutation({
    mutationFn: async (newIdea: IdeaCreationData) => {
      const response = await api.post<{ data: Idea }>("/idea/create", newIdea);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
    },
  });

  const updateIdeaMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Idea> }) => {
      const response = await api.put<{ data: Idea }>(`/idea/update/${id}`, updates);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
    },
  });

  const deleteIdeaMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/idea/delete/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
    },
  });

  const convertIdeaMutation = useMutation({
    mutationFn: async ({ id, targetType }: { id: string; targetType: string }) => {
      const response = await api.post(`/idea/convert/${id}`, { targetType });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
      // Also invalidate the target entity type queries
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dreams"] });
    },
  });

  const mergeIdeasMutation = useMutation({
    mutationFn: async (payload: IdeaMergePayload) => {
      const response = await api.post<{ data: Idea }>("/idea/merge", payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
    },
  });

  return {
    ideas: ideas || [],
    isLoading,
    error,
    createIdea: createIdeaMutation.mutateAsync,
    updateIdea: updateIdeaMutation.mutateAsync,
    deleteIdea: deleteIdeaMutation.mutateAsync,
    convertIdea: convertIdeaMutation.mutateAsync,
    mergeIdeas: mergeIdeasMutation.mutateAsync,
    isCreating: createIdeaMutation.isPending,
    isConverting: convertIdeaMutation.isPending,
    isMerging: mergeIdeasMutation.isPending,
  };
}
