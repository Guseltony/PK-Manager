"use client";

import { useDreams } from "../../hooks/useDreams";
import { 
  FiTarget, 
  FiActivity, 
  FiCheckCircle, 
  FiZap, 
  FiStar,
  FiPlus,
  FiX
} from "react-icons/fi";
import DreamCard from "./DreamCard";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconType } from "react-icons";

export default function DreamDashboard() {
  const { dreams, isLoading } = useDreams();
  const [showCreate, setShowCreate] = useState(false);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-surface-base">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
          <p className="text-text-muted font-bold text-xs uppercase tracking-widest">
            Synchronizing Ambitions...
          </p>
        </div>
      </div>
    );
  }

  const activeDreams = dreams.filter((d) => d.status !== "completed").length;
  const completedDreams = dreams.filter((d) => d.status === "completed").length;
  const avgProgress = dreams.length > 0 
    ? Math.round(dreams.reduce((acc, current) => acc + current.progress, 0) / dreams.length) 
    : 0;

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-surface-base">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-brand-primary uppercase tracking-[0.2em] font-bold text-[10px] mb-1">
              Executive View
            </p>
            <h1 className="text-4xl sm:text-5xl font-display font-black text-text-main tracking-tighter">
              Ambition <span className="text-brand-primary">Control</span>
            </h1>
          </div>
          <button 
            onClick={() => setShowCreate(true)}
            className="flex w-full sm:w-auto items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <FiPlus size={16} /> New Ambition
          </button>
        </header>

        {/* Intelligence Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
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
    <div className="glass p-3 sm:p-4 rounded-xl border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
      <div>
        <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">
          {label}
        </p>
        <p className="text-lg sm:text-xl font-display font-bold text-text-main group-hover:scale-105 origin-left transition-transform">
          {value}
        </p>
      </div>
      <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
        <Icon size={16} />
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
    category: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    targetDate: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    createDream({
      ...formData,
      status: "active",
      progress: 0,
      healthScore: 100,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl bg-surface-soft border border-white/10 rounded-xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-display font-bold text-text-main flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-brand-primary/20 flex items-center justify-center text-brand-primary">
               <FiPlus />
             </div>
             Initialize Ambition
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-main">
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-1">
              Ambition Title
            </label>
            <input
              autoFocus
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="e.g. Master Spatial Computing"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-lg text-text-main font-bold outline-none focus:border-brand-primary transition-all placeholder:text-text-muted/20"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-1">
              Descriptive Intent
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Define the scope and desired outcome..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-text-muted outline-none focus:border-brand-primary/40 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-1">
                Priority Level
              </label>
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
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
                    className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all relative overflow-hidden group ${
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
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-text-main outline-none focus:border-brand-primary/40 transition-all"
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
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-text-main outline-none focus:border-brand-primary/40 transition-all"
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
              disabled={isCreating || !formData.title}
              className="flex-[2] py-4 bg-brand-primary text-white rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
            >
              {isCreating ? "Deploying..." : "Commit Ambition"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
