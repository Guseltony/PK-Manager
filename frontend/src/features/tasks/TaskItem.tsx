"use client";

import { Task } from "@/src/types/task";
import dayjs from "dayjs";
import {
  FiCircle,
  FiCheckCircle,
  FiClock,
  FiStar,
  FiFlag,
} from "react-icons/fi";
import { useTasks } from "../../hooks/useTasks";

interface TaskItemProps {
  task: Task;
  isSelected: boolean;
  onClick: () => void;
}

const priorityColors = {
  low: "text-blue-400",
  medium: "text-text-muted/60",
  high: "text-amber-400",
  urgent: "text-brand-accent",
};

export default function TaskItem({ task, isSelected, onClick }: TaskItemProps) {
  const { updateTask } = useTasks();

  const handleToggleStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = task.status === "done" ? "todo" : "done";
    updateTask({ id: task.id, updates: { status: newStatus } });
  };

  const isDone = task.status === "done";

  return (
    <div
      onClick={onClick}
      className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden ${
        isSelected
          ? "bg-brand-primary/5 border-brand-primary/30 shadow-xl shadow-brand-primary/5 scale-[1.02] z-10"
          : "bg-surface-soft/50 border-white/5 hover:border-white/10 hover:bg-white/5 active:scale-[0.99]"
      }`}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-primary shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
      )}

      <button
        onClick={handleToggleStatus}
        className="shrink-0 transition-all duration-200 active:scale-75 z-10"
      >
        {isDone ? (
          <FiCheckCircle
            className="text-brand-primary drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]"
            size={22}
          />
        ) : (
          <div className="w-5.5 h-5.5 rounded-full border-2 border-text-muted/30 group-hover:border-text-main/50 transition-colors flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-brand-primary opacity-0 group-hover:opacity-40 transition-opacity" />
          </div>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <h4
          className={`text-sm font-semibold truncate transition-all duration-300 ${isDone ? "text-text-muted line-through opacity-50" : "text-text-main"}`}
        >
          {task.title}
        </h4>
        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-text-muted font-bold uppercase tracking-wider">
          {task.dueDate && (
            <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">
              <FiClock size={10} className="text-brand-primary/70" />
              <span>{dayjs(task.dueDate).format("MMM d, HH:mm")}</span>
            </div>
          )}
          {task.priority !== "medium" && (
            <div
              className={`flex items-center gap-1 ${priorityColors[task.priority as keyof typeof priorityColors]}`}
            >
              <FiFlag size={10} />
              {task.priority}
            </div>
          )}
          {task.note && (
            <div className="flex items-center gap-1 bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-lg border border-brand-primary/20 italic">
              {task.note.title}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {task.aiScore && task.aiScore > 0.7 && (
          <div className="w-8 h-8 rounded-full bg-amber-400/10 flex items-center justify-center border border-amber-400/20 shadow-lg shadow-amber-400/5">
            <FiStar className="text-amber-400 fill-amber-400/20" size={14} />
          </div>
        )}
      </div>
    </div>
  );
}
