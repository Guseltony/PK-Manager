/* eslint-disable react/no-unescaped-entities */
"use client";

import { motion } from "framer-motion";
import {
  FiFileText,
  FiCheckSquare,
  FiTarget,
  FiClock,
  FiPlus,
  FiChevronRight,
} from "react-icons/fi";
// Correction: use next/link
import NextLink from "next/link";
import { IconType } from "react-icons";

interface DashboardStatProps {
  icon: IconType;
  label: string;
  value: string | number;
  trend?: string;
  color: string;
  bg: string;
}

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  color,
  bg,
}: DashboardStatProps) {
  return (
    <div className="bg-surface-soft border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center`}
        >
          <Icon className={`text-xl ${color}`} />
        </div>
        {trend && (
          <span className="text-[11px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <p className="text-text-muted text-sm font-medium mb-1">{label}</p>
      <h3 className="text-2xl font-bold text-text-main">{value}</h3>
    </div>
  );
}

export default function DashboardOverview() {
  // Mock data for now
  const stats = [
    {
      icon: FiFileText,
      label: "Total Notes",
      value: 124,
      trend: "+12",
      color: "text-brand-primary",
      bg: "bg-brand-primary/10",
    },
    {
      icon: FiCheckSquare,
      label: "Active Tasks",
      value: 8,
      trend: "3 due today",
      color: "text-brand-secondary",
      bg: "bg-brand-secondary/10",
    },
    {
      icon: FiTarget,
      label: "Goals Progress",
      value: "65%",
      trend: "2/3 active",
      color: "text-green-400",
      bg: "bg-green-400/10",
    },
    {
      icon: FiClock,
      label: "Today's Focus",
      value: "4h 20m",
      trend: "+15%",
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
    },
  ];

  const recentNotes = [
    {
      title: "Next.js 15 Implementation Notes",
      date: "2 mins ago",
      tags: ["dev", "learning"],
    },
    {
      title: "Personal Branding Strategy",
      date: "1 hour ago",
      tags: ["career", "ideas"],
    },
    {
      title: "PK-Manager System Architecture",
      date: "Yesterday",
      tags: ["project", "arch"],
    },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto p-8 h-full overflow-y-auto custom-scrollbar">
      {/* Header section */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-main mb-2">
            Welcome back, Anthony
          </h1>
          <p className="text-text-muted">
            Here's what's happening in your second brain today.
          </p>
        </div>
        <NextLink
          href="/notes/new"
          className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-brand-primary/25 transition-all active:scale-[0.98]"
        >
          <FiPlus strokeWidth={3} />
          New Thought
        </NextLink>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Recent Activity */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-surface-soft border border-white/5 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text-main flex items-center gap-3">
                <FiClock className="text-brand-primary" />
                Recently Edited
              </h2>
              <NextLink
                href="/notes"
                className="text-sm font-semibold text-brand-primary hover:underline flex items-center gap-1 group"
              >
                View All
                <FiChevronRight className="group-hover:translate-x-0.5 transition-transform" />
              </NextLink>
            </div>

            <div className="flex flex-col gap-3">
              {recentNotes.map((note) => (
                <div
                  key={note.title}
                  className="p-4 rounded-2xl bg-surface-base border border-white/5 hover:border-white/10 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold">
                      <FiFileText />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-text-main group-hover:text-brand-primary transition-colors">
                        {note.title}
                      </h4>
                      <p className="text-[11px] text-text-muted">{note.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {note.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/5 text-text-muted/60"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Tasks / Goals Focus */}
        <div className="flex flex-col gap-6">
          <div className="bg-surface-soft border border-white/5 rounded-3xl p-6">
            <h2 className="text-xl font-bold text-text-main mb-6 flex items-center gap-3">
              <FiCheckSquare className="text-brand-secondary" />
              Today's Tasks
            </h2>
            <div className="flex flex-col gap-4">
              {[
                { label: "Refine System Architecture", priority: "High" },
                { label: "Prepare for Demo", priority: "Medium" },
                { label: "Research Vector DBs", priority: "Low" },
              ].map((task, i) => (
                <div key={task.label} className="flex items-center gap-3 group">
                  <div className="w-5 h-5 rounded border-2 border-white/10 group-hover:border-brand-secondary/50 transition-colors" />
                  <span className="text-sm text-text-main font-medium">
                    {task.label}
                  </span>
                </div>
              ))}
              <NextLink
                href="/tasks"
                className="mt-2 text-xs font-bold text-text-muted hover:text-text-main transition-colors text-center py-2 border border-dashed border-white/10 rounded-xl"
              >
                + Add Task
              </NextLink>
            </div>
          </div>

          <div className="bg-surface-soft border border-white/5 rounded-3xl p-6">
            <h2 className="text-xl font-bold text-text-main mb-4 flex items-center gap-3">
              <FiTarget className="text-green-400" />
              Active Goals
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">
                  <span>Fullstack Mastery</span>
                  <span>80%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-green-400 w-[80%] rounded-full shadow-[0_0_8px_rgba(74,222,128,0.4)]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">
                  <span>Knowledge Map</span>
                  <span>45%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-primary w-[45%] rounded-full shadow-[0_0_8px_rgba(var(--brand-primary-rgb),0.4)]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
