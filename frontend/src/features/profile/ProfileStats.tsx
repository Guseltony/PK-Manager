"use client";

import type { UserStats } from "@/src/types/user";
import {
  FiBookOpen,
  FiFolder,
  FiInbox,
  FiLayers,
  FiStar,
  FiZap,
} from "react-icons/fi";

interface ProfileStatsProps {
  stats: UserStats | undefined;
}

export default function ProfileStats({ stats }: ProfileStatsProps) {
  if (!stats) return null;

  const statItems = [
    {
      label: "Notes",
      value: stats.notesCount,
      detail: "Knowledge nodes captured",
      icon: FiBookOpen,
      tone: "text-sky-300 bg-sky-400/10 border-sky-400/20",
    },
    {
      label: "Tasks",
      value: stats.tasksCount,
      detail: `${stats.activeTasksCount} currently open`,
      icon: FiLayers,
      tone: "text-emerald-300 bg-emerald-400/10 border-emerald-400/20",
    },
    {
      label: "Dreams",
      value: stats.dreamsCount,
      detail: `${stats.projectsCount} projects under them`,
      icon: FiStar,
      tone: "text-amber-300 bg-amber-400/10 border-amber-400/20",
    },
    {
      label: "Inbox",
      value: stats.inboxCount,
      detail: `${stats.ideasCount} ideas routed into the system`,
      icon: FiInbox,
      tone: "text-brand-primary bg-brand-primary/10 border-brand-primary/20",
    },
    {
      label: "Ledger",
      value: stats.ledgerEntriesCount,
      detail: `${stats.completedThisWeek} completions this week`,
      icon: FiZap,
      tone: "text-rose-300 bg-rose-400/10 border-rose-400/20",
    },
    {
      label: "Focus Blocks",
      value: stats.plannedFocusBlocksCount,
      detail: `${stats.focusSessionsCount} sessions archived`,
      icon: FiFolder,
      tone: "text-violet-300 bg-violet-400/10 border-violet-400/20",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {statItems.map((item) => (
        <div
          key={item.label}
          className="rounded-3xl border border-white/10 bg-surface-soft/70 p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-text-muted">
                {item.label}
              </p>
              <p className="mt-2 text-2xl font-extrabold text-white">{item.value}</p>
            </div>
            <div className={`rounded-2xl border p-3 ${item.tone}`}>
              <item.icon size={16} />
            </div>
          </div>
          <p className="mt-3 text-xs leading-5 text-text-muted">{item.detail}</p>
        </div>
      ))}
    </div>
  );
}
