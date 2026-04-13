import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../libs/api";
import { Task, NewTask } from "../types/task";
import { useTasksStore } from "../store/tasksStore";
import { useEffect } from "react";

export function useTasks(activeFilter = "all") {
  const queryClient = useQueryClient();
  const { setTasks, addTask, updateTask: updateInStore, deleteTask: deleteFromStore } = useTasksStore();

  // Fetch Tasks
  const { data: fetchedTasks, isLoading, error } = useQuery<Task[]>({
    queryKey: ["tasks", activeFilter],
    queryFn: async () => {
      const params: Record<string, string | boolean> = {};
      if (activeFilter === "completed") params.status = "done";
      else if (activeFilter === "today") params.today = true;
      else if (activeFilter === "focus") params.focus = true;
      else if (activeFilter === "high-priority") params["high-priority"] = true;
      else if (activeFilter !== "all") {
        params.status = activeFilter;
      }
      
      const { data } = await api.get<{ data: Task[] }>("/task/get", { params });
      return data.data;
    },
  });

  // Sync with Zustand (optional, but keep it for consistency)
  useEffect(() => {
    if (fetchedTasks) {
      setTasks(fetchedTasks);
    }
  }, [fetchedTasks, setTasks]);

  // Create Task
  const createMutation = useMutation({
    mutationFn: async (newTask: NewTask | { title: string }) => {
      const { data } = await api.post<{ data: Task }>("/task/create", newTask);
      return data.data;
    },
    onSuccess: (data) => {
      addTask(data);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // Update Task
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
      const { data } = await api.put<{ data: Task }>(`/task/update/${id}`, updates);
      return data.data;
    },
    onSuccess: (data) => {
      updateInStore(data.id, data);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", data.id] });
    },
  });

  // Delete Task
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/task/delete/${id}`);
      return id;
    },
    onSuccess: (id) => {
      deleteFromStore(id);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // Subtask management
  const addSubtaskMutation = useMutation({
    mutationFn: async ({ taskId, title }: { taskId: string; title: string }) => {
      const { data } = await api.post(`/task/${taskId}/subtasks`, { title });
      return { taskId, subtask: data.data };
    },
    onSuccess: ({ taskId }) => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const updateSubtaskMutation = useMutation({
    mutationFn: async ({
      taskId,
      subtaskId,
      updates,
    }: {
      taskId: string;
      subtaskId: string;
      updates: any;
    }) => {
      const { data } = await api.put(`/task/${taskId}/subtasks/${subtaskId}`, updates);
      return { taskId, subtask: data.data };
    },
    onSuccess: ({ taskId }) => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const deleteSubtaskMutation = useMutation({
    mutationFn: async ({ taskId, subtaskId }: { taskId: string; subtaskId: string }) => {
      await api.delete(`/task/${taskId}/subtasks/${subtaskId}`);
      return { taskId, subtaskId };
    },
    onSuccess: ({ taskId }) => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  return {
    tasks: fetchedTasks || [],
    isLoading,
    error,
    createTask: createMutation.mutate,
    updateTask: updateMutation.mutate,
    deleteTask: deleteMutation.mutate,
    addSubtask: addSubtaskMutation.mutate,
    updateSubtask: updateSubtaskMutation.mutate,
    deleteSubtask: deleteSubtaskMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useTask(taskId: string | null) {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: async () => {
      if (!taskId) return null;
      const { data } = await api.get<{ data: Task }>(`/task/get/${taskId}`);
      return data.data;
    },
    enabled: !!taskId,
  });
}
