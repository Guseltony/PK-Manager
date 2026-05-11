"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FiAnchor, FiAward, FiBook, FiShield, FiTarget, FiZap, FiEdit3, FiX, FiCheck } from "react-icons/fi";
import * as FiIcons from "react-icons/fi";
import { useConstitution, Constitution, ConstitutionPillar } from "@/src/hooks/useConstitution";
import { useHabits } from "@/src/hooks/useHabits";
import dayjs from "dayjs";

export default function ConstitutionPage() {
  const { constitution, isLoading, updateConstitution } = useConstitution();
  const { habits } = useHabits();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Constitution | null>(null);

  if (isLoading) {
    return <div className="p-8 text-center text-text-muted animate-pulse">Loading Constitution...</div>;
  }

  if (!constitution) {
    return <div className="p-8 text-center text-text-muted">Failed to load Constitution.</div>;
  }

  const handleEdit = () => {
    setEditForm(constitution);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editForm) return;
    updateConstitution.mutate(editForm, {
      onSuccess: () => setIsEditing(false)
    });
  };

  if (isEditing && editForm) {
    return (
      <div className="w-full space-y-8 px-4 py-8 sm:px-6 md:px-8">
        <div className="mx-auto max-w-4xl space-y-8 rounded-[2rem] border border-white/10 bg-surface-soft p-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Edit Constitution</h2>
            <div className="flex gap-3">
              <button onClick={() => setIsEditing(false)} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-text-muted hover:bg-white/5">Cancel</button>
              <button onClick={handleSave} className="flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-sm font-bold text-white hover:brightness-110">
                <FiCheck /> Save
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-text-muted">Title</label>
              <input type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full mt-1 rounded-xl border border-white/10 bg-black/20 p-3 text-white focus:border-brand-primary focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-text-muted">Phase</label>
              <input type="text" value={editForm.phase} onChange={e => setEditForm({...editForm, phase: e.target.value})} className="w-full mt-1 rounded-xl border border-white/10 bg-black/20 p-3 text-white focus:border-brand-primary focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-text-muted">Mission</label>
              <textarea rows={3} value={editForm.mission} onChange={e => setEditForm({...editForm, mission: e.target.value})} className="w-full mt-1 rounded-xl border border-white/10 bg-black/20 p-3 text-white focus:border-brand-primary focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-text-muted">Vision (Legacy)</label>
              <textarea rows={3} value={editForm.vision} onChange={e => setEditForm({...editForm, vision: e.target.value})} className="w-full mt-1 rounded-xl border border-white/10 bg-black/20 p-3 text-white focus:border-brand-primary focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-text-muted mb-1 block">Non-Negotiables (One per line)</label>
              <textarea rows={5} value={editForm.nonNegotiables.join('\n')} onChange={e => setEditForm({...editForm, nonNegotiables: e.target.value.split('\n').filter(Boolean)})} className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-white focus:border-brand-primary focus:outline-none" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 px-4 py-8 sm:px-6 md:px-8">
      <div className="mx-auto max-w-4xl space-y-12 relative">
        <button onClick={handleEdit} className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-text-muted hover:bg-white/10 hover:text-white transition">
          <FiEdit3 />
        </button>

        {/* Header */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] border border-white/10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-primary/20 via-black/40 to-black/80 p-8 text-center sm:p-12 shadow-2xl"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary/20 text-brand-primary mb-6 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
            <FiBook size={32} />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-brand-primary">
            {constitution.phase}
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-white sm:text-6xl">
            {constitution.title}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-text-muted">
            This is your anchor. This is the blueprint for rebuilding before the legacy can exist globally. Read this when emotions fluctuate.
          </p>
        </motion.section>

        {/* Mission & Vision */}
        <div className="grid gap-6 md:grid-cols-2">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-[2rem] border border-brand-primary/20 bg-brand-primary/5 p-6 backdrop-blur-xl sm:p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <FiTarget className="text-brand-primary" size={24} />
              <h2 className="text-xl font-bold text-white">The Mission</h2>
            </div>
            <p className="text-base leading-8 text-brand-primary/90 font-medium whitespace-pre-wrap">
              {constitution.mission || "Define your mission..."}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-[2rem] border border-emerald-400/20 bg-emerald-400/5 p-6 backdrop-blur-xl sm:p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <FiZap className="text-emerald-400" size={24} />
              <h2 className="text-xl font-bold text-white">The Legacy</h2>
            </div>
            <p className="text-base leading-8 text-emerald-100/80 font-medium whitespace-pre-wrap">
              {constitution.vision || "Define your 10-year vision..."}
            </p>
          </motion.div>
        </div>

        {/* The Pillars */}
        {constitution.pillars && constitution.pillars.length > 0 && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <h2 className="text-center text-xs font-black uppercase tracking-[0.2em] text-text-muted">
              The {constitution.pillars.length} Pillars
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {constitution.pillars.map((pillar: ConstitutionPillar, index: number) => {
                const IconComponent = (FiIcons as Record<string, React.ElementType>)[pillar.icon] || FiIcons.FiCheckCircle;
                return (
                  <div 
                    key={index} 
                    className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-surface-soft p-6 transition hover:border-white/20 hover:bg-white/5"
                  >
                    <div className={`mb-4 inline-flex rounded-xl bg-black/40 p-3 ${pillar.color}`}>
                      <IconComponent size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{pillar.name}</h3>
                    <p className="text-sm leading-6 text-text-muted group-hover:text-text-main transition-colors mb-4">
                      {pillar.desc}
                    </p>
                    
                    {/* Linked Habits UI */}
                    {(() => {
                      const linkedHabits = habits.filter(h => h.pillarName === pillar.name);
                      if (linkedHabits.length === 0) return null;
                      
                      return (
                        <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted">Execution Anchor</h4>
                          {linkedHabits.map(habit => {
                            const today = dayjs().startOf('day');
                            const past7Days = Array.from({ length: 7 }).map((_, i) => today.subtract(6 - i, 'day'));
                            const completedCount = past7Days.filter(date => habit.logs.some(l => l.completed && dayjs(l.date).isSame(date, 'day'))).length;
                            const progress = (completedCount / 7) * 100;
                            
                            return (
                              <div key={habit.id} className="bg-black/20 rounded-xl p-3">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-xs font-bold text-white/90">{habit.title}</span>
                                  <span className="text-[10px] text-text-muted">{completedCount}/7 Days</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${pillar.color.replace('text-', 'bg-')} transition-all`} 
                                    style={{ width: `${progress}%` }} 
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* Non-Negotiables */}
        {constitution.nonNegotiables && constitution.nonNegotiables.length > 0 && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-[2rem] border border-rose-500/20 bg-rose-500/5 p-6 sm:p-10"
          >
            <div className="flex items-center gap-3 mb-8">
              <FiShield className="text-rose-400" size={28} />
              <h2 className="text-2xl font-bold text-white">The Non-Negotiables</h2>
            </div>
            <ul className="space-y-6">
              {constitution.nonNegotiables.map((rule: string, idx: number) => (
                <li key={idx} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-xs font-black text-rose-300">
                    {idx + 1}
                  </span>
                  <p className="text-base leading-8 text-rose-100/90 font-medium pt-1">
                    {rule}
                  </p>
                </li>
              ))}
            </ul>
          </motion.section>
        )}

        <div className="pb-12 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-white/30 font-bold">
            &quot;Roots are invisible before trees become visible.&quot;
          </p>
        </div>
      </div>
    </div>
  );
}
