"use client";

import { useEffect, useMemo, useState } from "react";
import { useTasks } from "../../hooks/useTasks";
import { useDreams } from "../../hooks/useDreams";
import { useProjects } from "../../hooks/useProjects";
import TaskItem from "./TaskItem";
import { FiArrowRight, FiFlag, FiInbox, FiLayers, FiTarget } from "react-icons/fi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  deriveTaskReadiness,
  getTaskScheduleSnapshot,
  readTaskExecutionMetaMap,
  subscribeTaskMetaChange,
  writeTaskExecutionMetaMap,
} from "./taskIntelligence";
import type { ExecutionState, Priority, TaskStatus } from "../../types/task";

interface TaskListViewProps {
  activeFilter: string;
  groupBy: "smart" | "dream" | "priority" | "execution";
  selectedTaskId: string | null;
  onTaskSelect: (id: string | null) => void;
}

export default function TaskListView({
  activeFilter,
  groupBy,
  selectedTaskId,
  onTaskSelect,
}: TaskListViewProps) {
  const { tasks, isLoading, error, updateTaskAsync, isUpdating } = useTasks(activeFilter);
  const { dreams } = useDreams();
  const { projects } = useProjects();
  const [selectedBulkIds, setSelectedBulkIds] = useState<string[]>([]);
  const [bulkDreamId, setBulkDreamId] = useState("");
  const [bulkProjectId, setBulkProjectId] = useState("");
  const [bulkStatus, setBulkStatus] = useState<"" | TaskStatus>("");
  const [bulkPriority, setBulkPriority] = useState<"" | Priority>("");
  const [bulkExecutionState, setBulkExecutionState] = useState<
    "" | ExecutionState
  >("");
  const [metaVersion, setMetaVersion] = useState(0);

  useEffect(() => {
    const syncMeta = () => setMetaVersion((current) => current + 1);
    window.addEventListener("storage", syncMeta);
    window.addEventListener("focus", syncMeta);
    const unsubscribe = subscribeTaskMetaChange(syncMeta);
    return () => {
      window.removeEventListener("storage", syncMeta);
      window.removeEventListener("focus", syncMeta);
      unsubscribe();
    };
  }, []);

  const availableProjects = useMemo(
    () => projects.filter((project) => !bulkDreamId || project.dreamId === bulkDreamId),
    [bulkDreamId, projects],
  );
  const executionMetaMap = useMemo(() => readTaskExecutionMetaMap(), [metaVersion]);

  const groupedTasks = useMemo(() => {
    const groups = new Map<string, typeof tasks>();

    tasks.forEach((task) => {
      const readiness = deriveTaskReadiness(task, tasks, executionMetaMap[task.id]);
      const schedule = getTaskScheduleSnapshot(task);
      let groupLabel = "Execution Queue";

      if (groupBy === "dream") {
        groupLabel = task.dream?.title || "Unlinked to Dream";
      } else if (groupBy === "priority") {
        groupLabel =
          task.priority === "urgent"
            ? "Urgent"
            : task.priority === "high"
              ? "High Priority"
              : task.priority === "medium"
                ? "Medium Priority"
                : "Low Priority";
      } else if (groupBy === "execution") {
        groupLabel = readiness.readinessLabel;
      } else {
        groupLabel =
          readiness.executionState === "blocked"
            ? "Blocked"
            : task.status === "in_progress"
              ? "In Motion"
              : schedule.bucket === "carryover"
                ? "Carryover Recovery"
                : schedule.bucket === "today"
                  ? "Today Commitments"
                  : schedule.bucket === "upcoming"
                    ? "Scheduled Ahead"
                    : readiness.executionState === "ready"
                      ? "Ready to Execute"
                      : "Queued";
      }

      groups.set(groupLabel, [...(groups.get(groupLabel) || []), task]);
    });

    return Array.from(groups.entries());
  }, [executionMetaMap, groupBy, tasks]);

  const toggleTaskSelection = (taskId: string) => {
    setSelectedBulkIds((current) =>
      current.includes(taskId)
        ? current.filter((id) => id !== taskId)
        : [...current, taskId],
    );
  };

  const applyBulkAssignment = async () => {
    if (!selectedBulkIds.length) return;

    const currentMetaMap = readTaskExecutionMetaMap();

    await Promise.all(
      selectedBulkIds.map((id) =>
        updateTaskAsync({
          id,
          updates: {
            dreamId: bulkDreamId || null,
            projectId: bulkProjectId || null,
            ...(bulkStatus ? { status: bulkStatus } : {}),
            ...(bulkPriority ? { priority: bulkPriority } : {}),
          },
        }),
      ),
    );

    if (bulkExecutionState) {
      selectedBulkIds.forEach((id) => {
        const existing = currentMetaMap[id];
        currentMetaMap[id] = {
          taskId: id,
          executionState: bulkExecutionState,
          blockerReason: existing?.blockerReason || null,
          dependencyTaskIds: existing?.dependencyTaskIds || [],
          requireReferenceNote: existing?.requireReferenceNote || false,
          focusMinutesTarget: existing?.focusMinutesTarget || 30,
          updatedAt: new Date().toISOString(),
        };
      });
      writeTaskExecutionMetaMap(currentMetaMap);
      setMetaVersion((current) => current + 1);
    }

    setSelectedBulkIds([]);
    setBulkDreamId("");
    setBulkProjectId("");
    setBulkStatus("");
    setBulkPriority("");
    setBulkExecutionState("");
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
        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-[1fr_1fr_0.9fr_0.9fr_0.9fr_auto]">
          <Select
            value={bulkDreamId || "none"}
            onValueChange={(value) => {
              setBulkDreamId(value === "none" ? "" : value);
              setBulkProjectId("");
            }}
          >
            <SelectTrigger className="rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-xs text-text-main outline-none">
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
            <SelectTrigger className="rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-xs text-text-main outline-none">
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

          <Select
            value={bulkStatus || "none"}
            onValueChange={(value) => setBulkStatus(value === "none" ? "" : (value as TaskStatus))}
          >
            <SelectTrigger className="rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-xs text-text-main outline-none">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border border-white/10 bg-surface-soft text-white">
              <SelectItem value="none">Keep status</SelectItem>
              <SelectItem value="todo">Todo</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="done">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={bulkPriority || "none"}
            onValueChange={(value) => setBulkPriority(value === "none" ? "" : (value as Priority))}
          >
            <SelectTrigger className="rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-xs text-text-main outline-none">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border border-white/10 bg-surface-soft text-white">
              <SelectItem value="none">Keep priority</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={bulkExecutionState || "none"}
            onValueChange={(value) =>
              setBulkExecutionState(value === "none" ? "" : (value as ExecutionState))
            }
          >
            <SelectTrigger className="rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-xs text-text-main outline-none">
              <SelectValue placeholder="Execution state" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border border-white/10 bg-surface-soft text-white">
              <SelectItem value="none">Keep execution state</SelectItem>
              <SelectItem value="queued">Queued</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="waiting">Waiting</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <button
            type="button"
            onClick={applyBulkAssignment}
            disabled={!selectedBulkIds.length || isUpdating}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-[9px] font-black uppercase tracking-[0.18em] text-text-main transition hover:bg-black/30 disabled:opacity-50"
          >
            <FiArrowRight />
            {isUpdating ? "Applying..." : "Apply"}
          </button>
        </div>
      </div>

      {groupedTasks.map(([groupTitle, groupTasks]) => (
        <section key={groupTitle} className="space-y-3">
          <div className="flex items-center gap-3 px-1 sm:px-0">
            <div className="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.18em] text-text-main">
              {groupBy === "execution" ? <FiTarget className="inline mr-1" size={8} /> : null}
              {groupBy === "smart" ? <FiLayers className="inline mr-1" size={8} /> : null}
              {groupBy === "priority" ? <FiFlag className="inline mr-1" size={8} /> : null}
              {groupTitle}
            </div>
            <span className="text-[8px] font-black uppercase tracking-[0.18em] text-text-muted">
              {groupTasks.length} items
            </span>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          {groupTasks.map((task) => (
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
                  allTasks={tasks}
                  isSelected={selectedTaskId === task.id}
                  onClick={() => onTaskSelect(task.id)}
                />
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
