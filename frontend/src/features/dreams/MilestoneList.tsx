"use client";

import { useMemo, useState } from "react";
import {
  FiAlertTriangle,
  FiBook,
  FiCheckCircle,
  FiCircle,
  FiLayers,
  FiPlus,
  FiSettings,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "../../components/ui/Modal";
import type {
  DreamNote,
  Milestone,
  MilestoneArchitectureMap,
} from "../../types/dream";
import type { Task } from "../../types/task";

interface MilestoneListProps {
  milestones: Milestone[];
  tasks: Task[];
  notes: DreamNote[];
  architectureMap: MilestoneArchitectureMap;
  onAdd: (milestone: Partial<Milestone>) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => Promise<void> | void;
  onSaveArchitecture: (
    milestoneId: string,
    updates: {
      taskIds: string[];
      noteIds: string[];
      requireLinkedTasksComplete: boolean;
      requireNotesOnLinkedTasks: boolean;
    },
  ) => void;
  isDeleting?: boolean;
}

type BlockerSummary = {
  incompleteTasks: Task[];
  tasksWithoutNotes: Task[];
};

function taskHasReferenceNotes(task: Task) {
  return Boolean(task.noteId || task.note || task.notes?.length);
}

function getArchitectureForMilestone(
  milestoneId: string,
  architectureMap: MilestoneArchitectureMap,
) {
  return (
    architectureMap[milestoneId] || {
      milestoneId,
      taskIds: [],
      noteIds: [],
      requireLinkedTasksComplete: true,
      requireNotesOnLinkedTasks: false,
    }
  );
}

function getMilestoneBlockers(
  linkedTasks: Task[],
  requireLinkedTasksComplete: boolean,
  requireNotesOnLinkedTasks: boolean,
): BlockerSummary {
  return {
    incompleteTasks: requireLinkedTasksComplete
      ? linkedTasks.filter((task) => task.status !== "done")
      : [],
    tasksWithoutNotes: requireNotesOnLinkedTasks
      ? linkedTasks.filter((task) => !taskHasReferenceNotes(task))
      : [],
  };
}

export default function MilestoneList({
  milestones,
  tasks,
  notes,
  architectureMap,
  onAdd,
  onToggle,
  onDelete,
  onSaveArchitecture,
  isDeleting = false,
}: MilestoneListProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [activeMilestoneId, setActiveMilestoneId] = useState<string | null>(
    null,
  );
  const [blockedMilestoneId, setBlockedMilestoneId] = useState<string | null>(
    null,
  );

  const activeMilestone = useMemo(
    () => milestones.find((milestone) => milestone.id === activeMilestoneId) || null,
    [activeMilestoneId, milestones],
  );

  const activeArchitecture = activeMilestone
    ? getArchitectureForMilestone(activeMilestone.id, architectureMap)
    : null;

  const activeLinkedTasks = useMemo(
    () =>
      activeArchitecture
        ? tasks.filter((task) => activeArchitecture.taskIds.includes(task.id))
        : [],
    [activeArchitecture, tasks],
  );

  const activeLinkedNotes = useMemo(
    () =>
      activeArchitecture
        ? notes.filter((note) => activeArchitecture.noteIds.includes(note.id))
        : [],
    [activeArchitecture, notes],
  );

  const activeBlockers = activeArchitecture
    ? getMilestoneBlockers(
        activeLinkedTasks,
        activeArchitecture.requireLinkedTasksComplete,
        activeArchitecture.requireNotesOnLinkedTasks,
      )
    : { incompleteTasks: [], tasksWithoutNotes: [] };

  const completedCount = milestones.filter((m) => m.completed).length;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newTitle.trim()) return;
    onAdd({ title: newTitle.trim() });
    setNewTitle("");
    setShowAdd(false);
  };

  const handleMilestoneToggle = (milestone: Milestone) => {
    const architecture = getArchitectureForMilestone(milestone.id, architectureMap);
    const linkedTasks = tasks.filter((task) => architecture.taskIds.includes(task.id));
    const blockers = getMilestoneBlockers(
      linkedTasks,
      architecture.requireLinkedTasksComplete,
      architecture.requireNotesOnLinkedTasks,
    );

    if (
      !milestone.completed &&
      (blockers.incompleteTasks.length || blockers.tasksWithoutNotes.length)
    ) {
      setBlockedMilestoneId(milestone.id);
      return;
    }

    setBlockedMilestoneId(null);
    onToggle(milestone.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-xl font-bold text-text-main tracking-tight">
            System Milestones
          </h3>
          <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-text-muted">
            {completedCount} / {milestones.length} strategic checkpoints secured
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-brand-primary transition-all hover:bg-white/10"
        >
          <FiPlus /> New Milestone
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {milestones.length ? (
          milestones.map((milestone, index) => {
            const architecture = getArchitectureForMilestone(
              milestone.id,
              architectureMap,
            );
            const linkedTasks = tasks.filter((task) =>
              architecture.taskIds.includes(task.id),
            );
            const linkedNotes = notes.filter((note) =>
              architecture.noteIds.includes(note.id),
            );
            const blockers = getMilestoneBlockers(
              linkedTasks,
              architecture.requireLinkedTasksComplete,
              architecture.requireNotesOnLinkedTasks,
            );
            const completedLinkedTasks = linkedTasks.filter(
              (task) => task.status === "done",
            ).length;
            const taskProgress = linkedTasks.length
              ? Math.round((completedLinkedTasks / linkedTasks.length) * 100)
              : 0;

            return (
              <motion.div
                layout
                key={milestone.id}
                className={`rounded-2xl sm:rounded-3xl border p-4 sm:p-6 transition-all ${
                  milestone.completed
                    ? "border-emerald-500/10 bg-emerald-500/5 text-text-muted"
                    : "border-white/5 bg-white/5 text-text-main"
                }`}
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex min-w-0 items-start gap-3 sm:gap-6">
                    <span className="w-5 sm:w-6 border-b border-white/10 pb-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-text-muted/30">
                      {(index + 1).toString().padStart(2, "0")}
                    </span>
                    <button
                      onClick={() => handleMilestoneToggle(milestone)}
                      className={`rounded-xl p-1.5 sm:p-2 transition-all ${
                        milestone.completed
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "text-text-muted hover:bg-brand-primary/10 hover:text-brand-primary"
                      }`}
                    >
                      {milestone.completed ? (
                        <FiCheckCircle size={24} />
                      ) : (
                        <FiCircle size={24} />
                      )}
                    </button>
                    <div className="min-w-0">
                      <span
                        className={`text-sm sm:text-base font-bold tracking-tight transition-all ${
                          milestone.completed ? "line-through opacity-50" : ""
                        }`}
                      >
                        {milestone.title}
                      </span>
                      {milestone.description ? (
                        <span className="mt-1 block text-[11px] sm:text-xs font-medium text-text-muted opacity-60 leading-5">
                          {milestone.description}
                        </span>
                      ) : null}
                      <div className="mt-2 flex flex-wrap gap-1.5 sm:mt-3 sm:gap-2">
                        <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-2 py-1 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.14em] text-sky-100">
                          <FiLayers className="mr-1 inline" />
                          {linkedTasks.length} execution
                        </span>
                        <span className="rounded-full border border-brand-primary/20 bg-brand-primary/10 px-2 py-1 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.14em] text-brand-primary">
                          <FiBook className="mr-1 inline" />
                          {linkedNotes.length} knowledge
                        </span>
                        <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.14em] text-text-main">
                          {linkedTasks.length ? `${taskProgress}% execution ready` : "No execution linked"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end lg:self-start">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMilestoneId(milestone.id);
                        setBlockedMilestoneId(null);
                      }}
                      className="rounded-xl border border-white/10 bg-black/20 px-2.5 py-1.5 sm:px-3 sm:py-2 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.16em] sm:tracking-[0.18em] text-text-main transition hover:bg-black/30"
                    >
                      <FiSettings className="mr-1 inline" />
                      Architect
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(milestone.id)}
                      disabled={isDeleting}
                      className="rounded-xl border border-rose-400/20 bg-rose-400/10 p-1.5 sm:p-2 text-rose-200 transition hover:bg-rose-400/15 disabled:opacity-50"
                      aria-label={`Delete ${milestone.title}`}
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>

                {blockedMilestoneId === milestone.id ? (
                  <div className="mt-3 sm:mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm text-amber-100">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em]">
                      Completion blocked
                    </p>
                    <div className="mt-2 space-y-1 text-xs">
                      {blockers.incompleteTasks.length ? (
                        <p>
                          {blockers.incompleteTasks.length} linked execution item
                          {blockers.incompleteTasks.length === 1 ? "" : "s"} still open.
                        </p>
                      ) : null}
                      {blockers.tasksWithoutNotes.length ? (
                        <p>
                          {blockers.tasksWithoutNotes.length} linked execution item
                          {blockers.tasksWithoutNotes.length === 1 ? "" : "s"} still need reference notes.
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </motion.div>
            );
          })
        ) : (
          <div className="glass rounded-[2.5rem] border border-dashed border-white/10 py-20 text-center">
            <p className="text-sm italic text-text-muted">
              Deconstruct your ambition into flexible, rule-aware milestones.
            </p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAdd ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl"
          >
            <div className="relative w-full max-w-md rounded-[2.5rem] border border-white/10 bg-surface-soft p-8 shadow-2xl">
              <button
                onClick={() => setShowAdd(false)}
                className="absolute right-6 top-6 p-2 text-text-muted hover:text-text-main"
              >
                <FiX size={20} />
              </button>
              <h4 className="mb-6 text-xl font-bold uppercase tracking-tight text-text-main">
                Define Milestone
              </h4>
              <form onSubmit={handleSubmit} className="space-y-6">
                <input
                  autoFocus
                  required
                  value={newTitle}
                  onChange={(event) => setNewTitle(event.target.value)}
                  placeholder="e.g. Land first recurring client"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-text-main outline-none transition-all placeholder:text-text-muted/30 focus:ring-2 focus:ring-brand-primary/20"
                />
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-brand-primary py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-brand-primary/20 transition-all hover:scale-105 active:scale-95"
                >
                  Deploy Step
                </button>
              </form>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Modal
        isOpen={Boolean(activeMilestone)}
        onClose={() => setActiveMilestoneId(null)}
        title={activeMilestone ? `${activeMilestone.title} Architecture` : "Milestone Architecture"}
        panelClassName="max-w-4xl"
      >
        {activeMilestone && activeArchitecture ? (
          <div className="space-y-5">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-primary">
                Why this exists
              </p>
              <p className="mt-2 text-sm text-text-muted">
                Link execution and knowledge only where it helps. A milestone can stay loose, or you can
                turn on stricter completion rules when this checkpoint needs evidence and finished work.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                    Linked execution
                  </p>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-text-main">
                    {activeArchitecture.taskIds.length} selected
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {tasks.length ? (
                    tasks.map((task) => {
                      const checked = activeArchitecture.taskIds.includes(task.id);
                      return (
                        <label
                          key={task.id}
                          className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(event) =>
                              onSaveArchitecture(activeMilestone.id, {
                                ...activeArchitecture,
                                taskIds: event.target.checked
                                  ? [...activeArchitecture.taskIds, task.id]
                                  : activeArchitecture.taskIds.filter((id) => id !== task.id),
                              })
                            }
                            className="mt-1"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-text-main">{task.title}</p>
                            <div className="mt-1 flex flex-wrap gap-2">
                              <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-text-muted">
                                {task.status}
                              </span>
                              <span
                                className={`rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${
                                  taskHasReferenceNotes(task)
                                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                                    : "border-amber-400/20 bg-amber-400/10 text-amber-100"
                                }`}
                              >
                                {taskHasReferenceNotes(task)
                                  ? "Reference ready"
                                  : "No reference note"}
                              </span>
                            </div>
                          </div>
                        </label>
                      );
                    })
                  ) : (
                    <p className="text-sm text-text-muted">
                      No dream execution items exist yet. You can still keep the milestone and attach work later.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                    Supporting knowledge
                  </p>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-text-main">
                    {activeArchitecture.noteIds.length} selected
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {notes.length ? (
                    notes.map((note) => {
                      const checked = activeArchitecture.noteIds.includes(note.id);
                      return (
                        <label
                          key={note.id}
                          className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(event) =>
                              onSaveArchitecture(activeMilestone.id, {
                                ...activeArchitecture,
                                noteIds: event.target.checked
                                  ? [...activeArchitecture.noteIds, note.id]
                                  : activeArchitecture.noteIds.filter((id) => id !== note.id),
                              })
                            }
                            className="mt-1"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-text-main">{note.title}</p>
                            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-text-muted">
                              Updated {new Date(note.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </label>
                      );
                    })
                  ) : (
                    <p className="text-sm text-text-muted">
                      No dream notes exist yet. This milestone can still move without attached knowledge.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                <input
                  type="checkbox"
                  checked={activeArchitecture.requireLinkedTasksComplete}
                  onChange={(event) =>
                    onSaveArchitecture(activeMilestone.id, {
                      ...activeArchitecture,
                      requireLinkedTasksComplete: event.target.checked,
                    })
                  }
                  className="mt-1"
                />
                <div>
                  <p className="text-sm font-bold text-text-main">
                    Require linked execution to be done
                  </p>
                  <p className="mt-1 text-xs text-text-muted">
                    Blocks milestone completion until every attached task is complete.
                  </p>
                </div>
              </label>
              <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                <input
                  type="checkbox"
                  checked={activeArchitecture.requireNotesOnLinkedTasks}
                  onChange={(event) =>
                    onSaveArchitecture(activeMilestone.id, {
                      ...activeArchitecture,
                      requireNotesOnLinkedTasks: event.target.checked,
                    })
                  }
                  className="mt-1"
                />
                <div>
                  <p className="text-sm font-bold text-text-main">
                    Require reference notes on linked execution
                  </p>
                  <p className="mt-1 text-xs text-text-muted">
                    Treats note-backed execution as stronger evidence before closing the milestone.
                  </p>
                </div>
              </label>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2">
                <FiAlertTriangle className="text-amber-300" />
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-primary">
                  Readiness summary
                </p>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                    Execution linked
                  </p>
                  <p className="mt-2 text-lg font-bold text-text-main">
                    {activeLinkedTasks.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                    Open execution blockers
                  </p>
                  <p className="mt-2 text-lg font-bold text-text-main">
                    {activeBlockers.incompleteTasks.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                    Missing reference blockers
                  </p>
                  <p className="mt-2 text-lg font-bold text-text-main">
                    {activeBlockers.tasksWithoutNotes.length}
                  </p>
                </div>
              </div>
              {activeBlockers.incompleteTasks.length || activeBlockers.tasksWithoutNotes.length ? (
                <div className="mt-4 space-y-2 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
                  {activeBlockers.incompleteTasks.length ? (
                    <p>
                      {activeBlockers.incompleteTasks.length} linked task
                      {activeBlockers.incompleteTasks.length === 1 ? "" : "s"} still need completion.
                    </p>
                  ) : null}
                  {activeBlockers.tasksWithoutNotes.length ? (
                    <p>
                      {activeBlockers.tasksWithoutNotes.length} linked task
                      {activeBlockers.tasksWithoutNotes.length === 1 ? "" : "s"} still need reference notes.
                    </p>
                  ) : null}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
                  This milestone is structurally ready based on its current rules.
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
