import type {
  Dream,
  Milestone,
  MilestoneArchitectureMap,
} from "../../types/dream";
import type {
  ExecutionState,
  Task,
  TaskExecutionMeta,
  TaskFocusSession,
  TaskRecurrence,
  TaskScheduleMeta,
} from "../../types/task";

const TASK_EXECUTION_META_STORAGE_KEY = "pk-manager-task-execution-meta";
const TASK_FOCUS_SESSIONS_STORAGE_KEY = "pk-manager-task-focus-sessions";
const TASK_SCHEDULE_META_STORAGE_KEY = "pk-manager-task-schedule-meta";
const TASK_META_EVENT = "pk-manager-task-meta-change";

export type TaskExecutionMetaMap = Record<string, TaskExecutionMeta>;
export type TaskScheduleMetaMap = Record<string, TaskScheduleMeta>;
export type TaskLifecycleBucket =
  | "today"
  | "carryover"
  | "upcoming"
  | "active"
  | "overdue"
  | "completed"
  | "backlog";

export type TaskReadiness = {
  executionState: ExecutionState;
  readinessLabel: string;
  blockers: string[];
  warnings: string[];
  linkedNoteCount: number;
  hasReferenceNotes: boolean;
  milestoneId: string | null;
  milestoneTitle: string | null;
  dependencyTasks: Task[];
  focusMinutesTarget: number;
};

export type TaskScheduleSnapshot = {
  scheduledDate: string | null;
  dueDate: string | null;
  endDate: string | null;
  durationDays: number;
  recurrence: TaskRecurrence;
  weeklyDays: number[];
  isTodayCommitment: boolean;
  todayOccurrenceCompleted: boolean;
  isRecurringDueToday: boolean;
  nextOccurrenceDate: string | null;
  progressLabel: string | null;
  completedThisPeriod: number;
  requiredThisPeriod: number;
  missedThisPeriod: number;
  bucket: TaskLifecycleBucket;
  statusLabel: string;
};

function notifyTaskMetaChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(TASK_META_EVENT));
}

export function readTaskExecutionMetaMap(): TaskExecutionMetaMap {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(TASK_EXECUTION_META_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as TaskExecutionMetaMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function writeTaskExecutionMetaMap(map: TaskExecutionMetaMap) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    TASK_EXECUTION_META_STORAGE_KEY,
    JSON.stringify(map),
  );
  notifyTaskMetaChange();
}

export function readTaskScheduleMetaMap(): TaskScheduleMetaMap {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(TASK_SCHEDULE_META_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as TaskScheduleMetaMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function writeTaskScheduleMetaMap(map: TaskScheduleMetaMap) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    TASK_SCHEDULE_META_STORAGE_KEY,
    JSON.stringify(map),
  );
  notifyTaskMetaChange();
}

export function readTaskFocusSessions(): TaskFocusSession[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(TASK_FOCUS_SESSIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TaskFocusSession[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeTaskFocusSessions(sessions: TaskFocusSession[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    TASK_FOCUS_SESSIONS_STORAGE_KEY,
    JSON.stringify(sessions),
  );
  notifyTaskMetaChange();
}

export function buildDefaultTaskExecutionMeta(
  task: Task,
  linkedNoteCount = 0,
): TaskExecutionMeta {
  const executionState: ExecutionState =
    task.status === "done"
      ? "completed"
      : task.status === "in_progress"
        ? "in_progress"
        : linkedNoteCount > 0 || !!task.description
          ? "ready"
          : "queued";

  return {
    taskId: task.id,
    executionState,
    blockerReason: null,
    dependencyTaskIds: [],
    requireReferenceNote: false,
    focusMinutesTarget: task.estimatedTime || task.duration || 30,
    updatedAt: new Date().toISOString(),
  };
}

export function buildDefaultTaskScheduleMeta(task: Task): TaskScheduleMeta {
  return {
    taskId: task.id,
    scheduledDate: task.startDate ? toDateKey(task.startDate) : null,
    recurrence: task.recurrence || "none",
    weeklyDays: task.weeklyDays || [],
    occurrenceDates: task.occurrenceDates || [],
    isTodayCommitment: task.isTodayCommitment || false,
    lastRescheduledAt: task.lastRescheduledAt || null,
    updatedAt: new Date().toISOString(),
  };
}

function readMilestoneArchitectureMap(
  dreamId: string | null | undefined,
): MilestoneArchitectureMap {
  if (!dreamId || typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(
      `pk-manager-dream-milestone-architecture:${dreamId}`,
    );
    if (!raw) return {};
    const parsed = JSON.parse(raw) as MilestoneArchitectureMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function getTaskMilestoneContext(
  task: Task,
  dream?: Dream | null,
): {
  milestone: Milestone | null;
  architectureTaskIds: string[];
  requireLinkedTasksComplete: boolean;
  requireNotesOnLinkedTasks: boolean;
} {
  if (!task.dreamId || !dream) {
    return {
      milestone: null,
      architectureTaskIds: [],
      requireLinkedTasksComplete: false,
      requireNotesOnLinkedTasks: false,
    };
  }

  const architectureMap = readMilestoneArchitectureMap(task.dreamId);
  const match = Object.values(architectureMap).find((item) =>
    item.taskIds.includes(task.id),
  );

  if (!match) {
    return {
      milestone: null,
      architectureTaskIds: [],
      requireLinkedTasksComplete: false,
      requireNotesOnLinkedTasks: false,
    };
  }

  const milestone =
    dream.milestones?.find((item) => item.id === match.milestoneId) || null;

  return {
    milestone,
    architectureTaskIds: match.taskIds,
    requireLinkedTasksComplete: match.requireLinkedTasksComplete,
    requireNotesOnLinkedTasks: match.requireNotesOnLinkedTasks,
  };
}

export function assignTaskToMilestone(
  taskId: string,
  dreamId: string,
  milestoneId: string | null,
) {
  const architectureMap = readMilestoneArchitectureMap(dreamId);

  const nextEntries = Object.entries(architectureMap).map(
    ([currentMilestoneId, architecture]) => [
      currentMilestoneId,
      {
        ...architecture,
        taskIds: architecture.taskIds.filter((id) => id !== taskId),
      },
    ],
  );

  const nextMap = Object.fromEntries(nextEntries) as MilestoneArchitectureMap;

  if (milestoneId) {
    const existing = nextMap[milestoneId] || {
      milestoneId,
      taskIds: [],
      noteIds: [],
      requireLinkedTasksComplete: false,
      requireNotesOnLinkedTasks: false,
    };

    nextMap[milestoneId] = {
      ...existing,
      taskIds: Array.from(new Set([...existing.taskIds, taskId])),
    };
  }

  if (typeof window !== "undefined") {
    window.localStorage.setItem(
      `pk-manager-dream-milestone-architecture:${dreamId}`,
      JSON.stringify(nextMap),
    );
  }
}

export function deriveTaskReadiness(
  task: Task,
  allTasks: Task[],
  meta?: TaskExecutionMeta | null,
  dream?: Dream | null,
): TaskReadiness {
  const linkedNoteIds = new Set([
    ...(task.noteId ? [task.noteId] : []),
    ...(task.notes?.map(({ note }) => note.id) || []),
  ]);
  const linkedNoteCount = linkedNoteIds.size;
  const hasReferenceNotes = linkedNoteCount > 0;
  const mergedMeta = meta || buildDefaultTaskExecutionMeta(task, linkedNoteCount);
  const milestoneContext = getTaskMilestoneContext(task, dream);

  const dependencyTasks = allTasks.filter((candidate) =>
    mergedMeta.dependencyTaskIds.includes(candidate.id),
  );

  const blockers = [
    ...(mergedMeta.blockerReason ? [mergedMeta.blockerReason] : []),
    ...dependencyTasks
      .filter((dependency) => dependency.status !== "done")
      .map((dependency) => `Waiting on "${dependency.title}"`),
    ...(mergedMeta.requireReferenceNote && !hasReferenceNotes
      ? ["Reference note required before this can close."]
      : []),
  ];

  const warnings = [
    ...(!task.description ? ["Add a clearer execution description."] : []),
    ...(!task.dueDate ? ["No due date is set yet."] : []),
    ...(!task.dreamId ? ["Task is not linked to a dream yet."] : []),
    ...(!milestoneContext.milestone && task.dreamId
      ? ["This task is not mapped to a milestone yet."]
      : []),
    ...(linkedNoteCount === 0
      ? ["No supporting knowledge note is attached yet."]
      : []),
  ];

  let executionState = mergedMeta.executionState;
  if (task.status === "done") {
    executionState = "completed";
  } else if (blockers.length > 0) {
    executionState = "blocked";
  } else if (task.status === "in_progress") {
    executionState = "in_progress";
  } else if (task.startDate && new Date(task.startDate) > new Date()) {
    executionState = "waiting";
  } else if (task.description || hasReferenceNotes || !!task.dreamId) {
    executionState = "ready";
  } else {
    executionState = "queued";
  }

  const readinessLabel =
    executionState === "completed"
      ? "Completed"
      : executionState === "blocked"
        ? "Blocked"
        : executionState === "in_progress"
          ? "In progress"
          : executionState === "waiting"
            ? "Waiting"
            : executionState === "ready"
              ? "Ready"
              : "Queued";

  return {
    executionState,
    readinessLabel,
    blockers,
    warnings,
    linkedNoteCount,
    hasReferenceNotes,
    milestoneId: milestoneContext.milestone?.id || null,
    milestoneTitle: milestoneContext.milestone?.title || null,
    dependencyTasks,
    focusMinutesTarget: Math.max(
      10,
      mergedMeta.focusMinutesTarget || task.estimatedTime || 30,
    ),
  };
}

export function toDateKey(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

function addDays(dateKey: string, days: number) {
  const date = new Date(`${dateKey}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

function compareDateKeys(left: string, right: string) {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function startOfWeek(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return toDateKey(date);
}

function endOfWeek(dateKey: string) {
  return addDays(startOfWeek(dateKey), 6);
}

function startOfMonth(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`);
  date.setDate(1);
  return toDateKey(date);
}

function endOfMonth(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`);
  date.setMonth(date.getMonth() + 1, 0);
  return toDateKey(date);
}

function enumerateDateKeys(startKey: string, endKey: string) {
  const dates: string[] = [];
  let current = startKey;
  while (compareDateKeys(current, endKey) <= 0) {
    dates.push(current);
    current = addDays(current, 1);
  }
  return dates;
}

function getWeekdayLabel(index: number) {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][index] || "Day";
}

function getRecurringOccurrencePlan(
  task: Task,
  meta: TaskScheduleMeta,
  today: string,
) {
  const scheduledDate =
    meta.scheduledDate || (task.startDate ? toDateKey(task.startDate) : today);
  const occurrenceDates = Array.from(new Set(meta.occurrenceDates || []));
  const recurrence = meta.recurrence;
  const weeklyDays = Array.from(
    new Set(
      (meta.weeklyDays || []).filter(
        (day) => Number.isInteger(day) && day >= 0 && day <= 6,
      ),
    ),
  ).sort((left, right) => left - right);

  if (recurrence === "none") {
    return {
      weeklyDays,
      dueToday: false,
      todayCompleted: false,
      nextOccurrenceDate: null as string | null,
      progressLabel: null as string | null,
      completedThisPeriod: 0,
      requiredThisPeriod: 0,
      missedThisPeriod: 0,
      periodEndDate: null as string | null,
    };
  }

  let periodStart = today;
  let periodEnd = today;
  if (recurrence === "daily" || recurrence === "weekly") {
    periodStart = startOfWeek(today);
    periodEnd = endOfWeek(today);
  } else if (recurrence === "monthly") {
    periodStart = startOfMonth(today);
    periodEnd = endOfMonth(today);
  }

  const periodDates = enumerateDateKeys(periodStart, periodEnd).filter(
    (dateKey) => compareDateKeys(dateKey, scheduledDate) >= 0,
  );

  const expectedDates = periodDates.filter((dateKey) => {
    const weekday = new Date(`${dateKey}T00:00:00`).getDay();
    if (recurrence === "daily") return true;
    if (recurrence === "weekly") {
      const activeDays = weeklyDays.length ? weeklyDays : [new Date(`${scheduledDate}T00:00:00`).getDay()];
      return activeDays.includes(weekday);
    }
    if (recurrence === "monthly") {
      return dateKey.slice(8, 10) === scheduledDate.slice(8, 10);
    }
    return false;
  });

  const completedThisPeriod = expectedDates.filter((dateKey) =>
    occurrenceDates.includes(dateKey),
  ).length;
  const requiredThisPeriod = expectedDates.length;
  const todayCompleted = occurrenceDates.includes(today);
  const dueToday = expectedDates.includes(today) && !todayCompleted;
  const missedThisPeriod = expectedDates.filter(
    (dateKey) =>
      compareDateKeys(dateKey, today) < 0 && !occurrenceDates.includes(dateKey),
  ).length;
  const nextOccurrenceDate =
    expectedDates.find(
      (dateKey) =>
        compareDateKeys(dateKey, today) > 0 && !occurrenceDates.includes(dateKey),
    ) || null;

  const progressLabel =
    recurrence === "daily"
      ? `${completedThisPeriod}/${requiredThisPeriod || 1} this week`
      : `${completedThisPeriod}/${requiredThisPeriod || expectedDates.length || 1} this ${
          recurrence === "weekly" ? "week" : "month"
        }`;

  return {
    weeklyDays:
      recurrence === "weekly"
        ? weeklyDays.length
          ? weeklyDays
          : [new Date(`${scheduledDate}T00:00:00`).getDay()]
        : weeklyDays,
    dueToday,
    todayCompleted,
    nextOccurrenceDate,
    progressLabel,
    completedThisPeriod,
    requiredThisPeriod,
    missedThisPeriod,
    periodEndDate: periodEnd,
  };
}

export function getTaskScheduleSnapshot(
  task: Task,
  meta?: TaskScheduleMeta | null,
  today = toDateKey(new Date()),
): TaskScheduleSnapshot {
  const mergedMeta = {
    ...buildDefaultTaskScheduleMeta(task),
    ...(meta || {}),
  };
  const scheduledDate = mergedMeta.scheduledDate || (task.startDate ? toDateKey(task.startDate) : null);
  const dueDate = task.dueDate ? toDateKey(task.dueDate) : null;
  const durationDays = Math.max(task.duration || 1, 1);
  const endDate = scheduledDate ? addDays(scheduledDate, durationDays - 1) : null;
  const recurringPlan = getRecurringOccurrencePlan(task, mergedMeta, today);
  const isRecurring = mergedMeta.recurrence !== "none";
  const isCompleted = !isRecurring && task.status === "done";
  const isTodayCommitment = mergedMeta.isTodayCommitment;

  let bucket: TaskLifecycleBucket = "backlog";

  if (isCompleted) {
    bucket = "completed";
  } else if (
    recurringPlan.missedThisPeriod > 0 &&
    !recurringPlan.dueToday &&
    !isTodayCommitment
  ) {
    bucket = "carryover";
  } else if (
    (dueDate && compareDateKeys(dueDate, today) < 0) ||
    (!isRecurring && endDate && compareDateKeys(endDate, today) < 0)
  ) {
    bucket = scheduledDate ? "carryover" : "overdue";
  } else if (
    isTodayCommitment ||
    recurringPlan.dueToday ||
    (dueDate && compareDateKeys(dueDate, today) === 0) ||
    (!isRecurring && scheduledDate && compareDateKeys(scheduledDate, today) === 0) ||
    (scheduledDate && endDate && compareDateKeys(scheduledDate, today) <= 0 && compareDateKeys(endDate, today) >= 0)
  ) {
    bucket = "today";
  } else if (
    recurringPlan.nextOccurrenceDate ||
    (scheduledDate && compareDateKeys(scheduledDate, today) > 0) ||
    (dueDate && compareDateKeys(dueDate, today) > 0)
  ) {
    bucket = "upcoming";
  } else if (task.status === "in_progress") {
    bucket = "active";
  }

  const statusLabel =
    bucket === "carryover"
      ? "Carryover"
      : bucket === "today"
        ? "Today"
        : bucket === "upcoming"
          ? "Upcoming"
          : bucket === "active"
            ? "Active"
            : bucket === "overdue"
              ? "Overdue"
              : bucket === "completed"
                ? "Completed"
                : "Backlog";

  return {
    scheduledDate,
    dueDate,
    endDate,
    durationDays,
    recurrence: mergedMeta.recurrence,
    weeklyDays: recurringPlan.weeklyDays,
    isTodayCommitment,
    todayOccurrenceCompleted: recurringPlan.todayCompleted,
    isRecurringDueToday: recurringPlan.dueToday,
    nextOccurrenceDate: recurringPlan.nextOccurrenceDate,
    progressLabel: recurringPlan.progressLabel,
    completedThisPeriod: recurringPlan.completedThisPeriod,
    requiredThisPeriod: recurringPlan.requiredThisPeriod,
    missedThisPeriod: recurringPlan.missedThisPeriod,
    bucket,
    statusLabel,
  };
}

export function filterTasksBySchedule(
  tasks: Task[],
  filter: string,
  scheduleMetaMap: TaskScheduleMetaMap,
) {
  if (filter === "all") return tasks;

  return tasks.filter((task) => {
    const snapshot = getTaskScheduleSnapshot(task, scheduleMetaMap[task.id]);

    if (filter === "completed") return snapshot.bucket === "completed";
    if (filter === "today") return snapshot.bucket === "today";
    if (filter === "upcoming") return snapshot.bucket === "upcoming";
    if (filter === "overdue") return snapshot.bucket === "overdue";
    if (filter === "carryover") return snapshot.bucket === "carryover";
    if (filter === "focus") return task.priority === "high" || task.priority === "urgent";
    if (filter === "high-priority") return task.priority === "high" || task.priority === "urgent";
    return task.status === filter;
  });
}

export function persistTaskScheduleMeta(meta: TaskScheduleMeta) {
  const current = readTaskScheduleMetaMap();
  current[meta.taskId] = meta;
  writeTaskScheduleMetaMap(current);
}

export function recordTaskOccurrence(taskId: string, dateKey = toDateKey(new Date())) {
  const current = readTaskScheduleMetaMap();
  const existing = current[taskId];
  if (!existing) return;

  current[taskId] = {
    ...existing,
    occurrenceDates: Array.from(
      new Set([...(existing.occurrenceDates || []), dateKey]),
    ).sort(),
    updatedAt: new Date().toISOString(),
  };
  writeTaskScheduleMetaMap(current);
}

export function clearTaskOccurrence(taskId: string, dateKey = toDateKey(new Date())) {
  const current = readTaskScheduleMetaMap();
  const existing = current[taskId];
  if (!existing) return;

  current[taskId] = {
    ...existing,
    occurrenceDates: (existing.occurrenceDates || []).filter((entry) => entry !== dateKey),
    updatedAt: new Date().toISOString(),
  };
  writeTaskScheduleMetaMap(current);
}

export function subscribeTaskMetaChange(listener: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(TASK_META_EVENT, listener);
  return () => window.removeEventListener(TASK_META_EVENT, listener);
}

export function formatWeeklyDays(days: number[]) {
  if (!days.length) return "No weekdays selected";
  return days.map(getWeekdayLabel).join(", ");
}

export function getTodayFocusMinutesForTasks(tasks: Task[]) {
  const today = new Date().toISOString().slice(0, 10);
  const sessions = readTaskFocusSessions();

  const localMinutes = sessions
    .filter(
      (session) =>
        session.createdAt.slice(0, 10) === today &&
        tasks.some((task) => task.id === session.taskId),
    )
    .reduce((sum, session) => sum + session.durationMinutes, 0);

  const readingMinutes = tasks.reduce((sum, task) => {
    const mins = (task.taskLogs || [])
      .filter(
        (log) =>
          log.completedAt.slice(0, 10) === today &&
          log.title.toLowerCase().includes("reading session"),
      )
      .reduce((acc, log) => acc + (log.duration || 0), 0);
    return sum + mins;
  }, 0);

  return Math.round(localMinutes + readingMinutes);
}
