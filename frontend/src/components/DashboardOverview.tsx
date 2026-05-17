"use client";

import { motion } from "framer-motion";
import {
  FiFileText,
  FiCheckSquare,
  FiTarget,
  FiClock,
  FiPlus,
  FiChevronRight,
  FiBookOpen,
  FiActivity,
  FiCheck,
  FiZap,
  FiTrendingUp,
  FiShare2,
  FiCompass,
  FiCpu,
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import NextLink from "next/link";
import { IconType } from "react-icons";
import { useNotes } from "../hooks/useNotes";
import { useTasks } from "../hooks/useTasks";
import { useDreams } from "../hooks/useDreams";
import { useJournal } from "../hooks/useJournal";
import { useDashboardSummary } from "../hooks/useAI";
import { useTagsStore } from "../store/tagsStore";
import { useInbox } from "../hooks/useInbox";
import { useUser } from "../hooks/useUser";
import GlobalTagFilter from "./GlobalTagFilter";
import { Task } from "../types/task";
import { Note } from "../types/note";
import { Dream } from "../types/dream";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

function NeonProgressRing({ progress, size = 60, strokeWidth = 6, color = "#10b981" }: { progress: number; size?: number; strokeWidth?: number; color?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--border)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <defs>
          <filter id={`neon-glow-${color.replace("#", "")}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
          filter={`url(#neon-glow-${color.replace("#", "")})`}
        />
      </svg>
      <div className="absolute font-display font-bold text-xs tabular-nums" style={{ color }}>
        {progress}%
      </div>
    </div>
  );
}

function KnowledgeHeatmap({ notes }: { notes: Note[] }) {
  const today = dayjs().startOf("day");
  const days = Array.from({ length: 28 }, (_, i) => today.subtract(27 - i, "day"));
  
  const counts = days.map(day => {
    return notes.filter(n => dayjs(n.updatedAt).isSame(day, "day")).length;
  });

  const maxCount = Math.max(...counts, 1);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2">
        <FiTrendingUp className="text-brand-primary" /> 28-Day Knowledge Heatmap
      </p>
      <div className="grid grid-cols-7 gap-2 bg-surface-base/50 p-4 rounded-2xl border border-border/50">
        {days.map((day, i) => {
          const count = counts[i];
          const intensity = count === 0 ? "bg-surface-base border-border/50" : count / maxCount > 0.5 ? "bg-brand-primary border-brand-primary/50 shadow-[0_0_12px_rgba(99,102,241,0.5)] text-white" : "bg-brand-primary/40 border-brand-primary/30 text-white";
          return (
            <div
              key={day.format("YYYY-MM-DD")}
              className={`h-8 rounded-lg border flex items-center justify-center text-[10px] font-bold transition-all hover:scale-110 cursor-pointer ${intensity}`}
              title={`${day.format("MMM D")}: ${count} notes`}
            >
              {count > 0 ? count : ""}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MiniConnectionGraph({ notes }: { notes: Note[] }) {
  const recent = notes.slice(0, 5);
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2">
        <FiShare2 className="text-brand-secondary" /> Second Brain Graph Preview
      </p>
      <div className="h-40 bg-surface-base/50 rounded-2xl border border-border/50 p-4 relative overflow-hidden flex items-center justify-center">
        <div className="absolute w-12 h-12 rounded-full bg-brand-primary/20 border border-brand-primary/40 flex items-center justify-center text-brand-primary font-bold text-xs shadow-[0_0_15px_rgba(99,102,241,0.3)] z-10 animate-pulse">
          CORE
        </div>
        {recent.map((note, i) => {
          const angle = (i / recent.length) * 2 * Math.PI;
          const radius = 55;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          return (
            <motion.div
              key={note.id}
              className="absolute w-10 h-10 rounded-full bg-surface-soft border border-border flex items-center justify-center text-[9px] text-text-main font-medium p-1 text-center shadow-lg hover:border-brand-secondary hover:scale-125 transition-all cursor-pointer z-20"
              style={{ x, y }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              title={note.title || "Untitled"}
            >
              <span className="truncate w-8">{note.title || "Note"}</span>
            </motion.div>
          );
        })}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {recent.map((_, i) => {
            const angle = (i / recent.length) * 2 * Math.PI;
            const radius = 55;
            const x = 160 + Math.cos(angle) * radius;
            const y = 80 + Math.sin(angle) * radius;
            return (
              <line
                key={`line-${i}`}
                x1="50%"
                y1="50%"
                x2={x}
                y2={y}
                stroke="var(--border)"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}

interface DashboardStatProps {
  icon: IconType;
  label: string;
  value: string | number;
  trend?: string;
  color: string;
  bg: string;
  href: string;
  sparkline: number[];
  warning?: boolean;
}

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  color,
  bg,
  href,
  sparkline,
  warning,
}: DashboardStatProps) {
  return (
    <NextLink
      href={href}
      className={`block bg-surface-base/40 backdrop-blur-md border rounded-2xl p-4 md:p-5 transition-all group relative overflow-hidden hover:border-brand-primary/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] hover:-translate-y-1 ${
        warning ? "border-amber-400/30 bg-amber-400/5" : "border-border"
      }`}
    >
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div
          className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl ${bg} flex items-center justify-center shadow-inner`}
        >
          <Icon className={`text-lg md:text-xl ${color}`} />
        </div>
        {trend && (
          <span className="text-[10px] md:text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full shadow-sm">
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-text-muted text-xs font-semibold mb-1 uppercase tracking-wider">{label}</p>
        <h3 className="text-2xl md:text-3xl font-black text-text-main tabular-nums font-display">{value}</h3>
      </div>
      <div className="mt-4 flex items-end gap-1 opacity-80 h-8">
        {sparkline.map((point, index) => (
          <span
            key={`${label}-spark-${index}`}
            className={`block w-1.5 rounded-full transition-all duration-300 ${warning ? "bg-amber-400/60 group-hover:bg-amber-400" : "bg-surface-soft group-hover:bg-brand-primary/60"}`}
            style={{ height: `${Math.max(8, point * 8)}px` }}
          />
        ))}
      </div>
    </NextLink>
  );
}

export default function DashboardOverview() {
  const { notes, isLoading: loadingNotes } = useNotes();
  const { tasks, isLoading: loadingTasks, updateTaskAsync } = useTasks();
  const { dreams, isLoading: loadingDreams } = useDreams();
  const { entry: todayEntry } = useJournal(new Date());
  const { data: dashboardSummary } = useDashboardSummary();
  const { globalTagFilter } = useTagsStore();
  const { queue } = useInbox();
  const { data: user } = useUser();

  const today = dayjs().startOf("day");

  const hour = dayjs().hour();
  let timeOfDay = "evening";
  let contextualFocus = "Evening Spotlight: Focuses on Journaling and Reflection.";
  if (hour >= 5 && hour < 12) {
    timeOfDay = "morning";
    contextualFocus = "Morning Spotlight: Focuses on Tasks and Schedule.";
  } else if (hour >= 12 && hour < 18) {
    timeOfDay = "afternoon";
    contextualFocus = "Afternoon Spotlight: Focuses on Inbox and Note Processing.";
  }

  // Filtering Logic
  const filteredTasks = (tasks as Task[]).filter(
    (t: Task) =>
      !globalTagFilter ||
      (t.tags && t.tags.some(({ tag }) => tag.name === globalTagFilter)),
  );

  const filteredNotes = (notes as Note[]).filter(
    (n: Note) =>
      !globalTagFilter ||
      (n.tags && n.tags.some(({ tag }) => tag.name === globalTagFilter)),
  );

  const filteredDreams = (dreams as Dream[]).filter(
    (d: Dream) =>
      !globalTagFilter ||
      (d.tags && d.tags.some(({ tag }) => tag.name === globalTagFilter)),
  );

  const todayTasks = filteredTasks.filter((t) => {
    if (t.status === "done") return false;
    if (!t.dueDate) return false;
    return dayjs(t.dueDate).isSame(today, "day");
  });

  const activeDreams = filteredDreams.filter(
    (d) => d.milestones && d.milestones.some((m) => !m.completed),
  );

  const recentNotes = [...filteredNotes]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 4);

  const completedToday = filteredTasks.filter(
    (t) =>
      t.status === "done" && t.dueDate && dayjs(t.dueDate).isSame(today, "day"),
  ).length;

  const buildDailySparkline = (
    entries: string[],
    formatter?: (isoDate: string) => string,
  ) =>
    Array.from({ length: 7 }, (_, offset) => {
      const day = today.subtract(6 - offset, "day");
      return entries.filter((value) =>
        dayjs(formatter ? formatter(value) : value).isSame(day, "day"),
      ).length;
    });

  const noteSparkline = buildDailySparkline(
    filteredNotes.map((note) => note.updatedAt),
  );
  const taskSparkline = Array.from({ length: 7 }, (_, offset) => {
    const day = today.subtract(6 - offset, "day");
    return filteredTasks.filter(
      (task) => task.dueDate && dayjs(task.dueDate).isSame(day, "day"),
    ).length;
  });
  const dreamSparkline = buildDailySparkline(
    filteredDreams.map((dream) => dream.updatedAt),
  );
  const inboxSignalCount = queue.filter(
    (item) => item.status === "queued" || item.status === "failed",
  ).length;
  const spotlightTasks = [...filteredTasks]
    .filter((task) => task.status !== "done")
    .sort((left, right) => {
      const priorityRank = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityRank[left.priority] - priorityRank[right.priority];
    })
    .slice(0, 3);
  const activityFeed = [
    ...filteredTasks.slice(0, 3).map((task) => ({
      id: `task-${task.id}`,
      label: task.title,
      meta: `Task ${task.status.replace("_", " ")}`,
      href: "/tasks",
      createdAt: task.updatedAt,
      icon: FiCheckSquare,
      color: "text-brand-secondary",
    })),
    ...filteredNotes.slice(0, 2).map((note) => ({
      id: `note-${note.id}`,
      label: note.title || "Untitled note",
      meta: "Note updated",
      href: `/notes?note=${note.id}`,
      createdAt: note.updatedAt,
      icon: FiFileText,
      color: "text-brand-primary",
    })),
    ...filteredDreams.slice(0, 2).map((dream) => ({
      id: `dream-${dream.id}`,
      label: dream.title,
      meta: "Dream active",
      href: `/dreams/${dream.id}`,
      createdAt: dream.updatedAt,
      icon: FiTarget,
      color: "text-emerald-400",
    })),
  ]
    .sort((left, right) => dayjs(right.createdAt).valueOf() - dayjs(left.createdAt).valueOf())
    .slice(0, 6);

  const stats = [
    {
      icon: FiFileText,
      label: "Total Notes",
      value: loadingNotes ? "..." : filteredNotes.length,
      trend: recentNotes.length > 0 ? `${recentNotes.length} recent` : undefined,
      color: "text-brand-primary",
      bg: "bg-brand-primary/10",
      href: "/notes",
      sparkline: noteSparkline,
    },
    {
      icon: FiCheckSquare,
      label: "Tasks Due Today",
      value: loadingTasks ? "..." : todayTasks.length,
      trend: completedToday > 0 ? `${completedToday} done` : undefined,
      color: "text-brand-secondary",
      bg: "bg-brand-secondary/10",
      href: "/tasks",
      sparkline: taskSparkline,
    },
    {
      icon: FiTarget,
      label: "Active Goals",
      value: loadingDreams ? "..." : activeDreams.length,
      trend: activeDreams.length > 0 ? "In progress" : undefined,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      href: "/dreams",
      sparkline: dreamSparkline,
    },
    {
      icon: FiClock,
      label: "Inbox Signal",
      value: inboxSignalCount,
      trend: inboxSignalCount >= 10 ? "Needs routing" : inboxSignalCount > 0 ? "In motion" : "Clear",
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      href: "/inbox",
      sparkline: Array.from({ length: 7 }, (_, offset) => (offset === 6 ? Math.max(1, inboxSignalCount) : 0)),
      warning: inboxSignalCount >= 10,
    },
  ];

  return (
    <div className="relative min-h-full bg-surface-base text-text-main overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8">
      {/* Dynamic Mesh Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-brand-secondary/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />

      <div className="relative max-w-7xl mx-auto flex flex-col gap-6 lg:gap-8">
        {/* Global Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-soft/40 border border-border p-4 rounded-2xl backdrop-blur-xl shadow-lg"
        >
          <GlobalTagFilter />
        </motion.div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          
          {/* Welcome / Greeting (2x1) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="md:col-span-2 lg:col-span-2 bg-surface-soft/60 backdrop-blur-xl border border-border rounded-3xl p-6 lg:p-8 relative overflow-hidden group hover:border-brand-primary/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] transition-all duration-500 flex flex-col justify-between"
          >
            <div className="absolute -right-20 -top-20 w-60 h-60 bg-brand-primary/20 rounded-full blur-3xl group-hover:bg-brand-primary/30 transition-all duration-500 pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-brand-secondary/20 rounded-full blur-3xl group-hover:bg-brand-secondary/30 transition-all duration-500 pointer-events-none" />
            
            <div className="relative z-10">
              <p className="text-brand-primary uppercase tracking-[0.2em] font-bold text-xs mb-2 flex items-center gap-2">
                <FiCompass className="animate-spin" style={{ animationDuration: '10s' }} /> {dayjs().format("dddd, MMMM D")}
              </p>
              <h1 className="text-3xl lg:text-4xl font-display font-black text-text-main tracking-tight">
                Good {timeOfDay}, {user?.name?.split(" ")[0] || "Anthony"}.
              </h1>
              <p className="text-text-muted mt-2 text-sm md:text-base leading-relaxed border-l-2 border-brand-primary/50 pl-3 py-0.5 my-4 bg-brand-primary/5 rounded-r-lg">
                {contextualFocus}
              </p>
            </div>

            <div className="relative z-10 flex flex-wrap gap-3 pt-4 border-t border-border">
              <NextLink href="/journal" className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-brand-primary/25 transition-all active:scale-[0.98] text-sm">
                <FiBookOpen /> Write Journal
              </NextLink>
              <NextLink href="/tasks" className="flex items-center gap-2 bg-surface-mutes/80 hover:bg-surface-soft border border-border text-text-main font-bold px-5 py-2.5 rounded-xl transition-all active:scale-[0.98] text-sm">
                <FiPlus strokeWidth={3} /> New Task
              </NextLink>
            </div>
          </motion.div>

          {/* AI Insight (Orb) (1x1) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-surface-soft/60 backdrop-blur-xl border border-border rounded-3xl p-6 flex flex-col items-center justify-center relative group hover:border-brand-secondary/50 hover:shadow-[0_0_30px_rgba(14,165,233,0.15)] transition-all duration-500 text-center"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-secondary mb-4 flex items-center gap-1.5">
              <FiCpu className="animate-pulse" /> AI Insight Orb
            </p>
            
            <motion.div
              animate={{
                scale: [1, 1.08, 1],
                boxShadow: [
                  '0 0 20px rgba(14,165,233,0.4)',
                  '0 0 40px rgba(14,165,233,0.8)',
                  '0 0 20px rgba(14,165,233,0.4)'
                ]
              }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center text-white shadow-2xl mb-4 cursor-pointer group-hover:scale-110 transition-transform"
            >
              <HiSparkles size={28} className="animate-spin" style={{ animationDuration: '6s' }} />
            </motion.div>

            <p className="text-xs text-text-main font-medium line-clamp-3 px-2">
              {dashboardSummary?.momentum || "Maintain your daily momentum by clearing your inbox and reviewing active goals."}
            </p>
          </motion.div>

          {/* Quick Action Hub (1x1) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="bg-surface-soft/60 backdrop-blur-xl border border-border rounded-3xl p-6 relative group hover:border-border transition-all duration-500 flex flex-col justify-between"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted mb-3 flex items-center gap-1.5">
              <FiZap className="text-amber-400" /> Quick Action Hub
            </p>
            <div className="grid grid-cols-2 gap-3 my-auto">
              <NextLink href="/notes?new=true" className="flex flex-col items-center justify-center gap-2 p-3 bg-surface-base/50 hover:bg-brand-primary/20 border border-border/50 hover:border-brand-primary/40 rounded-2xl transition-all group/btn">
                <FiFileText className="text-brand-primary text-xl group-hover/btn:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-text-main">Note</span>
              </NextLink>
              <NextLink href="/tasks" className="flex flex-col items-center justify-center gap-2 p-3 bg-surface-base/50 hover:bg-brand-secondary/20 border border-border/50 hover:border-brand-secondary/40 rounded-2xl transition-all group/btn">
                <FiCheckSquare className="text-brand-secondary text-xl group-hover/btn:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-text-main">Task</span>
              </NextLink>
              <NextLink href="/journal" className="flex flex-col items-center justify-center gap-2 p-3 bg-surface-base/50 hover:bg-amber-500/20 border border-border/50 hover:border-amber-500/40 rounded-2xl transition-all group/btn">
                <FiBookOpen className="text-amber-400 text-xl group-hover/btn:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-text-main">Journal</span>
              </NextLink>
              <NextLink href="/dreams" className="flex flex-col items-center justify-center gap-2 p-3 bg-surface-base/50 hover:bg-emerald-500/20 border border-border/50 hover:border-emerald-500/40 rounded-2xl transition-all group/btn">
                <FiTarget className="text-emerald-400 text-xl group-hover/btn:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-text-main">Goal</span>
              </NextLink>
            </div>
          </motion.div>

          {/* Stats Grid (Spans full width 4 cols) */}
          <div className="md:col-span-3 lg:col-span-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <StatCard {...stat} />
              </motion.div>
            ))}
          </div>

          {/* Priority Stack (1x2) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2 lg:col-span-2 bg-surface-soft/60 backdrop-blur-xl border border-border rounded-3xl p-6 lg:p-8 relative group hover:border-brand-primary/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] transition-all duration-500 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary flex items-center gap-2">
                  <FiZap /> Priority Stack
                </p>
                <span className="text-xs font-bold text-text-muted bg-surface-base px-3 py-1 rounded-full border border-border/50">
                  Top 3 Critical
                </span>
              </div>

              <div className="space-y-3 mb-6">
                {spotlightTasks.length > 0 ? (
                  spotlightTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between gap-4 rounded-2xl bg-surface-base/60 border border-border p-4 text-sm text-text-main hover:border-brand-primary/40 transition-all group/task"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`w-3 h-3 rounded-full shrink-0 ${task.priority === 'urgent' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : task.priority === 'high' ? 'bg-amber-500' : 'bg-brand-primary'}`} />
                        <div className="overflow-hidden">
                          <p className="font-semibold text-text-main group-hover/task:text-brand-primary transition-colors truncate">{task.title}</p>
                          <p className="text-xs text-text-muted capitalize mt-0.5">{task.priority} priority</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateTaskAsync({ id: task.id, updates: { status: "done" } })}
                        className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold uppercase tracking-wider text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all cursor-pointer"
                      >
                        <FiCheck size={14} /> Done
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 bg-surface-base/40 rounded-2xl border border-border/50">
                    <p className="text-text-muted text-sm">No urgent tasks in your priority stack. 🎉</p>
                  </div>
                )}
              </div>

              {dashboardSummary?.blockers && dashboardSummary.blockers.length > 0 && (
                <div className="space-y-2 mb-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400 mb-2">Identified Blockers</p>
                  {dashboardSummary.blockers.map((item, i) => (
                    <div key={`blocker-${i}`} className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-xs text-red-200 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 shrink-0 animate-pulse" /> {item}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {inboxSignalCount >= 10 && (
              <NextLink href="/inbox" className="inline-flex items-center justify-between gap-2 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-xs font-bold text-amber-200 hover:bg-amber-400/20 transition-all">
                <span>⚠️ {inboxSignalCount} inbox items require immediate routing</span>
                <FiChevronRight size={16} />
              </NextLink>
            )}
          </motion.div>

          {/* Knowledge Heatmap & Connection Graph (1x2) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="md:col-span-2 lg:col-span-2 bg-surface-soft/60 backdrop-blur-xl border border-border rounded-3xl p-6 lg:p-8 relative group hover:border-brand-secondary/50 hover:shadow-[0_0_30px_rgba(14,165,233,0.15)] transition-all duration-500 flex flex-col justify-between gap-6"
          >
            <KnowledgeHeatmap notes={filteredNotes} />
            <MiniConnectionGraph notes={filteredNotes} />
          </motion.div>

          {/* Active Goals with Neon Circular Progress Rings (1x2) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="md:col-span-2 lg:col-span-2 bg-surface-soft/60 backdrop-blur-xl border border-border rounded-3xl p-6 lg:p-8 relative group hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] transition-all duration-500 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400 flex items-center gap-2">
                  <FiTarget /> Active Goals Progress
                </p>
                <NextLink href="/dreams" className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1">
                  View All <FiChevronRight />
                </NextLink>
              </div>

              <div className="space-y-4">
                {loadingDreams ? (
                  <p className="text-text-muted text-sm text-center py-8">Loading goals...</p>
                ) : activeDreams.length === 0 ? (
                  <div className="text-center py-8 bg-surface-base/40 rounded-2xl border border-border/50">
                    <p className="text-text-muted text-sm mb-2">No active goals found.</p>
                    <NextLink href="/dreams" className="text-xs font-bold text-emerald-400 hover:underline">Create a Dream</NextLink>
                  </div>
                ) : (
                  activeDreams.slice(0, 3).map((dream) => {
                    const total = dream.milestones?.length || 0;
                    const done = dream.milestones?.filter((m) => m.completed).length || 0;
                    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                    return (
                      <NextLink href={`/dreams/${dream.id}`} key={dream.id} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-surface-base/60 border border-border hover:border-emerald-500/40 transition-all group/goal">
                        <div className="overflow-hidden pr-2">
                          <h4 className="text-sm font-bold text-text-main group-hover/goal:text-emerald-400 transition-colors truncate">{dream.title}</h4>
                          <p className="text-xs text-text-muted mt-1">{done} of {total} milestones completed</p>
                        </div>
                        <NeonProgressRing progress={pct} size={54} strokeWidth={5} color="#10b981" />
                      </NextLink>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>

          {/* Today's Journal Quick Peek (1x2) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="md:col-span-2 lg:col-span-2 bg-surface-soft/60 backdrop-blur-xl border border-border rounded-3xl p-6 lg:p-8 relative group hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] transition-all duration-500 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400 flex items-center gap-2">
                  <FiBookOpen /> Today&apos;s Journal
                </p>
                <NextLink href="/journal" className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1">
                  Open Journal <FiChevronRight />
                </NextLink>
              </div>

              {todayEntry?.content ? (
                <div className="bg-surface-base/60 border border-border rounded-2xl p-5 relative group/journal hover:border-amber-500/40 transition-all">
                  <p className="text-sm text-text-main line-clamp-4 leading-relaxed italic">&ldquo;{todayEntry.content}&rdquo;</p>
                  <NextLink href="/journal" className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:underline">
                    Continue writing <FiChevronRight size={14} />
                  </NextLink>
                </div>
              ) : (
                <div className="text-center py-10 bg-surface-base/40 rounded-2xl border border-border/50">
                  <p className="text-text-muted text-sm mb-4">Take a moment to reflect on your day.</p>
                  <NextLink href="/journal" className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-sm">
                    <FiBookOpen /> Start Writing
                  </NextLink>
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent Activity Feed (Spans 4 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="md:col-span-3 lg:col-span-4 bg-surface-soft/60 backdrop-blur-xl border border-border rounded-3xl p-6 lg:p-8 relative group hover:border-border transition-all duration-500"
          >
            <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted flex items-center gap-2">
                <FiActivity className="text-brand-primary" /> Recent Activity Feed
              </p>
              <span className="text-xs font-semibold text-text-muted">Live Updates</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activityFeed.map((item) => {
                const Icon = item.icon;
                return (
                  <NextLink
                    key={item.id}
                    href={item.href}
                    className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-surface-base/50 border border-border/50 hover:border-border hover:bg-surface-base transition-all group/feed"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`w-10 h-10 rounded-xl bg-surface-soft flex items-center justify-center shrink-0 border border-border/50 group-hover/feed:border-border transition-colors`}>
                        <Icon className={`text-lg ${item.color}`} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-semibold text-sm text-text-main truncate group-hover/feed:text-brand-primary transition-colors">{item.label}</p>
                        <p className="text-[11px] text-text-muted mt-0.5">{item.meta}</p>
                      </div>
                    </div>
                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-text-muted bg-surface-soft px-2.5 py-1 rounded-lg border border-border/50">
                      {dayjs(item.createdAt).fromNow(true)}
                    </span>
                  </NextLink>
                );
              })}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
