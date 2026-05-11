"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { FiCheck, FiPlus, FiTrash2, FiTarget, FiActivity } from "react-icons/fi";
import * as FiIcons from "react-icons/fi";
import { useHabits } from "@/src/hooks/useHabits";
import { useConstitution } from "@/src/hooks/useConstitution";

export default function HabitsPage() {
  const { constitution } = useConstitution();
  const { habits, isLoading, toggleLog, createHabit, deleteHabit } = useHabits();
  const [isCreating, setIsCreating] = useState(false);
  const [newHabit, setNewHabit] = useState({ title: "", description: "", color: "text-brand-primary", pillarName: "" });

  const colors = ["text-brand-primary", "text-emerald-400", "text-amber-400", "text-rose-400", "text-sky-400", "text-purple-400"];

  // Generate last 30 days
  const today = dayjs().startOf('day');
  const pastDays = Array.from({ length: 30 }).map((_, i) => today.subtract(29 - i, 'day'));

  if (isLoading) {
    return <div className="p-8 text-center text-text-muted animate-pulse">Loading Streak Engine...</div>;
  }

  const handleToggle = (habitId: string, date: string, isCompleted: boolean) => {
    toggleLog.mutate({ id: habitId, date, completed: !isCompleted });
  };

  const handleCreate = () => {
    if (!newHabit.title) return;
    createHabit.mutate({ ...newHabit, icon: "FiCheckCircle" }, {
      onSuccess: () => {
        setIsCreating(false);
        setNewHabit({ title: "", description: "", color: "text-brand-primary", pillarName: "" });
      }
    });
  };

  return (
    <div className="w-full space-y-8 px-4 py-8 sm:px-6 md:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.25em] text-emerald-400">
              <FiActivity size={12} />
              Streak Engine
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Habits & Consistency
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-text-muted">
              Systems over motivation. Track your daily non-negotiables and visually build your foundation streaks. No zero days.
            </p>
          </div>
          <button 
            onClick={() => setIsCreating(true)}
            className="flex shrink-0 items-center gap-2 rounded-2xl bg-brand-primary px-5 py-3 text-sm font-bold text-white transition hover:brightness-110"
          >
            <FiPlus size={18} /> Add Habit
          </button>
        </div>

        {/* Create Form */}
        {isCreating && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-white/10 bg-surface-soft p-6">
            <h3 className="mb-4 text-lg font-bold text-white">New Foundation Habit</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold text-text-muted">Habit Name</label>
                <input autoFocus type="text" value={newHabit.title} onChange={e => setNewHabit({...newHabit, title: e.target.value})} placeholder="e.g. Code for 3 hours" className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-white focus:border-brand-primary focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-text-muted">Description (Optional)</label>
                <input type="text" value={newHabit.description} onChange={e => setNewHabit({...newHabit, description: e.target.value})} placeholder="Why is this important?" className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-white focus:border-brand-primary focus:outline-none" />
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-bold text-text-muted">Color</label>
                <div className="flex gap-2">
                  {colors.map(c => (
                    <button key={c} onClick={() => setNewHabit({...newHabit, color: c})} className={`h-8 w-8 rounded-full border-2 ${newHabit.color === c ? 'border-white' : 'border-transparent'} ${c.replace('text-', 'bg-').replace('-400', '-500').replace('text-brand-primary', 'bg-brand-primary')}`} />
                  ))}
                </div>
              </div>
              {constitution && constitution.pillars && constitution.pillars.length > 0 && (
                <div>
                  <label className="mb-2 block text-xs font-bold text-text-muted">Link to Pillar (Optional)</label>
                  <select 
                    value={newHabit.pillarName} 
                    onChange={e => setNewHabit({...newHabit, pillarName: e.target.value})}
                    className="w-full rounded-xl border border-white/10 bg-black/20 p-2 text-sm text-white focus:border-brand-primary focus:outline-none"
                  >
                    <option value="">-- No Link --</option>
                    {constitution.pillars.map((p, i) => (
                      <option key={i} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsCreating(false)} className="rounded-xl px-4 py-2 text-sm text-text-muted hover:bg-white/5">Cancel</button>
              <button onClick={handleCreate} disabled={!newHabit.title} className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-black hover:bg-white/90 disabled:opacity-50">Create</button>
            </div>
          </motion.div>
        )}

        {/* Heatmaps */}
        <div className="space-y-6">
          {habits.map((habit) => {
            const IconComponent = (FiIcons as Record<string, React.ElementType>)[habit.icon] || FiCheck;
            const habitColorBg = habit.color.replace('text-', 'bg-').replace('-400', '-500').replace('text-brand-primary', 'bg-brand-primary');
            
            return (
              <motion.div 
                key={habit.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="group overflow-hidden rounded-[2rem] border border-white/10 bg-surface-soft p-5 sm:p-6"
              >
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-black/40 ${habit.color}`}>
                      <IconComponent size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        {habit.title}
                        {habit.pillarName && (
                          <span className="text-[10px] uppercase tracking-wider bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-text-muted">
                            {habit.pillarName}
                          </span>
                        )}
                      </h3>
                      {habit.description && <p className="text-sm text-text-muted">{habit.description}</p>}
                    </div>
                  </div>
                  <button onClick={() => deleteHabit.mutate(habit.id)} className="rounded-xl p-2 text-text-muted opacity-0 transition hover:bg-rose-500/10 hover:text-rose-400 group-hover:opacity-100">
                    <FiTrash2 size={18} />
                  </button>
                </div>

                <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
                  <div className="flex min-w-max gap-1 sm:gap-2">
                    {pastDays.map(date => {
                      const dateStr = date.toISOString();
                      const isCompleted = habit.logs.some(l => l.completed && dayjs(l.date).isSame(date, 'day'));
                      const isToday = date.isSame(today, 'day');
                      
                      return (
                        <button
                          key={dateStr}
                          onClick={() => handleToggle(habit.id, dateStr, isCompleted)}
                          className={`relative h-10 w-10 shrink-0 rounded-xl transition-all hover:scale-110 sm:h-12 sm:w-12 sm:rounded-2xl ${
                            isCompleted 
                              ? `${habitColorBg} shadow-[0_0_15px_rgba(255,255,255,0.1)]` 
                              : `bg-black/40 hover:bg-white/10 ${isToday ? 'border-2 border-white/20' : 'border border-transparent'}`
                          }`}
                          title={date.format("MMM D, YYYY")}
                        >
                          {isCompleted && (
                            <div className="absolute inset-0 flex items-center justify-center text-white/90">
                              <FiCheck size={16} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex justify-between px-1 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                    <span>30 days ago</span>
                    <span>Today</span>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {habits.length === 0 && !isCreating && (
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-black/20 text-white/40">
                <FiTarget size={28} />
              </div>
              <h3 className="mt-4 text-xl font-bold text-white">No habits yet</h3>
              <p className="mt-2 text-sm text-text-muted">Create your first foundation habit to start tracking your streaks.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
