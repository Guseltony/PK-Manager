"use client";

import { useMemo, useState } from "react";
import type { ComponentType } from "react";
import { FiActivity, FiAlertCircle, FiCompass, FiTarget, FiTrendingUp, FiZap } from "react-icons/fi";
import { motion } from "framer-motion";
import { useInsights } from "../../hooks/useInsights";
import { InsightRecord, InsightType } from "../../types/insight";

const tabs: Array<{ id: "all" | InsightType; label: string; icon: ComponentType<{ className?: string }> }> = [
  { id: "all", label: "All", icon: FiTrendingUp },
  { id: "productivity", label: "Productivity", icon: FiZap },
  { id: "behavior", label: "Behavior", icon: FiActivity },
  { id: "goal_progress", label: "Goals", icon: FiTarget },
  { id: "focus", label: "Focus", icon: FiCompass },
  { id: "emotional", label: "Emotional", icon: FiAlertCircle },
];

export default function InsightsPage() {
  const [activeTab, setActiveTab] = useState<"all" | InsightType>("all");
  const { data, isLoading } = useInsights(activeTab === "all" ? undefined : activeTab);

  const spotlight = useMemo(() => data?.insights[0] ?? null, [data]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 md:px-6">
      <section className="rounded-[28px] border border-white/10 bg-surface-soft p-6 shadow-2xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-primary">
              Behavior Intelligence Engine
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-white">Insights</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-text-muted">
              This page interprets what is happening across your work, focus, reflection, and goals, then turns those patterns into practical guidance.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <MetricCard label="Insights" value={data?.totals.totalInsights || 0} />
            <MetricCard label="Top Signal" value={spotlight?.type?.replace("_", " ") || "waiting"} />
            <MetricCard label="Priority" value={spotlight ? `${Math.round(spotlight.confidence * 100)}%` : "0%"} />
          </div>
        </div>
      </section>

      {spotlight ? (
        <section className="rounded-[28px] border border-brand-primary/20 bg-brand-primary/10 p-6">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-primary">Behavior Mirror</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white">{spotlight.title}</h2>
              <p className="mt-3 text-sm leading-7 text-text-main">{spotlight.description}</p>
              <p className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-text-main">
                {data?.topRecommendation}
              </p>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">Why this exists</p>
              <div className="mt-4 space-y-3">
                {spotlight.evidence.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-text-main">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="rounded-[28px] border border-white/10 bg-surface-soft p-6">
        <div className="flex flex-wrap gap-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-xs font-black uppercase tracking-[0.18em] transition ${
                activeTab === id
                  ? "border-brand-primary/30 bg-brand-primary text-black"
                  : "border-white/10 bg-black/20 text-text-muted hover:text-text-main"
              }`}
            >
              <Icon className="text-sm" />
              {label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4">
          {isLoading
            ? Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-44 animate-pulse rounded-[24px] border border-white/10 bg-black/20" />
              ))
            : data?.insights.map((insight, index) => (
                <InsightCard key={insight.id} insight={insight} index={index} />
              )) ?? null}
        </div>
      </section>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">{label}</p>
      <p className="mt-2 text-xl font-black text-white capitalize">{value}</p>
    </div>
  );
}

function InsightCard({ insight, index }: { insight: InsightRecord; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-[24px] border border-white/10 bg-black/20 p-5"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-brand-primary">
            {insight.type.replace("_", " ")}
          </div>
          <h3 className="mt-4 text-xl font-black tracking-tight text-white">{insight.title}</h3>
          <p className="mt-3 text-sm leading-7 text-text-muted">{insight.description}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">Confidence</p>
          <p className="mt-2 text-lg font-black text-white">{Math.round(insight.confidence * 100)}%</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">Evidence</p>
          <div className="mt-3 space-y-2">
            {insight.evidence.map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-main">
                {item}
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">Recommendation</p>
          <div className="mt-3 rounded-2xl border border-brand-primary/20 bg-brand-primary/10 p-4 text-sm leading-7 text-text-main">
            {insight.recommendation}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
