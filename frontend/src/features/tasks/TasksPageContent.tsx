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
  getTodayFocusMinutesForTasks,
  readTaskExecutionMetaMap,
} from "./taskIntelligence";

const filters = [
  { id: "all", label: "All Tasks", icon: FiList },
  { id: "today", label: "Today", icon: FiClock },
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
  const { logs } = useLedger();
  const [metaVersion, setMetaVersion] = useState(0);

  useEffect(() => {
    const syncMeta = () => setMetaVersion((current) => current + 1);
    window.addEventListener("storage", syncMeta);
    window.addEventListener("focus", syncMeta);
    return () => {
      window.removeEventListener("storage", syncMeta);
      window.removeEventListener("focus", syncMeta);
    };
  }, []);

  useEffect(() => {
    const taskId = searchParams.get("task");
    if (taskId) {
      setSelectedTaskId(taskId);
    }
  }, [searchParams, setSelectedTaskId]);

  const executionMetaMap = useMemo(() => readTaskExecutionMetaMap(), [metaVersion]);
  const blockedCount = tasks.filter((task) =>
    deriveTaskReadiness(task, tasks, executionMetaMap[task.id]).executionState ===
    "blocked",
  ).length;
  const inProgressCount = tasks.filter((task) => task.status === "in_progress").length;
  const dueTodayCount = tasks.filter((task) => {
    if (!task.dueDate || task.status === "done") return false;
    const due = new Date(task.dueDate).toISOString().slice(0, 10);
    return due === new Date().toISOString().slice(0, 10);
  }).length;
  const overdueCount = tasks.filter((task) => {
    if (!task.dueDate || task.status === "done") return false;
    return new Date(task.dueDate) < new Date();
  }).length;
  const completedTodayCount = logs.filter((log) => {
    if (!log.taskId) return false;
    return log.completedAt.slice(0, 10) === new Date().toISOString().slice(0, 10);
  }).length;
  const focusMinutesToday = getTodayFocusMinutesForTasks(tasks);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-surface-base relative">
      {/* Top Filter Tabs - Ledger Style */}
      <div className="w-full bg-surface-soft border-b border-white/5 px-4 sm:px-8 py-4 shrink-0 overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-2 min-w-max">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  filter === f.id
                    ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
                    : "text-text-muted hover:text-text-main hover:bg-white/5"
                }`}
              >
                <f.icon className={filter === f.id ? "text-white" : f.color || ""} size={14} />
                {f.label}
              </button>
            ))}
          </div>
          
          <div className="h-6 w-px bg-white/10 mx-2" />
          
          <div className="flex items-center gap-2 bg-amber-400/10 px-3 py-2 rounded-xl border border-amber-400/20">
            <FiZap className="text-amber-400" size={12} />
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">AI Optimized</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Main Engine: Execution Layer */}
        <div className={`flex-1 flex flex-col relative ${selectedTaskId ? "hidden lg:flex" : "flex"}`}>
          <div className="px-4 py-4 sm:px-8 sm:py-6 border-b border-white/5 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <TaskOverviewCard
                label="Due Today"
                value={String(dueTodayCount)}
                detail="Tasks needing attention now"
                icon={<FiClock size={14} />}
              />
              <TaskOverviewCard
                label="Overdue"
                value={String(overdueCount)}
                detail="Past due and still open"
                icon={<FiAlertCircle size={14} />}
                tone="danger"
              />
              <TaskOverviewCard
                label="In Progress"
                value={String(inProgressCount)}
                detail="Objectives already in motion"
                icon={<FiTrendingUp size={14} />}
                tone="warm"
              />
              <TaskOverviewCard
                label="Blocked"
                value={String(blockedCount)}
                detail="Waiting on context or dependency"
                icon={<FiTarget size={14} />}
                tone="danger"
              />
              <TaskOverviewCard
                label="Focus Today"
                value={`${focusMinutesToday}m`}
                detail={`${completedTodayCount} ledger completions today`}
                icon={<FiZap size={14} />}
                tone="brand"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-1">
                {[
                  { id: "smart", label: "Smart" },
                  { id: "dream", label: "By Dream" },
                  { id: "priority", label: "By Priority" },
                  { id: "execution", label: "Execution" },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      setGroupBy(option.id as "smart" | "dream" | "priority" | "execution")
                    }
                    className={`rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition ${
                      groupBy === option.id
                        ? "bg-brand-primary text-white"
                        : "text-text-muted hover:text-text-main"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-text-main">
                <FiLayers size={12} className="text-brand-primary" />
                Grouped execution view
              </div>
            </div>
            <TaskQuickAdd />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-8 py-2">
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
  detail,
  icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  detail: string;
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
    <div className="rounded-3xl border border-white/10 bg-surface-soft/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
            {label}
          </p>
          <p className="mt-2 text-2xl font-black text-white">{value}</p>
        </div>
        <div className={`rounded-2xl border px-3 py-3 ${toneClass}`}>{icon}</div>
      </div>
      <p className="mt-3 text-xs leading-5 text-text-muted">{detail}</p>
    </div>
  );
}
