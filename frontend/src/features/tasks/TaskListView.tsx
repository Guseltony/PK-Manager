"use client";

import { useMemo, useState } from "react";
import { useTasks } from "../../hooks/useTasks";
import { useDreams } from "../../hooks/useDreams";
import { useProjects } from "../../hooks/useProjects";
import TaskItem from "./TaskItem";
import { FiArrowRight, FiInbox } from "react-icons/fi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

interface TaskListViewProps {
  activeFilter: string;
  selectedTaskId: string | null;
  onTaskSelect: (id: string | null) => void;
}

export default function TaskListView({ activeFilter, selectedTaskId, onTaskSelect }: TaskListViewProps) {
  const { tasks, isLoading, error, updateTaskAsync, isUpdating } = useTasks(activeFilter);
  const { dreams } = useDreams();
  const { projects } = useProjects();
  const [selectedBulkIds, setSelectedBulkIds] = useState<string[]>([]);
  const [bulkDreamId, setBulkDreamId] = useState("");
  const [bulkProjectId, setBulkProjectId] = useState("");

  const availableProjects = useMemo(
    () => projects.filter((project) => !bulkDreamId || project.dreamId === bulkDreamId),
    [bulkDreamId, projects],
  );

  const toggleTaskSelection = (taskId: string) => {
    setSelectedBulkIds((current) =>
      current.includes(taskId)
        ? current.filter((id) => id !== taskId)
        : [...current, taskId],
    );
  };

  const applyBulkAssignment = async () => {
    if (!selectedBulkIds.length) return;

    await Promise.all(
      selectedBulkIds.map((id) =>
        updateTaskAsync({
          id,
          updates: {
            dreamId: bulkDreamId || null,
            projectId: bulkProjectId || null,
          },
        }),
      ),
    );

    setSelectedBulkIds([]);
    setBulkDreamId("");
    setBulkProjectId("");
  };

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

      <div className="rounded-2xl border border-white/10 bg-surface-soft/60 p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-primary">
              Bulk Shift
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Select tasks and move them into a dream or project without leaving the list.
            </p>
          </div>
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-text-main">
            {selectedBulkIds.length} selected
          </span>
        </div>
        <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
          <Select
            value={bulkDreamId || "none"}
            onValueChange={(value) => {
              setBulkDreamId(value === "none" ? "" : value);
              setBulkProjectId("");
            }}
          >
            <SelectTrigger className="rounded-xl border border-white/10 bg-black/20 px-3 py-6 text-sm text-text-main outline-none">
              <SelectValue placeholder="No dream" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border border-white/10 bg-surface-soft text-white">
              <SelectItem value="none">No dream</SelectItem>
              {dreams.map((dream) => (
                <SelectItem key={dream.id} value={dream.id}>
                  {dream.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={bulkProjectId || "none"}
            onValueChange={(value) => setBulkProjectId(value === "none" ? "" : value)}
          >
            <SelectTrigger className="rounded-xl border border-white/10 bg-black/20 px-3 py-6 text-sm text-text-main outline-none">
              <SelectValue placeholder="No project" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border border-white/10 bg-surface-soft text-white">
              <SelectItem value="none">No project</SelectItem>
              {availableProjects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            type="button"
            onClick={applyBulkAssignment}
            disabled={!selectedBulkIds.length || isUpdating}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-text-main transition hover:bg-black/30 disabled:opacity-50"
          >
            <FiArrowRight />
            {isUpdating ? "Applying..." : "Apply"}
          </button>
        </div>
      </div>

      {tasks.map((task) => (
        <div key={task.id} className="flex items-stretch gap-3">
          <button
            type="button"
            onClick={() => toggleTaskSelection(task.id)}
            className={`mt-4 h-5 w-5 shrink-0 rounded-md border transition ${
              selectedBulkIds.includes(task.id)
                ? "border-brand-primary bg-brand-primary"
                : "border-white/15 bg-black/20"
            }`}
            aria-label={`Select ${task.title}`}
          />
          <div className="min-w-0 flex-1">
            <TaskItem 
              task={task} 
              isSelected={selectedTaskId === task.id}
              onClick={() => onTaskSelect(task.id)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
