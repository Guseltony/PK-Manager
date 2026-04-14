"use client";

import { useTasksStore } from "@/src/store/tasksStore";
import { useState } from "react";
import TaskListView from "./TaskListView";
import TaskDetailView from "./TaskDetailView";
import TaskQuickAdd from "./TaskQuickAdd";
import { 
  FiClock, 
  FiCalendar, 
  FiAlertCircle, 
  FiCheckCircle, 
  FiZap, 
  FiStar,
  FiList,
  FiArrowLeft
} from "react-icons/fi";

const filters = [
  { id: "all", label: "All Tasks", icon: FiList },
  { id: "today", label: "Today", icon: FiClock },
  { id: "upcoming", label: "Upcoming", icon: FiCalendar },
  { id: "overdue", label: "Overdue", icon: FiAlertCircle, color: "text-brand-accent" },
  { id: "completed", label: "Completed", icon: FiCheckCircle },
  { id: "focus", label: "Focus", icon: FiZap, color: "text-amber-400" },
  { id: "high-priority", label: "Priority", icon: FiStar, color: "text-brand-primary" },
];

export default function TasksPageContent() {
  const { selectedTaskId, setSelectedTaskId } = useTasksStore();
  const [filter, setFilter] = useState("all");

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-surface-base relative">
      {/* Top Filter Tabs - Ledger Style */}
      <div className="w-full bg-surface-soft border-b border-white/5 px-4 sm:px-8 py-4 shrink-0 overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-2 min-w-max">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  filter === f.id
                    ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
                    : "text-text-muted hover:text-text-main hover:bg-white/5"
                }`}
              >
                <f.icon className={filter === f.id ? "text-white" : f.color || ""} size={14} />
                {f.label}
              </button>
            ))}
          </div>
          
          <div className="h-6 w-px bg-white/10 mx-2" />
          
          <div className="flex items-center gap-2 bg-amber-400/10 px-3 py-2 rounded-xl border border-amber-400/20">
            <FiZap className="text-amber-400" size={12} />
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">AI Optimized</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Main Engine: Execution Layer */}
        <div className={`flex-1 flex flex-col relative ${selectedTaskId ? "hidden lg:flex" : "flex"}`}>
          <div className="px-4 py-4 sm:px-8 sm:py-6 border-b border-white/5">
            <TaskQuickAdd />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-8 py-2">
            <TaskListView
              activeFilter={filter}
              selectedTaskId={selectedTaskId}
              onTaskSelect={setSelectedTaskId}
            />
          </div>
        </div>

        {/* Right Layer: Deep Context & Analytics */}
        {selectedTaskId && (
          <TaskDetailView
            taskId={selectedTaskId}
            onClose={() => setSelectedTaskId(null)}
          />
        )}
      </div>
    </div>
  );
}
