import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../libs/api";

export interface ChaosEntry {
  id: string;
  trigger: string;
  context?: string;
  resolution: string;
  category: string;
  severity: number;
  createdAt: string;
}

export const CHAOS_CATEGORIES = [
  { value: "focus", label: "Focus & Discipline" },
  { value: "health", label: "Health & Body" },
  { value: "social", label: "Social & Relationships" },
  { value: "finance", label: "Finance & Money" },
  { value: "mental", label: "Mental & Emotional" },
  { value: "general", label: "General" },
];

export function useChaos() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<ChaosEntry[]>({
    queryKey: ["chaos"],
    queryFn: async () => {
      const res = await api.get<ChaosEntry[]>("/chaos");
      return res.data;
    },
  });

  const createEntry = useMutation({
    mutationFn: async (entry: Partial<ChaosEntry>) => {
      const res = await api.post<ChaosEntry>("/chaos", entry);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chaos"] });
    },
    onError: (err: Error) => {
      console.error(err.message || "Failed to log chaos entry");
    },
  });

  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete<{ success: boolean }>(`/chaos/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chaos"] });
    },
    onError: (err: Error) => {
      console.error(err.message || "Failed to delete entry");
    },
  });

  return {
    entries: data ?? [],
    isLoading,
    createEntry,
    deleteEntry,
  };
}
