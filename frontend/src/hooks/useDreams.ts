import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../libs/api";

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  weight: number;
  targetDate?: string;
}

export interface Dream {
  id: string;
  title: string;
  description?: string;
  status: "active" | "paused" | "completed";
  category?: string;
  priority: "low" | "medium" | "high" | "urgent";
  targetDate?: string;
  progress: number;
  healthScore: number;
  aiScore?: number;
  tasks?: any[];
  notes?: any[];
  milestones?: Milestone[];
  insights?: any[];
  activities?: any[];
  createdAt: string;
  updatedAt: string;
}

export function useDreams() {
  const queryClient = useQueryClient();

  const { data: dreams, isLoading, error } = useQuery<Dream[]>({
    queryKey: ["dreams"],
    queryFn: async () => {
      const { data } = await api.get<{ data: Dream[] }>("/dream/all");
      return data.data;
    },
  });

  const createDream = useMutation({
    mutationFn: async (newDream: Partial<Dream>) => {
      const { data } = await api.post<{ data: Dream }>("/dream/create", newDream);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dreams"] });
    },
  });

  return {
    dreams: dreams || [],
    isLoading,
    error,
    createDream,
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

  const updateDream = useMutation({
    mutationFn: async (updates: Partial<Dream>) => {
      const { data } = await api.put<{ data: Dream }>(`/dream/update/${id}`, updates);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dreams"] });
      queryClient.invalidateQueries({ queryKey: ["dream", id] });
    },
  });

  const addMilestone = useMutation({
    mutationFn: async (milestone: Partial<Milestone>) => {
      const { data } = await api.post<{ data: Milestone }>(`/dream/${id}/milestones`, milestone);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dream", id] });
    },
  });

  const toggleMilestone = useMutation({
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
    updateDream,
    addMilestone,
    toggleMilestone,
  };
}
