import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../libs/api";
import { Task, NewTask, Subtask } from "../types/task";
import { useTasksStore } from "../store/tasksStore";
import { useEffect } from "react";

const normalizeTaskShape = (task: Partial<Task>) => {
  if (!task.tags) return task;

  return {
    ...task,
    tags: task.tags.map((tag) => {
      if ("tag" in tag && tag.tag) {
        return tag;
      }

      if ("name" in tag) {
        return {
          tag: {
            id: `temp-${tag.name}`,
            name: tag.name,
            color: "color" in tag ? tag.color : undefined,
            createdAt: new Date().toISOString(),
          },
        };
      }

      return tag;
    }),
  };
};

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
      else if (activeFilter === "upcoming") params.upcoming = true;
      else if (activeFilter === "overdue") params.overdue = true;
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

  // Update Task (Optimistic)
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
      const { data } = await api.put<{ data: Task }>(`/task/update/${id}`, updates);
      return data.data;
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      await queryClient.cancelQueries({ queryKey: ["task", id] });

      const previousTask = queryClient.getQueryData<Task>(["task", id]);
      const previousTasks = queryClient.getQueryData<Task[]>(["tasks", activeFilter]);

      if (previousTask) {
        queryClient.setQueryData<Task>(["task", id], (old) => {
          if (!old) return undefined;
          return {
            ...old,
            ...normalizeTaskShape(updates),
            // Keep activities during update - they'll be refreshed on success
            activities: old.activities 
          };
        });
      }
      if (previousTasks) {
        queryClient.setQueryData<Task[]>(["tasks", activeFilter], (old) =>
          old?.map((t) => (t.id === id ? { ...t, ...normalizeTaskShape(updates) } : t))
        );
      }

      return { previousTask, previousTasks };
    },
    onError: (err, { id }, context) => {
      if (context?.previousTask) queryClient.setQueryData(["task", id], context.previousTask);
      if (context?.previousTasks) queryClient.setQueryData(["tasks", activeFilter], context.previousTasks);
    },
    onSettled: (data) => {
      if (data) {
        updateInStore(data.id, data);
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        queryClient.invalidateQueries({ queryKey: ["task", data.id] });
      }
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

  // Subtask management (Optimistic)
  const addSubtaskMutation = useMutation({
    mutationFn: async ({ taskId, title }: { taskId: string; title: string }) => {
      const { data } = await api.post<{ data: Subtask }>(`/task/${taskId}/subtasks`, { title });
      return { taskId, subtask: data.data };
    },
    onMutate: async ({ taskId, title }) => {
      await queryClient.cancelQueries({ queryKey: ["task", taskId] });
      const previousTask = queryClient.getQueryData<Task>(["task", taskId]);

      if (previousTask) {
        queryClient.setQueryData<Task>(["task", taskId], (old) => {
          if (!old) return undefined;
          return {
            ...old,
            subtasks: [
              ...(old.subtasks || []),
              { id: "temp-id", title, status: "todo", taskId },
            ],
          };
        });
      }

      return { previousTask };
    },
    onError: (err, { taskId }, context) => {
      if (context?.previousTask) queryClient.setQueryData(["task", taskId], context.previousTask);
    },
    onSettled: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["task", data.taskId] });
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      }
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
      updates: Partial<Subtask>;
    }) => {
      const { data } = await api.put<{ data: Subtask }>(`/task/${taskId}/subtasks/${subtaskId}`, updates);
      return { taskId, subtask: data.data };
    },
    onMutate: async ({ taskId, subtaskId, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["task", taskId] });
      const previousTask = queryClient.getQueryData<Task>(["task", taskId]);

      if (previousTask) {
        queryClient.setQueryData<Task>(["task", taskId], (old) => {
          if (!old) return undefined;
          return {
            ...old,
            subtasks: old.subtasks?.map((s) =>
              s.id === subtaskId ? { ...s, ...updates } : s
            ),
          };
        });
      }

      return { previousTask };
    },
    onError: (err, { taskId }, context) => {
      if (context?.previousTask) queryClient.setQueryData(["task", taskId], context.previousTask);
    },
    onSettled: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["task", data.taskId] });
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      }
    },
  });

  const deleteSubtaskMutation = useMutation({
    mutationFn: async ({ taskId, subtaskId }: { taskId: string; subtaskId: string }) => {
      await api.delete(`/task/${taskId}/subtasks/${subtaskId}`);
      return { taskId, subtaskId };
    },
    onMutate: async ({ taskId, subtaskId }) => {
      await queryClient.cancelQueries({ queryKey: ["task", taskId] });
      const previousTask = queryClient.getQueryData<Task>(["task", taskId]);

      if (previousTask) {
        queryClient.setQueryData<Task>(["task", taskId], (old) => {
          if (!old) return undefined;
          return {
            ...old,
            subtasks: old.subtasks?.filter((s) => s.id !== subtaskId),
          };
        });
      }

      return { previousTask };
    },
    onError: (err, { taskId }, context) => {
      if (context?.previousTask) queryClient.setQueryData(["task", taskId], context.previousTask);
    },
    onSettled: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["task", data.taskId] });
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      }
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
    isAddingSubtask: addSubtaskMutation.isPending,
    isUpdatingSubtask: updateSubtaskMutation.isPending,
    isDeletingSubtask: deleteSubtaskMutation.isPending,
  };
}

export function useTask(taskId: string | null) {
  return useQuery<Task | null>({
    queryKey: ["task", taskId],
    queryFn: async () => {
      if (!taskId) return null;
      const { data } = await api.get<{ data: Task }>(`/task/get/${taskId}`);
      return data.data;
    },
    enabled: !!taskId,
  });
}
