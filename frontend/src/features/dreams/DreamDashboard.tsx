"use client";

import { IconType } from "react-icons";
import { useState } from "react";
import { useDreams, Dream } from "../../hooks/useDreams";
import DreamCard from "./DreamCard";
import { FiPlus, FiStar, FiActivity, FiCheckCircle, FiTarget } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function DreamDashboard() {
  const { dreams, isLoading, createDream, isCreating } = useDreams();
  const [showCreate, setShowCreate] = useState(false);

  // Stats
  const activeDreams = dreams.filter(d => d.status === "active").length;
  const completedDreams = dreams.filter(d => d.status === "completed").length;
  const avgProgress = dreams.length > 0 
    ? Math.round(dreams.reduce((acc, d) => acc + d.progress, 0) / dreams.length) 
    : 0;

  if (isLoading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <FiStar className="text-brand-primary animate-spin" size={32} />
          <p className="text-text-muted text-sm font-medium animate-pulse uppercase tracking-widest">
            Aligning your ambitions...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-surface-base">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Header Perspective */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-display font-black text-text-main mb-2 tracking-tight">
              DREAMS <span className="text-brand-primary">&</span> GOALS
            </h1>
            <p className="text-text-muted text-sm max-w-lg leading-relaxed">
              Connect your long-term vision to daily execution. Use the Goal Intelligence Engine to track progress and maintain momentum.
            </p>
          </div>
          <button 
            onClick={() => setShowCreate(true)}
            className="flex w-full sm:w-auto items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <FiPlus size={16} /> New Ambition
          </button>
        </header>

        {/* Intelligence Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <MetricCard 
            label="Total Ambitions" 
            value={dreams.length} 
            icon={FiTarget} 
            color="text-brand-primary" 
          />
          <MetricCard 
            label="Active Focus" 
            value={activeDreams} 
            icon={FiActivity} 
            color="text-amber-400" 
          />
          <MetricCard 
            label="Finalized" 
            value={completedDreams} 
            icon={FiCheckCircle} 
            color="text-emerald-400" 
          />
          <MetricCard 
            label="System Velocity" 
            value={`${avgProgress}%`} 
            icon={FiStar} 
            color="text-brand-accent" 
          />
        </div>

        {/* Dreams Grid */}
        {dreams.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
              <FiStar size={40} className="text-text-muted/20" />
            </div>
            <h3 className="text-xl font-bold text-text-main mb-2">The Canvas is Empty</h3>
            <p className="text-text-muted text-sm max-w-xs mb-8">
              Start by defining your first long-term ambition. The system will help you break it down.
            </p>
            <button 
              onClick={() => setShowCreate(true)}
              className="text-brand-primary font-bold text-xs uppercase tracking-widest hover:underline"
            >
              Initialize First Dream
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dreams.map((dream) => (
              <DreamCard key={dream.id} dream={dream} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreate && (
          <CreateDreamModal onClose={() => setShowCreate(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: IconType;
  color: string;
}

function MetricCard({ label, value, icon: Icon, color }: MetricCardProps) {
  return (
    <div className="glass p-6 rounded-3xl border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
      <div>
        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">
          {label}
        </p>
        <p className="text-2xl font-display font-bold text-text-main group-hover:scale-110 origin-left transition-transform">
          {value}
        </p>
      </div>
      <div className={`p-3 rounded-2xl bg-white/5 ${color}`}>
        <Icon size={20} />
      </div>
    </div>
  );
}

interface CreateDreamModalProps {
  onClose: () => void;
}

function CreateDreamModal({ onClose }: CreateDreamModalProps) {
  const { createDream, isCreating } = useDreams();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    category: "",
    targetDate: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createDream(formData as Partial<Dream>, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-surface-soft border border-white/10 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl"
      >
        <div className="p-8 border-b border-white/5 bg-linear-to-br from-brand-primary/5 to-transparent">
          <h2 className="text-2xl font-display font-bold text-text-main">
            DEFY GRAVITY
          </h2>
          <p className="text-text-muted text-xs uppercase tracking-widest mt-1">
            Initialize New Strategic Goal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-1">
              Goal Title
            </label>
            <input
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="e.g. Master Full Stack Engineering"
              className="w-full bg-white/5 border border-white/10 rounded-2xl shadow-inner py-3 px-4 text-sm text-text-main focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/40 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-1">
                Priority Level
              </label>
              <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                {[
                  { id: 'low', label: 'Low', color: 'bg-blue-500/20 text-blue-400' },
                  { id: 'medium', label: 'Med', color: 'bg-emerald-500/20 text-emerald-400' },
                  { id: 'high', label: 'High', color: 'bg-amber-500/20 text-amber-400' },
                  { id: 'urgent', label: 'Urgent', color: 'bg-red-500/20 text-red-400' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: opt.id as "low" | "medium" | "high" | "urgent" })}
                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all relative overflow-hidden group ${
                      formData.priority === opt.id 
                        ? `${opt.color} shadow-lg shadow-black/20 scale-[1.02] z-10` 
                        : 'text-text-muted hover:text-text-main hover:bg-white/5'
                    }`}
                  >
                    {formData.priority === opt.id && (
                      <motion.div 
                        layoutId="active-priority"
                        className="absolute inset-0 border border-white/10 rounded-xl"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-1">
                Category
              </label>
              <input
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="Career, Health..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-sm text-text-main outline-none focus:border-brand-primary/40 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-1">
              Target Deadline
            </label>
            <input
              type="date"
              value={formData.targetDate}
              onChange={(e) =>
                setFormData({ ...formData, targetDate: e.target.value })
              }
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-sm text-text-main outline-none focus:border-brand-primary/40 transition-all"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] hover:text-text-main transition-colors"
            >
              Abort
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="flex-1 bg-brand-primary py-4 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-xl shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {isCreating ? "Generating..." : "Commence Mission"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
