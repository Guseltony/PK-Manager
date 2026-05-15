"use client";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { FiEdit3, FiShield } from "react-icons/fi";
import Image from "next/image";
import { User, UserStats } from "@/src/types/user";

dayjs.extend(relativeTime);

interface ProfileHeaderProps {
  user: User;
  stats: UserStats;
  onEdit: () => void;
  isEditing: boolean;
}

export default function ProfileHeader({
  user,
  stats,
  onEdit,
  isEditing,
}: ProfileHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-linear-to-br from-surface-soft via-surface-base to-black/80 p-5 sm:p-7">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.10),transparent_30%)]" />
      <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
          <div className="relative shrink-0">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-brand-primary/20 sm:h-24 sm:w-24 sm:rounded-3xl">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-2xl font-black text-brand-primary sm:text-4xl">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-brand-primary">
                Core
              </span>
              <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-text-main">
                {user.provider === "GOOGLE" ? "Google" : "Email"}
              </span>
              {user.emailVerified ? (
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-emerald-200">
                  Verified
                </span>
              ) : null}
            </div>

            <h1 className="mt-3 text-2xl font-black leading-tight text-white sm:text-4xl">
              {user.name}
            </h1>
            <p className="mt-1.5 truncate text-xs leading-5 text-text-muted sm:text-base">
              {user.username ? `@${user.username} • ` : ""}
              {user.email}
            </p>

            <div className="mt-4 grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
              <HeaderStat
                label="Joined"
                value={dayjs(user.createdAt).format("MMM D, YYYY")}
              />
              <HeaderStat
                label="Tasks"
                value={String(stats.completedTasksCount)}
              />
              <HeaderStat
                label="Focus"
                value={`${stats.focusMinutesTotal}m`}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-row items-center gap-2 sm:flex-row lg:flex-col lg:items-end">
          {!isEditing ? (
            <button
              onClick={onEdit}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-xs font-bold text-text-main transition hover:bg-black/30 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm"
            >
              <FiEdit3 size={14} />
              <span className="hidden xs:inline">Edit Profile</span>
              <span className="xs:hidden">Edit</span>
            </button>
          ) : null}
          <div className="flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 sm:rounded-2xl sm:px-4 sm:py-3">
            <div className="flex items-center gap-1.5">
              <FiShield className="text-brand-primary" size={12} />
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-text-muted">
                Updated
              </p>
            </div>
            <p className="mt-1 text-xs font-bold text-white sm:text-sm">
              {dayjs(user.updatedAt).fromNow()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeaderStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-text-muted">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-white">{value}</p>
    </div>
  );
}
