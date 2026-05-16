"use client";

import { useEffect, useMemo, useState } from "react";
import { useTasks } from "../../hooks/useTasks";
import { useDreams } from "../../hooks/useDreams";
import { useProjects } from "../../hooks/useProjects";
import TaskItem from "./TaskItem";
import { FiArrowRight, FiFlag, FiInbox, FiLayers, FiTarget, FiX, FiCheckCircle } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
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
              ? "In Progress"
              : schedule.bucket === "carryover"
                ? "Carryover"
                : schedule.bucket === "today"
                  ? "Today"
                  : schedule.bucket === "upcoming"
                    ? "Upcoming"
                    : readiness.executionState === "ready"
                      ? "Ready"
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
      <div className="flex-1 p-6 space-y-4 max-w-4xl w-full">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 w-full bg-surface-mutes/50 animate-pulse rounded-2xl border border-border" />
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
      <div className="flex-1 flex flex-col items-center justify-center text-text-muted p-12 text-center">
        <div className="w-24 h-24 rounded-[2rem] bg-surface-soft border border-border flex items-center justify-center mb-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <FiInbox size={40} className="opacity-20 text-brand-primary" />
        </div>
        <h3 className="text-xl font-black text-text-main mb-2 tracking-tight">Clear Horizon</h3>
        <p className="text-sm opacity-50 max-w-[200px] leading-relaxed">
          No tasks found in this perspective. Ready for a new objective?
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-6 w-full pb-32 min-w-0 overflow-hidden">
      {groupedTasks.map(([groupTitle, groupTasks]) => (
        <section key={groupTitle} className="space-y-3 min-w-0">
          <div className="flex items-center gap-3 px-1">
            <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface-mutes/50 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-[0.18em] text-text-main backdrop-blur-md">
              {groupBy === "execution" && <FiTarget className="text-brand-primary" size={8} />}
              {groupBy === "smart" && <FiLayers className="text-brand-primary" size={8} />}
              {groupBy === "priority" && <FiFlag className="text-brand-primary" size={8} />}
              {groupTitle}
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
          </div>

          <div className="flex flex-col gap-2 min-w-0">
            {groupTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-2 min-w-0 w-full group">
                <button
                  type="button"
                  onClick={() => toggleTaskSelection(task.id)}
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-all duration-300 active:scale-90 ${
                    selectedBulkIds.includes(task.id)
                      ? "border-brand-primary bg-brand-primary text-black"
                      : "border-border bg-surface-mutes/20 hover:border-white/20"
                  }`}
                >
                  {selectedBulkIds.includes(task.id) && <FiCheckCircle size={10} />}
                </button>
                
                <div className="flex-1 min-w-0 overflow-hidden">
                  <TaskItem
                    task={task}
                    allTasks={tasks}
                    isSelected={selectedTaskId === task.id}
                    onClick={() => onTaskSelect(task.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Floating Bulk Action Bar */}
      <AnimatePresence>
        {selectedBulkIds.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-4 right-4 z-[100] md:left-auto md:right-8 md:w-[480px]"
          >
            <div className="overflow-hidden rounded-3xl border border-border bg-surface-base/90 p-4 shadow-2xl backdrop-blur-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary text-black">
                    <FiLayers size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-text-main uppercase tracking-tight">Bulk Shift</h3>
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
                      {selectedBulkIds.length} Objectives Selected
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedBulkIds([])}
                  className="text-text-muted hover:text-text-main transition-colors"
                >
                   <FiX size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-text-muted ml-1">Dream</label>
                  <Select
                    value={bulkDreamId || "none"}
                    onValueChange={(value) => {
                      setBulkDreamId(value === "none" ? "" : value);
                      setBulkProjectId("");
                    }}
                  >
                    <SelectTrigger className="w-full rounded-xl border border-border bg-surface-mutes/50 px-3 py-4 text-[10px] font-bold text-text-main outline-none">
                      <SelectValue placeholder="Dream" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border border-border bg-surface-soft text-text-main">
                      <SelectItem value="none">Unlinked</SelectItem>
                      {dreams.map((dream) => (
                        <SelectItem key={dream.id} value={dream.id}>{dream.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-text-muted ml-1">Project</label>
                  <Select
                    value={bulkProjectId || "none"}
                    onValueChange={(value) => setBulkProjectId(value === "none" ? "" : value)}
                  >
                    <SelectTrigger className="w-full rounded-xl border border-border bg-surface-mutes/50 px-3 py-4 text-[10px] font-bold text-text-main outline-none">
                      <SelectValue placeholder="Project" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border border-border bg-surface-soft text-text-main">
                      <SelectItem value="none">Unlinked</SelectItem>
                      {availableProjects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>{project.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Select
                  value={bulkStatus || "none"}
                  onValueChange={(value) => setBulkStatus(value === "none" ? "" : (value as TaskStatus))}
                >
                  <SelectTrigger className="rounded-xl border border-border bg-surface-mutes/50 px-3 py-3 text-[10px] font-bold text-text-main">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-soft border-border text-text-main">
                    <SelectItem value="none">No Change</SelectItem>
                    <SelectItem value="todo">Todo</SelectItem>
                    <SelectItem value="in_progress">In progress</SelectItem>
                    <SelectItem value="done">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={bulkPriority || "none"}
                  onValueChange={(value) => setBulkPriority(value === "none" ? "" : (value as Priority))}
                >
                  <SelectTrigger className="rounded-xl border border-border bg-surface-mutes/50 px-3 py-3 text-[10px] font-bold text-text-main">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-soft border-border text-text-main">
                    <SelectItem value="none">No Change</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>

                <button
                  type="button"
                  onClick={applyBulkAssignment}
                  disabled={isUpdating}
                  className="flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-3 text-[10px] font-black uppercase tracking-widest text-black transition hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  {isUpdating ? "..." : "Execute"}
                  {!isUpdating && <FiArrowRight />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
