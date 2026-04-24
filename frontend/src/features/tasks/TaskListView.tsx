"use client";

import { useTasks } from "../../hooks/useTasks";
import TaskItem from "./TaskItem";
import { FiInbox } from "react-icons/fi";

interface TaskListViewProps {
  activeFilter: string;
  selectedTaskId: string | null;
  onTaskSelect: (id: string | null) => void;
}

export default function TaskListView({ activeFilter, selectedTaskId, onTaskSelect }: TaskListViewProps) {
  const { tasks, isLoading, error } = useTasks(activeFilter);

  if (isLoading) {
    return (
      <div className="flex-1 p-6 space-y-4 max-w-4xl mx-auto w-full">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 w-full bg-white/5 animate-pulse rounded-2xl border border-white/5" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-brand-accent">
        <p>Error loading tasks. Please try again.</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-text-muted p-12">
        <div className="w-20 h-20 rounded-3xl bg-surface-soft border border-white/5 flex items-center justify-center mb-6 shadow-xl">
            <FiInbox size={32} className="opacity-20" />
        </div>
        <h3 className="text-lg font-display font-semibold text-text-main mb-1">Clear Horizons</h3>
        <p className="text-sm opacity-60">No tasks found in this perspective.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 px-2 py-4 sm:p-6 flex flex-col gap-2.5 max-w-4xl mx-auto w-full pb-20">
      <div className="flex items-center justify-between mb-3 px-1 sm:px-0">
        <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted/50">
          {activeFilter.replace("-", " ")} Tasks ({tasks.length})
        </h2>
        <div className="h-px flex-1 bg-white/5 mx-4" />
      </div>

      {tasks.map((task) => (
        <TaskItem 
          key={task.id} 
          task={task} 
          isSelected={selectedTaskId === task.id}
          onClick={() => onTaskSelect(task.id)}
        />
      ))}
    </div>
  );
}
