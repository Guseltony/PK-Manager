"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiBarChart2, FiRefreshCw, FiChevronDown, FiChevronUp, FiAward, FiAlertTriangle, FiZap, FiSave } from "react-icons/fi";
import dayjs from "dayjs";
import { useScorecard, MONTH_NAMES, Scorecard } from "@/src/hooks/useScorecard";

const SCORE_COLOR = (s: number) => {
  if (s >= 80) return "text-emerald-400";
  if (s >= 60) return "text-amber-400";
  if (s >= 40) return "text-orange-400";
  return "text-rose-400";
};
const SCORE_BG = (s: number) => {
  if (s >= 80) return "bg-emerald-400";
  if (s >= 60) return "bg-amber-400";
  if (s >= 40) return "bg-orange-400";
  return "bg-rose-400";
};
const GRADE = (s: number) => {
  if (s >= 90) return "S";
  if (s >= 80) return "A";
  if (s >= 70) return "B";
  if (s >= 60) return "C";
  if (s >= 50) return "D";
  return "F";
};

function ReflectionEditor({ card, onSave }: { card: Scorecard; onSave: (updates: Partial<Scorecard>) => void }) {
  const [form, setForm] = useState({
    reflection: card.reflection ?? "",
    winOfMonth: card.winOfMonth ?? "",
    missOfMonth: card.missOfMonth ?? "",
    intentNextMonth: card.intentNextMonth ?? "",
  });

  return (
    <div className="mt-6 space-y-4 border-t border-white/5 pt-6">
      <h4 className="text-xs font-black uppercase tracking-widest text-text-muted">Monthly Reflection</h4>
      {[
        { key: "winOfMonth", label: "🏆 Biggest Win", placeholder: "What went really well this month?", color: "emerald" },
        { key: "missOfMonth", label: "⚠️ Biggest Miss", placeholder: "What did you fail to execute?", color: "rose" },
        { key: "intentNextMonth", label: "⚡ Intent for Next Month", placeholder: "What is your #1 focus next month?", color: "brand-primary" },
        { key: "reflection", label: "📝 Full Reflection", placeholder: "Write your honest monthly reflection...", color: "text-muted" },
      ].map(({ key, label, placeholder }) => (
        <div key={key}>
          <label className="mb-1 block text-xs font-bold text-text-muted">{label}</label>
          <textarea
            rows={key === "reflection" ? 4 : 2}
            value={(form as Record<string, string>)[key]}
            onChange={e => setForm({ ...form, [key]: e.target.value })}
            placeholder={placeholder}
            className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white focus:border-brand-primary focus:outline-none"
          />
        </div>
      ))}
      <button
        onClick={() => onSave(form)}
        className="flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-bold text-white hover:brightness-110 transition"
      >
        <FiSave size={15} /> Save Reflection
      </button>
    </div>
  );
}

function ScorecardCard({ card, onUpdate }: { card: Scorecard; onUpdate: (updates: Partial<Scorecard>) => void }) {
  const [expanded, setExpanded] = useState(false);
  const grade = GRADE(card.overallScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-[2rem] border border-white/10 bg-surface-soft"
    >
      {/* Header */}
      <div
        className="flex cursor-pointer items-center gap-5 p-5 sm:p-6"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Grade badge */}
        <div className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl ${SCORE_BG(card.overallScore)}/20 border border-current/20`}>
          <span className={`text-2xl font-black leading-none ${SCORE_COLOR(card.overallScore)}`}>{grade}</span>
          <span className={`text-[9px] font-bold ${SCORE_COLOR(card.overallScore)}`}>{card.overallScore}%</span>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-white">{MONTH_NAMES[card.month]} {card.year}</h3>
          <p className="mt-0.5 text-xs text-text-muted">{card.pillarScores.length} Pillars tracked</p>
          {/* Mini bar */}
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
            <div
              className={`h-full ${SCORE_BG(card.overallScore)} transition-all`}
              style={{ width: `${card.overallScore}%` }}
            />
          </div>
        </div>

        {expanded ? <FiChevronUp className="text-text-muted shrink-0" /> : <FiChevronDown className="text-text-muted shrink-0" />}
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/5"
          >
            <div className="p-5 sm:p-6 space-y-4">
              {/* Pillar breakdown */}
              <h4 className="text-xs font-black uppercase tracking-widest text-text-muted">Pillar Breakdown</h4>
              <div className="space-y-3">
                {card.pillarScores.map((ps, i) => (
                  <div key={i}>
                    <div className="mb-1.5 flex justify-between items-center">
                      <span className="text-sm font-bold text-white/90">{ps.pillarName}</span>
                      <span className={`text-xs font-black ${SCORE_COLOR(ps.score)}`}>{ps.score}% · {ps.completed}/{ps.total} days</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${ps.score}%` }}
                        transition={{ duration: 0.6, delay: i * 0.1 }}
                        className={`h-full ${SCORE_BG(ps.score)}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Reflection highlights if saved */}
              {(card.winOfMonth || card.missOfMonth || card.intentNextMonth) && (
                <div className="grid gap-3 sm:grid-cols-3 pt-2">
                  {card.winOfMonth && (
                    <div className="rounded-xl bg-emerald-400/5 border border-emerald-400/10 p-3">
                      <div className="flex items-center gap-1.5 mb-1"><FiAward className="text-emerald-400" size={13} /><span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Win</span></div>
                      <p className="text-xs text-white/80">{card.winOfMonth}</p>
                    </div>
                  )}
                  {card.missOfMonth && (
                    <div className="rounded-xl bg-rose-400/5 border border-rose-400/10 p-3">
                      <div className="flex items-center gap-1.5 mb-1"><FiAlertTriangle className="text-rose-400" size={13} /><span className="text-[10px] font-black uppercase tracking-wider text-rose-400">Miss</span></div>
                      <p className="text-xs text-white/80">{card.missOfMonth}</p>
                    </div>
                  )}
                  {card.intentNextMonth && (
                    <div className="rounded-xl bg-brand-primary/5 border border-brand-primary/10 p-3">
                      <div className="flex items-center gap-1.5 mb-1"><FiZap className="text-brand-primary" size={13} /><span className="text-[10px] font-black uppercase tracking-wider text-brand-primary">Intent</span></div>
                      <p className="text-xs text-white/80">{card.intentNextMonth}</p>
                    </div>
                  )}
                </div>
              )}

              <ReflectionEditor card={card} onSave={onUpdate} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ScorecardPage() {
  const { scorecards, isLoading, generate, update } = useScorecard();
  const now = dayjs();
  const [genMonth, setGenMonth] = useState(now.month() + 1);
  const [genYear, setGenYear] = useState(now.year());

  if (isLoading) {
    return <div className="p-8 text-center text-text-muted animate-pulse">Loading Scorecards...</div>;
  }

  const handleGenerate = () => {
    generate.mutate({ month: genMonth, year: genYear });
  };

  return (
    <div className="w-full space-y-8 px-4 py-8 sm:px-6 md:px-8">
      <div className="mx-auto max-w-4xl space-y-8">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.25em] text-amber-400">
              <FiBarChart2 size={12} />
              Monthly Scorecard
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Performance Review
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-text-muted">
              Auto-generated from your habit logs. Grade yourself honestly. Reflect. Adjust. Execute better next month.
            </p>
          </div>
        </div>

        {/* Generate Card */}
        <div className="rounded-3xl border border-amber-400/20 bg-amber-400/5 p-6 backdrop-blur-xl">
          <h3 className="mb-4 font-bold text-white">Generate Scorecard</h3>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-text-muted">Month</label>
              <select
                value={genMonth}
                onChange={e => setGenMonth(Number(e.target.value))}
                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
              >
                {MONTH_NAMES.slice(1).map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-text-muted">Year</label>
              <select
                value={genYear}
                onChange={e => setGenYear(Number(e.target.value))}
                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
              >
                {[now.year() - 1, now.year(), now.year() + 1].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleGenerate}
              disabled={generate.isPending}
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-black hover:brightness-110 disabled:opacity-60 transition"
            >
              <FiRefreshCw size={15} className={generate.isPending ? "animate-spin" : ""} />
              {generate.isPending ? "Generating..." : "Generate"}
            </button>
          </div>
          <p className="mt-3 text-xs text-text-muted">This scans all your habit logs for the selected month and auto-calculates each pillar&apos;s completion rate.</p>
        </div>

        {/* Scorecard List */}
        <div className="space-y-4">
          {scorecards.map(card => (
            <ScorecardCard
              key={card.id}
              card={card}
              onUpdate={(updates) => update.mutate({ id: card.id, updates })}
            />
          ))}

          {scorecards.length === 0 && (
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-black/20 text-white/40">
                <FiBarChart2 size={28} />
              </div>
              <h3 className="mt-4 text-xl font-bold text-white">No scorecards yet</h3>
              <p className="mt-2 text-sm text-text-muted">Generate your first monthly review above to see how aligned your execution is with your Constitution.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
