import { create } from "zustand";
import { Task } from "../types/task";

interface TasksState {
  tasks: Task[];
  selectedTaskId: string | null;
  setTasks: (tasks: Task[]) => void;
  setSelectedTaskId: (id: string | null) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, task: Task) => void;
  deleteTask: (id: string) => void;
}

export const useTasksStore = create<TasksState>((set) => ({
  tasks: [],
  selectedTaskId: null,
  setTasks: (tasks) => set({ tasks }),
  setSelectedTaskId: (id) => set({ selectedTaskId: id }),
  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
  updateTask: (id, updatedTask) =>
    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === id ? updatedTask : task)),
    })),
  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
      selectedTaskId: state.selectedTaskId === id ? null : state.selectedTaskId,
    })),
}));
