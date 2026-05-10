import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../libs/api";

export interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  pillarName?: string;
  frequency: string;
  color: string;
  icon: string;
  logs: HabitLog[];
  createdAt: string;
}

export function useHabits() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<Habit[]>({
    queryKey: ["habits"],
    queryFn: async () => {
      const res = await api.get<Habit[]>("/habit");
      return res.data;
    },
  });

  const createHabit = useMutation({
    mutationFn: async (newHabit: Partial<Habit>) => {
      const res = await api.post<Habit>("/habit", newHabit);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
    onError: (err: Error) => {
      console.error(err.message || "Failed to create habit");
    },
  });

  const updateHabit = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Habit> }) => {
      const res = await api.put<Habit>(`/habit/${id}`, updates);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
    onError: (err: Error) => {
      console.error(err.message || "Failed to update habit");
    },
  });

  const deleteHabit = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete<{ success: boolean }>(`/habit/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
    onError: (err: Error) => {
      console.error(err.message || "Failed to delete habit");
    },
  });

  const toggleLog = useMutation({
    mutationFn: async ({ id, date, completed }: { id: string; date: string; completed: boolean }) => {
      const res = await api.post<HabitLog>(`/habit/${id}/log`, { date, completed });
      return res.data;
    },
    onMutate: async ({ id, date, completed }) => {
      await queryClient.cancelQueries({ queryKey: ["habits"] });
      const previousHabits = queryClient.getQueryData<Habit[]>(["habits"]);
      
      if (previousHabits) {
        queryClient.setQueryData<Habit[]>(["habits"], (old) => {
          if (!old) return old;
          return old.map(habit => {
            if (habit.id === id) {
              const existingLogIndex = habit.logs.findIndex(l => new Date(l.date).toISOString().split('T')[0] === new Date(date).toISOString().split('T')[0]);
              const newLogs = [...habit.logs];
              
              if (existingLogIndex >= 0) {
                newLogs[existingLogIndex] = { ...newLogs[existingLogIndex], completed };
              } else {
                newLogs.push({ id: 'temp', habitId: id, date: new Date(date).toISOString(), completed });
              }
              return { ...habit, logs: newLogs };
            }
            return habit;
          });
        });
      }
      return { previousHabits };
    },
    onError: (err, variables, context) => {
      if (context?.previousHabits) {
        queryClient.setQueryData(["habits"], context.previousHabits);
      }
      console.error("Failed to update log");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });

  return {
    habits: data ?? [],
    isLoading,
    error,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleLog,
  };
}
