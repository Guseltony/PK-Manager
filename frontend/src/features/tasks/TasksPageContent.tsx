"use client";

import { useTasksStore } from "@/src/store/tasksStore";
import { ReactNode, useEffect, useMemo, useState } from "react";
import TaskListView from "./TaskListView";
import TaskDetailView from "./TaskDetailView";
import TaskQuickAdd from "./TaskQuickAdd";
import { useTasks } from "../../hooks/useTasks";
import { useLedger } from "../../hooks/useLedger";
import { 
  FiClock, 
  FiCalendar, 
  FiCornerDownRight,
  FiAlertCircle, 
  FiCheckCircle, 
  FiZap, 
  FiStar,
  FiList,
  FiLayers,
  FiTarget,
  FiTrendingUp,
} from "react-icons/fi";
import { useSearchParams } from "next/navigation";
import {
  deriveTaskReadiness,
  getTaskScheduleSnapshot,
  getTodayFocusMinutesForTasks,
  readTaskExecutionMetaMap,
  subscribeTaskMetaChange,
} from "./taskIntelligence";

const filters = [
  { id: "all", label: "All Tasks", icon: FiList },
  { id: "today", label: "Today", icon: FiClock },
  { id: "carryover", label: "Carryover", icon: FiCornerDownRight, color: "text-amber-300" },
  { id: "upcoming", label: "Upcoming", icon: FiCalendar },
  { id: "overdue", label: "Overdue", icon: FiAlertCircle, color: "text-brand-accent" },
  { id: "completed", label: "Completed", icon: FiCheckCircle },
  { id: "focus", label: "Focus", icon: FiZap, color: "text-amber-400" },
  { id: "high-priority", label: "Priority", icon: FiStar, color: "text-brand-primary" },
];

export default function TasksPageContent() {
  const { selectedTaskId, setSelectedTaskId } = useTasksStore();
  const [filter, setFilter] = useState("all");
  const [groupBy, setGroupBy] = useState<"smart" | "dream" | "priority" | "execution">("smart");
  const searchParams = useSearchParams();
  const { tasks } = useTasks(filter);
  const { tasks: allTasks } = useTasks("all");
  const { logs } = useLedger();
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

  useEffect(() => {
    const taskId = searchParams.get("task");
    if (taskId) {
      setSelectedTaskId(taskId);
    }
  }, [searchParams, setSelectedTaskId]);

  const executionMetaMap = useMemo(() => readTaskExecutionMetaMap(), [metaVersion]);
  const blockedCount = allTasks.filter((task) =>
    deriveTaskReadiness(task, allTasks, executionMetaMap[task.id]).executionState ===
    "blocked",
  ).length;
  const inProgressCount = allTasks.filter((task) => task.status === "in_progress").length;
  const dueTodayCount = allTasks.filter(
    (task) => getTaskScheduleSnapshot(task).bucket === "today",
  ).length;
  const carryoverCount = allTasks.filter(
    (task) => getTaskScheduleSnapshot(task).bucket === "carryover",
  ).length;
  const overdueCount = allTasks.filter(
    (task) => getTaskScheduleSnapshot(task).bucket === "overdue",
  ).length;
  const completedTodayCount = logs.filter((log) => {
    if (!log.taskId) return false;
    return log.completedAt.slice(0, 10) === new Date().toISOString().slice(0, 10);
  }).length;
  const focusMinutesToday = getTodayFocusMinutesForTasks(allTasks);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-surface-base relative">
      {/* Top Filter Tabs - Ledger Style */}
      <div className="w-full bg-surface-soft border-b border-white/5 px-4 md:px-8 py-2 shrink-0 overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-2 min-w-max">
          <div className="flex bg-white/5 p-1 rounded-lg border border-white/5">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[9px] font-bold transition-all ${
                  filter === f.id
                    ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
                    : "text-text-muted hover:text-text-main hover:bg-white/5"
                }`}
              >
                <f.icon className={filter === f.id ? "text-white" : f.color || ""} size={12} />
                {f.label}
              </button>
            ))}
          </div>
          
          <div className="h-5 w-px bg-white/10 mx-1" />
          
          <div className="flex items-center gap-1.5 bg-amber-400/10 px-2 py-1.5 rounded-lg border border-amber-400/20">
            <FiZap className="text-amber-400" size={10} />
            <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">AI</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Main Engine: Execution Layer */}
        <div className={`flex-1 flex flex-col relative ${selectedTaskId ? "hidden md:flex" : "flex"}`}>
          <div className="px-3 py-2 md:px-8 md:py-3 border-b border-white/5 space-y-1 md:space-y-2">
            <div className="grid gap-1 grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 md:gap-2">
              <TaskOverviewCard
                label="Today"
                value={String(dueTodayCount)}
                icon={<FiClock size={10} className="md:size-3" />}
              />
              <TaskOverviewCard
                label="Carryover"
                value={String(carryoverCount)}
                icon={<FiCornerDownRight size={10} className="md:size-3" />}
                tone="warm"
              />
              <TaskOverviewCard
                label="Overdue"
                value={String(overdueCount)}
                icon={<FiAlertCircle size={10} className="md:size-3" />}
                tone="danger"
              />
              <TaskOverviewCard
                label="In Motion"
                value={String(inProgressCount)}
                icon={<FiTrendingUp size={10} className="md:size-3" />}
                tone="warm"
              />
              <TaskOverviewCard
                label="Blocked"
                value={String(blockedCount)}
                icon={<FiTarget size={10} className="md:size-3" />}
                tone="danger"
              />
              <TaskOverviewCard
                label="Focus"
                value={`${focusMinutesToday}m`}
                icon={<FiZap size={10} className="md:size-3" />}
                tone="brand"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-0.5 md:gap-1 rounded-xl border border-white/10 bg-white/5 p-0.5 overflow-x-auto custom-scrollbar max-w-[calc(100%-80px)] md:max-w-none">
                {[
                  { id: "smart", label: "Smart" },
                  { id: "dream", label: "Dream" },
                  { id: "priority", label: "Priority" },
                  { id: "execution", label: "Execution" },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      setGroupBy(option.id as "smart" | "dream" | "priority" | "execution")
                    }
                    className={`rounded-lg px-2 py-1 md:px-2.5 text-[7px] md:text-[8px] font-black uppercase tracking-[0.1em] md:tracking-[0.18em] transition whitespace-nowrap ${
                      groupBy === option.id
                        ? "bg-brand-primary text-white"
                        : "text-text-muted hover:text-text-main"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div className="inline-flex items-center gap-1 md:gap-1.5 rounded-xl border border-white/10 bg-black/20 px-1.5 md:px-2.5 py-1 text-[7px] md:text-[8px] font-black uppercase tracking-[0.1em] md:tracking-[0.18em] text-text-main shrink-0">
                <FiLayers size={10} className="text-brand-primary" />
                <span className="hidden md:inline">Execution view</span>
                <span className="md:hidden">Exec</span>
              </div>
            </div>
            <TaskQuickAdd />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-8 py-2">
            <TaskListView
              activeFilter={filter}
              groupBy={groupBy}
              selectedTaskId={selectedTaskId}
              onTaskSelect={setSelectedTaskId}
            />
          </div>
        </div>

        {/* Right Layer: Deep Context & Analytics */}
        {selectedTaskId && (
          <TaskDetailView
            taskId={selectedTaskId}
            onClose={() => setSelectedTaskId(null)}
          />
        )}
      </div>
    </div>
  );
}

function TaskOverviewCard({
  label,
  value,
  icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  icon: ReactNode;
  tone?: "neutral" | "brand" | "danger" | "warm";
}) {
  const toneClass =
    tone === "brand"
      ? "border-brand-primary/20 bg-brand-primary/10 text-brand-primary"
      : tone === "danger"
        ? "border-rose-400/20 bg-rose-400/10 text-rose-300"
        : tone === "warm"
          ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
          : "border-white/10 bg-white/5 text-text-main";

  return (
    <div className="rounded-2xl border border-white/5 bg-surface-soft/70 px-2 py-1.5 md:px-3 md:py-2">
      <div className="flex items-center justify-between gap-1.5 md:gap-2">
        <div>
          <p className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.1em] text-text-muted whitespace-nowrap">
            {label}
          </p>
          <p className="text-sm md:text-base font-black text-white">{value}</p>
        </div>
        <div className={`rounded-xl border p-1 md:p-1.5 ${toneClass}`}>{icon}</div>
      </div>
    </div>
  );
}
