"use client";

import { motion } from "framer-motion";
import { FiCalendar, FiActivity, FiLayers, FiChevronRight } from "react-icons/fi";
import Link from "next/link";

export default function DreamCard({ dream }) {
  const isUrgent = dream.priority === "urgent";
  const isHigh = dream.priority === "high";

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="glass group relative overflow-hidden rounded-[2.5rem] border border-white/5 hover:border-white/10 transition-all p-8 flex flex-col h-[320px]"
    >
      {/* Background Accent */}
      <div className={`absolute top-0 right-0 w-32 h-32 blur-[100px] opacity-20 -mr-10 -mt-10 transition-colors duration-500 ${
        isUrgent ? "bg-red-500" : isHigh ? "bg-amber-500" : "bg-brand-primary"
      }`} />

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${
          isUrgent ? "border-red-500/30 text-red-500 bg-red-500/5" :
          isHigh ? "border-amber-500/30 text-amber-500 bg-amber-500/5" :
          "border-white/10 text-text-muted bg-white/5"
        }`}>
          {dream.priority}
        </span>
        {dream.category && (
          <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.1em]">
            {dream.category}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-xl font-display font-bold text-text-main line-clamp-2 group-hover:text-brand-primary transition-colors mb-2">
          {dream.title}
        </h3>
        <p className="text-text-muted text-xs line-clamp-3 leading-relaxed">
          {dream.description || "Take a step toward this long-term ambition. The system will help you track execution velocity."}
        </p>
      </div>

      {/* Progress Section */}
      <div className="mt-8 space-y-4">
        <div className="flex items-end justify-between">
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-text-muted uppercase tracking-widest">
              <FiLayers size={10} /> {dream.tasks?.length || 0} Tasks
            </div>
            {dream.targetDate && (
              <div className="flex items-center gap-1.5 text-[10px] font-black text-text-muted uppercase tracking-widest">
                <FiCalendar size={10} /> {new Date(dream.targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </div>
            )}
          </div>
          <span className="text-sm font-display font-black text-text-main">
            {Math.round(dream.progress)}%
          </span>
        </div>
        
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${dream.progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${
              isUrgent ? "bg-linear-to-r from-red-500 to-red-400" : 
              isHigh ? "bg-linear-to-r from-amber-500 to-amber-400" : 
              "bg-linear-to-r from-brand-primary to-brand-accent"
            }`}
          />
        </div>
      </div>

      {/* Action Overlay */}
      <Link 
        href={`/dreams/${dream.id}`}
        className="absolute bottom-6 right-6 p-4 rounded-2xl bg-white/5 text-text-muted group-hover:bg-brand-primary group-hover:text-white transition-all transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
      >
        <FiChevronRight size={20} />
      </Link>
    </motion.div>
  );
}
