"use client";

import { useTask, useTasks } from "../../hooks/useTasks";
import {
  FiX,
  FiTrash2,
  FiEdit,
  FiPlus,
  FiTag,
  FiClock,
  FiFlag,
  FiLink,
  FiActivity,
  FiCheckCircle,
  FiZap,
} from "react-icons/fi";
import { useState } from "react";
import dayjs from "dayjs";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import PromptModal from "../../components/ui/PromptModal";

interface TaskDetailViewProps {
  taskId: string;
  onClose: () => void;
}

export default function TaskDetailView({
  taskId,
  onClose,
}: TaskDetailViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { data: task, isLoading } = useTask(taskId);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSubtaskPrompt, setShowSubtaskPrompt] = useState(false);

  const handleDelete = () => {
    deleteTask(taskId, {
      onSuccess: () => onClose(),
    });
  };

  const handleAddSubtask = (title: string) => {
    addSubtask({ taskId, title });
  };

  if (isLoading)
    return (
      <div className="w-112.5 border-l border-white/5 bg-surface-soft p-8 space-y-6">
        <div className="h-8 w-32 bg-white/5 animate-pulse rounded-lg" />
        <div className="h-24 w-full bg-white/5 animate-pulse rounded-2xl" />
        <div className="h-48 w-full bg-white/5 animate-pulse rounded-2xl" />
      </div>
    );

  if (!task)
    return (
      <div className="w-112.5 border-l border-white/5 bg-surface-soft p-8 flex items-center justify-center">
        <p className="text-text-muted">Task context not found</p>
      </div>
    );

  return (
    <div className="w-112.5 border-l border-white/5 bg-surface-soft flex flex-col h-full animate-in slide-in-from-right duration-500 ease-out z-20 shadow-2xl shadow-black/50">
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between glass">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted/60">
            Execution Context
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 text-text-muted hover:text-text-main hover:bg-white/5 rounded-xl transition-all duration-200">
            <FiEdit size={16} />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-text-muted hover:text-brand-accent hover:bg-brand-accent/10 rounded-xl transition-all duration-200"
          >
            <FiTrash2 size={16} />
          </button>
          <div className="w-px h-6 bg-white/5 mx-1" />
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text-main hover:bg-white/5 rounded-xl transition-all duration-200"
          >
            <FiX size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {/* Title Section */}
        <div className="mb-10">
          <div className="flex items-start gap-4 mb-4">
            <div
              className={`mt-1.5 shrink-0 ${task.status === "done" ? "text-brand-primary" : "text-text-muted"}`}
            >
              {task.status === "done" ? (
                <FiCheckCircle size={24} />
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-current opacity-30" />
              )}
            </div>
            <h2
              className={`text-2xl font-display font-extrabold leading-tight ${task.status === "done" ? "text-text-muted/50 line-through" : "text-text-main"}`}
            >
              {task.title}
            </h2>
          </div>

          <div className="flex flex-wrap gap-2 ml-10">
            {task.tags?.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1.5 text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-3 py-1.5 rounded-xl border border-brand-primary/20 uppercase tracking-tighter"
              >
                <FiTag size={10} /> {tag}
              </span>
            ))}
            <button className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 hover:bg-white/10 hover:text-text-main transition-all uppercase tracking-tighter">
              <FiPlus size={10} /> Link Tag
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="p-4 rounded-2xl bg-surface-base/80 border border-white/5 group hover:border-brand-primary/30 transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-brand-primary/10 text-brand-primary">
                <FiClock size={12} />
              </div>
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                Target Date
              </span>
            </div>
            <p className="text-sm text-text-main font-bold">
              {task.dueDate ? (
                dayjs(task.dueDate).format("MMM dd, yyyy")
              ) : (
                <span className="text-text-muted font-medium italic opacity-40">
                  Not scheduled
                </span>
              )}
            </p>
            {task.dueDate && (
              <p className="text-[10px] text-text-muted mt-1 uppercase font-semibold">
                {dayjs(task.dueDate).format("HH:mm")}
              </p>
            )}
          </div>
          <div className="p-4 rounded-2xl bg-surface-base/80 border border-white/5 group hover:border-brand-primary/30 transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400">
                <FiFlag size={12} />
              </div>
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                Priority
              </span>
            </div>
            <div className="flex items-center gap-2">
              <p
                className={`text-sm font-extrabold uppercase tracking-tight ${
                  task.priority === "urgent"
                    ? "text-brand-accent"
                    : task.priority === "high"
                      ? "text-amber-400"
                      : task.priority === "low"
                        ? "text-blue-400"
                        : "text-text-main"
                }`}
              >
                {task.priority || "Medium"}
              </p>
            </div>
            <p className="text-[10px] text-text-muted mt-1 uppercase font-semibold">
              Strategic Weight
            </p>
          </div>
        </div>

        {/* Description Section */}
        <div className="mb-10 p-6 rounded-3xl bg-linear-to-b from-surface-base to-surface-soft border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <FiZap size={64} className="text-brand-primary" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <FiActivity size={14} className="text-brand-primary" />
              <h4 className="text-[10px] font-bold text-text-main uppercase tracking-[0.2em]">
                Objective Details
              </h4>
            </div>
            <div className="text-sm text-text-muted leading-relaxed prose prose-invert font-medium">
              {task.description ||
                "The intelligence engine is awaiting further context for this objective. Define the scope to enable deeper execution linking."}
            </div>
          </div>
        </div>

        {/* Subtasks Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">
              Execution Steps
            </h4>
            <div className="h-px flex-1 bg-white/5 ml-4" />
          </div>
          <div className="space-y-2">
            {task.subtasks?.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-surface-base/50 border border-white/5 group"
              >
                <button
                  className={`shrink-0 ${sub.status === "done" ? "text-brand-primary" : "text-text-muted/40 group-hover:text-text-muted/70"}`}
                >
                  {sub.status === "done" ? (
                    <FiCheckCircle size={16} />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-current" />
                  )}
                </button>
                <span
                  className={`text-sm ${sub.status === "done" ? "text-text-muted line-through" : "text-text-main font-medium"}`}
                >
                  {sub.title}
                </span>
              </div>
            ))}
            <button
              onClick={() => setShowSubtaskPrompt(true)}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-white/10 text-text-muted hover:text-text-main hover:border-white/20 transition-all"
            >
              <FiPlus size={16} />
              <span className="text-xs font-semibold uppercase tracking-widest">
                Add Subtask
              </span>
            </button>
          </div>
        </div>

        {/* Knowledge & Goals Links */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">
              Connected Nodes
            </h4>
            <div className="h-px flex-1 bg-white/5 ml-4" />
          </div>
          <div className="space-y-3">
            {task.note ? (
              <div className="group relative overflow-hidden flex items-center justify-between p-4 rounded-2xl bg-surface-base border border-brand-primary/20 hover:border-brand-primary/50 transition-all cursor-pointer">
                <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-8 h-8 rounded-lg bg-brand-primary/20 flex items-center justify-center text-brand-primary">
                    <FiLink size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-main leading-none mb-1">
                      {task.note.title}
                    </p>
                    <p className="text-[10px] text-brand-primary font-bold uppercase tracking-tighter">
                      Linked Knowledge Node
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <button className="w-full flex flex-col items-center justify-center gap-2 p-6 rounded-3xl border border-dashed border-white/10 text-text-muted hover:text-brand-primary hover:border-brand-primary/30 hover:bg-brand-primary/5 transition-all group">
                <FiLink
                  size={20}
                  className="group-hover:scale-110 transition-transform"
                />
                <p className="text-[10px] font-bold uppercase tracking-widest">
                  Connect to Library
                </p>
              </button>
            )}
          </div>
        </div>

        {/* Activity Timeline */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">
              Execution History
            </h4>
            <div className="h-px flex-1 bg-white/5 ml-4" />
          </div>
          <div className="space-y-6 border-l border-white/10 ml-3 pl-8 relative">
            {task.activities?.map((activity, idx) => (
              <div key={idx} className="relative group/item">
                <div className="absolute -left-9.25 top-1 w-4 h-4 rounded-full bg-surface-soft border border-white/10 flex items-center justify-center z-10 group-hover/item:border-brand-primary transition-colors">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${activity.action === "created" ? "bg-blue-400" : activity.action === "completed" ? "bg-brand-primary" : "bg-amber-400"}`}
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-text-main capitalize mb-0.5 tracking-tight">
                    {activity.action}
                  </p>
                  <p className="text-[10px] text-text-muted font-medium opacity-60">
                    {dayjs(activity.timestamp).format(
                      "dddd, MMM DD · HH:mm:ss",
                    )}
                  </p>
                </div>
              </div>
            ))}
            {(!task.activities || task.activities.length === 0) && (
              <p className="text-[10px] text-text-muted italic opacity-40">
                Initial execution log pending...
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-white/5 glass">
        <button className="w-full py-3 rounded-2xl bg-brand-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-brand-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-brand-primary/20">
          Update Execution State
        </button>
      </div>

      <ConfirmationModal 
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Objective"
        message="Are you sure you want to terminate this task execution context? This action cannot be reversed."
        confirmText="Confirm Deletion"
      />

      <PromptModal 
        isOpen={showSubtaskPrompt}
        onClose={() => setShowSubtaskPrompt(false)}
        onSubmit={handleAddSubtask}
        title="New Execution Step"
        message="Define the next step for this objective."
        placeholder="e.g. Verify database migrations"
      />
    </div>
  );
}
