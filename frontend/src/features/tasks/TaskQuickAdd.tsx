"use client";

import { useState } from "react";
import { FiCpu, FiLoader, FiPlus, FiZap } from "react-icons/fi";
import { useTasks } from "../../hooks/useTasks";
import { useTaskPlanner } from "../../hooks/useAI";
import { AiTaskPlan } from "../../types/ai";

export default function TaskQuickAdd() {
  const [title, setTitle] = useState("");
  const [plannerInput, setPlannerInput] = useState("");
  const [showPlanner, setShowPlanner] = useState(false);
  const [plan, setPlan] = useState<AiTaskPlan | null>(null);
  const { createTask, isCreating } = useTasks();
  const {
    planTasks,
    createSuggestedTasks,
    isPlanning,
    isCreatingSuggestedTasks,
  } = useTaskPlanner();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      createTask({ title: title.trim() }, {
        onSuccess: () => setTitle(""),
      });
    }
  };

  const handlePlan = async () => {
    if (!plannerInput.trim()) return;
    const result = await planTasks({ input: plannerInput.trim(), sourceType: "task_request" });
    setPlan(result);
  };

  const handleCreateAll = async () => {
    if (!plan?.tasks.length) return;
    await createSuggestedTasks({ tasks: plan.tasks });
    setPlannerInput("");
    setPlan(null);
    setShowPlanner(false);
  };

  return (
    <div className="space-y-4 bg-surface-base sticky top-0 z-10 border-b border-white/5">
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
            <button
              type="button"
              onClick={() => setShowPlanner((current) => !current)}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg border transition-all ${showPlanner ? "bg-brand-primary/15 border-brand-primary/30 text-brand-primary" : "bg-surface-base border-white/5 text-text-muted hover:text-text-main"}`}
            >
              <FiCpu size={12} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">
                AI Plan
              </span>
            </button>
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

      {showPlanner && (
        <div className="max-w-4xl mx-auto rounded-3xl border border-white/10 bg-surface-soft/80 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-amber-400">AI Planner</p>
              <p className="mt-2 text-sm text-text-muted">
                Drop in a messy goal, request, or work block and turn it into real PK-Manager tasks.
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
              {isPlanning ? <FiLoader className="animate-spin" size={14} /> : <FiCpu size={14} />}
              Generate plan
            </button>
            {plan ? (
              <button
                type="button"
                onClick={handleCreateAll}
                disabled={isCreatingSuggestedTasks}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-text-main transition hover:bg-white/10 disabled:opacity-50"
              >
                {isCreatingSuggestedTasks ? <FiLoader className="animate-spin" size={14} /> : <FiPlus size={14} />}
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
                <div key={`${task.title}-${index}`} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                      {task.priority}
                    </span>
                    {task.estimatedTime ? (
                      <span className="text-[11px] text-text-muted">{task.estimatedTime} min</span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm font-bold text-text-main">{task.title}</p>
                  {task.description ? <p className="mt-1 text-sm text-text-muted">{task.description}</p> : null}
                  {task.tags.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {task.tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-brand-primary/20 bg-brand-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-primary">
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
    </div>
  );
}
