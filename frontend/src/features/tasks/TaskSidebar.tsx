"use client";

import { 
  FiClock, 
  FiCalendar, 
  FiAlertCircle, 
  FiCheckCircle, 
  FiZap, 
  FiStar,
  FiList
} from "react-icons/fi";

interface TaskSidebarProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const filters = [
  { id: "all", label: "All Tasks", icon: FiList },
  { id: "today", label: "Today", icon: FiClock },
  { id: "upcoming", label: "Upcoming", icon: FiCalendar },
  { id: "overdue", label: "Overdue", icon: FiAlertCircle, color: "text-brand-accent" },
  { id: "completed", label: "Completed", icon: FiCheckCircle },
];

const smartLists = [
  { id: "focus", label: "Focus Mode", icon: FiZap, color: "text-amber-400" },
  { id: "high-priority", label: "High Priority", icon: FiStar, color: "text-brand-primary" },
];

export default function TaskSidebar({ activeFilter, onFilterChange }: TaskSidebarProps) {
  return (
    <div className="hidden md:flex flex-col w-56 lg:w-64 p-4 bg-surface-soft border-r border-white/5 shrink-0">
      <div className="mb-8">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted/50 px-2 mb-3">
          Status Filters
        </h3>
        <nav className="space-y-1">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => onFilterChange(f.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                activeFilter === f.id
                  ? "bg-brand-primary/10 text-brand-primary"
                  : "text-text-muted hover:bg-white/5 hover:text-text-main"
              }`}
            >
              <f.icon className={`transition-transform duration-200 group-hover:scale-110 ${activeFilter === f.id ? "text-brand-primary" : f.color || ""}`} size={16} />
              {f.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mb-8">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted/50 px-2 mb-3">
          Intelligence Views
        </h3>
        <nav className="space-y-1">
          {smartLists.map((s) => (
            <button
              key={s.id}
              onClick={() => onFilterChange(s.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                activeFilter === s.id
                  ? "bg-brand-primary/10 text-brand-primary"
                  : "text-text-muted hover:bg-white/5 hover:text-text-main"
              }`}
            >
              <s.icon className={`transition-transform duration-200 group-hover:scale-110 ${activeFilter === s.id ? "text-brand-primary" : s.color || ""}`} size={16} />
              {s.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-4 rounded-2xl bg-linear-to-br from-brand-primary/10 to-transparent border border-brand-primary/10 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-lg bg-amber-400/20 flex items-center justify-center">
            <FiZap className="text-amber-400 text-xs" />
          </div>
          <p className="text-xs text-text-main font-semibold">AI Insights</p>
        </div>
        <p className="text-[10px] text-text-muted leading-relaxed">
          Your execution patterns are being analyzed to suggest optimal focus times.
        </p>
      </div>
    </div>
  );
}
