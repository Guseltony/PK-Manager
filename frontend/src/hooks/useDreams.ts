import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../libs/api";
import { 
  Dream, 
  Milestone, 
} from "../types/dream";

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
        console.error("DEBUG: Fetching dreams error:", error.response?.data || error.message);
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
    },
  });

  return {
    dreams: dreams || (EMPTY_ARRAY as Dream[]),
    isLoading,
    error,
    createDream: createDreamMutation.mutate,
    isCreating: createDreamMutation.isPending,
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
      queryClient.invalidateQueries({ queryKey: ["dream", id] });
    },
  });

  const addMilestoneMutation = useMutation({
    mutationFn: async (milestone: Partial<Milestone>) => {
      const { data } = await api.post<{ data: Milestone }>(`/dream/${id}/milestones`, milestone);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dream", id] });
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

  return {
    dream,
    isLoading,
    error,
    updateDream: updateMutation.mutate,
    addMilestone: addMilestoneMutation.mutate,
    toggleMilestone: toggleMilestoneMutation.mutate,
    isUpdating: updateMutation.isPending,
    isAddingMilestone: addMilestoneMutation.isPending,
  };
}
