"use client";

import { useState } from "react";
import { FiPlus, FiCheckCircle, FiCircle, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Milestone } from "../../hooks/useDreams";

interface MilestoneListProps {
  milestones: Milestone[];
  onAdd: (milestone: Partial<Milestone>) => void;
  onToggle: (id: string) => void;
}

export default function MilestoneList({ milestones, onAdd, onToggle }: MilestoneListProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAdd({ title: newTitle });
    setNewTitle("");
    setShowAdd(false);
  };

  const completedCount = milestones.filter(m => m.completed).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-xl font-bold text-text-main tracking-tight">System Milestones</h3>
          <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">
            {completedCount} / {milestones.length} Strategic steps secured
          </p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-brand-primary px-4 py-2 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest border border-white/5"
        >
          <FiPlus /> New Milestone
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {milestones.length > 0 ? (
          milestones.map((milestone, idx) => (
            <motion.div
              layout
              key={milestone.id}
              className={`p-6 rounded-3xl border transition-all flex items-center justify-between group ${
                milestone.completed 
                  ? "bg-emerald-500/5 border-emerald-500/10 text-text-muted" 
                  : "bg-white/5 border-white/5 text-text-main"
              }`}
            >
              <div className="flex items-center gap-6">
                <span className="text-[10px] font-black text-text-muted/30 uppercase tracking-[0.2em] w-6 pb-0.5 border-b border-white/10">
                  {(idx + 1).toString().padStart(2, '0')}
                </span>
                <button 
                  onClick={() => onToggle(milestone.id)}
                  className={`p-2 rounded-xl transition-all ${
                    milestone.completed 
                      ? "text-emerald-500 bg-emerald-500/10" 
                      : "text-text-muted hover:text-brand-primary hover:bg-brand-primary/10"
                  }`}
                >
                  {milestone.completed ? <FiCheckCircle size={24} /> : <FiCircle size={24} />}
                </button>
                <div className="flex flex-col">
                  <span className={`text-base font-bold tracking-tight transition-all ${milestone.completed ? 'line-through opacity-50' : ''}`}>
                    {milestone.title}
                  </span>
                  {milestone.description && (
                    <span className="text-xs text-text-muted mt-1 opacity-60 font-medium">{milestone.description}</span>
                  )}
                </div>
              </div>

               <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                 <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">W: {milestone.weight}</span>
               </div>
            </motion.div>
          ))
        ) : (
          <div className="py-20 text-center glass rounded-[2.5rem] border border-dashed border-white/10">
            <p className="text-text-muted text-sm italic">Deconstruct your ambition into actionable milestones.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
          >
            <div className="bg-surface-soft border border-white/10 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative">
              <button 
                onClick={() => setShowAdd(false)}
                className="absolute top-6 right-6 text-text-muted hover:text-text-main p-2"
              >
                <FiX size={20} />
              </button>
              <h4 className="text-xl font-display font-bold text-text-main mb-6 uppercase tracking-tight">Define Milestone</h4>
              <form onSubmit={handleSubmit} className="space-y-6">
                <input 
                  autoFocus
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Complete Advanced React Architecture"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm text-text-main focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all placeholder:text-text-muted/30"
                />
                <button 
                  type="submit"
                  className="w-full bg-brand-primary py-4 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-xl shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                  Deploy Step
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
