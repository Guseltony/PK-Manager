"use client";

import { useState } from "react";
import { useDream } from "../../hooks/useDreams";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiCircle,
  FiPlus,
  FiActivity,
  FiLayers,
  FiBook,
  FiCpu,
  FiAlertTriangle,
  FiZap,
  FiStar,
  FiTarget,
} from "react-icons/fi";
import { IconType } from "react-icons";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import MilestoneList from "./MilestoneList";
// import MilestoneList from "./MilestoneList";

interface DreamDetailViewProps {
  id: string;
}

export default function DreamDetailView({ id }: DreamDetailViewProps) {
  const { dream, isLoading, addMilestone, toggleMilestone } = useDream(id);
  const [activeTab, setActiveTab] = useState("execution");

  if (isLoading) return <LoadingState />;
  if (!dream) return <NotFoundState />;

  const isAtRisk = dream.healthScore < 50;
  const isAccelerating = dream.healthScore > 80 && dream.progress > 20;

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-surface-base">
      <div className="max-w-7xl mx-auto p-8">
        {/* Navigation / Control */}
        <div className="flex items-center justify-between mb-12">
          <Link
            href="/dreams"
            className="group flex items-center gap-2 text-text-muted hover:text-text-main transition-colors font-bold text-[10px] uppercase tracking-widest"
          >
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />{" "}
            Back to Dashboard
          </Link>
          <div className="flex gap-4">
            <StatusBadge status={dream.status} />
          </div>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-full border border-brand-primary/30 bg-brand-primary/5 text-brand-primary text-[10px] font-black uppercase tracking-widest">
                  {dream.category || "Inception"}
                </span>
                <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-text-muted text-[10px] font-black uppercase tracking-widest">
                  {dream.priority} PRIORITY
                </span>
              </div>
              <h1 className="text-5xl font-display font-black text-text-main mb-4 tracking-tighter">
                {dream.title}
              </h1>
              <p className="text-xl text-text-muted leading-relaxed font-medium">
                {dream.description ||
                  "No description provided for this mission."}
              </p>
            </div>

            {/* System Intelligence Indicators */}
            <div className="flex flex-wrap gap-4 pt-4">
              <IntelligenceBadge
                label="Goal Health"
                value={`${Math.round(dream.healthScore)}%`}
                icon={isAtRisk ? FiAlertTriangle : FiZap}
                color={
                  isAtRisk
                    ? "text-red-400 bg-red-400/5"
                    : "text-brand-accent bg-brand-accent/5"
                }
              />
              <IntelligenceBadge
                label="Completion Delta"
                value="On Track"
                icon={FiActivity}
                color="text-emerald-400 bg-emerald-400/5"
              />
              {isAccelerating && (
                <IntelligenceBadge
                  label="Momentum"
                  value="Accelerating"
                  icon={FiZap}
                  color="text-brand-primary bg-brand-primary/5 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                />
              )}
            </div>
          </div>

          {/* Progress Orbital Card */}
          <div className="glass p-8 rounded-[3rem] border border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-brand-primary/5 blur-3xl rounded-full scale-150 group-hover:bg-brand-primary/10 transition-colors" />
            <div className="relative z-10">
              <div className="mb-6 relative inline-block">
                <svg className="w-40 h-40" viewBox="0 0 100 100">
                  <circle
                    className="text-white/5 stroke-current"
                    strokeWidth="8"
                    fill="transparent"
                    r="42"
                    cx="50"
                    cy="50"
                  />
                  <motion.circle
                    className="text-brand-primary stroke-current"
                    strokeWidth="8"
                    strokeLinecap="round"
                    fill="transparent"
                    r="42"
                    cx="50"
                    cy="50"
                    strokeDasharray="263.89"
                    initial={{ strokeDashoffset: 263.89 }}
                    animate={{
                      strokeDashoffset:
                        263.89 - (263.89 * dream.progress) / 100,
                    }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center mt-1">
                  <span className="text-4xl font-display font-black text-text-main leading-none">
                    {Math.round(dream.progress)}
                  </span>
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mt-1">
                    % DONE
                  </span>
                </div>
              </div>
              <h3 className="text-sm font-black text-text-main uppercase tracking-widest mb-1">
                Mission Progress
              </h3>
              <p className="text-xs text-text-muted">
                Targeting{" "}
                {dream.targetDate
                  ? new Date(dream.targetDate).toLocaleDateString()
                  : "Undated"}
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Navigation */}
        <div className="flex items-center gap-2 mb-8 bg-white/5 p-1.5 rounded-2xl w-fit border border-white/5">
          <TabButton
            id="execution"
            label="Execution"
            icon={FiLayers}
            active={activeTab}
            onClick={setActiveTab}
          />
          <TabButton
            id="milestones"
            label="Milestones"
            icon={FiActivity}
            active={activeTab}
            onClick={setActiveTab}
          />
          <TabButton
            id="knowledge"
            label="Knowledge"
            icon={FiBook}
            active={activeTab}
            onClick={setActiveTab}
          />
          <TabButton
            id="intelligence"
            label="Intelligence"
            icon={FiCpu}
            active={activeTab}
            onClick={setActiveTab}
          />
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="min-h-100"
          >
            {activeTab === "execution" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-text-main">
                    Linked Mission Tasks
                  </h3>
                  <button className="flex items-center gap-2 text-brand-primary font-bold text-xs uppercase tracking-widest hover:text-brand-accent transition-colors">
                    <FiPlus /> Deploy New Task
                  </button>
                </div>
                {dream.tasks && dream.tasks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dream.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-5 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 hover:border-white/10 transition-all group overflow-hidden relative"
                      >
                        <div
                          className={`absolute top-0 left-0 bottom-0 w-1 transition-all ${task.status === "done" ? "bg-emerald-500" : "bg-amber-500"}`}
                        />
                        <div
                          className={`p-2 rounded-xl bg-white/5 ${task.status === "done" ? "text-emerald-500" : "text-amber-500"}`}
                        >
                          {task.status === "done" ? (
                            <FiCheckCircle />
                          ) : (
                            <FiCircle />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-bold truncate ${task.status === "done" ? "text-text-muted line-through" : "text-text-main"}`}
                          >
                            {task.title}
                          </p>
                          <p className="text-[10px] uppercase font-black tracking-widest text-text-muted mt-0.5">
                            {task.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center glass rounded-[2.5rem] border border-dashed border-white/10">
                    <p className="text-text-muted text-sm italic">
                      No tasks currently linked to this mission orbit.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "milestones" && (
              <MilestoneList
                milestones={dream.milestones || []}
                onAdd={(m) => addMilestone(m)}
                onToggle={(id) => toggleMilestone(id)}
              />
            )}

            {activeTab === "knowledge" && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-text-main px-1">
                  Linked Knowledge Nodes
                </h3>
                {dream.notes && dream.notes.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dream.notes.map((note) => (
                      <Link
                        key={note.id}
                        href={`/notes/${note.id}`}
                        className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-brand-primary/20 transition-all group"
                      >
                        <FiBook className="text-brand-primary mb-4" size={24} />
                        <h4 className="font-bold text-text-main mb-2 line-clamp-2">
                          {note.title}
                        </h4>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                          Modified{" "}
                          {new Date(note.updatedAt).toLocaleDateString()}
                        </p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center glass rounded-[2.5rem] border border-dashed border-white/10">
                    <p className="text-text-muted text-sm italic">
                      No knowledge nodes linked to this goal yet.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "intelligence" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-text-main flex items-center gap-2">
                    <FiZap className="text-brand-primary" /> AI SENSORS
                  </h3>
                  <div className="space-y-4">
                    <InsightCard
                      type="prediction"
                      message="Completion estimated for June 20, 2026 based on current velocity."
                    />
                    <InsightCard
                      type="warning"
                      message="Activity frequency dropped by 14% over the last 7 cycles."
                    />
                    <InsightCard
                      type="suggestion"
                      message="Link 3 more relevant notes to increase system intelligence index."
                    />
                  </div>
                </div>
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-text-main flex items-center gap-2">
                    <FiActivity className="text-brand-accent" /> RECENT
                    MANEUVERS
                  </h3>
                  <div className="space-y-4">
                    {dream.activities?.map((activity) => (
                      <div key={activity.id} className="flex gap-4 group">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-brand-primary shrink-0" />
                          <div className="w-0.5 flex-1 bg-white/10 group-last:hidden" />
                        </div>
                        <div className="pb-8">
                          <p className="text-xs text-text-main font-bold capitalize tracking-tight">
                            {activity.action.replace("_", " ")}
                          </p>
                          <p className="text-[10px] text-text-muted uppercase font-black tracking-widest mt-1">
                            {new Date(activity.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

interface TabButtonProps {
  id: string;
  label: string;
  icon: IconType;
  active: string;
  onClick: (id: string) => void;
}

function TabButton({ id, label, icon: Icon, active, onClick }: TabButtonProps) {
  const isActive = active === id;
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest ${
        isActive
          ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
          : "text-text-muted hover:text-text-main hover:bg-white/5"
      }`}
    >
      <Icon size={14} /> {label}
    </button>
  );
}

interface IntelligenceBadgeProps {
  label: string;
  value: string;
  icon: IconType;
  color: string;
}

function IntelligenceBadge({
  label,
  value,
  icon: Icon,
  color,
}: IntelligenceBadgeProps) {
  return (
    <div
      className={`flex items-center gap-3 px-5 py-3 rounded-2xl border border-white/5 ${color} transition-all`}
    >
      <Icon size={16} />
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none opacity-60">
          {label}
        </span>
        <span className="text-sm font-black tracking-tight mt-0.5">
          {value}
        </span>
      </div>
    </div>
  );
}

interface InsightCardProps {
  type: "prediction" | "warning" | "suggestion";
  message: string;
}

function InsightCard({ type, message }: InsightCardProps) {
  const colors = {
    prediction: "border-brand-primary/30 bg-brand-primary/5 text-text-main",
    warning: "border-amber-500/30 bg-amber-500/5 text-text-main",
    suggestion: "border-emerald-500/30 bg-emerald-500/5 text-text-main",
  };
  return (
    <div
      className={`p-5 rounded-2xl border ${colors[type]} flex items-start gap-4 transition-all hover:scale-[1.01]`}
    >
      <div className={`mt-0.5 p-2 rounded-lg bg-white/5`}>
        {type === "prediction" ? (
          <FiZap />
        ) : type === "warning" ? (
          <FiAlertTriangle />
        ) : (
          <FiCpu />
        )}
      </div>
      <p className="text-sm font-medium leading-relaxed">{message}</p>
    </div>
  );
}

interface StatusBadgeProps {
  status: "active" | "paused" | "completed";
}

function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    paused: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    completed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  };
  return (
    <span
      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="flex-1 p-8 flex items-center justify-center bg-surface-base">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-white/5 border-t-brand-primary animate-spin" />
          <FiStar className="absolute inset-0 m-auto text-brand-primary opacity-50" size={20} />
        </div>
        <p className="text-text-muted text-xs uppercase font-black tracking-widest animate-pulse">Syncing Mission Data...</p>
      </div>
    </div>
  );
}

function NotFoundState() {
  return (
    <div className="flex-1 p-8 flex items-center justify-center bg-surface-base">
      <div className="text-center">
        <FiTarget size={64} className="mx-auto text-text-muted/20 mb-6" />
        <h2 className="text-3xl font-black text-text-main mb-4 uppercase tracking-tighter">Mission Scoped Not Found</h2>
        <Link href="/dreams" className="text-brand-primary font-bold text-sm uppercase tracking-widest hover:underline">Return to Dashboard</Link>
      </div>
    </div>
  );
}
