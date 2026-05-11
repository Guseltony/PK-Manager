"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../libs/api";
import type { User, UserStats, UpdateUserPayload } from "../types/user";

export function useUser() {
  return useQuery<User>({
    queryKey: ["user"],
    queryFn: async () => {
      const { data } = await api.get<{ data: User }>("/user/get");
      return data.data;
    },
  });
}

export function useUserStats() {
  return useQuery<UserStats>({
    queryKey: ["userStats"],
    queryFn: async () => {
      const { data } = await api.get<{ data: UserStats }>("/user/stats");
      return data.data;
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateUserPayload) => {
      const { data } = await api.put<{ data: User }>("/user/update", payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}
