"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../libs/api";
import type { CreateProjectInput, GeneratedProjectsPayload, Project } from "../types/project";

type ProjectFilters = {
  dreamId?: string;
  status?: string;
};

export function useProjects(filters: ProjectFilters = {}) {
  const queryClient = useQueryClient();

  const query = useQuery<Project[]>({
    queryKey: ["projects", filters],
    queryFn: async () => {
      const { data } = await api.get<{ data: Project[] }>("/project/get", { params: filters });
      return data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: CreateProjectInput) => {
      const { data } = await api.post<{ data: Project }>("/project/create", payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dreams"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CreateProjectInput & { status: Project["status"] }> }) => {
      const { data } = await api.put<{ data: Project }>(`/project/update/${id}`, updates);
      return data.data;
    },
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.setQueryData(["project", project.id], project);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/project/delete/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const generateMutation = useMutation({
    mutationFn: async ({ dreamId, persist = true }: { dreamId: string; persist?: boolean }) => {
      const { data } = await api.post<{ data: GeneratedProjectsPayload }>(`/project/dream/${dreamId}/generate`, { persist });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dreams"] });
    },
  });

  return {
    projects: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createProject: createMutation.mutate,
    createProjectAsync: createMutation.mutateAsync,
    updateProject: updateMutation.mutate,
    updateProjectAsync: updateMutation.mutateAsync,
    deleteProject: deleteMutation.mutate,
    deleteProjectAsync: deleteMutation.mutateAsync,
    generateProjects: generateMutation.mutate,
    generateProjectsAsync: generateMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isGenerating: generateMutation.isPending,
  };
}

export function useProject(projectId: string | null) {
  return useQuery<Project | null>({
    queryKey: ["project", projectId],
    queryFn: async () => {
      if (!projectId) {
        return null;
      }
      const { data } = await api.get<{ data: Project }>(`/project/get/${projectId}`);
      return data.data;
    },
    enabled: !!projectId,
  });
}
