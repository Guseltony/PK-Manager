"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../libs/api";
import type { Settings } from "../types/settings";

export function useSettings() {
  const queryClient = useQueryClient();

  const query = useQuery<Settings>({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data } = await api.get<{ data: Settings }>("/settings/get");
      return data.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<Settings>) => {
      const { data } = await api.put<{ data: Settings }>("/settings/update", updates);
      return data.data;
    },
    onSuccess: (settings) => {
      queryClient.setQueryData(["settings"], settings);
    },
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{ data: Settings }>("/settings/reset");
      return data.data;
    },
    onSuccess: (settings) => {
      queryClient.setQueryData(["settings"], settings);
    },
  });

  return {
    settings: query.data,
    isLoading: query.isLoading,
    error: query.error,
    updateSettings: updateMutation.mutate,
    updateSettingsAsync: updateMutation.mutateAsync,
    resetSettings: resetMutation.mutate,
    resetSettingsAsync: resetMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    isResetting: resetMutation.isPending,
  };
}
