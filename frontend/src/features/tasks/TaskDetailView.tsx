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
  FiArrowLeft,
} from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";
import { useTags } from "../../hooks/useTags";
import { useNotesStore } from "../../store/notesStore";
import { useTasksStore } from "../../store/tasksStore";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import PromptModal from "../../components/ui/PromptModal";
import { TaskStatus, Priority } from "../../types/task";

interface TaskDetailViewProps {
  taskId: string;
  onClose: () => void;
}

const statuses: TaskStatus[] = ["todo", "in_progress", "done"];
const priorities: Priority[] = ["low", "medium", "high", "urgent"];

export default function TaskDetailView({
  taskId,
  onClose,
}: TaskDetailViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { data: task, isLoading } = useTask(taskId);
  const {
    updateTask,
    deleteTask,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    isUpdating,
    isDeleting,
    isAddingSubtask,
    isUpdatingSubtask,
    isDeletingSubtask,
  } = useTasks();
  const { tags: allTags } = useTags();
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSubtaskPrompt, setShowSubtaskPrompt] = useState(false);
  const [showTagPrompt, setShowTagPrompt] = useState(false);
  const [showSubtaskWarning, setShowSubtaskWarning] = useState(false);

  const [localPriority, setLocalPriority] = useState<Priority | null>(null);
  const [isCycling, setIsCycling] = useState(false);
  const [localDescription, setLocalDescription] = useState("");
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [showDurationPrompt, setShowDurationPrompt] = useState(false);

  const [prevTaskId, setPrevTaskId] = useState<string | null>(null);

  const isCompleted = task?.status === "done";

  if (task && task.id !== prevTaskId) {
    setPrevTaskId(task.id);
    setLocalPriority(task.priority);
    setLocalDescription(task.description || "");
  }

  const handleStatusToggle = () => {
    if (!task) return;
    const currentIndex = statuses.indexOf(task.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    
    // Check for incomplete subtasks if trying to complete the task
    if (nextStatus === "done" && task.subtasks && task.subtasks.length > 0) {
      const incompleteSubtasks = task.subtasks.filter(s => s.status !== "done");
      if (incompleteSubtasks.length > 0) {
        setShowSubtaskWarning(true);
        return;
      }
    }
    
    setShowSubtaskWarning(false);
    updateTask({ id: task.id, updates: { status: nextStatus } });
  };

  const handleMarkDone = () => {
    if (!task || isCompleted) return;
    
    // Check for incomplete subtasks
    if (task.subtasks && task.subtasks.length > 0) {
      const incompleteSubtasks = task.subtasks.filter(s => s.status !== "done");
      if (incompleteSubtasks.length > 0) {
        setShowSubtaskWarning(true);
        return;
      }
    }
    
    setShowSubtaskWarning(false);
    updateTask({ id: task.id, updates: { status: "done" } });
  };

  const handlePriorityCycle = () => {
    if (!task || !localPriority || isCompleted) return;
    setIsCycling(true);
    const currentIndex = priorities.indexOf(localPriority);
    const nextPriority = priorities[(currentIndex + 1) % priorities.length];
    
    // Fast local update
    setLocalPriority(nextPriority);
    
    // Mutation in background
    updateTask(
      { id: task.id, updates: { priority: nextPriority } },
      { onSettled: () => setIsCycling(false) }
    );
  };

  const handleAddTag = (tagName: string) => {
    if (!task || isCompleted) return;
    if (!task.tags.some(t => t.tag.name === tagName)) {
      updateTask({ id: task.id, updates: { tags: [...task.tags.map(t => ({ name: t.tag.name })), { name: tagName }] } });
    }
  };

  const handleRemoveTag = (tagName: string) => {
    if (!task || isCompleted) return;
    updateTask({ id: task.id, updates: { tags: task.tags.filter(t => t.tag.name !== tagName).map(t => ({ name: t.tag.name })) } });
  };

  const handleSubtaskToggle = (subtaskId: string, currentStatus: string) => {
    if (!task || isCompleted) return;
    const nextStatus = currentStatus === "done" ? "todo" : "done";
    updateSubtask({ taskId, subtaskId, updates: { status: nextStatus } });
  };

  const handleSubtaskDelete = (subtaskId: string) => {
    if (!task || isCompleted) return;
    if (confirm("Delete this step?")) {
      deleteSubtask({ taskId, subtaskId });
    }
  };

  const handleDelete = () => {
    if (isCompleted) return;
    deleteTask(taskId, {
      onSuccess: () => onClose(),
    });
  };

  const handleAddSubtask = (title: string) => {
    if (isCompleted) return;
    addSubtask({ taskId, title });
  };

  const { notes } = useNotesStore();
  const [showNotePrompt, setShowNotePrompt] = useState(false);

  const handleLinkNote = (noteTitle: string) => {
    if (!task || isCompleted) return;
    const note = notes.find(n => n.title.toLowerCase() === noteTitle.toLowerCase());
    if (note) {
      updateTask({ id: task.id, updates: { noteId: note.id } });
    } else {
      alert("Note not found. Please select an existing note title.");
    }
  };

  const handleUnlinkNote = () => {
    if (!task || isCompleted) return;
    updateTask({ id: task.id, updates: { noteId: null } });
  };

  const handleUpdateDescription = () => {
    if (!task || isCompleted) return;
    if (localDescription !== task.description) {
      updateTask({ id: task.id, updates: { description: localDescription } });
    }
    setIsEditingDesc(false);
  };

  const handleUpdateDuration = (val: string) => {
    if (!task || isCompleted) return;
    const dur = parseInt(val);
    if (!isNaN(dur) && dur >= 0) {
      updateTask({ id: task.id, updates: { duration: dur } });
    }
  };

  if (isLoading)
    return (
      <div className="w-full md:w-96 lg:w-112.5 absolute md:relative inset-0 border-l border-white/5 bg-surface-soft p-4 sm:p-6 lg:p-8 space-y-6 z-20">
        <div className="h-8 w-32 bg-white/5 animate-pulse rounded-lg" />
        <div className="h-24 w-full bg-white/5 animate-pulse rounded-2xl" />
        <div className="h-48 w-full bg-white/5 animate-pulse rounded-2xl" />
      </div>
    );

  if (!task)
    return (
      <div className="w-full md:w-96 lg:w-112.5 absolute md:relative inset-0 border-l border-white/5 bg-surface-soft p-4 sm:p-6 lg:p-8 flex items-center justify-center z-20">
        <p className="text-text-muted">Task context not found</p>
      </div>
    );

  return (
    <div className="w-full md:w-96 lg:w-112.5 absolute md:relative inset-0 border-l border-white/5 bg-surface-soft flex flex-col h-full animate-in slide-in-from-right duration-500 ease-out z-20 shadow-2xl shadow-black/50">
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between glass">
        <div className="flex items-center gap-2">
          <button
            onClick={() => useTasksStore.getState().setSelectedTaskId(null)}
            className="-ml-2 p-2 text-text-muted hover:text-text-main hover:bg-white/5 rounded-xl transition-all"
            title="Back to list"
          >
            <FiArrowLeft size={18} />
          </button>
          <div
            className={`w-2 h-2 rounded-full ${isUpdating ? "bg-amber-400" : "bg-brand-primary"} animate-pulse`}
          />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted/60">
            {isUpdating
              ? "Synchronizing..."
              : isDeleting
                ? "Terminating..."
                : "Execution Context"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {!isCompleted && (
            <>
              <button
                onClick={() => setIsEditingDesc(true)}
                className="p-2 text-text-muted hover:text-text-main hover:bg-white/5 rounded-xl transition-all duration-200"
              >
                <FiEdit size={16} />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-text-muted hover:text-brand-accent hover:bg-brand-accent/10 rounded-xl transition-all duration-200"
              >
                <FiTrash2 size={16} />
              </button>
              <div className="w-px h-6 bg-white/5 mx-1" />
            </>
          )}
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text-main hover:bg-white/5 rounded-xl transition-all duration-200"
          >
            <FiX size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
        {/* Warning Toast */}
        <AnimatePresence>
          {showSubtaskWarning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="mb-8 p-6 rounded-3xl bg-brand-accent/10 border-2 border-brand-accent/30 shadow-2xl shadow-brand-accent/5 backdrop-blur-md relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-linear-to-br from-brand-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-start gap-4 relative z-10">
                <div className="p-3 rounded-2xl bg-brand-accent/20 text-brand-accent shadow-lg shadow-brand-accent/20 animate-bounce">
                  <FiZap size={20} />
                </div>
                <div className="flex-1">
                  <h5 className="text-sm font-black text-brand-accent uppercase tracking-widest mb-1">
                    System Interlock Initialized
                  </h5>
                  <p className="text-xs text-brand-accent/80 font-bold leading-relaxed">
                    Objective completion is disabled. Prerequisite sub-layers
                    must all reach 100% synchronization before final execution
                    state can be committed.
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => setShowSubtaskWarning(false)}
                      className="px-4 py-1.5 rounded-xl bg-brand-accent/20 text-[10px] font-bold text-brand-accent hover:bg-brand-accent/30 transition-all uppercase tracking-widest"
                    >
                      Acknowledge
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Title Section */}
        <div className="mb-10">
          <div className="flex items-start gap-4 mb-4">
            <button
              onClick={handleStatusToggle}
              className={`mt-1.5 shrink-0 transition-all active:scale-75 ${task.status === "done" ? "text-brand-primary" : "text-text-muted/40 hover:text-text-main"}`}
            >
              {task.status === "done" ? (
                <FiCheckCircle
                  size={24}
                  className="drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]"
                />
              ) : task.status === "in_progress" ? (
                <FiActivity
                  size={24}
                  className="animate-pulse text-amber-400"
                />
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-current opacity-30" />
              )}
            </button>
            <h2
              className={`text-2xl font-display font-extrabold leading-tight ${task.status === "done" ? "text-text-muted/50 line-through" : "text-text-main"}`}
            >
              {task.title}
            </h2>
          </div>

          <div className="flex flex-wrap gap-2 ml-10">
            {task.tags?.map((tagObj: any) => (
              <span
                key={tagObj.tag.id || tagObj.tag.name}
                onClick={() => !isCompleted && handleRemoveTag(tagObj.tag.name)}
                className={`flex items-center gap-1.5 text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-3 py-1.5 rounded-xl border border-brand-primary/20 uppercase tracking-tighter transition-all group ${!isCompleted ? "cursor-pointer hover:bg-red-400/10 hover:text-red-400 hover:border-red-400/20" : ""}`}
              >
                <FiTag size={10} /> {tagObj.tag.name}
                {!isCompleted && (
                  <span className="opacity-0 group-hover:opacity-100">
                    &times;
                  </span>
                )}
              </span>
            ))}
            {!isCompleted && (
              <button
                onClick={() => setShowTagPrompt(true)}
                className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 hover:bg-white/10 hover:text-text-main transition-all uppercase tracking-tighter"
              >
                <FiPlus size={10} /> Link Tag
              </button>
            )}
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
                dayjs(task.dueDate).format("MMM DD, YYYY")
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
          <button
            onClick={handlePriorityCycle}
            disabled={isCompleted}
            className={`p-4 rounded-2xl bg-surface-base/80 border border-white/5 group transition-all duration-300 text-left relative overflow-hidden ${isCompleted ? "cursor-default" : "hover:border-brand-primary/30"}`}
          >
            <AnimatePresence mode="wait">
              {isCycling && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-brand-primary/5 flex items-center justify-center backdrop-blur-[2px]"
                >
                  <FiActivity
                    className="animate-spin text-brand-primary"
                    size={16}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-2 mb-2">
              <div
                className={`p-1.5 rounded-lg ${
                  localPriority === "urgent"
                    ? "bg-brand-accent/10 text-brand-accent"
                    : localPriority === "high"
                      ? "bg-amber-400/10 text-amber-400"
                      : localPriority === "low"
                        ? "bg-blue-400/10 text-blue-400"
                        : "bg-white/10 text-text-muted"
                }`}
              >
                <FiFlag size={12} />
              </div>
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                Priority
              </span>
            </div>
            <div className="flex items-center gap-2">
              <motion.p
                key={localPriority}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`text-sm font-extrabold uppercase tracking-tight ${
                  localPriority === "urgent"
                    ? "text-brand-accent"
                    : localPriority === "high"
                      ? "text-amber-400"
                      : localPriority === "low"
                        ? "text-blue-400"
                        : "text-text-main"
                }`}
              >
                {localPriority || "Medium"}
              </motion.p>
            </div>
            <p className="text-[10px] text-text-muted mt-1 uppercase font-semibold">
              Force Multiplier
            </p>
          </button>

          <button
            onClick={() => !isCompleted && setShowDurationPrompt(true)}
            disabled={isCompleted}
            className={`p-4 rounded-2xl bg-surface-base/80 border border-white/5 group transition-all duration-300 text-left ${isCompleted ? "cursor-default" : "hover:border-brand-primary/30"}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-emerald-400/10 text-emerald-400">
                <FiZap size={12} />
              </div>
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                Duration
              </span>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-extrabold text-text-main uppercase tracking-tight">
                {task.duration || 0} {task.duration === 1 ? "Day" : "Days"}
              </p>
            </div>
            <p className="text-[10px] text-text-muted mt-1 uppercase font-semibold">
              Execution Span
            </p>
          </button>
        </div>

        {/* Description Section */}
        <div className="mb-10 p-6 rounded-3xl bg-linear-to-b from-surface-base to-surface-soft border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <FiZap size={64} className="text-brand-primary" />
          </div>
          <div className="relative z-10 w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FiActivity size={14} className="text-brand-primary" />
                <h4 className="text-[10px] font-bold text-text-main uppercase tracking-[0.2em]">
                  Objective Details
                </h4>
              </div>
              {!isEditingDesc && !isCompleted && (
                <button
                  onClick={() => setIsEditingDesc(true)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-text-muted transition-all"
                >
                  <FiEdit size={12} />
                </button>
              )}
            </div>

            {isEditingDesc ? (
              <textarea
                autoFocus
                value={localDescription}
                onChange={(e) => setLocalDescription(e.target.value)}
                onBlur={handleUpdateDescription}
                className="w-full bg-transparent text-sm text-text-main leading-relaxed outline-none border-none resize-none min-h-24 custom-scrollbar"
                placeholder="Describe the desired outcome..."
              />
            ) : (
              <div
                onClick={() => !isCompleted && setIsEditingDesc(true)}
                className={`text-sm text-text-muted leading-relaxed prose prose-invert font-medium ${isCompleted ? "cursor-default" : "cursor-text"}`}
              >
                {task.description ||
                  "The intelligence engine is awaiting further context for this objective. Define the scope to enable deeper execution linking."}
              </div>
            )}
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
                className="flex items-center gap-3 p-3 rounded-xl bg-surface-base/50 border border-white/5 group/sub"
              >
                <button
                  onClick={() => handleSubtaskToggle(sub.id, sub.status)}
                  disabled={isCompleted || isUpdatingSubtask}
                  className={`shrink-0 transition-all active:scale-75 ${sub.status === "done" ? "text-brand-primary" : "text-text-muted/40 group-hover/sub:text-text-muted/70"} ${isCompleted || isUpdatingSubtask ? "cursor-wait opacity-50" : ""}`}
                >
                  {isUpdatingSubtask ? (
                    <FiActivity size={16} className="animate-spin" />
                  ) : sub.status === "done" ? (
                    <FiCheckCircle size={16} />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-current" />
                  )}
                </button>
                <span
                  className={`flex-1 text-sm ${sub.status === "done" ? "text-text-muted line-through" : "text-text-main font-medium"}`}
                >
                  {sub.title}
                </span>
                {!isCompleted && (
                  <button
                    onClick={() => handleSubtaskDelete(sub.id)}
                    className="opacity-0 group-hover/sub:opacity-100 p-1 text-text-muted hover:text-red-400 transition-all"
                  >
                    <FiX size={14} />
                  </button>
                )}
              </div>
            ))}
            {isAddingSubtask && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 animate-pulse">
                <div className="w-4 h-4 rounded-full border border-white/20" />
                <div className="h-4 w-32 bg-white/10 rounded-md" />
              </div>
            )}
            {!isCompleted && (
              <button
                onClick={() => setShowSubtaskPrompt(true)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-white/10 text-text-muted hover:text-text-main hover:border-white/20 transition-all"
              >
                <FiPlus size={16} />
                <span className="text-xs font-semibold uppercase tracking-widest">
                  Add Subtask
                </span>
              </button>
            )}
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
              <div className="group relative overflow-hidden flex items-center justify-between p-4 rounded-2xl bg-surface-base border border-brand-primary/20 hover:border-brand-primary/50 transition-all">
                <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-8 h-8 rounded-lg bg-brand-primary/20 flex items-center justify-center text-brand-primary">
                    <FiLink size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text-main leading-tight mb-1 truncate">
                      {task.note.title}
                    </p>
                    <p className="text-[10px] text-brand-primary font-bold uppercase tracking-tighter">
                      Linked Knowledge Node
                    </p>
                  </div>
                </div>
                {!isCompleted && (
                  <button
                    onClick={handleUnlinkNote}
                    className="relative z-10 p-2 text-text-muted hover:text-red-400 transition-colors"
                    title="Unlink Note"
                  >
                    <FiX size={16} />
                  </button>
                )}
              </div>
            ) : !isCompleted ? (
              <button
                onClick={() => setShowNotePrompt(true)}
                className="w-full flex flex-col items-center justify-center gap-2 p-6 rounded-3xl border border-dashed border-white/10 text-text-muted hover:text-brand-primary hover:border-brand-primary/30 hover:bg-brand-primary/5 transition-all group"
              >
                <FiLink
                  size={20}
                  className="group-hover:scale-110 transition-transform"
                />
                <p className="text-[10px] font-bold uppercase tracking-widest">
                  Connect to Library
                </p>
              </button>
            ) : (
              <p className="text-[10px] text-text-muted italic opacity-40 text-center py-4">
                No linked knowledge nodes
              </p>
            )}
          </div>
        </div>

        {/* Execution History (Activity Timeline) */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">
              Execution History
            </h4>
            <div className="h-px flex-1 bg-white/5 ml-4" />
          </div>
          <div className="space-y-6 border-l border-white/10 ml-3 pl-8 relative">
            {task.activities?.length ? (
              task.activities.map((activity, idx) => (
                <div key={idx} className="relative group/item">
                  <div className="absolute -left-9.25 top-1 w-4 h-4 rounded-full bg-surface-soft border border-white/10 flex items-center justify-center z-10 group-hover/item:border-brand-primary transition-colors">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        activity.action === "created" 
                          ? "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]" 
                          : activity.action === "completed" 
                          ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" 
                          : "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                      }`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-0.5">
                      <p className="text-xs font-bold text-text-main tracking-tight">
                        {activity.action}
                      </p>
                      <div className="h-px w-2 bg-white/10" />
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/5 text-text-muted/60 font-mono uppercase tracking-tighter">
                        Log Entry
                      </span>
                    </div>
                    <p className="text-[10px] text-text-muted font-medium opacity-60">
                      {dayjs(activity.timestamp).format("dddd, MMM DD · HH:mm:ss")}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-4 text-center sm:text-left">
                <p className="text-[10px] text-text-muted italic opacity-40">
                  Initial execution log pending...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-white/5 glass">
        <button
          onClick={handleMarkDone}
          disabled={isCompleted || isUpdating}
          className={`w-full py-4 rounded-2xl text-white text-xs font-bold uppercase tracking-[0.2em] transition-all shadow-2xl ${isCompleted ? "bg-emerald-500/20 text-emerald-500 shadow-none cursor-default border border-emerald-500/30" : "bg-brand-primary hover:bg-brand-primary/90 hover:scale-[1.02] active:scale-[0.98] shadow-brand-primary/30"}`}
        >
          {isCompleted ? (
            <span className="flex items-center justify-center gap-2">
              <FiCheckCircle size={14} /> Objective Finalized
            </span>
          ) : isUpdating ? (
            <span className="flex items-center justify-center gap-2">
              <FiActivity size={14} className="animate-spin" /> Committing
              State...
            </span>
          ) : (
            "Mark as Completed"
          )}
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

      <PromptModal
        isOpen={showTagPrompt}
        onClose={() => setShowTagPrompt(false)}
        onSubmit={handleAddTag}
        title="Link Tag"
        message="Add a classification tag to this task."
        placeholder="e.g. Research, Design, API"
        suggestions={allTags.map((t) => t.name)}
      />

      <PromptModal
        isOpen={showNotePrompt}
        onClose={() => setShowNotePrompt(false)}
        onSubmit={handleLinkNote}
        title="Link Knowledge Node"
        message="Connect this task to a relevant note in your library."
        placeholder="Type note title..."
        suggestions={notes.map((n) => n.title)}
      />

      <PromptModal
        isOpen={showDurationPrompt}
        onClose={() => setShowDurationPrompt(false)}
        onSubmit={handleUpdateDuration}
        title="Execution Span"
        message="How many days should this objective span? This determines its visibility in your workflow."
        placeholder="e.g. 3"
        defaultValue={task.duration?.toString() || "0"}
      />
    </div>
  );
}
