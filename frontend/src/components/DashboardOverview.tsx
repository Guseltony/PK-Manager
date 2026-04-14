/* eslint-disable react/no-unescaped-entities */
"use client";

import { motion } from "framer-motion";
import {
  FiFileText, FiCheckSquare, FiTarget, FiClock,
  FiPlus, FiChevronRight, FiBookOpen, FiActivity,
} from "react-icons/fi";
import NextLink from "next/link";
import { IconType } from "react-icons";
import { useNotes } from "../hooks/useNotes";
import { useTasks } from "../hooks/useTasks";
import { useDreams } from "../hooks/useDreams";
import { useJournal } from "../hooks/useJournal";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface DashboardStatProps {
  icon: IconType;
  label: string;
  value: string | number;
  trend?: string;
  color: string;
  bg: string;
}

function StatCard({ icon: Icon, label, value, trend, color, bg }: DashboardStatProps) {
  return (
    <div className="bg-surface-soft border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center`}>
          <Icon className={`text-xl ${color}`} />
        </div>
        {trend && (
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <p className="text-text-muted text-sm font-medium mb-1">{label}</p>
      <h3 className="text-2xl font-bold text-text-main">{value}</h3>
    </div>
  );
}

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate?: string;
}

interface Note {
  id: string;
  title: string;
  updatedAt: string;
  tags: string[];
}

interface Dream {
  id: string;
  title: string;
  category?: string;
  milestones?: { completed: boolean }[];
}

export default function DashboardOverview() {
  const { notes, isLoading: loadingNotes } = useNotes();
  const { tasks, isLoading: loadingTasks } = useTasks();
  const { dreams, isLoading: loadingDreams } = useDreams();
  const { entry: todayEntry } = useJournal(new Date());

  const today = dayjs().startOf("day");

  const todayTasks = (tasks as Task[]).filter((t) => {
    if (t.status === "done") return false;
    if (!t.dueDate) return false;
    return dayjs(t.dueDate).isSame(today, "day");
  });

  const activeDreams = (dreams as Dream[]).filter((d) => d.milestones && d.milestones.some((m) => !m.completed));

  const recentNotes = [...(notes as Note[])]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);

  const completedToday = (tasks as Task[]).filter((t) => t.status === "done" && t.dueDate && dayjs(t.dueDate).isSame(today, "day")).length;

  const stats = [
    {
      icon: FiFileText,
      label: "Total Notes",
      value: loadingNotes ? "..." : notes.length,
      trend: recentNotes.length > 0 ? `${recentNotes.length} recent` : undefined,
      color: "text-brand-primary",
      bg: "bg-brand-primary/10",
    },
    {
      icon: FiCheckSquare,
      label: "Tasks Due Today",
      value: loadingTasks ? "..." : todayTasks.length,
      trend: completedToday > 0 ? `${completedToday} done` : undefined,
      color: "text-brand-secondary",
      bg: "bg-brand-secondary/10",
    },
    {
      icon: FiTarget,
      label: "Active Goals",
      value: loadingDreams ? "..." : activeDreams.length,
      trend: activeDreams.length > 0 ? "In progress" : undefined,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
    {
      icon: FiBookOpen,
      label: "Journal Today",
      value: todayEntry?.content ? "Written" : "Empty",
      trend: todayEntry?.mood ? `Mood: ${todayEntry.mood}` : undefined,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
  ];

  return (
    <div className="flex flex-col gap-6 lg:gap-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 h-full overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <p className="text-brand-primary uppercase tracking-[0.2em] font-bold text-[10px] mb-1">
            {dayjs().format("dddd, MMMM D")}
          </p>
          <h1 className="text-3xl font-display font-bold text-text-main">
            Command Centre
          </h1>
          <p className="text-text-muted mt-1 text-sm">Here&apos;s what&apos;s happening in your second brain today.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <NextLink
            href="/journal"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 text-text-muted font-bold px-4 py-2.5 rounded-xl transition-all active:scale-[0.98] text-sm"
          >
            <FiBookOpen /> Write
          </NextLink>
          <NextLink
            href="/tasks"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-brand-primary/25 transition-all active:scale-[0.98] text-sm"
          >
            <FiPlus strokeWidth={3} /> New Task
          </NextLink>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Recent Notes & Goals */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-surface-soft border border-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-text-main flex items-center gap-3">
                <FiClock className="text-brand-primary" />
                Recent Notes
              </h2>
              <NextLink href="/notes" className="text-sm font-semibold text-brand-primary hover:underline flex items-center gap-1 group">
                View All <FiChevronRight className="group-hover:translate-x-0.5 transition-transform" />
              </NextLink>
            </div>
            <div className="flex flex-row sm:flex-col overflow-x-auto sm:overflow-x-visible gap-4 pb-4 sm:pb-0 custom-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
              {loadingNotes ? (
                <p className="text-text-muted text-sm text-center py-4">Loading notes...</p>
              ) : recentNotes.length === 0 ? (
                <p className="text-text-muted text-sm text-center py-4">No notes yet. <NextLink href="/notes" className="text-brand-primary hover:underline">Create your first</NextLink>.</p>
              ) : recentNotes.map((note) => (
                <NextLink
                  href={`/notes/${note.id}`}
                  key={note.id}
                  className="p-4 rounded-xl bg-surface-base border border-white/5 hover:border-white/10 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between group cursor-pointer min-w-[240px] sm:min-w-0 flex-shrink-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                      <FiFileText />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-text-main group-hover:text-brand-primary transition-colors line-clamp-1">
                        {note.title || "Untitled Note"}
                      </h4>
                      <p className="text-[11px] text-text-muted">{dayjs(note.updatedAt).fromNow()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {note.tags.slice(0, 3).map((t) => (
                      <span key={t} className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/5 text-text-muted/60">
                        {t}
                      </span>
                    ))}
                  </div>
                </NextLink>
              ))}
            </div>
          </div>

          {/* Active Dreams */}
          <div className="bg-surface-soft border border-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-text-main flex items-center gap-3">
                <FiActivity className="text-emerald-400" />
                Active Goals
              </h2>
              <NextLink href="/dreams" className="text-sm font-semibold text-emerald-400 hover:underline flex items-center gap-1 group">
                View All <FiChevronRight className="group-hover:translate-x-0.5 transition-transform" />
              </NextLink>
            </div>
            {loadingDreams ? (
              <p className="text-text-muted text-sm text-center py-4">Loading goals...</p>
            ) : activeDreams.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-4">No active goals. <NextLink href="/dreams" className="text-emerald-400 hover:underline">Create a dream</NextLink>.</p>
            ) : activeDreams.slice(0, 3).map((dream) => {
              const total = dream.milestones?.length || 0;
              const done = dream.milestones?.filter((m) => m.completed).length || 0;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              return (
                <NextLink href={`/dreams/${dream.id}`} key={dream.id} className="block mb-4 group cursor-pointer">
                  <div className="flex justify-between text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">
                    <span className="group-hover:text-emerald-400 transition-colors truncate">{dream.title}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(74,222,128,0.3)]" style={{ width: `${pct}%` }} />
                  </div>
                </NextLink>
              );
            })}
          </div>
        </div>

        {/* Right: Today's Tasks */}
        <div className="flex flex-col gap-6">
          <div className="bg-surface-soft border border-white/5 rounded-xl p-6">
            <h2 className="text-lg font-bold text-text-main mb-6 flex items-center gap-3">
              <FiCheckSquare className="text-brand-secondary" />
              Due Today
            </h2>
            <div className="flex flex-col gap-3">
              {loadingTasks ? (
                <p className="text-text-muted text-sm text-center py-4">Loading tasks...</p>
              ) : todayTasks.length === 0 ? (
                <p className="text-text-muted text-sm text-center py-4">
                  {(tasks as Task[]).filter(t => t.status !== "done").length > 0 ? "Nothing due today 🎉" : "No tasks yet."}
                </p>
              ) : todayTasks.slice(0, 6).map((task) => (
                <div key={task.id} className="flex items-center gap-3 group">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    task.priority === "urgent" ? "bg-red-500" :
                    task.priority === "high" ? "bg-amber-500" :
                    task.priority === "medium" ? "bg-emerald-500" : "bg-blue-400"
                  }`} />
                  <span className="text-sm text-text-main font-medium line-clamp-1 group-hover:text-brand-secondary transition-colors">
                    {task.title}
                  </span>
                </div>
              ))}
              <NextLink
                href="/tasks"
                className="mt-2 text-xs font-bold text-text-muted hover:text-text-main transition-colors text-center py-2 border border-dashed border-white/10 rounded-xl"
              >
                + View All Tasks
              </NextLink>
            </div>
          </div>

          {/* Journal Quick Peek */}
          <div className="bg-surface-soft border border-white/5 rounded-xl p-6">
            <h2 className="text-lg font-bold text-text-main mb-4 flex items-center gap-3">
              <FiBookOpen className="text-amber-400" />
              Today&apos;s Journal
            </h2>
            {todayEntry?.content ? (
              <div>
                <p className="text-sm text-text-muted line-clamp-4 leading-relaxed">
                  {todayEntry.content}
                </p>
                <NextLink href="/journal" className="mt-3 block text-xs font-bold text-amber-400 hover:underline">
                  Continue writing →
                </NextLink>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-text-muted text-sm mb-3">You haven&apos;t written today.</p>
                <NextLink
                  href="/journal"
                  className="inline-block bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 font-bold px-4 py-2 rounded-xl text-xs transition-all"
                >
                  Start Writing
                </NextLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
