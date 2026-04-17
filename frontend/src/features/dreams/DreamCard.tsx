"use client";

import { motion } from "framer-motion";
import { FiCalendar, FiActivity, FiLayers, FiChevronRight } from "react-icons/fi";
import Link from "next/link";
import { Dream } from "../../types/dream";

interface DreamCardProps {
  dream: Dream;
}

export default function DreamCard({ dream }: DreamCardProps) {
  const isUrgent = dream.priority === "urgent";
  const isHigh = dream.priority === "high";
  const isMedium = dream.priority === "medium";
  const isLow = dream.priority === "low";

  return (
    <Link href={`/dreams/${dream.id}`}>
      <motion.div
        whileHover={{ y: -5 }}
        className="glass group relative overflow-hidden rounded-xl border border-white/5 hover:border-white/10 transition-all p-6 sm:p-8 flex flex-col h-[320px] cursor-pointer"
      >
        {/* Background Accent */}
        <div className={`absolute top-0 right-0 w-32 h-32 blur-[100px] opacity-20 -mr-10 -mt-10 transition-colors duration-500 ${
          isUrgent ? "bg-red-500" : 
          isHigh ? "bg-amber-500" : 
          isMedium ? "bg-emerald-500" : 
          "bg-blue-500"
        }`} />

        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${
            isUrgent ? "border-red-500/30 text-red-500 bg-red-500/5" :
            isHigh ? "border-amber-500/30 text-amber-500 bg-amber-500/5" :
            isMedium ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/5" :
            "border-blue-500/30 text-blue-400 bg-blue-500/5"
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
                <FiLayers size={10} /> {dream.tasks?.length || 0}
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

        {/* Desktop Arrow - always visible on mobile, hover on desktop */}
        <div 
          className="absolute bottom-6 right-6 p-3 rounded-xl bg-white/5 text-text-muted group-hover:bg-brand-primary group-hover:text-white transition-all transform sm:translate-y-4 sm:opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
        >
          <FiChevronRight size={18} />
        </div>
      </motion.div>
    </Link>
  );
}
