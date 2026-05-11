"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiAlertTriangle, FiPlus, FiTrash2, FiChevronDown, FiChevronUp, FiZap } from "react-icons/fi";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useChaos, CHAOS_CATEGORIES } from "@/src/hooks/useChaos";

dayjs.extend(relativeTime);

const SEVERITY_LABELS = ["", "Minor", "Low", "Moderate", "High", "Critical"];
const SEVERITY_COLORS = ["", "text-emerald-400", "text-sky-400", "text-amber-400", "text-orange-400", "text-rose-400"];
const SEVERITY_BG = ["", "bg-emerald-400/10", "bg-sky-400/10", "bg-amber-400/10", "bg-orange-400/10", "bg-rose-400/10"];

export default function ChaosLedgerPage() {
  const { entries, isLoading, createEntry, deleteEntry } = useChaos();
  const [isCreating, setIsCreating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    trigger: "",
    context: "",
    resolution: "",
    category: "general",
    severity: 1,
  });

  if (isLoading) {
    return <div className="p-8 text-center text-text-muted animate-pulse">Loading Chaos Ledger...</div>;
  }

  const handleSubmit = () => {
    if (!form.trigger || !form.resolution) return;
    createEntry.mutate(form, {
      onSuccess: () => {
        setIsCreating(false);
        setForm({ trigger: "", context: "", resolution: "", category: "general", severity: 1 });
      },
    });
  };

  return (
    <div className="w-full space-y-8 px-4 py-8 sm:px-6 md:px-8">
      <div className="mx-auto max-w-4xl space-y-8">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.25em] text-rose-400">
              <FiAlertTriangle size={12} />
              Chaos Ledger
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Trigger Log
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-text-muted">
              When chaos strikes — log it, analyze it, resolve it. Every trigger you document is a pattern you can break.
            </p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex shrink-0 items-center gap-2 rounded-2xl bg-rose-500 px-5 py-3 text-sm font-bold text-white transition hover:brightness-110"
          >
            <FiPlus size={18} /> Log Trigger
          </button>
        </div>

        {/* Create Form */}
        <AnimatePresence>
          {isCreating && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-3xl border border-rose-400/20 bg-rose-400/5 p-6 backdrop-blur-xl"
            >
              <h3 className="mb-6 text-lg font-bold text-white">Log a Chaos Trigger</h3>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-rose-400">What broke you? *</label>
                  <textarea
                    autoFocus
                    rows={2}
                    value={form.trigger}
                    onChange={e => setForm({ ...form, trigger: e.target.value })}
                    placeholder="e.g. Stayed up scrolling until 3 AM and missed morning routine"
                    className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white focus:border-rose-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-text-muted">Context (What was happening?)</label>
                  <textarea
                    rows={2}
                    value={form.context}
                    onChange={e => setForm({ ...form, context: e.target.value })}
                    placeholder="e.g. Was stressed about a deadline, started as 'just 5 minutes'..."
                    className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white focus:border-rose-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-emerald-400">Resolution — how will you prevent this? *</label>
                  <textarea
                    rows={2}
                    value={form.resolution}
                    onChange={e => setForm({ ...form, resolution: e.target.value })}
                    placeholder="e.g. Phone goes to grayscale at 10 PM. No exceptions."
                    className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-text-muted">Category</label>
                    <select
                      value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white focus:border-rose-400 focus:outline-none"
                    >
                      {CHAOS_CATEGORIES.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-text-muted">Severity: {SEVERITY_LABELS[form.severity]}</label>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={form.severity}
                      onChange={e => setForm({ ...form, severity: parseInt(e.target.value) })}
                      className="w-full accent-rose-500 mt-3"
                    />
                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-text-muted mt-1">
                      <span>Minor</span><span>Critical</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setIsCreating(false)} className="rounded-xl px-4 py-2 text-sm text-text-muted hover:bg-white/5">Cancel</button>
                <button
                  onClick={handleSubmit}
                  disabled={!form.trigger || !form.resolution || createEntry.isPending}
                  className="rounded-xl bg-rose-500 px-5 py-2 text-sm font-bold text-white hover:brightness-110 disabled:opacity-50"
                >
                  {createEntry.isPending ? "Logging..." : "Log It"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Entries */}
        <div className="space-y-3">
          {entries.map(entry => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-surface-soft"
            >
              <div
                className="flex cursor-pointer items-center gap-4 p-4 sm:p-5"
                onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${SEVERITY_BG[entry.severity]}`}>
                  <FiAlertTriangle className={SEVERITY_COLORS[entry.severity]} size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">{entry.trigger}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${SEVERITY_BG[entry.severity]} ${SEVERITY_COLORS[entry.severity]}`}>
                      {SEVERITY_LABELS[entry.severity]}
                    </span>
                    <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                      {CHAOS_CATEGORIES.find(c => c.value === entry.category)?.label ?? entry.category}
                    </span>
                    <span className="text-[11px] text-text-muted">{dayjs(entry.createdAt).fromNow()}</span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={e => { e.stopPropagation(); deleteEntry.mutate(entry.id); }}
                    className="rounded-lg p-1.5 text-text-muted opacity-0 hover:bg-rose-500/10 hover:text-rose-400 group-hover:opacity-100 transition"
                  >
                    <FiTrash2 size={15} />
                  </button>
                  {expandedId === entry.id ? <FiChevronUp size={16} className="text-text-muted" /> : <FiChevronDown size={16} className="text-text-muted" />}
                </div>
              </div>

              <AnimatePresence>
                {expandedId === entry.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/5 overflow-hidden"
                  >
                    <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
                      {entry.context && (
                        <div>
                          <h4 className="mb-1 text-[10px] font-black uppercase tracking-widest text-text-muted">Context</h4>
                          <p className="text-sm leading-relaxed text-text-muted">{entry.context}</p>
                        </div>
                      )}
                      <div>
                        <h4 className="mb-1 text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1">
                          <FiZap size={10} /> Resolution
                        </h4>
                        <p className="text-sm leading-relaxed text-white/90">{entry.resolution}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}

          {entries.length === 0 && !isCreating && (
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-black/20 text-white/40">
                <FiAlertTriangle size={28} />
              </div>
              <h3 className="mt-4 text-xl font-bold text-white">No triggers logged</h3>
              <p className="mt-2 text-sm text-text-muted">When chaos strikes, document it here. Every pattern you name is a pattern you can break.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
