import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../libs/api";
import type { Dream, Milestone } from "../types/dream";

const EMPTY_ARRAY: unknown[] = [];

export function useDreams() {
  const queryClient = useQueryClient();

  const { data: dreams, isLoading, error } = useQuery<Dream[]>({
    queryKey: ["dreams"],
    queryFn: async () => {
      try {
        console.log("DEBUG: Fetching all dreams...");
        const response = await api.get<{ data: Dream[] }>("/dream/all");
        console.log("DEBUG: Fetching dreams success:", response.data);
        return response.data.data;
      } catch (err) {
        const error = err as { response?: { data?: unknown }; message?: string };
        console.error(
          "DEBUG: Fetching dreams error:",
          error.response?.data || error.message,
        );
        throw err;
      }
    },
  });

  const createDreamMutation = useMutation({
    mutationFn: async (newDream: Partial<Dream>) => {
      const { data } = await api.post<{ data: Dream }>("/dream/create", newDream);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dreams"] });
      queryClient.invalidateQueries({ queryKey: ["dreamTree"] });
    },
  });

  return {
    dreams: dreams || (EMPTY_ARRAY as Dream[]),
    isLoading,
    error,
    createDream: createDreamMutation.mutate,
    createDreamAsync: createDreamMutation.mutateAsync,
    isCreating: createDreamMutation.isPending,
  };
}

export function useDreamTree() {
  const { data, isLoading, error } = useQuery<Dream[]>({
    queryKey: ["dreamTree"],
    queryFn: async () => {
      const response = await api.get<{ data: Dream[] }>("/dream/tree");
      return response.data.data;
    },
  });

  return {
    dreamTree: data || (EMPTY_ARRAY as Dream[]),
    isLoading,
    error,
  };
}

export function useDream(id: string | null) {
  const queryClient = useQueryClient();

  const { data: dream, isLoading, error } = useQuery<Dream | null>({
    queryKey: ["dream", id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await api.get<{ data: Dream }>(`/dream/get/${id}`);
      return data.data;
    },
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<Dream>) => {
      const { data } = await api.put<{ data: Dream }>(`/dream/update/${id}`, updates);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dreams"] });
      queryClient.invalidateQueries({ queryKey: ["dreamTree"] });
      queryClient.invalidateQueries({ queryKey: ["dream", id] });
    },
  });

  const createChildDreamMutation = useMutation({
    mutationFn: async (child: Partial<Dream>) => {
      if (!id) throw new Error("Dream id is required");
      const { data } = await api.post<{ data: Dream }>(`/dream/${id}/children`, child);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dreams"] });
      queryClient.invalidateQueries({ queryKey: ["dreamTree"] });
      queryClient.invalidateQueries({ queryKey: ["dream", id] });
    },
  });

  const addMilestoneMutation = useMutation<
    Milestone,
    Error,
    Partial<Milestone>,
    { previousDream?: Dream }
  >({
    mutationFn: async (milestone: Partial<Milestone>) => {
      const { data } = await api.post<{ data: Milestone }>(`/dream/${id}/milestones`, milestone);
      return data.data;
    },
    onMutate: async (milestone) => {
      await queryClient.cancelQueries({ queryKey: ["dream", id] });
      const previousDream = queryClient.getQueryData<Dream>(["dream", id]);

      if (previousDream) {
        queryClient.setQueryData<Dream>(["dream", id], {
          ...previousDream,
          milestones: [
            ...(previousDream.milestones || []),
            {
              id: `temp-milestone-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              dreamId: id || "",
              title: milestone.title || "New milestone",
              description: milestone.description || null,
              completed: false,
              weight: milestone.weight || 1,
              targetDate: milestone.targetDate || null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        });
      }

      return { previousDream };
    },
    onError: (_error, _milestone, context) => {
      if (context?.previousDream) {
        queryClient.setQueryData(["dream", id], context.previousDream);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dream", id] });
      queryClient.invalidateQueries({ queryKey: ["dreams"] });
      queryClient.invalidateQueries({ queryKey: ["dreamTree"] });
    },
  });

  const toggleMilestoneMutation = useMutation({
    mutationFn: async (milestoneId: string) => {
      const { data } = await api.put<{ data: Milestone }>(`/dream/${id}/milestones/${milestoneId}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dream", id] });
    },
  });

  const deleteMilestoneMutation = useMutation<string, Error, string, { previousDream?: Dream }>({
    mutationFn: async (milestoneId: string) => {
      await api.delete(`/dream/${id}/milestones/${milestoneId}`);
      return milestoneId;
    },
    onMutate: async (milestoneId) => {
      await queryClient.cancelQueries({ queryKey: ["dream", id] });
      const previousDream = queryClient.getQueryData<Dream>(["dream", id]);

      if (previousDream) {
        queryClient.setQueryData<Dream>(["dream", id], {
          ...previousDream,
          milestones: (previousDream.milestones || []).filter(
            (milestone) => milestone.id !== milestoneId,
          ),
        });
      }

      return { previousDream };
    },
    onError: (_error, _milestoneId, context) => {
      if (context?.previousDream) {
        queryClient.setQueryData(["dream", id], context.previousDream);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dream", id] });
      queryClient.invalidateQueries({ queryKey: ["dreams"] });
      queryClient.invalidateQueries({ queryKey: ["dreamTree"] });
    },
  });

  return {
    dream,
    isLoading,
    error,
    updateDream: updateMutation.mutate,
    updateDreamAsync: updateMutation.mutateAsync,

    createChildDream: createChildDreamMutation.mutate,
    createChildDreamAsync: createChildDreamMutation.mutateAsync,
    isCreatingChildDream: createChildDreamMutation.isPending,

    addMilestone: addMilestoneMutation.mutate,
    addMilestoneAsync: addMilestoneMutation.mutateAsync,
    toggleMilestone: toggleMilestoneMutation.mutate,
    deleteMilestone: deleteMilestoneMutation.mutate,
    deleteMilestoneAsync: deleteMilestoneMutation.mutateAsync,

    isUpdating: updateMutation.isPending,
    isAddingMilestone: addMilestoneMutation.isPending,
    isDeletingMilestone: deleteMilestoneMutation.isPending,
  };
}