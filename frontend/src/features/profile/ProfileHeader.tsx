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
      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4 sm:gap-5">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-brand-primary/20 sm:h-24 sm:w-24">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-3xl font-black text-brand-primary sm:text-4xl">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-brand-primary">
                Profile Core
              </span>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-text-main">
                {user.provider === "GOOGLE" ? "Google Account" : "Email Account"}
              </span>
              {user.emailVerified ? (
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-200">
                  Verified
                </span>
              ) : null}
            </div>

            <h1 className="mt-4 text-2xl font-black leading-tight text-white sm:text-4xl">
              {user.name}
            </h1>
            <p className="mt-2 text-sm leading-6 text-text-muted sm:text-base">
              {user.username ? `@${user.username} • ` : ""}
              {user.email}
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <HeaderStat
                label="Member Since"
                value={dayjs(user.createdAt).format("MMM D, YYYY")}
              />
              <HeaderStat
                label="Tasks Completed"
                value={String(stats.completedTasksCount)}
              />
              <HeaderStat
                label="Focus Minutes"
                value={`${stats.focusMinutesTotal}m`}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 sm:flex-row lg:flex-col lg:items-end">
          {!isEditing ? (
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-bold text-text-main transition hover:bg-black/30"
            >
              <FiEdit3 size={16} />
              Edit Profile
            </button>
          ) : null}
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <div className="flex items-center gap-2">
              <FiShield className="text-brand-primary" size={14} />
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-text-muted">
                Last Updated
              </p>
            </div>
            <p className="mt-1 text-sm font-bold text-white">
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
