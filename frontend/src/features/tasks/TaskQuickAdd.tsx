"use client";

import React, { useState, FormEvent } from "react";
import { FiCpu, FiLoader, FiPlus, FiZap, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useTasks } from "../../hooks/useTasks";
import { useTaskPlanner } from "../../hooks/useAI";
import { AiTaskPlan } from "../../types/ai";

export default function TaskQuickAdd() {
  const [title, setTitle] = useState("");
  const [plannerInput, setPlannerInput] = useState("");
  const [showPlanner, setShowPlanner] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [plan, setPlan] = useState<AiTaskPlan | null>(null);
  const { createTask, isCreating } = useTasks();
  const {
    planTasks,
    createSuggestedTasks,
    isPlanning,
    isCreatingSuggestedTasks,
  } = useTaskPlanner();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      createTask(
        { title: title.trim() },
        {
          onSuccess: () => {
            setTitle("");
            setIsExpanded(false);
          },
        },
      );
    }
  };

  const handlePlan = async () => {
    if (!plannerInput.trim()) return;
    const result = await planTasks({
      input: plannerInput.trim(),
      sourceType: "task_request",
    });
    setPlan(result);
  };

  const handleCreateAll = async () => {
    if (!plan?.tasks.length) return;
    await createSuggestedTasks({ tasks: plan.tasks });
    setPlannerInput("");
    setPlan(null);
    setShowPlanner(false);
    setIsExpanded(false);
  };

  return (
    <>
      {/* Mobile FAB */}
      <div className="sm:hidden fixed bottom-20 right-6 z-[60]">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary text-white shadow-2xl shadow-brand-primary/40 active:scale-90 transition-transform"
        >
          {isExpanded ? <FiX size={24} /> : <FiPlus size={24} />}
        </button>
      </div>

      {/* Mobile Input Overlay */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="sm:hidden fixed inset-0 z-[150] bg-surface-base/95 backdrop-blur-xl p-6 flex flex-col items-center justify-center"
          >
             <button 
                onClick={() => setIsExpanded(false)}
                className="absolute top-6 right-6 text-text-muted hover:text-text-main p-2"
             >
                <FiX size={24} />
             </button>

             <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-black text-white tracking-tight">New Task</h3>
                  <p className="text-sm text-text-muted font-medium">What&apos;s the objective?</p>
                </div>

                <div className="relative">
                  <input
                    autoFocus
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Type task title..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-lg text-text-main placeholder:text-text-muted/50 focus:ring-2 focus:ring-brand-primary/30 outline-none transition-all text-center"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPlanner(true);
                      setIsExpanded(false);
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-4 rounded-2xl border border-white/10 bg-white/5 text-text-main font-bold hover:bg-white/10 transition-colors"
                  >
                    <FiCpu className="text-brand-primary" /> 
                    <span className="uppercase text-[10px] tracking-widest">AI Plan</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || !title.trim()}
                    className="flex items-center justify-center bg-brand-primary text-black font-black py-4 rounded-2xl shadow-xl shadow-brand-primary/20 disabled:opacity-50"
                  >
                    {isCreating ? "..." : "CREATE"}
                  </button>
                </div>
             </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sticky Bar */}
      <div className="hidden sm:block space-y-2 bg-surface-base sticky top-0 z-10 border-b border-white/5">
        <form
          onSubmit={handleSubmit}
          className="relative group max-w-4xl mx-auto flex flex-col sm:block gap-3"
        >
          <div className="relative w-full">
            <div className="absolute top-4 md:top-0 md:inset-y-0 left-4 flex items-center pointer-events-none">
              <FiPlus className="h-4 w-4 text-text-muted group-focus-within:text-brand-primary transition-colors" />
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done? Enter task title..."
              className="w-full bg-surface-soft border border-white/5 rounded-2xl py-3 sm:py-2 pl-11 pr-4 sm:pr-28 text-sm text-text-main placeholder:text-text-muted transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/40 shadow-inner"
            />
            {/* Action buttons - Desktop absolute, Mobile flex row */}
            <div className="sm:absolute sm:inset-y-0 sm:right-3 flex items-center gap-2 mt-2 sm:mt-0 px-1 sm:px-0">
              <button
                type="button"
                onClick={() => setShowPlanner((current) => !current)}
                className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-1 rounded-lg border transition-all ${
                  showPlanner
                    ? "bg-brand-primary/15 border-brand-primary/30 text-brand-primary"
                    : "bg-surface-base border-white/5 text-text-muted hover:text-text-main"
                }`}
              >
                <FiCpu size={12} />
                <span className="text-[10px] font-bold uppercase tracking-tighter">
                  AI Plan
                </span>
              </button>
              <div className="flex items-center gap-1.5 px-2.5 sm:px-2 py-1.5 sm:py-1 rounded-lg bg-surface-base border border-white/5">
                <FiZap size={12} className="text-amber-400 animate-pulse" />
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">
                  Smart Add
                </span>
              </div>
              <button
                type="submit"
                disabled={isCreating || !title.trim()}
                className="flex-1 sm:flex-none bg-brand-primary text-white text-[11px] font-bold px-5 sm:px-4 py-2 sm:py-1.5 rounded-xl hover:bg-brand-primary/90 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 shadow-lg shadow-brand-primary/20"
              >
                {isCreating ? "..." : "Create"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {showPlanner && (
        <div className="max-w-4xl mx-auto rounded-3xl border border-white/10 bg-surface-soft/80 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-amber-400">
                AI Planner
              </p>
              <p className="mt-2 text-sm text-text-muted">
                Drop in a messy goal, request, or work block and turn it into
                real PK-Manager tasks.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowPlanner(false)}
              className="text-xs font-bold text-text-muted hover:text-text-main"
            >
              Close
            </button>
          </div>

          <textarea
            value={plannerInput}
            onChange={(e) => setPlannerInput(e.target.value)}
            placeholder="Example: launch the focus mode update, fix the dashboard polish, and prepare a short demo flow for tomorrow"
            className="mt-4 min-h-[96px] w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-text-main outline-none transition focus:border-brand-primary/30 focus:ring-2 focus:ring-brand-primary/20"
          />

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={handlePlan}
              disabled={!plannerInput.trim() || isPlanning}
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-primary px-4 py-2 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-50"
            >
              {isPlanning ? (
                <FiLoader className="animate-spin" size={14} />
              ) : (
                <FiCpu size={14} />
              )}
              Generate plan
            </button>
            {plan ? (
              <button
                type="button"
                onClick={handleCreateAll}
                disabled={isCreatingSuggestedTasks}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-text-main transition hover:bg-white/10 disabled:opacity-50"
              >
                {isCreatingSuggestedTasks ? (
                  <FiLoader className="animate-spin" size={14} />
                ) : (
                  <FiPlus size={14} />
                )}
                Create all {plan.tasks.length} tasks
              </button>
            ) : null}
          </div>

          {plan ? (
            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                {plan.summary}
              </div>
              {plan.tasks.map((task, index) => (
                <div
                  key={`${task.title}-${index}`}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                      {task.priority}
                    </span>
                    {task.estimatedTime ? (
                      <span className="text-[11px] text-text-muted">
                        {task.estimatedTime} min
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm font-bold text-text-main">
                    {task.title}
                  </p>
                  {task.description ? (
                    <p className="mt-1 text-sm text-text-muted">
                      {task.description}
                    </p>
                  ) : null}
                  {task.tags.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {task.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-brand-primary/20 bg-brand-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-primary"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </>
  );
}
