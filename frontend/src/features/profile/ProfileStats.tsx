"use client";

import type { UserStats } from "@/src/types/user";
import { FileText, CheckSquare, Star, FolderOpen } from "lucide-react";

interface ProfileStatsProps {
  stats: UserStats | undefined;
}

export default function ProfileStats({ stats }: ProfileStatsProps) {
  if (!stats) return null;

  const statItems = [
    {
      label: "Notes",
      value: stats.notesCount,
      icon: FileText,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "Tasks",
      value: stats.tasksCount,
      icon: CheckSquare,
      color: "text-green-400",
      bg: "bg-green-400/10",
    },
    {
      label: "Dreams",
      value: stats.dreamsCount,
      icon: Star,
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
    },
    {
      label: "Projects",
      value: stats.projectsCount,
      icon: FolderOpen,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
  ];

  return (
    <div className="rounded-lg border border-gray-800 bg-surface-soft p-6">
      <h2 className="mb-4 text-lg font-semibold text-white">Activity Stats</h2>
      <div className="space-y-4">
        {statItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-lg bg-gray-900/50 p-3"
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-lg ${item.bg} p-2`}>
                <item.icon className={`h-4 w-4 ${item.color}`} />
              </div>
              <span className="text-sm text-gray-300">{item.label}</span>
            </div>
            <span className="text-lg font-bold text-white">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
