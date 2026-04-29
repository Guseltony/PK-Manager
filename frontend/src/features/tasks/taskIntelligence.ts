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
} from "../../types/task";

const TASK_EXECUTION_META_STORAGE_KEY = "pk-manager-task-execution-meta";
const TASK_FOCUS_SESSIONS_STORAGE_KEY = "pk-manager-task-focus-sessions";

export type TaskExecutionMetaMap = Record<string, TaskExecutionMeta>;

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
