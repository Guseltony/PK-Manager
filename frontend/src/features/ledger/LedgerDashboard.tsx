"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import dayjs from "dayjs";
import {
  FiActivity,
  FiAlertCircle,
  FiClock,
  FiDownload,
  FiList,
  FiTarget,
  FiTrendingUp,
  FiZap,
} from "react-icons/fi";
import { useLedger } from "../../hooks/useLedger";
import { useLedgerInsights } from "../../hooks/useAI";

export default function LedgerDashboard() {
  const { logs, summaries, isLoading } = useLedger();
  const { data: insights, isLoading: loadingInsights } = useLedgerInsights();
  const [view, setView] = useState<"table" | "heatmap" | "replay">("table");

  const metrics = useMemo(() => {
    const totalMinutes = logs.reduce((sum, log) => sum + (log.duration || 0), 0);
    const highImpactCount = logs.filter((log) =>
      ["high", "urgent"].includes(log.priority),
    ).length;
    const activeDays = summaries.filter((summary) => summary.completedTasks > 0).length;

    return {
      totalCompletions: logs.length,
      totalMinutes,
      highImpactCount,
      activeDays,
    };
  }, [logs, summaries]);

  const replayGroups = useMemo(() => {
    const groups = new Map<string, typeof logs>();

    logs.forEach((log) => {
      const key = dayjs(log.completedAt).format("YYYY-MM-DD");
      const existing = groups.get(key) || [];
      existing.push(log);
      groups.set(key, existing);
    });

    return Array.from(groups.entries()).slice(0, 8);
  }, [logs]);

  if (isLoading || loadingInsights) {
    return (
      <div className="flex flex-1 items-center justify-center bg-surface-base p-8">
        <div className="flex flex-col items-center gap-4">
          <FiActivity className="animate-spin text-brand-primary" size={32} />
          <p className="animate-pulse text-sm font-medium uppercase tracking-widest text-text-muted">
            Synchronizing Ledger...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface-base">
      <div className="border-b border-white/5 px-4 pb-4 pt-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-display font-black tracking-tight text-text-main">
              TASK <span className="text-brand-primary">LEDGER</span>
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-text-muted">
              Immutable execution history with a sharper intelligence layer. See
              what you finished, when you finish best, and where momentum is
              slipping or compounding.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex w-full overflow-x-auto rounded-2xl border border-white/5 bg-white/5 p-1 md:w-auto">
              <button
                onClick={() => setView("table")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${view === "table" ? "bg-brand-primary text-white shadow-lg" : "text-text-muted hover:bg-white/5 hover:text-text-main"}`}
              >
                <FiList /> Table
              </button>
              <button
                onClick={() => setView("heatmap")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${view === "heatmap" ? "bg-amber-500 text-amber-950 shadow-lg" : "text-text-muted hover:bg-white/5 hover:text-text-main"}`}
              >
                <FiActivity /> Heatmap
              </button>
              <button
                onClick={() => setView("replay")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${view === "replay" ? "bg-emerald-500 text-emerald-950 shadow-lg" : "text-text-muted hover:bg-white/5 hover:text-text-main"}`}
              >
                <FiClock /> Replay
              </button>
            </div>
            <button
              type="button"
              className="flex items-center justify-center rounded-2xl border border-white/5 bg-white/5 p-3 text-text-muted transition-colors hover:bg-white/10 hover:text-text-main"
              title="Export coming soon"
            >
              <FiDownload size={18} />
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-4">
          <MetricCard
            label="Logged completions"
            value={String(metrics.totalCompletions)}
            hint="Immutable finished-task history"
            icon={<FiZap />}
          />
          <MetricCard
            label="Focused minutes"
            value={`${metrics.totalMinutes}m`}
            hint="Estimated execution time captured"
            icon={<FiClock />}
          />
          <MetricCard
            label="High-impact work"
            value={String(metrics.highImpactCount)}
            hint="High + urgent completions"
            icon={<FiTarget />}
          />
          <MetricCard
            label="Active days"
            value={String(metrics.activeDays)}
            hint="Days with recorded completions"
            icon={<FiTrendingUp />}
          />
        </div>
      </div>

      <div className="custom-scrollbar flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {insights ? (
          <section className="mb-6 grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
            <div className="rounded-[2rem] border border-brand-primary/20 bg-gradient-to-br from-brand-primary/15 via-white/5 to-transparent p-6">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-brand-primary">
                Ledger Intelligence
              </p>
              <p className="mt-3 text-lg font-semibold leading-relaxed text-text-main">
                {insights.summary}
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <InsightStat
                  label="Momentum"
                  value={insights.momentum}
                  icon={<FiTrendingUp />}
                />
                <InsightStat
                  label="Streak"
                  value={`${insights.streakDays} day${insights.streakDays === 1 ? "" : "s"}`}
                  icon={<FiZap />}
                />
                <InsightStat
                  label="Peak window"
                  value={insights.peakExecutionWindow}
                  icon={<FiClock />}
                />
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-amber-300">
                Strongest Themes
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {insights.strongestTags.length > 0 ? (
                  insights.strongestTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-text-main"
                    >
                      #{tag}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-text-muted">
                    Not enough repeated tag activity yet.
                  </span>
                )}
              </div>

              <div className="mt-5 space-y-4">
                <InsightList
                  title="Risks"
                  tone="warning"
                  items={insights.risks}
                  emptyLabel="No major execution risks detected in the current sample."
                />
                <InsightList
                  title="Recommendations"
                  tone="positive"
                  items={insights.recommendations}
                  emptyLabel="No recommendations available yet."
                />
              </div>
            </div>
          </section>
        ) : null}

        {view === "table" ? (
          <div className="glass overflow-hidden rounded-[2rem] border border-white/5">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-text-muted">
                  <tr>
                    <th className="p-4 pl-6">Completed Time</th>
                    <th className="p-4">Task Title</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4">Goal (Dream)</th>
                    <th className="p-4">Priority</th>
                    <th className="p-4">Tags</th>
                    <th className="p-4">Note Link</th>
                    <th className="p-4">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {logs.map((log) => (
                    <tr key={log.id} className="group transition-colors hover:bg-white/2">
                      <td className="whitespace-nowrap p-4 pl-6 text-sm text-text-muted">
                        {dayjs(log.completedAt).format("MMM D, HH:mm")}
                      </td>
                      <td className="p-4 font-bold text-text-main">{log.title}</td>
                      <td className="p-4 text-center">
                        {log.status === "done" ? (
                          <span className="text-emerald-500" title="Completed">
                            ✓
                          </span>
                        ) : (
                          <span className="text-red-500" title={`Logged as ${log.status}`}>
                            ✕
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-text-muted">
                        {log.dream ? (
                          <span className="flex flex-col">
                            <span className="font-medium text-text-main">
                              {log.dream.title}
                            </span>
                            {log.dream.category ? (
                              <span className="text-[10px] uppercase opacity-70">
                                {log.dream.category}
                              </span>
                            ) : null}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-widest ${
                            log.priority === "urgent"
                              ? "border-red-500/30 bg-red-500/5 text-red-500"
                              : log.priority === "high"
                                ? "border-amber-500/30 bg-amber-500/5 text-amber-500"
                                : log.priority === "medium"
                                  ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-500"
                                  : "border-blue-500/30 bg-blue-500/5 text-blue-400"
                          }`}
                        >
                          {log.priority}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {log.tags.length > 0 ? (
                            log.tags.map((tag) => (
                              <span
                                key={`${log.id}-${tag}`}
                                className="rounded-md bg-white/5 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-text-muted"
                              >
                                #{tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-text-muted/60">-</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-text-muted">
                        {log.note ? (
                          <span className="line-clamp-1 cursor-pointer hover:text-brand-primary">
                            {log.note.title}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="p-4 font-mono text-sm text-brand-accent">
                        {log.duration ? `${log.duration}m` : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {view === "heatmap" ? (
          <div className="glass flex min-h-[24rem] flex-col rounded-[2rem] border border-white/5 p-6">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold font-display text-text-main">
                  Activity Heatmap
                </h2>
                <p className="mt-1 max-w-xl text-sm text-text-muted">
                  Higher intensity means more completed tasks and stronger
                  productivity scores on that day.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {summaries.map((sum) => (
                <div key={sum.id || sum.date} className="flex flex-col items-center gap-2">
                  <div
                    title={`${dayjs(sum.date).format("MMM D")}: ${sum.completedTasks} tasks / Score ${sum.productivityScore || 0}`}
                    className={`h-12 w-12 rounded-xl border border-white/5 transition-transform hover:scale-110 ${
                      (sum.productivityScore || 0) > 80
                        ? "bg-amber-500 shadow-lg shadow-amber-500/20"
                        : (sum.productivityScore || 0) > 50
                          ? "bg-emerald-500/70"
                          : (sum.productivityScore || 0) > 20
                            ? "bg-emerald-500/35"
                            : "bg-white/5"
                    }`}
                  />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                    {dayjs(sum.date).format("DD")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {view === "replay" ? (
          <div className="grid gap-4">
            {replayGroups.length > 0 ? (
              replayGroups.map(([date, dayLogs]) => (
                <div
                  key={date}
                  className="rounded-[2rem] border border-white/10 bg-white/5 p-6"
                >
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-300">
                        Replay Day
                      </p>
                      <h2 className="mt-1 text-xl font-bold text-text-main">
                        {dayjs(date).format("dddd, MMMM D")}
                      </h2>
                    </div>
                    <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-text-main">
                      {dayLogs.length} completion{dayLogs.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {dayLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <p className="font-semibold text-text-main">{log.title}</p>
                          <p className="mt-1 text-xs text-text-muted">
                            {dayjs(log.completedAt).format("HH:mm")}
                            {log.tags.length > 0 ? ` • ${log.tags.map((tag) => `#${tag}`).join(" ")}` : ""}
                          </p>
                        </div>
                        <span className="font-mono text-sm text-brand-accent">
                          {log.duration ? `${log.duration}m` : "time n/a"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="glass flex min-h-[20rem] flex-col items-center justify-center rounded-[2rem] border border-white/5 p-8 text-center">
                <FiAlertCircle className="text-text-muted" size={28} />
                <h2 className="mt-4 text-xl font-bold text-text-main">
                  Replay needs more history
                </h2>
                <p className="mt-2 max-w-md text-sm text-text-muted">
                  Once more tasks are completed and logged, the ledger will
                  reconstruct your execution rhythm day by day here.
                </p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-text-muted">
          {label}
        </span>
        <span className="text-brand-primary">{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-black tracking-tight text-text-main">{value}</p>
      <p className="mt-2 text-xs leading-relaxed text-text-muted">{hint}</p>
    </div>
  );
}

function InsightStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
        <span className="text-brand-primary">{icon}</span>
        <span>{label}</span>
      </div>
      <p className="mt-3 text-sm font-semibold leading-relaxed text-text-main">{value}</p>
    </div>
  );
}

function InsightList({
  title,
  items,
  emptyLabel,
  tone,
}: {
  title: string;
  items: string[];
  emptyLabel: string;
  tone: "warning" | "positive";
}) {
  const toneClass =
    tone === "warning"
      ? "border-amber-500/20 bg-amber-500/5 text-amber-100"
      : "border-emerald-500/20 bg-emerald-500/5 text-emerald-100";

  return (
    <div>
      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-text-muted">
        {title}
      </p>
      <div className="mt-3 space-y-2">
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={`${title}-${item}`}
              className={`rounded-2xl border px-4 py-3 text-sm leading-relaxed ${toneClass}`}
            >
              {item}
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-text-muted">
            {emptyLabel}
          </div>
        )}
      </div>
    </div>
  );
}
