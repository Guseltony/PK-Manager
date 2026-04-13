"use client";

import { useState } from "react";
import { FiPlus, FiZap } from "react-icons/fi";
import { useTasks } from "../../hooks/useTasks";

export default function TaskQuickAdd() {
  const [title, setTitle] = useState("");
  const { createTask, isCreating } = useTasks();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      createTask({ title: title.trim() }, {
        onSuccess: () => setTitle(""),
      });
    }
  };

  return (
    <div className="p-4 bg-surface-base sticky top-0 z-10 border-b border-white/5">
      <form onSubmit={handleSubmit} className="relative group max-w-4xl mx-auto">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <FiPlus className="h-4 w-4 text-text-muted group-focus-within:text-brand-primary transition-colors" />
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done? Enter task title..."
          className="w-full bg-surface-soft border border-white/5 rounded-2xl py-3 pl-11 pr-28 text-sm text-text-main placeholder:text-text-muted transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/40 shadow-inner"
        />
        <div className="absolute inset-y-0 right-3 flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-surface-base border border-white/5">
                <FiZap size={12} className="text-amber-400 animate-pulse" />
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">
                  Smart Add
                </span>
            </div>
            <button 
                type="submit"
                disabled={isCreating || !title.trim()}
                className="bg-brand-primary text-white text-[11px] font-bold px-4 py-1.5 rounded-xl hover:bg-brand-primary/90 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 shadow-lg shadow-brand-primary/20"
            >
                {isCreating ? "..." : "Create"}
            </button>
        </div>
      </form>
    </div>
  );
}
