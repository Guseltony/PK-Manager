"use client";

import { useMemo, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  FiActivity,
  FiBookOpen,
  FiClock,
  FiCpu,
  FiInbox,
  FiLayers,
  FiTarget,
  FiUserCheck,
  FiZap,
} from "react-icons/fi";
import { useUser, useUserStats, useUpdateUser } from "@/src/hooks/useUser";
import ProfileHeader from "./ProfileHeader";
import ProfileStats from "./ProfileStats";
import ProfileForm from "./ProfileForm";
import { Skeleton } from "@/src/components/ui/skeleton";
import { User, UserStats } from "@/src/types/user";

dayjs.extend(relativeTime);

export default function ProfilePage() {
  const { data: user, isLoading: userLoading } = useUser();
  const { data: stats, isLoading: statsLoading } = useUserStats();
  const { mutate: updateUser, isPending } = useUpdateUser();
  const [isEditing, setIsEditing] = useState(false);

  if (userLoading || statsLoading) {
    return <ProfileSkeleton />;
  }

  if (!user || !stats) {
    return <div className="p-8 text-center text-text-muted">User not found</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6">
      <ProfileHeader
        user={user}
        stats={stats}
        onEdit={() => setIsEditing(true)}
        isEditing={isEditing}
      />

      <div className="mt-6">
        <ProfileStats stats={stats} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          {isEditing ? (
            <ProfileForm
              user={user}
              onSubmit={(data) => {
                updateUser(data, {
                  onSuccess: () => setIsEditing(false),
                });
              }}
              onCancel={() => setIsEditing(false)}
              isPending={isPending}
            />
          ) : (
            <ProfileIdentity user={user} />
          )}
          <SystemProfile user={user} />
        </div>

        <div className="space-y-6">
          <ExecutionProfile stats={stats} />
          <RecentSignals stats={stats} />
        </div>
      </div>
    </div>
  );
}

function ProfileIdentity({ user }: { user: User }) {
  const joinedDays = useMemo(
    () => Math.max(1, dayjs().diff(dayjs(user.createdAt), "day") + 1),
    [user.createdAt],
  );

  return (
    <div className="rounded-3xl border border-border bg-surface-soft/80 p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <FiUserCheck className="text-brand-primary" size={14} />
        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-text-main">
          Identity Layer
        </h2>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
        <ProfileField label="Name" value={user.name} />
        <ProfileField label="Email" value={user.email} />
        <ProfileField label="Username" value={user.username || "Not set yet"} />
        <ProfileField
          label="Provider"
          value={user.provider === "GOOGLE" ? "Google Sign-In" : "Email Auth"}
        />
        <ProfileField
          label="Verification"
          value={
            user.emailVerified
              ? `Verified${user.verifiedAt ? ` • ${dayjs(user.verifiedAt).format("MMM D, YYYY")}` : ""}`
              : "Pending verification"
          }
        />
        <ProfileField label="Member Age" value={`${joinedDays} day${joinedDays === 1 ? "" : "s"}`} />
      </div>
    </div>
  );
}

function SystemProfile({ user }: { user: User }) {
  const switches = [
    {
      label: "Dream Auto-Tasks",
      value: user.settings?.autoTaskGenerationFromDreams ? "On" : "Off",
    },
    {
      label: "Knowledge Auto-Linking",
      value: user.settings?.autoLinkingKnowledgeGraph ? "On" : "Off",
    },
    {
      label: "Focus Alerts",
      value: user.settings?.focusSessionAlerts ? "On" : "Off",
    },
    {
      label: "Daily Insights",
      value: user.settings?.dailyInsightSummaries ? "On" : "Off",
    },
  ];

  return (
    <div className="rounded-3xl border border-border bg-surface-soft/80 p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <FiCpu className="text-brand-primary" size={14} />
        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-text-main">
          System Profile
        </h2>
      </div>
      <p className="mt-3 text-sm leading-6 text-text-muted">
        This is the user-level behavior layer shaping how the platform routes,
        links, prioritizes, and surfaces work for you.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
        <SystemPill label="AI Strictness" value={user.settings?.aiStrictness || "Default"} />
        <SystemPill
          label="AI Proactiveness"
          value={user.settings?.aiProactiveness || "Default"}
        />
        <SystemPill
          label="Task Prioritization"
          value={user.settings?.taskPrioritizationMode || "Default"}
        />
        <SystemPill
          label="Active Sessions"
          value={`${user._count?.session || 0} saved`}
        />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {switches.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-border bg-surface-mutes/20 px-4 py-3"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-text-muted">
              {item.label}
            </p>
            <p className="mt-1 text-sm font-bold text-text-main">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExecutionProfile({ stats }: { stats: UserStats }) {
  const executionCards = [
    {
      label: "Open Tasks",
      value: stats.activeTasksCount,
      detail: `${stats.dueTodayCount} due today`,
      icon: <FiLayers size={14} />,
    },
    {
      label: "Recurring Tasks",
      value: stats.recurringTasksCount,
      detail: "Persisted execution loops",
      icon: <FiActivity size={14} />,
    },
    {
      label: "Completed This Week",
      value: stats.completedThisWeek,
      detail: `${stats.completedTasksCount} total completed`,
      icon: <FiTarget size={14} />,
    },
    {
      label: "Focus Minutes",
      value: stats.focusMinutesTotal,
      detail: `${stats.focusSessionsCount} recorded sessions`,
      icon: <FiZap size={14} />,
    },
  ];

  return (
    <div className="rounded-3xl border border-border bg-surface-soft/80 p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <FiTarget className="text-brand-primary" size={14} />
        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-text-main">
          Execution Profile
        </h2>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
        {executionCards.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-border bg-surface-mutes/20 p-3 sm:p-4"
          >
            <div className="flex items-center gap-1.5 text-brand-primary">
              {item.icon}
              <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.16em] text-text-muted">
                {item.label}
              </p>
            </div>
            <p className="mt-2 text-xl sm:text-2xl font-extrabold text-white">
              {item.value}
            </p>
            <p className="mt-0.5 text-[9px] sm:text-xs leading-4 sm:leading-5 text-text-muted">
              {item.detail}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentSignals({ stats }: { stats: UserStats }) {
  const items = [
    {
      label: "Last Ledger Event",
      value: stats.lastTaskCompletedTitle || "No execution logged yet",
      meta: stats.lastTaskCompletedAt ? dayjs(stats.lastTaskCompletedAt).fromNow() : "",
      icon: <FiClock size={14} />,
    },
    {
      label: "Last Focus Session",
      value: stats.lastFocusSessionAt
        ? `${stats.lastFocusSessionCompletedCount} tasks completed`
        : "No focus session recorded yet",
      meta: stats.lastFocusSessionAt ? dayjs(stats.lastFocusSessionAt).fromNow() : "",
      icon: <FiZap size={14} />,
    },
    {
      label: "Last Inbox Capture",
      value: stats.lastInboxCaptureType
        ? `${stats.lastInboxCaptureType} • ${stats.lastInboxCaptureStatus || "queued"}`
        : "No capture recorded yet",
      meta: stats.lastInboxCaptureAt ? dayjs(stats.lastInboxCaptureAt).fromNow() : "",
      icon: <FiInbox size={14} />,
    },
    {
      label: "Last Note Update",
      value: stats.lastNoteUpdatedTitle || "No note updated yet",
      meta: stats.lastNoteUpdatedAt ? dayjs(stats.lastNoteUpdatedAt).fromNow() : "",
      icon: <FiBookOpen size={14} />,
    },
  ];

  return (
    <div className="rounded-3xl border border-border bg-surface-soft/80 p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <FiClock className="text-brand-primary" size={14} />
        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-text-main">
          Recent Signals
        </h2>
      </div>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-border bg-surface-mutes/20 px-4 py-3"
          >
            <div className="flex items-center gap-2 text-brand-primary">
              {item.icon}
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-text-muted">
                {item.label}
              </p>
            </div>
            <p className="mt-2 text-sm font-bold text-white">{item.value}</p>
            {item.meta ? (
              <p className="mt-1 text-xs leading-5 text-text-muted">{item.meta}</p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-mutes/20 px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-text-muted">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-text-main">{value}</p>
    </div>
  );
}

function SystemPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-mutes/20 px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-text-muted">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold capitalize text-text-main">{value}</p>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6">
      <Skeleton className="h-52 w-full rounded-3xl" />
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <Skeleton className="h-80 w-full rounded-3xl" />
          <Skeleton className="h-72 w-full rounded-3xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-72 w-full rounded-3xl" />
          <Skeleton className="h-80 w-full rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
