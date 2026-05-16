"use client";

import { useMemo, useState } from "react";
import type { ComponentType } from "react";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import {
  FiActivity,
  FiAlertTriangle,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiLayers,
  FiLoader,
  FiPlus,
  FiTarget,
  FiTrendingUp,
  FiZap,
} from "react-icons/fi";
import { useDreams } from "../../hooks/useDreams";
import { useProjects } from "../../hooks/useProjects";
import { useTasks } from "../../hooks/useTasks";
import type { ProjectStatus } from "../../types/project";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

const projectStatuses: ProjectStatus[] = [
  "not_started",
  "in_progress",
  "completed",
  "paused",
];

const statusTone: Record<ProjectStatus, string> = {
  not_started: "border-border bg-surface-mutes/50 text-text-muted",
  in_progress: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  completed: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  paused: "border-sky-400/30 bg-sky-400/10 text-sky-200",
};

export default function ProjectsPage() {
  const { dreams } = useDreams();
  const { tasks } = useTasks();
  const {
    projects,
    isLoading,
    createProject,
    updateProjectAsync,
    generateProjectsAsync,
    isCreating,
    isGenerating,
  } = useProjects();

  const [selectedDreamId, setSelectedDreamId] = useState<string>("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [draft, setDraft] = useState({
    title: "",
    description: "",
    dreamId: "",
  });

  const filteredProjects = useMemo(
    () =>
      projects.filter(
        (project) =>
          selectedDreamId === "all" || project.dreamId === selectedDreamId,
      ),
    [projects, selectedDreamId],
  );

  const orphanTasks = tasks.filter(
    (task) => !task.projectId && task.status !== "done",
  );
  const projectsMissingNearTermTasks = projects.filter((project) =>
    project.tasks.every((task) => {
      if (task.status === "done" || !task.dueDate) {
        return true;
      }

      return !dayjs(task.dueDate).isBefore(dayjs().add(7, "day"), "day");
    }),
  ).length;
  const healthyCount = projects.filter(
    (project) => project.health.state === "healthy",
  ).length;
  const atRiskCount = projects.filter(
    (project) => project.health.state !== "healthy",
  ).length;
  const avgProgress = projects.length
    ? Math.round(
        projects.reduce((sum, project) => sum + project.progress, 0) /
          projects.length,
      )
    : 0;

  const handleCreateProject = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.title.trim() || !draft.dreamId) {
      return;
    }

    createProject(
      {
        title: draft.title.trim(),
        description: draft.description.trim() || null,
        dreamId: draft.dreamId,
      },
      {
        onSuccess: () => {
          setDraft({ title: "", description: "", dreamId: "" });
          setShowCreateForm(false);
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 md:px-6">
      <section className="overflow-hidden rounded-2xl sm:rounded-[32px] border border-border bg-surface-soft shadow-2xl">
        <div className="bg-linear-to-r from-brand-primary/18 via-white/0 to-brand-accent/15 px-4 sm:px-6 py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-brand-primary">
                Execution Structure Layer
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-white md:text-5xl">
                Projects
              </h1>
              <p className="mt-3 text-sm leading-7 text-text-muted">
                Projects turn dreams into structured execution units. This layer
                groups related tasks, reveals stalled systems, and keeps
                mid-range progress visible.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <StatCard
                label="Projects"
                value={projects.length}
                icon={FiLayers}
              />
              <StatCard
                label="Healthy"
                value={healthyCount}
                icon={FiCheckCircle}
              />
              <StatCard
                label="At Risk"
                value={atRiskCount}
                icon={FiAlertTriangle}
              />
              <StatCard
                label="Velocity"
                value={`${avgProgress}%`}
                icon={FiTrendingUp}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <div className="flex flex-col">
          {showCreateForm ? (
            <form
              onSubmit={handleCreateProject}
              className="flex-1 rounded-2xl sm:rounded-[28px] border border-border bg-surface-soft p-4 sm:p-6 animate-in fade-in slide-in-from-top-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-brand-primary/15 p-3 text-brand-primary">
                    <FiPlus />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">
                      Create execution
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="text-text-muted hover:text-white transition"
                >
                  Cancel
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <input
                  value={draft.title}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  placeholder="Example: Build portfolio API"
                  className="w-full rounded-2xl border border-border bg-surface-mutes/20 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-primary/30"
                />
                <textarea
                  value={draft.description}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Scope, outcome, etc."
                  rows={2}
                  className="w-full rounded-2xl border border-border bg-surface-mutes/20 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-primary/30"
                />
                <Select
                  value={draft.dreamId}
                  onValueChange={(value) =>
                    setDraft((current) => ({
                      ...current,
                      dreamId: value,
                    }))
                  }
                >
                  <SelectTrigger className="w-full rounded-2xl border border-border bg-surface-mutes/20 px-4 py-4 text-sm text-white outline-none transition focus:border-brand-primary/30">
                    <SelectValue placeholder="Select parent dream" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border border-border bg-surface-soft text-white">
                    {dreams.map((dream) => (
                      <SelectItem 
                        key={dream.id} 
                        value={dream.id}
                        className="rounded-xl hover:bg-surface-mutes/50 focus:bg-white/10 transition-colors"
                      >
                        {dream.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <button
                type="submit"
                disabled={isCreating || !draft.title.trim() || !draft.dreamId}
                className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-brand-primary px-5 py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-50 w-full justify-center"
              >
                {isCreating ? (
                  <FiLoader className="animate-spin" size={14} />
                ) : (
                  <FiPlus size={14} />
                )}
                Create project
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex-1 w-full rounded-2xl sm:rounded-[28px] border border-dashed border-border bg-surface-soft p-6 flex flex-col items-center justify-center text-center hover:bg-surface-mutes/50 transition"
            >
              <div className="rounded-full bg-brand-primary/10 p-4 text-brand-primary mb-4">
                <FiPlus size={24} />
              </div>
              <h2 className="text-xl font-black text-white">New Project</h2>
              <p className="mt-2 text-sm text-text-muted max-w-sm">
                Manually structure a new execution lane for your tasks.
              </p>
            </button>
          )}
        </div>

        <div className="flex flex-col rounded-2xl sm:rounded-[28px] border border-border bg-surface-soft p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-primary">
                AI Project Generator
              </p>
              <h2 className="mt-1 text-xl font-black text-white">
                Break dreams
              </h2>
              <p className="mt-2 text-sm leading-7 text-text-muted">
                Select a dream to generate structured projects.
              </p>
            </div>
            <div className="rounded-2xl bg-brand-accent/10 p-3 text-brand-accent">
              <FiZap />
            </div>
          </div>

          <div className="mt-auto pt-5 flex gap-2">
            <Select
              value={selectedDreamId !== "all" ? selectedDreamId : ""}
              onValueChange={(val) => val && generateProjectsAsync({ dreamId: val, persist: true })}
            >
              <SelectTrigger className="w-full rounded-2xl border border-border bg-surface-mutes/20 px-4 py-4 text-sm text-white outline-none transition focus:border-brand-primary/30">
                <SelectValue placeholder="Select a dream to analyze..." />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border border-border bg-surface-soft text-white">
                {dreams.map((dream) => (
                  <SelectItem 
                    key={dream.id} 
                    value={dream.id}
                    className="rounded-xl hover:bg-surface-mutes/50 focus:bg-white/10"
                  >
                    {dream.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col rounded-2xl sm:rounded-[28px] border border-amber-400/20 bg-amber-400/10 p-4 sm:p-6">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">
            Task Context Gap
          </p>
          <h3 className="mt-2 text-xl font-black text-white">
            {orphanTasks.length} orphan tasks
          </h3>
          <p className="mt-2 text-sm leading-7 text-amber-100/80">
            {projectsMissingNearTermTasks > 0 
              ? `${projectsMissingNearTermTasks} projects have no upcoming tasks.`
              : "Projects act as the preferred execution context."}
          </p>
          
          <div className="mt-auto pt-5">
            {orphanTasks.length > 0 && (
              <button 
                onClick={() => alert("Quick assign modal would open here!")}
                className="w-full rounded-xl bg-amber-400 text-amber-950 font-bold py-3 text-sm transition hover:bg-amber-300"
              >
                Organize Orphan Tasks
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-border bg-surface-soft p-4 sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-primary">
                Project Control Board
              </p>
              <h2 className="mt-1 text-2xl font-black text-white">
                Live execution blueprints
              </h2>
            </div>

            <Select
              value={selectedDreamId}
              onValueChange={setSelectedDreamId}
            >
              <SelectTrigger className="w-full md:w-[220px] rounded-2xl border border-border bg-surface-mutes/20 px-4 py-6 text-sm text-white outline-none transition focus:border-brand-primary/30">
                <SelectValue placeholder="Filter by dream" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border border-border bg-surface-soft text-white">
                <SelectItem value="all" className="rounded-xl hover:bg-surface-mutes/50 focus:bg-white/10">All dreams</SelectItem>
                {dreams.map((dream) => (
                  <SelectItem 
                    key={dream.id} 
                    value={dream.id}
                    className="rounded-xl hover:bg-surface-mutes/50 focus:bg-white/10"
                  >
                    {dream.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
            {isLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-48 animate-pulse rounded-[26px] border border-border bg-surface-mutes/20"
                  />
                ))
              : filteredProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="rounded-2xl border border-border bg-surface-mutes/20 p-4 sm:p-6 flex flex-col"
                  >
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="max-w-3xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${statusTone[project.status]}`}
                          >
                            {project.status.replace("_", " ")}
                          </span>
                          <span className="rounded-full border border-border bg-surface-mutes/50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                            {project.dream.title}
                          </span>
                          {project.health.flags.map((flag) => (
                            <span
                              key={flag}
                              className="rounded-full border border-brand-accent/20 bg-brand-accent/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-rose-200"
                            >
                              {flag}
                            </span>
                          ))}
                        </div>

                        <h3 className="mt-4 text-2xl font-black tracking-tight text-white">
                          {project.title}
                        </h3>
                        <p className="mt-3 text-sm leading-7 text-text-muted line-clamp-2">
                          {project.description ||
                            "This project is the structured execution layer translating the parent dream into practical work."}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {projectStatuses.map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() =>
                              updateProjectAsync({
                                id: project.id,
                                updates: { status },
                              })
                            }
                            className={`rounded-2xl border px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] transition ${
                              project.status === status
                                ? "border-brand-primary/30 bg-brand-primary/15 text-brand-primary"
                                : "border-border bg-surface-mutes/50 text-text-muted hover:text-white"
                            }`}
                          >
                            {status.replace("_", " ")}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                      <div className="rounded-[22px] border border-border bg-surface-mutes/50 p-4 flex flex-col justify-center">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                            Progress
                          </p>
                          <p className="text-lg font-black text-white">
                            {project.progress}%
                          </p>
                        </div>
                        <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-linear-to-r from-brand-primary to-brand-accent"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                          <MiniMetric
                            label="Total"
                            value={project.taskSummary.total}
                          />
                          <MiniMetric
                            label="Done"
                            value={project.taskSummary.completed}
                          />
                          <MiniMetric
                            label="Active"
                            value={project.taskSummary.active}
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <SignalCard
                          icon={FiClock}
                          label="Stalled Days"
                          value={project.stalledDays}
                        />
                        <SignalCard
                          icon={FiActivity}
                          label="Health"
                          value={project.health.state}
                        />
                      </div>
                    </div>

                    <div className="mt-auto pt-5">
                      {project.tasks.length ? (
                        <div className="rounded-2xl border border-border bg-surface-mutes/50 p-4 flex items-center justify-between">
                            <span className="text-sm font-bold text-white">{project.tasks.length} active tasks inside</span>
                            <button className="text-xs text-brand-primary font-bold hover:underline">View All</button>
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-border bg-surface-mutes/50 px-4 py-4 text-center text-sm text-text-muted">
                          No tasks linked yet.
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}

            {!isLoading && filteredProjects.length === 0 ? (
              <div className="col-span-full rounded-[26px] border border-dashed border-border bg-surface-mutes/20 px-6 py-12 text-center">
                <p className="text-lg font-black text-white">No projects yet</p>
                <p className="mt-2 text-sm text-text-muted">
                  Create one manually or generate structure from a dream to
                  establish the bridge between vision and task execution.
                </p>
              </div>
            ) : null}
          </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface-mutes/20 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
          {label}
        </p>
        <Icon className="text-brand-primary" />
      </div>
      <p className="mt-3 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface-mutes/20 px-3 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-text-muted">
        {label}
      </p>
      <p className="mt-1 text-lg font-black text-white">{value}</p>
    </div>
  );
}

function SignalCard({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-[22px] border border-border bg-surface-mutes/50 p-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-text-muted">
          {label}
        </p>
        <Icon className="text-brand-primary" />
      </div>
      <p className="mt-3 text-base font-black capitalize text-white">{value}</p>
    </div>
  );
}
