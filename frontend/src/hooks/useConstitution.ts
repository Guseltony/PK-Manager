import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../libs/api";

export interface ConstitutionPillar {
  name: string;
  desc: string;
  icon: string;
  color: string;
}

export interface Constitution {
  id: string;
  title: string;
  phase: string;
  mission: string;
  vision: string;
  pillars: ConstitutionPillar[];
  nonNegotiables: string[];
}

export function useConstitution() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<Constitution>({
    queryKey: ["constitution"],
    queryFn: async () => {
      const res = await api.get<Constitution>("/constitution");
      return res.data;
    },
  });

  const updateConstitution = useMutation({
    mutationFn: async (updates: Partial<Constitution>) => {
      const res = await api.put<Constitution>("/constitution", updates);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["constitution"] });
    },
    onError: (err: Error) => {
      console.error(err.message || "Failed to update constitution");
    },
  });

  return {
    constitution: data,
    isLoading,
    error,
    updateConstitution,
  };
}
