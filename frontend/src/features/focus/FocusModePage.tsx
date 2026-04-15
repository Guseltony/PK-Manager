"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import {
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiLoader,
  FiPauseCircle,
  FiPlayCircle,
  FiSkipForward,
  FiStar,
  FiTarget,
  FiZap,
} from "react-icons/fi";
import { useFocus } from "@/src/hooks/useFocus";
import { FocusTask } from "@/src/types/focus";

const SESSION_SECONDS = 25 * 60;

const priorityTone: Record<FocusTask["priority"], string> = {
  low: "text-sky-300 border-sky-400/20 bg-sky-400/10",
  medium: "text-slate-300 border-white/10 bg-white/5",
  high: "text-amber-300 border-amber-400/20 bg-amber-400/10",
  urgent: "text-rose-300 border-rose-400/20 bg-rose-400/10",
};

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");

  return `${minutes}:${remainingSeconds}`;
};

function FocusSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_22rem]">
      <div className="space-y-4">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="h-40 animate-pulse rounded-4xl border border-white/5 bg-white/5"
          />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-4xl border border-white/5 bg-white/5" />
    </div>
  );
}

export default function FocusModePage() {
  const {
    tasks,
    activeSession,
    analytics,
    isLoading,
    startSession,
    endSession,
    completeTask,
    skipTask,
    isStartingSession,
    isEndingSession,
    isCompletingTask,
    isSkippingTask,
  } = useFocus();
  const [secondsLeft, setSecondsLeft] = useState(SESSION_SECONDS);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const focusTasks = tasks;

  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          setIsTimerRunning(false);
          return SESSION_SECONDS;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isTimerRunning]);

  const handleTimerToggle = async () => {
    if (!activeSession) {
      await startSession();
      setSecondsLeft(SESSION_SECONDS);
      setIsTimerRunning(true);
      return;
    }

    setIsTimerRunning((current) => !current);
  };

  const handleComplete = async (task: FocusTask) => {
    const session = activeSession ?? (await startSession());

    await completeTask({
      sessionId: session.id,
      taskId: task.id,
      durationSeconds: SESSION_SECONDS - secondsLeft,
    });
  };

  const handleSkip = async (taskId: string) => {
    const session = activeSession ?? (await startSession());

    await skipTask({
      sessionId: session.id,
      taskId,
    });
  };

  const handleResetSession = async () => {
    if (activeSession) {
      await endSession({
        sessionId: activeSession.id,
        durationSeconds: SESSION_SECONDS - secondsLeft,
      });
    }

    setSecondsLeft(SESSION_SECONDS);
    setIsTimerRunning(false);
  };

  const completedCount = activeSession?.completedCount ?? 0;
  const remainingCount = focusTasks.length;
  const completionRate =
    remainingCount === 0
      ? 0
      : Math.min((completedCount / Math.max(completedCount + remainingCount, 1)) * 100, 100);
  const currentTask = focusTasks[0] ?? null;
  const sessionStartedAt = activeSession?.startedAt ? new Date(activeSession.startedAt) : null;
  const focusMinutesToday = analytics?.history?.[0]?.totalFocusTime
    ? Math.round(analytics.history[0].totalFocusTime / 60)
    : 0;
  const sessionLabel = activeSession ? "Active session" : "Ready to begin";

  return (
    <div className="min-h-[calc(100vh-64px)] overflow-y-auto bg-[radial-gradient(circle_at_top,#262f4d_0%,#131720_38%,#0f1115_100%)] px-4 py-6 sm:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.25em] text-amber-300">
                <FiZap size={12} />
                Focus Engine
              </div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-text-main sm:text-5xl">
                Focus Mode
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-text-muted sm:text-base">
                Here&apos;s what matters right now. We rank your unfinished work, keep the list intentionally short, and refill the queue as you complete or skip tasks.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-black/20 px-4 py-3">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-text-muted">Queue</p>
                <p className="mt-2 text-2xl font-bold text-text-main">{focusTasks.length}</p>
                <p className="text-xs text-text-muted">Top tasks surfaced</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/20 px-4 py-3">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-text-muted">Completed</p>
                <p className="mt-2 text-2xl font-bold text-text-main">{completedCount}</p>
                <p className="text-xs text-text-muted">This session</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/20 px-4 py-3">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-text-muted">Momentum</p>
                <p className="mt-2 text-2xl font-bold text-text-main">{Math.round(analytics?.averageScore ?? completionRate)}%</p>
                <p className="text-xs text-text-muted">Focus quality</p>
              </div>
            </div>
          </div>
        </section>

        {isLoading ? (
          <FocusSkeleton />
        ) : (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_22rem]">
            <section className="space-y-4">
              {focusTasks.length > 0 ? (
                focusTasks.map((task, index) => (
                  <motion.article
                    key={task.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`overflow-hidden rounded-[2rem] border p-5 transition-all duration-300 sm:p-6 ${
                      index === 0
                        ? "border-brand-primary/30 bg-brand-primary/10 shadow-xl shadow-brand-primary/10"
                        : "border-white/10 bg-white/5 backdrop-blur-xl"
                    }`}
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-brand-primary/20 bg-brand-primary/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-brand-primary">
                            #{index + 1} right now
                          </span>
                          <span
                            className={`rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] ${priorityTone[task.priority]}`}
                          >
                            {task.priority}
                          </span>
                          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
                            Score {Math.round(task.focusScore)}
                          </span>
                        </div>

                        <h2 className="mt-4 text-xl font-bold text-text-main sm:text-2xl">
                          {task.title}
                        </h2>

                        {task.description ? (
                          <p className="mt-3 max-w-2xl text-sm leading-6 text-text-muted">
                            {task.description}
                          </p>
                        ) : null}

                        <div className="mt-4 flex flex-wrap gap-2">
                          <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-text-muted">
                            <span className="font-semibold text-text-main">Urgency:</span>{" "}
                            {task.urgencyLabel}
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-text-muted">
                            <span className="font-semibold text-text-main">Due:</span>{" "}
                            {task.dueDate ? dayjs(task.dueDate).format("MMM D, h:mm A") : "No due date"}
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-text-muted">
                            <span className="font-semibold text-text-main">Duration:</span>{" "}
                            {task.estimatedTime ? `${task.estimatedTime} mins` : "Flexible"}
                          </div>
                          {task.dream ? (
                            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-200">
                              <span className="font-semibold">Goal:</span> {task.dream.title}
                            </div>
                          ) : null}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {task.focusReasons.map((reason) => (
                            <span
                              key={reason}
                              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted"
                            >
                              {reason}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 lg:w-52">
                        <button
                          onClick={() => handleComplete(task)}
                          disabled={isCompletingTask || isStartingSession}
                          className="flex items-center justify-center gap-2 rounded-2xl bg-brand-primary px-4 py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isCompletingTask ? <FiLoader size={16} className="animate-spin" /> : <FiCheckCircle size={16} />}
                          Mark done
                        </button>
                        <button
                          onClick={() => handleSkip(task.id)}
                          disabled={isSkippingTask || isStartingSession}
                          className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-bold text-text-main transition hover:bg-white/5"
                        >
                          {isSkippingTask ? <FiLoader size={16} className="animate-spin" /> : <FiSkipForward size={16} />}
                          Skip for now
                        </button>
                      </div>
                    </div>
                  </motion.article>
                ))
              ) : (
                <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
                    <FiCheckCircle size={28} />
                  </div>
                  <h2 className="mt-4 text-2xl font-bold text-text-main">Focus queue cleared</h2>
                  <p className="mt-2 text-sm text-text-muted">
                    There are no active tasks left to rank right now. Add a new task or revisit skipped work when you&apos;re ready.
                  </p>
                </div>
              )}
            </section>

            <aside className="space-y-4">
              <section className="rounded-[2rem] border border-white/10 bg-black/20 p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-text-muted">
                      {sessionLabel}
                    </p>
                    <h2 className="mt-2 text-3xl font-bold text-text-main">
                      {formatTime(secondsLeft)}
                    </h2>
                  </div>
                  <button
                    onClick={handleTimerToggle}
                    disabled={isStartingSession}
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-brand-primary/20 bg-brand-primary/10 text-brand-primary transition hover:bg-brand-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label={isTimerRunning ? "Pause focus timer" : "Start focus timer"}
                  >
                    {isStartingSession ? <FiLoader size={20} className="animate-spin" /> : isTimerRunning ? <FiPauseCircle size={20} /> : <FiPlayCircle size={20} />}
                  </button>
                </div>
                <p className="mt-3 text-sm text-text-muted">
                  Run a 25 minute session and keep your attention on the first ranked task. Session history and task decisions are now stored on the backend.
                </p>
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-text-muted">
                  <span className="font-semibold text-text-main">{focusMinutesToday} mins</span> logged into focus analytics today.
                </div>
                <button
                  onClick={handleResetSession}
                  disabled={isEndingSession}
                  className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-text-main transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {activeSession ? "End session" : "Reset timer"}
                </button>
              </section>

              <section className="rounded-[2rem] border border-white/10 bg-black/20 p-6 backdrop-blur-xl">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-text-muted">
                  Current Target
                </p>
                {currentTask ? (
                  <>
                    <h3 className="mt-3 text-lg font-bold text-text-main">{currentTask.title}</h3>
                    <div className="mt-4 space-y-3 text-sm text-text-muted">
                      <div className="flex items-center gap-3">
                        <FiTarget className="text-brand-primary" />
                        <span>{currentTask.urgencyLabel}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <FiClock className="text-amber-300" />
                        <span>
                          {currentTask.estimatedTime ? `${currentTask.estimatedTime} minute block` : "Open duration"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <FiStar className="text-emerald-300" />
                        <span>{currentTask.dream ? currentTask.dream.title : "Standalone execution task"}</span>
                      </div>
                      {sessionStartedAt ? (
                        <div className="flex items-center gap-3">
                          <FiZap className="text-amber-300" />
                          <span>Started {dayjs(sessionStartedAt).format("h:mm A")}</span>
                        </div>
                      ) : null}
                    </div>
                    <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-text-muted">
                        Why this now
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {currentTask.focusReasons.map((reason) => (
                          <span
                            key={reason}
                            className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-text-main"
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="mt-3 text-sm text-text-muted">
                    Your next focus target will appear here once there is active work to rank.
                  </p>
                )}
              </section>

              <section className="rounded-[2rem] border border-white/10 bg-black/20 p-6 backdrop-blur-xl">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-text-muted">
                  Queue Logic
                </p>
                <div className="mt-4 space-y-3 text-sm text-text-muted">
                  <div className="flex items-start gap-3">
                    <FiArrowRight className="mt-0.5 text-brand-primary" />
                    <span>Overdue and high-priority tasks rise to the top first.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <FiArrowRight className="mt-0.5 text-brand-primary" />
                    <span>Goal-linked work gets a strategic boost to keep daily effort aligned.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <FiArrowRight className="mt-0.5 text-brand-primary" />
                    <span>Skipped tasks are temporarily deprioritized so the queue can refill.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <FiArrowRight className="mt-0.5 text-brand-primary" />
                    <span>{analytics?.totalSessions ?? 0} focus sessions and {analytics?.totalCompleted ?? 0} completions have been tracked so far.</span>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
