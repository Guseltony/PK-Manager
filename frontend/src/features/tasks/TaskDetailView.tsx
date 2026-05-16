"use client";

import { useTask, useTasks } from "../../hooks/useTasks";
import {
  FiX,
  FiTrash2,
  FiEdit,
  FiPlus,
  FiTag,
  FiClock,
  FiCalendar,
  FiFlag,
  FiLink,
  FiActivity,
  FiCheckCircle,
  FiZap,
  FiArrowLeft,
  FiBookOpen,
  FiCornerDownRight,
} from "react-icons/fi";
import { useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";
import { useTags } from "../../hooks/useTags";
import { useNotesStore } from "../../store/notesStore";
import { ImageGallery } from "../../components/ImageGallery";
import { useTasksStore } from "../../store/tasksStore";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import PromptModal from "../../components/ui/PromptModal";
import Modal from "../../components/ui/Modal";
import {
  TaskStatus,
  Priority,
  ReadingSessionPayload,
  Task,
  ExecutionState,
  TaskExecutionMeta,
  TaskFocusSession,
  TaskRecurrence,
  TaskScheduleMeta,
} from "../../types/task";
import { useTaskEnrichmentAI, useTaskSubtasksAI } from "../../hooks/useAI";
import { getTagColorStyle } from "../../utils/tagColor";
import { useRouter } from "next/navigation";
import { useDream, useDreams } from "../../hooks/useDreams";
import { useProjects } from "../../hooks/useProjects";
import { useInbox } from "../../hooks/useInbox";
import { useLedger } from "../../hooks/useLedger";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  assignTaskToMilestone,
  buildDefaultTaskExecutionMeta,
  buildDefaultTaskScheduleMeta,
  deriveTaskReadiness,
  formatWeeklyDays,
  getTaskScheduleSnapshot,
  getTaskMilestoneContext,
  readTaskExecutionMetaMap,
  readTaskFocusSessions,
  toDateKey,
  writeTaskExecutionMetaMap,
  writeTaskFocusSessions,
} from "./taskIntelligence";

interface TaskDetailViewProps {
  taskId: string;
  onClose: () => void;
}

const statuses: TaskStatus[] = ["todo", "in_progress", "done"];
const priorities: Priority[] = ["low", "medium", "high", "urgent"];
const executionStates: ExecutionState[] = [
  "queued",
  "ready",
  "blocked",
  "in_progress",
  "waiting",
  "completed",
];
const weekdayOptions = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

export default function TaskDetailView({
  taskId,
  onClose,
}: TaskDetailViewProps) {
  const { data: task, isLoading } = useTask(taskId);
  const {
    tasks,
    updateTask,
    updateTaskAsync,
    deleteTaskAsync,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    logReadingSessionAsync,
    isUpdating,
    isDeleting,
    isAddingSubtask,
    isUpdatingSubtask,
    isLoggingReadingSession,
  } = useTasks();
  const { dreams } = useDreams();
  const { dream, toggleMilestone } = useDream(task?.dreamId || null);
  const { projects } = useProjects({ dreamId: task?.dreamId || undefined });
  const { items: inboxItems } = useInbox();
  const { logs } = useLedger();
  const { tags: allTags } = useTags();
  const taskSubtasksAi = useTaskSubtasksAI();
  const taskEnrichmentAi = useTaskEnrichmentAI();
  const router = useRouter();
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSubtaskPrompt, setShowSubtaskPrompt] = useState(false);
  const [showTagPrompt, setShowTagPrompt] = useState(false);
  const [showSubtaskWarning, setShowSubtaskWarning] = useState(false);

  const [localPriority, setLocalPriority] = useState<Priority | null>(null);
  const [isCycling, setIsCycling] = useState(false);
  const [localDescription, setLocalDescription] = useState("");
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [showDurationPrompt, setShowDurationPrompt] = useState(false);
  const [showReadingSession, setShowReadingSession] = useState(false);
  const [showFocusSession, setShowFocusSession] = useState(false);
  const [executionMeta, setExecutionMeta] = useState<TaskExecutionMeta | null>(
    null,
  );
  const [scheduleMeta, setScheduleMeta] = useState<TaskScheduleMeta | null>(
    null,
  );
  const [focusSessions, setFocusSessions] = useState<TaskFocusSession[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "architecture" | "scheduling" | "intelligence">("overview");

  const getTagName = (tagLike: unknown) => {
    if (!tagLike || typeof tagLike !== "object") return null;
    if ("tag" in tagLike && tagLike.tag && typeof tagLike.tag === "object" && "name" in tagLike.tag) {
      return String(tagLike.tag.name);
    }
    if ("name" in tagLike) {
      return String(tagLike.name);
    }
    return null;
  };

  const isRecurringTask =
    (scheduleMeta?.recurrence || task?.recurrence || "none") !== "none";
  const isCompleted = task?.status === "done" && !isRecurringTask;

  useEffect(() => {
    if (!task) return;
    setLocalPriority(task.priority);
    setLocalDescription(task.description || "");
  }, [task]);

  useEffect(() => {
    if (!task) return;
    const metaMap = readTaskExecutionMetaMap();
    const linkedNoteCount = new Set([
      ...(task.noteId ? [task.noteId] : []),
      ...(task.notes?.map(({ note }) => note.id) || []),
    ]).size;
    setExecutionMeta(metaMap[task.id] || buildDefaultTaskExecutionMeta(task, linkedNoteCount));
    setScheduleMeta(buildDefaultTaskScheduleMeta(task));
    setFocusSessions(
      readTaskFocusSessions().filter((session) => session.taskId === task.id),
    );
  }, [task]);

  useEffect(() => {
    if (!task || !executionMeta) return;
    if (executionMeta.executionState !== "blocked") return;

    const linkedNoteIds = new Set([
      ...(task.noteId ? [task.noteId] : []),
      ...(task.notes?.map(({ note }) => note.id) || []),
    ]);

    const dependencyTasks = tasks.filter((candidate) =>
      executionMeta.dependencyTaskIds.includes(candidate.id),
    );

    const hasLiveDependencyBlock = dependencyTasks.some(
      (candidate) => candidate.status !== "done",
    );
    const hasManualBlocker = Boolean(executionMeta.blockerReason?.trim());
    const hasReferenceBlock =
      executionMeta.requireReferenceNote && linkedNoteIds.size === 0;

    if (hasLiveDependencyBlock || hasManualBlocker || hasReferenceBlock) return;

    persistExecutionMeta({
      ...executionMeta,
      executionState:
        task.status === "in_progress"
          ? "in_progress"
          : task.startDate && new Date(task.startDate) > new Date()
            ? "waiting"
            : task.description || linkedNoteIds.size > 0 || task.dreamId
              ? "ready"
              : "queued",
      updatedAt: new Date().toISOString(),
    });
  }, [executionMeta, task, tasks]);

  const handleStatusToggle = async () => {
    if (!task) return;
    const currentIndex = statuses.indexOf(task.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];

    if (schedule.recurrence !== "none" && nextStatus === "done") {
      handleRecurringOccurrenceRecord();
      return;
    }
    
    // Check for incomplete subtasks if trying to complete the task
    if (nextStatus === "done" && task.subtasks && task.subtasks.length > 0) {
      const incompleteSubtasks = task.subtasks.filter(s => s.status !== "done");
      if (incompleteSubtasks.length > 0) {
        setShowSubtaskWarning(true);
        return;
      }
    }
    
    setShowSubtaskWarning(false);
    if (nextStatus === "done" && readiness.blockers.length > 0) {
      setShowSubtaskWarning(true);
      return;
    }

    const updatedTask = await updateTaskAsync({
      id: task.id,
      updates: { status: nextStatus },
    });

    if (nextStatus === "done") {
      await maybeAdvanceMilestone(updatedTask);
    }
  };

  const handleMarkDone = async () => {
    if (!task || isCompleted) return;

    if (schedule.recurrence !== "none") {
      handleRecurringOccurrenceRecord();
      return;
    }
    
    // Check for incomplete subtasks
    if (task.subtasks && task.subtasks.length > 0) {
      const incompleteSubtasks = task.subtasks.filter(s => s.status !== "done");
      if (incompleteSubtasks.length > 0) {
        setShowSubtaskWarning(true);
        return;
      }
    }
    
    setShowSubtaskWarning(false);
    if (readiness.blockers.length > 0) {
      setShowSubtaskWarning(true);
      return;
    }

    const updatedTask = await updateTaskAsync({
      id: task.id,
      updates: { status: "done" },
    });
    await maybeAdvanceMilestone(updatedTask);
  };

  const handlePriorityCycle = async () => {
    if (!task || !localPriority || isCompleted) return;
    setIsCycling(true);
    const currentIndex = priorities.indexOf(localPriority);
    const nextPriority = priorities[(currentIndex + 1) % priorities.length];
    
    // Fast local update
    setLocalPriority(nextPriority);
    
    // Mutation in background
    try {
      await updateTaskAsync({ id: task.id, updates: { priority: nextPriority } });
    } finally {
      setIsCycling(false);
    }
  };

  const handleAddTag = (tagName: string) => {
    if (!task || isCompleted) return;
    const currentTags = (task.tags || []).map(getTagName).filter((value): value is string => Boolean(value));
    if (!currentTags.some((name) => name.toLowerCase() === tagName.toLowerCase())) {
      updateTask({ id: task.id, updates: { tags: [...currentTags.map((name) => ({ tag: { id: `temp-${name}`, name, createdAt: new Date().toISOString() } as import("../../types/tag").Tag })), { tag: { id: `temp-${tagName}`, name: tagName, createdAt: new Date().toISOString() } as import("../../types/tag").Tag }] } });
    }
  };

  const handleRemoveTag = (tagName: string) => {
    if (!task || isCompleted) return;
    const nextTags = (task.tags || [])
      .map(getTagName)
      .filter((name): name is string => Boolean(name) && name !== tagName)
      .map((name) => ({ tag: { id: `temp-${name}`, name, createdAt: new Date().toISOString() } as import("../../types/tag").Tag }));
    updateTask({ id: task.id, updates: { tags: nextTags } });
  };

  const handleAiEnrich = async () => {
    if (!task || isCompleted) return;

    const result = await taskEnrichmentAi.mutateAsync(task.id);
    updateTask({
      id: task.id,
      updates: {
        title: result.task.title || task.title,
        description: result.task.description || "",
        priority: result.task.priority,
        estimatedTime: result.task.estimatedTime ?? undefined,
        duration: result.task.duration ?? undefined,
        startDate: result.task.startDate ?? undefined,
        dueDate: result.task.dueDate ?? undefined,
        tags: result.task.tags.map((name) => ({ tag: { id: `temp-${name}`, name, createdAt: new Date().toISOString() } as import("../../types/tag").Tag })),
      },
    });

    setLocalDescription(result.task.description || "");
    setLocalPriority(result.task.priority);
  };

  const handleSubtaskToggle = (subtaskId: string, currentStatus: string) => {
    if (!task || isCompleted) return;
    const nextStatus = currentStatus === "done" ? "todo" : "done";
    updateSubtask({ taskId, subtaskId, updates: { status: nextStatus } });
  };

  const handleSubtaskDelete = (subtaskId: string) => {
    if (!task || isCompleted) return;
    if (confirm("Delete this step?")) {
      deleteSubtask({ taskId, subtaskId });
    }
  };

  const handleDelete = () => {
    if (isCompleted) return;
    deleteTaskAsync(taskId).then(() => onClose());
  };

  const handleAddSubtask = (title: string) => {
    if (isCompleted) return;
    addSubtask({ taskId, title });
  };

  const { notes } = useNotesStore();
  const [showNotePrompt, setShowNotePrompt] = useState(false);

  const handleLinkNote = (noteTitle: string) => {
    if (!task || isCompleted) return;
    const note = notes.find(n => n.title.toLowerCase() === noteTitle.toLowerCase());
    if (note) {
      const existingNoteIds = Array.from(
        new Set([
          ...(task.notes?.map(({ note: linkedNote }) => linkedNote.id) || []),
          ...(task.noteId ? [task.noteId] : []),
        ]),
      );
      if (!existingNoteIds.includes(note.id)) {
        updateTask({ id: task.id, updates: { noteId: existingNoteIds[0] || note.id, noteIds: [...existingNoteIds, note.id] } });
      }
    } else {
      alert("Note not found. Please select an existing note title.");
    }
  };

  const handleUnlinkNote = (noteIdToRemove: string) => {
    if (!task || isCompleted) return;
    const remainingNoteIds = Array.from(
      new Set(
        (task.notes?.map(({ note }) => note.id) || [])
          .concat(task.noteId ? [task.noteId] : [])
          .filter((id) => id !== noteIdToRemove),
      ),
    );
    updateTask({
      id: task.id,
      updates: {
        noteId: remainingNoteIds[0] || null,
        noteIds: remainingNoteIds,
      },
    });
  };

  const handleUpdateDescription = () => {
    if (!task || isCompleted) return;
    if (localDescription !== task.description) {
      updateTask({ id: task.id, updates: { description: localDescription } });
    }
    setIsEditingDesc(false);
  };

  const handleUpdateDuration = (val: string) => {
    if (!task || isCompleted) return;
    const dur = parseInt(val);
    if (!isNaN(dur) && dur >= 0) {
      updateTask({ id: task.id, updates: { duration: dur } });
    }
  };

  const persistExecutionMeta = (next: TaskExecutionMeta) => {
    const currentMap = readTaskExecutionMetaMap();
    currentMap[next.taskId] = next;
    writeTaskExecutionMetaMap(currentMap);
    setExecutionMeta(next);
  };

  const persistSchedule = (next: TaskScheduleMeta) => {
    setScheduleMeta(next);
  };

  const maybeAdvanceMilestone = async (candidateTask?: Task | null) => {
    if (!candidateTask?.dreamId || !dream || !milestoneContext.milestone) return;
    if (!milestoneContext.requireLinkedTasksComplete) return;
    if (milestoneContext.milestone.completed) return;

    const linkedTasks = tasks.filter((candidate) =>
      milestoneContext.architectureTaskIds.includes(candidate.id),
    );

    const everyTaskDone = linkedTasks.every((linkedTask) =>
      linkedTask.id === candidateTask.id
        ? true
        : linkedTask.status === "done",
    );

    if (everyTaskDone) {
      toggleMilestone(milestoneContext.milestone.id);
    }
  };

  const handleExecutionStateChange = (value: ExecutionState) => {
    if (!task) return;
    persistExecutionMeta({
      ...(executionMeta || buildDefaultTaskExecutionMeta(task, linkedNotes.length)),
      executionState: value,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleBlockerReasonChange = (value: string) => {
    if (!task) return;
    persistExecutionMeta({
      ...(executionMeta || buildDefaultTaskExecutionMeta(task, linkedNotes.length)),
      blockerReason: value || null,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleRequireReferenceNote = (value: string) => {
    if (!task) return;
    persistExecutionMeta({
      ...(executionMeta || buildDefaultTaskExecutionMeta(task, linkedNotes.length)),
      requireReferenceNote: value === "required",
      updatedAt: new Date().toISOString(),
    });
  };

  const handleFocusTargetChange = (value: string) => {
    if (!task) return;
    const nextValue = Number(value);
    persistExecutionMeta({
      ...(executionMeta || buildDefaultTaskExecutionMeta(task, linkedNotes.length)),
      focusMinutesTarget: Number.isFinite(nextValue) ? nextValue : 30,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDependencyToggle = (dependencyTaskId: string) => {
    if (!task || dependencyTaskId === task.id) return;
    const currentIds = executionMeta?.dependencyTaskIds || [];
    const nextIds = currentIds.includes(dependencyTaskId)
      ? currentIds.filter((id) => id !== dependencyTaskId)
      : [...currentIds, dependencyTaskId];

    persistExecutionMeta({
      ...(executionMeta || buildDefaultTaskExecutionMeta(task, linkedNotes.length)),
      dependencyTaskIds: nextIds,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDreamChange = async (dreamId: string) => {
    if (!task || isCompleted) return;
    await updateTaskAsync({
      id: task.id,
      updates: {
        dreamId: dreamId === "none" ? null : dreamId,
        projectId: dreamId === "none" ? null : task.projectId || null,
      },
    });
  };

  const handleProjectChange = async (projectId: string) => {
    if (!task || isCompleted) return;
    await updateTaskAsync({
      id: task.id,
      updates: {
        projectId: projectId === "none" ? null : projectId,
      },
    });
  };

  const handleMilestoneChange = (milestoneId: string) => {
    if (!task?.dreamId || isCompleted) return;
    assignTaskToMilestone(
      task.id,
      task.dreamId,
      milestoneId === "none" ? null : milestoneId,
    );
  };

  const handleFocusSessionSubmit = async (session: TaskFocusSession) => {
    const nextSessions = [session, ...focusSessions].slice(0, 24);
    const persisted = [
      session,
      ...readTaskFocusSessions().filter((entry) => entry.id !== session.id),
    ].slice(0, 120);
    writeTaskFocusSessions(persisted);
    setFocusSessions(nextSessions);

    if (!task) return;

    if (schedule.recurrence !== "none" && session.status === "completed") {
      const nextOccurrenceDates = Array.from(
        new Set([...(scheduleMeta?.occurrenceDates || task.occurrenceDates || []), toDateKey(new Date())]),
      ).sort();
      setScheduleMeta((current) =>
        current
          ? {
              ...current,
              occurrenceDates: nextOccurrenceDates,
              updatedAt: new Date().toISOString(),
            }
          : current,
      );
      await updateTaskAsync({
        id: task.id,
        updates: { occurrenceDates: nextOccurrenceDates },
      });
    }

    const shouldComplete =
      schedule.recurrence === "none" &&
      session.status === "completed" &&
      readiness.blockers.length === 0 &&
      task.status !== "done";

    const updatedTask = await updateTaskAsync({
      id: task.id,
      updates: {
        status:
          schedule.recurrence !== "none"
            ? "in_progress"
            : shouldComplete
              ? "done"
              : "in_progress",
      },
    });

    if (shouldComplete) {
      await maybeAdvanceMilestone(updatedTask);
    }
  };

  const handleScheduleDateChange = async (value: string) => {
    if (!task || isCompleted) return;
    const normalized = value || null;
    const next = {
      ...(scheduleMeta || buildDefaultTaskScheduleMeta(task)),
      scheduledDate: normalized,
      updatedAt: new Date().toISOString(),
    };
    persistSchedule(next);
    await updateTaskAsync({
      id: task.id,
      updates: {
        startDate: normalized || null,
        lastRescheduledAt: new Date().toISOString(),
      },
    });
  };

  const handleRecurrenceChange = async (value: string) => {
    if (!task || isCompleted) return;
    const nextRecurrence = value as TaskRecurrence;
    const defaultWeeklyDay = schedule.scheduledDate
      ? new Date(`${schedule.scheduledDate}T00:00:00`).getDay()
      : dayjs().day();
    const nextMeta = {
      ...(scheduleMeta || buildDefaultTaskScheduleMeta(task)),
      recurrence: nextRecurrence,
      weeklyDays:
        nextRecurrence === "weekly"
          ? (scheduleMeta?.weeklyDays?.length
              ? scheduleMeta.weeklyDays
              : [defaultWeeklyDay])
          : [],
      occurrenceDates:
        nextRecurrence === "none" ? [] : scheduleMeta?.occurrenceDates || [],
      updatedAt: new Date().toISOString(),
    };
    persistSchedule(nextMeta);

    await updateTaskAsync({
      id: task.id,
      updates: {
        recurrence: nextMeta.recurrence,
        weeklyDays: nextMeta.weeklyDays || [],
        occurrenceDates: nextMeta.occurrenceDates || [],
        status: nextRecurrence !== "none" && task.status === "done" ? "todo" : task.status,
      },
    });
  };

  const handleWeeklyDayToggle = async (weekday: number) => {
    if (!task || isCompleted) return;
    const currentDays = scheduleMeta?.weeklyDays || [];
    const nextDays = currentDays.includes(weekday)
      ? currentDays.filter((day) => day !== weekday)
      : [...currentDays, weekday].sort((left, right) => left - right);

    const nextMeta: TaskScheduleMeta = {
      ...(scheduleMeta || buildDefaultTaskScheduleMeta(task)),
      recurrence: "weekly",
      weeklyDays: nextDays,
      updatedAt: new Date().toISOString(),
    };
    persistSchedule(nextMeta);
    await updateTaskAsync({
      id: task.id,
      updates: {
        recurrence: "weekly",
        weeklyDays: nextDays,
      },
    });
  };

  const handleTodayCommitmentToggle = async () => {
    if (!task || isCompleted) return;
    const nextValue = !(scheduleMeta?.isTodayCommitment || false);
    persistSchedule({
      ...(scheduleMeta || buildDefaultTaskScheduleMeta(task)),
      isTodayCommitment: nextValue,
      updatedAt: new Date().toISOString(),
    });
    await updateTaskAsync({
      id: task.id,
      updates: { isTodayCommitment: nextValue },
    });
  };

  const handleQuickReschedule = async (days: number) => {
    if (!task || isCompleted) return;
    const nextDate = toDateKey(dayjs().add(days, "day").toDate());
    persistSchedule({
      ...(scheduleMeta || buildDefaultTaskScheduleMeta(task)),
      scheduledDate: nextDate,
      isTodayCommitment: false,
      lastRescheduledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await updateTaskAsync({
      id: task.id,
      updates: {
        startDate: nextDate,
        isTodayCommitment: false,
        lastRescheduledAt: new Date().toISOString(),
      },
    });
  };

  const handleRecurringOccurrenceRecord = async () => {
    if (!task || isCompleted) return;
    if (schedule.todayOccurrenceCompleted) return;
    const nextOccurrenceDates = Array.from(
      new Set([...(scheduleMeta?.occurrenceDates || task.occurrenceDates || []), toDateKey(new Date())]),
    ).sort();
    setScheduleMeta((current) =>
      current
        ? {
            ...current,
            occurrenceDates: nextOccurrenceDates,
            updatedAt: new Date().toISOString(),
          }
        : current,
    );

    await updateTaskAsync({
      id: task.id,
      updates: {
        occurrenceDates: nextOccurrenceDates,
        status: task.status === "todo" ? "in_progress" : task.status,
      },
    });
  };

  if (isLoading)
    return (
      <div className="absolute inset-0 z-20 w-full border-l border-border bg-surface-soft p-4 sm:p-5 lg:relative lg:w-[38rem] lg:p-6 xl:w-[42rem] 2xl:w-[46rem] space-y-6">
        <div className="h-8 w-32 bg-surface-mutes/50 animate-pulse rounded-lg" />
        <div className="h-24 w-full bg-surface-mutes/50 animate-pulse rounded-2xl" />
        <div className="h-48 w-full bg-surface-mutes/50 animate-pulse rounded-2xl" />
      </div>
    );

  if (!task)
    return (
      <div className="absolute inset-0 z-20 flex w-full items-center justify-center border-l border-border bg-surface-soft p-4 sm:p-5 lg:relative lg:w-[38rem] lg:p-6 xl:w-[42rem] 2xl:w-[46rem]">
        <p className="text-text-muted">Task context not found</p>
      </div>
    );

  const linkedNoteEntries = [
    ...(task.notes?.map(({ note }) => [note.id, note] as const) || []),
    ...(task.note
      ? [[task.note.id, { ...task.note, updatedAt: undefined, contentType: undefined }] as const]
      : []),
  ];

  const linkedNotes: { id: string; title: string; updatedAt?: string; contentType?: string }[] =
    Array.from(
      new Map<
        string,
        { id: string; title: string; updatedAt?: string; contentType?: string }
      >(linkedNoteEntries).values(),
    );
  const readiness = deriveTaskReadiness(task, tasks, executionMeta, dream);
  const sourceInboxItem = task.sourceInboxId
    ? inboxItems.find((item) => item.id === task.sourceInboxId)
    : null;
  const milestoneContext = getTaskMilestoneContext(task, dream);
  const schedule = getTaskScheduleSnapshot(task, scheduleMeta);
  const taskLedgerLogs = logs.filter((log) => log.taskId === task.id).slice(0, 4);
  const focusMinutesCompleted = Math.round(
    focusSessions.reduce((sum, session) => sum + session.durationMinutes, 0),
  );
  const lowerTitle = task.title.toLowerCase();
  const tagNames = (task.tags || [])
    .map(getTagName)
    .filter((value): value is string => Boolean(value))
    .map((value) => value.toLowerCase());
  const shouldShowReadingSession =
    lowerTitle.includes("read") ||
    lowerTitle.includes("study") ||
    tagNames.some((tag) =>
      ["reading", "book", "study", "research", "knowledge"].includes(tag),
    ) ||
    linkedNotes.length > 0;
  const readingLogs = (task.taskLogs || []).filter((log) =>
    log.title.toLowerCase().includes("reading session"),
  );

  return (
    <div className="absolute inset-0 z-20 flex h-full w-full flex-col border-l border-border bg-surface-soft shadow-2xl shadow-black/50 animate-in slide-in-from-right duration-500 ease-out lg:relative lg:w-[38rem] xl:w-[42rem] 2xl:w-[46rem]">
      {/* Header */}
      <div className="glass flex items-center justify-between border-b border-border p-4 sm:p-5 xl:p-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => useTasksStore.getState().setSelectedTaskId(null)}
            className="-ml-2 p-2 text-text-muted hover:text-text-main hover:bg-surface-mutes/50 rounded-xl transition-all"
            title="Back to list"
          >
            <FiArrowLeft size={18} />
          </button>
          <div
            className={`w-2 h-2 rounded-full ${isUpdating ? "bg-amber-400" : "bg-brand-primary"} animate-pulse`}
          />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted/60">
            {isUpdating
              ? "Synchronizing..."
              : isDeleting
                ? "Terminating..."
                : "Execution Context"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {!isCompleted && (
            <>
              <button
                onClick={() => setIsEditingDesc(true)}
                className="p-2 text-text-muted hover:text-text-main hover:bg-surface-mutes/50 rounded-xl transition-all duration-200"
              >
                <FiEdit size={16} />
              </button>
              <button
                onClick={handleAiEnrich}
                className="p-2 text-text-muted hover:text-brand-primary hover:bg-surface-mutes/50 rounded-xl transition-all duration-200"
                title="AI enrich objective"
              >
                <FiZap size={16} className={taskEnrichmentAi.isPending ? "animate-pulse" : ""} />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-text-muted hover:text-brand-accent hover:bg-brand-accent/10 rounded-xl transition-all duration-200"
              >
                <FiTrash2 size={16} />
              </button>
              <div className="w-px h-6 bg-surface-mutes/50 mx-1" />
            </>
          )}
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text-main hover:bg-surface-mutes/50 rounded-xl transition-all duration-200"
          >
            <FiX size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="custom-scrollbar flex-1 overflow-y-auto">
        {/* Warning Toast */}
        <div className="p-4 sm:p-5 xl:p-6 pb-0">
          <AnimatePresence>
            {showSubtaskWarning && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="mb-8 p-6 rounded-3xl bg-brand-accent/10 border-2 border-brand-accent/30 shadow-2xl shadow-brand-accent/5 backdrop-blur-md relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-linear-to-br from-brand-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-start gap-4 relative z-10">
                  <div className="p-3 rounded-2xl bg-brand-accent/20 text-brand-accent shadow-lg shadow-brand-accent/20 animate-bounce">
                    <FiZap size={20} />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-sm font-black text-brand-accent uppercase tracking-widest mb-1">
                      System Interlock Initialized
                    </h5>
                    <p className="text-xs text-brand-accent/80 font-bold leading-relaxed">
                      Objective completion is disabled. Prerequisite sub-layers
                      must all reach 100% synchronization before final execution
                      state can be committed.
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                      <button
                        onClick={() => setShowSubtaskWarning(false)}
                        className="px-4 py-1.5 rounded-xl bg-brand-accent/20 text-[10px] font-bold text-brand-accent hover:bg-brand-accent/30 transition-all uppercase tracking-widest"
                      >
                        Acknowledge
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Title Section */}
          <div className="mb-6">
            <div className="mb-4 flex min-w-0 items-start gap-4">
              <button
                onClick={handleStatusToggle}
                className={`mt-1.5 shrink-0 transition-all active:scale-75 ${task.status === "done" ? "text-brand-primary" : "text-text-muted/40 hover:text-text-main"}`}
              >
                {task.status === "done" ? (
                  <FiCheckCircle
                    size={24}
                    className="drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]"
                  />
                ) : task.status === "in_progress" ? (
                  <FiActivity
                    size={24}
                    className="animate-pulse text-amber-400"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-current opacity-30" />
                )}
              </button>
              <h2
                className={`min-w-0 text-xl sm:text-2xl font-display font-extrabold leading-tight break-words ${task.status === "done" ? "text-text-muted/50 line-through" : "text-text-main"}`}
              >
                {task.title}
              </h2>
            </div>

            <div className="ml-0 flex flex-wrap gap-2 sm:ml-10">
              {(task.tags || []).map((tagObj, index) => {
                const tagName = getTagName(tagObj);
                if (!tagName) return null;

                const tagId =
                  tagObj &&
                  typeof tagObj === "object" &&
                  "tag" in tagObj &&
                  tagObj.tag &&
                  typeof tagObj.tag === "object" &&
                  "id" in tagObj.tag
                    ? String(tagObj.tag.id)
                    : `temp-${tagName}-${index}`;

                const tagColor =
                  tagObj &&
                  typeof tagObj === "object" &&
                  "tag" in tagObj &&
                  tagObj.tag &&
                  typeof tagObj.tag === "object" &&
                  "color" in tagObj.tag
                    ? (tagObj.tag.color as string | null | undefined)
                    : undefined;

                return (
                  <span
                    key={tagId}
                    onClick={() => !isCompleted && handleRemoveTag(tagName)}
                    className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-xl border uppercase tracking-tighter transition-all group ${!isCompleted ? "cursor-pointer hover:opacity-90" : ""}`}
                    style={getTagColorStyle(tagColor)}
                  >
                    <FiTag size={10} /> {tagName}
                    {!isCompleted && (
                      <span className="opacity-0 group-hover:opacity-100">
                        &times;
                      </span>
                    )}
                  </span>
                );
              })}
              {!isCompleted && (
                <button
                  onClick={() => setShowTagPrompt(true)}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted bg-surface-mutes/50 px-3 py-1.5 rounded-xl border border-border hover:bg-white/10 hover:text-text-main transition-all uppercase tracking-tighter"
                >
                  <FiPlus size={10} /> Link Tag
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Command Center Tabs */}
        <div className="sticky top-0 z-20 bg-surface-soft/80 backdrop-blur-xl border-y border-border px-4 sm:px-6">
          <div className="flex gap-6 overflow-x-auto custom-scrollbar no-scrollbar py-3">
            {(
              [
                { id: "overview", label: "Overview", icon: FiActivity },
                { id: "architecture", label: "Architecture", icon: FiZap },
                { id: "scheduling", label: "Scheduling", icon: FiCalendar },
                { id: "intelligence", label: "Intelligence", icon: FiBookOpen },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap px-1 py-1 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${
                  activeTab === tab.id
                    ? "text-brand-primary"
                    : "text-text-muted hover:text-text-main"
                }`}
              >
                <tab.icon size={12} />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-[13px] left-0 right-0 h-0.5 bg-brand-primary shadow-[0_0_8px_rgba(99,102,241,0.6)]"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-5 xl:p-6 pb-20">
          {activeTab === "overview" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="p-4 rounded-2xl bg-surface-base/80 border border-border group hover:border-brand-primary/30 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-brand-primary/10 text-brand-primary">
                      <FiClock size={12} />
                    </div>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      Schedule State
                    </span>
                  </div>
                  <p className="text-sm text-text-main font-bold">
                    {schedule.scheduledDate ? (
                      dayjs(schedule.scheduledDate).format("MMM DD, YYYY")
                    ) : (
                      <span className="text-text-muted font-medium italic opacity-40">
                        Not scheduled
                      </span>
                    )}
                  </p>
                  {(schedule.endDate || task.dueDate) && (
                    <p className="text-[10px] text-text-muted mt-1 uppercase font-semibold">
                      {schedule.endDate
                        ? `Window ends ${dayjs(schedule.endDate).format("MMM DD")}`
                        : `Due ${dayjs(task.dueDate).format("MMM DD")}`}
                    </p>
                  )}
                </div>
                <button
                  onClick={handlePriorityCycle}
                  disabled={isCompleted}
                  className={`p-4 rounded-2xl bg-surface-base/80 border border-border group transition-all duration-300 text-left relative overflow-hidden ${isCompleted ? "cursor-default" : "hover:border-brand-primary/30"}`}
                >
                  <AnimatePresence mode="wait">
                    {isCycling && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-brand-primary/5 flex items-center justify-center backdrop-blur-[2px]"
                      >
                        <FiActivity
                          className="animate-spin text-brand-primary"
                          size={16}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`p-1.5 rounded-lg ${
                        localPriority === "urgent"
                          ? "bg-brand-accent/10 text-brand-accent"
                          : localPriority === "high"
                            ? "bg-amber-400/10 text-amber-400"
                            : localPriority === "low"
                              ? "bg-blue-400/10 text-blue-400"
                              : "bg-white/10 text-text-muted"
                      }`}
                    >
                      <FiFlag size={12} />
                    </div>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      Priority
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.p
                      key={localPriority}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className={`text-sm font-extrabold uppercase tracking-tight ${
                        localPriority === "urgent"
                          ? "text-brand-accent"
                          : localPriority === "high"
                            ? "text-amber-400"
                            : localPriority === "low"
                              ? "text-blue-400"
                              : "text-text-main"
                      }`}
                    >
                      {localPriority || "Medium"}
                    </motion.p>
                  </div>
                </button>

                <button
                  onClick={() => !isCompleted && setShowDurationPrompt(true)}
                  disabled={isCompleted}
                  className={`p-4 rounded-2xl bg-surface-base/80 border border-border group transition-all duration-300 text-left ${isCompleted ? "cursor-default" : "hover:border-brand-primary/30"}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-emerald-400/10 text-emerald-400">
                      <FiZap size={12} />
                    </div>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      Duration
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-extrabold text-text-main uppercase tracking-tight">
                      {task.duration || 0} {task.duration === 1 ? "Day" : "Days"}
                    </p>
                  </div>
                  <p className="text-[10px] text-text-muted mt-1 uppercase font-semibold">
                    {schedule.progressLabel || "Execution Span"}
                  </p>
                </button>
                <div className="p-4 rounded-2xl bg-surface-base/80 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400">
                      <FiCalendar size={12} />
                    </div>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      Dream Node
                    </span>
                  </div>
                  <p className="text-sm text-text-main font-bold truncate">
                    {task.dream?.title || "Standalone Task"}
                  </p>
                  {task.project && (
                    <p className="text-[10px] text-text-muted mt-1 uppercase font-semibold">
                      Layer: {task.project.title}
                    </p>
                  )}
                </div>
              </div>

              {/* Description Section */}
              <div className="p-6 rounded-3xl bg-linear-to-b from-surface-base to-surface-soft border border-border relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <FiZap size={64} className="text-brand-primary" />
                </div>
                <div className="relative z-10 w-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FiActivity size={14} className="text-brand-primary" />
                      <h4 className="text-[10px] font-bold text-text-main uppercase tracking-[0.2em]">
                        Objective Details
                      </h4>
                    </div>
                    {!isEditingDesc && !isCompleted && (
                      <button
                        onClick={() => setIsEditingDesc(true)}
                        className="p-1.5 rounded-lg hover:bg-surface-mutes/50 text-text-muted transition-all"
                      >
                        <FiEdit size={12} />
                      </button>
                    )}
                  </div>

                  {isEditingDesc ? (
                    <textarea
                      autoFocus
                      value={localDescription}
                      onChange={(e) => setLocalDescription(e.target.value)}
                      onBlur={handleUpdateDescription}
                      className="w-full bg-transparent text-sm text-text-main leading-relaxed outline-none border-none resize-none min-h-24 custom-scrollbar"
                      placeholder="Describe the desired outcome..."
                    />
                  ) : (
                    <div
                      onClick={() => !isCompleted && setIsEditingDesc(true)}
                      className={`text-sm text-text-muted leading-relaxed prose prose-invert font-medium ${isCompleted ? "cursor-default" : "cursor-text"}`}
                    >
                      {task.description ||
                        "The intelligence engine is awaiting further context for this objective. Define the scope to enable deeper execution linking."}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "architecture" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Subtasks Section */}
              <div className="rounded-3xl border border-border bg-surface-mutes/50 p-5">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary">
                    Execution Steps
                  </p>
                  <div className="h-px flex-1 bg-surface-mutes/50 ml-4" />
                </div>
                <div className="space-y-2 mb-6">
                  {task.subtasks?.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-surface-base/50 border border-border group/sub"
                    >
                      <button
                        onClick={() => handleSubtaskToggle(sub.id, sub.status)}
                        disabled={isCompleted || isUpdatingSubtask}
                        className={`shrink-0 transition-all active:scale-75 ${sub.status === "done" ? "text-brand-primary" : "text-text-muted/40 group-hover/sub:text-text-muted/70"} ${isCompleted || isUpdatingSubtask ? "cursor-wait opacity-50" : ""}`}
                      >
                        {isUpdatingSubtask ? (
                          <FiActivity size={16} className="animate-spin" />
                        ) : sub.status === "done" ? (
                          <FiCheckCircle size={16} />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-current" />
                        )}
                      </button>
                      <span
                        className={`flex-1 text-sm ${sub.status === "done" ? "text-text-muted line-through" : "text-text-main font-medium"}`}
                      >
                        {sub.title}
                      </span>
                      {!isCompleted && (
                        <button
                          onClick={() => handleSubtaskDelete(sub.id)}
                          className="opacity-0 group-hover/sub:opacity-100 p-1 text-text-muted hover:text-red-400 transition-all"
                        >
                          <FiX size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                  {!isCompleted && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      <button
                        onClick={() => setShowSubtaskPrompt(true)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-border text-text-muted hover:text-text-main hover:border-white/20 transition-all"
                      >
                        <FiPlus size={16} />
                        <span className="text-xs font-semibold uppercase tracking-widest">
                          Add Subtask
                        </span>
                      </button>
                      <button
                        onClick={async () => {
                          const result = await taskSubtasksAi.mutateAsync(task.id);
                          result.subtasks.forEach((subtask) => handleAddSubtask(subtask.title));
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-amber-400/20 bg-amber-400/10 text-amber-300 hover:bg-amber-400/15 transition-all"
                      >
                        <FiZap size={16} />
                        <span className="text-xs font-semibold uppercase tracking-widest">
                          {taskSubtasksAi.isPending ? "Generating..." : "AI Subtasks"}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Execution Cockpit: Structure & Rules */}
              <div className="rounded-3xl border border-border bg-surface-mutes/50 p-5">
                <div className="flex items-center justify-between gap-3 mb-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary">
                      Execution Cockpit
                    </p>
                    <p className="mt-2 text-[10px] leading-5 text-text-muted/70 uppercase font-black tracking-widest">
                      Deep Architecture Controls
                    </p>
                  </div>
                  <div
                    className={`rounded-2xl border px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] ${
                      readiness.executionState === "blocked"
                        ? "border-rose-400/20 bg-rose-400/10 text-rose-200"
                        : readiness.executionState === "ready"
                          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                          : readiness.executionState === "in_progress"
                            ? "border-amber-400/20 bg-amber-400/10 text-amber-200"
                            : "border-border bg-surface-mutes/20 text-text-main"
                    }`}
                  >
                    {readiness.readinessLabel}
                  </div>
                </div>

                <div className="grid gap-4 2xl:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-surface-mutes/20 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted mb-4">
                      Structural Linking
                    </p>
                    <div className="grid gap-3">
                      <Select
                        value={task.dreamId || "none"}
                        onValueChange={handleDreamChange}
                      >
                        <SelectTrigger className="rounded-xl border-border bg-surface-mutes/50 text-text-main">
                          <SelectValue placeholder="Link dream" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No dream</SelectItem>
                          {dreams.map((dreamOption) => (
                            <SelectItem key={dreamOption.id} value={dreamOption.id}>
                              {dreamOption.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={task.projectId || "none"}
                        onValueChange={handleProjectChange}
                      >
                        <SelectTrigger className="rounded-xl border-border bg-surface-mutes/50 text-text-main">
                          <SelectValue placeholder="Link project" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No project</SelectItem>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={readiness.milestoneId || "none"}
                        onValueChange={handleMilestoneChange}
                        disabled={!task.dreamId}
                      >
                        <SelectTrigger className="rounded-xl border-border bg-surface-mutes/50 text-text-main">
                          <SelectValue placeholder="Attach to milestone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No milestone</SelectItem>
                          {(dream?.milestones || []).map((milestone) => (
                            <SelectItem key={milestone.id} value={milestone.id}>
                              {milestone.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-surface-mutes/20 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted mb-4">
                      Execution Policies
                    </p>
                    <div className="grid gap-3">
                      <Select
                        value={executionMeta?.executionState || readiness.executionState}
                        onValueChange={(value) =>
                          handleExecutionStateChange(value as ExecutionState)
                        }
                      >
                        <SelectTrigger className="rounded-xl border-border bg-surface-mutes/50 text-text-main">
                          <SelectValue placeholder="Execution state" />
                        </SelectTrigger>
                        <SelectContent>
                          {executionStates.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state.replace("_", " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={executionMeta?.requireReferenceNote ? "required" : "optional"}
                        onValueChange={handleRequireReferenceNote}
                      >
                        <SelectTrigger className="rounded-xl border-border bg-surface-mutes/50 text-text-main">
                          <SelectValue placeholder="Reference note policy" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="optional">Note Optional</SelectItem>
                          <SelectItem value="required">Note Required</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        value={String(executionMeta?.focusMinutesTarget || readiness.focusMinutesTarget)}
                        onValueChange={handleFocusTargetChange}
                      >
                        <SelectTrigger className="rounded-xl border-border bg-surface-mutes/50 text-text-main">
                          <SelectValue placeholder="Focus target" />
                        </SelectTrigger>
                        <SelectContent>
                          {[15, 25, 30, 45, 60, 90].map((minutes) => (
                            <SelectItem key={minutes} value={String(minutes)}>
                              {minutes} minutes
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 2xl:grid-cols-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted mb-3">
                      Active Blocker
                    </p>
                    <textarea
                      value={executionMeta?.blockerReason || ""}
                      onChange={(event) => handleBlockerReasonChange(event.target.value)}
                      placeholder="What is blocking this task?"
                      className="min-h-32 w-full rounded-2xl border border-border bg-surface-mutes/30 px-4 py-3 text-sm leading-6 text-text-main outline-none focus:border-brand-primary/40"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted mb-3">
                      Dependencies
                    </p>
                    <div className="flex max-h-32 flex-col gap-2 overflow-y-auto custom-scrollbar no-scrollbar">
                      {tasks
                        .filter((candidate) => candidate.id !== task.id)
                        .slice(0, 8)
                        .map((candidate) => {
                          const active = executionMeta?.dependencyTaskIds.includes(candidate.id);
                          return (
                            <button
                              key={candidate.id}
                              type="button"
                              onClick={() => handleDependencyToggle(candidate.id)}
                              className={`rounded-xl border px-3 py-2 text-left transition ${
                                active
                                  ? "border-brand-primary/30 bg-brand-primary/10 text-white"
                                  : "border-border bg-surface-mutes/50 text-text-muted hover:text-text-main"
                              }`}
                            >
                              <p className="text-xs font-bold truncate">{candidate.title}</p>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "scheduling" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Scheduling Window */}
              <div className="rounded-3xl border border-border bg-surface-mutes/50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary">
                      Scheduling Window
                    </p>
                    <p className="mt-2 text-[10px] leading-5 text-text-muted/70 uppercase font-black tracking-widest">
                      Temporal Execution Bounds
                    </p>
                  </div>
                  <div
                    className={`rounded-2xl border px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] ${
                      schedule.bucket === "today"
                        ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                        : schedule.bucket === "carryover"
                          ? "border-amber-400/20 bg-amber-400/10 text-amber-200"
                          : schedule.bucket === "overdue"
                            ? "border-rose-400/20 bg-rose-400/10 text-rose-200"
                            : "border-border bg-surface-mutes/20 text-text-main"
                    }`}
                  >
                    {schedule.statusLabel}
                  </div>
                </div>

                <div className="grid gap-4 2xl:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-surface-mutes/20 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted mb-4">
                      Date Configuration
                    </p>
                    <div className="grid gap-4">
                      <label className="space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-[0.16em] text-text-muted ml-1">
                          Scheduled
                        </span>
                        <input
                          type="date"
                          value={schedule.scheduledDate || ""}
                          onChange={(event) => handleScheduleDateChange(event.target.value)}
                          className="w-full rounded-xl border border-border bg-surface-mutes/50 px-3 py-2.5 text-xs text-text-main outline-none focus:border-brand-primary/40"
                          disabled={isCompleted}
                        />
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <span className="text-[9px] font-black uppercase tracking-[0.16em] text-text-muted ml-1">
                            Due
                          </span>
                          <div className="rounded-xl border border-border bg-surface-mutes/50 px-3 py-2.5 text-xs text-text-main">
                            {schedule.dueDate ? dayjs(schedule.dueDate).format("MMM DD, YYYY") : "None"}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] font-black uppercase tracking-[0.16em] text-text-muted ml-1">
                            Recurrence
                          </span>
                          <Select value={schedule.recurrence} onValueChange={handleRecurrenceChange} disabled={isCompleted}>
                            <SelectTrigger className="h-[38px] rounded-xl border-border bg-surface-mutes/50 text-xs text-text-main">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      {schedule.recurrence === "weekly" && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {weekdayOptions.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => handleWeeklyDayToggle(opt.value)}
                              className={`w-9 h-9 rounded-lg border text-[9px] font-black transition-all ${
                                schedule.weeklyDays.includes(opt.value)
                                  ? "bg-brand-primary border-brand-primary text-white"
                                  : "bg-surface-mutes/50 border-border text-text-muted hover:border-border"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-surface-mutes/20 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted mb-4">
                      Control Actions
                    </p>
                    <div className="grid gap-3">
                      <button
                        onClick={handleTodayCommitmentToggle}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                          schedule.isTodayCommitment 
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                            : "bg-surface-mutes/50 border-border text-text-muted hover:bg-white/10"
                        }`}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-widest">Commit to Today</span>
                        <FiClock size={14} className={schedule.isTodayCommitment ? "animate-pulse" : ""} />
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleQuickReschedule(1)}
                          className="p-3 rounded-xl border border-border bg-surface-mutes/50 text-[9px] font-bold uppercase tracking-widest text-text-muted hover:bg-white/10 hover:text-text-main transition-all"
                        >
                          Tomorrow
                        </button>
                        <button
                          onClick={() => handleQuickReschedule(3)}
                          className="p-3 rounded-xl border border-border bg-surface-mutes/50 text-[9px] font-bold uppercase tracking-widest text-text-muted hover:bg-white/10 hover:text-text-main transition-all"
                        >
                          Defer 3d
                        </button>
                      </div>

                      {schedule.recurrence !== "none" && (
                        <button
                          onClick={handleRecurringOccurrenceRecord}
                          disabled={schedule.todayOccurrenceCompleted}
                          className={`w-full p-3 rounded-xl border transition-all ${
                            schedule.todayOccurrenceCompleted
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400/50"
                              : "bg-brand-primary/10 border-brand-primary/30 text-brand-primary hover:bg-brand-primary/20"
                          }`}
                        >
                          <span className="text-[10px] font-bold uppercase tracking-widest">
                            {schedule.todayOccurrenceCompleted ? "Occurrence Logged" : "Log Occurrence"}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recurrence Pulse Stats */}
              {schedule.recurrence !== "none" && (
                <div className="rounded-3xl border border-border bg-surface-mutes/50 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary mb-6">
                    Recurrence Pulse
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-2xl bg-surface-mutes/20 border border-border">
                      <p className="text-[8px] font-black uppercase text-text-muted mb-1">Period</p>
                      <p className="text-base font-black text-white">{schedule.completedThisPeriod}/{schedule.requiredThisPeriod || 1}</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-surface-mutes/20 border border-border">
                      <p className="text-[8px] font-black uppercase text-text-muted mb-1">Missed</p>
                      <p className="text-base font-black text-rose-400">{schedule.missedThisPeriod}</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-surface-mutes/20 border border-border">
                      <p className="text-[8px] font-black uppercase text-text-muted mb-1">Next</p>
                      <p className="text-[10px] font-bold text-emerald-400 truncate">
                        {schedule.nextOccurrenceDate ? dayjs(schedule.nextOccurrenceDate).format("ddd, DD") : "Due Today"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "intelligence" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Focus & Reading Sessions */}
              <div className="grid gap-4 2xl:grid-cols-2">
                <div className="rounded-3xl border border-border bg-surface-mutes/50 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary">Focus Flow</p>
                    <button onClick={() => setShowFocusSession(true)} className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 transition-all">
                      <FiZap size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="p-3 rounded-xl bg-surface-mutes/20 text-center">
                      <p className="text-[8px] font-black text-text-muted uppercase mb-1">Total</p>
                      <p className="text-sm font-black text-white">{focusMinutesCompleted}m</p>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-mutes/20 text-center">
                      <p className="text-[8px] font-black text-text-muted uppercase mb-1">Target</p>
                      <p className="text-sm font-black text-white">{readiness.focusMinutesTarget}m</p>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar">
                    {focusSessions.slice(0, 3).map(s => (
                      <div key={s.id} className="p-2 rounded-lg bg-surface-mutes/50 border border-border flex justify-between items-center text-[10px]">
                        <span className="font-bold text-text-main">{s.durationMinutes}m focused</span>
                        <span className="text-text-muted uppercase">{dayjs(s.createdAt).fromNow()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-border bg-surface-mutes/50 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary">Reading Log</p>
                    {shouldShowReadingSession && (
                      <button onClick={() => setShowReadingSession(true)} className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 transition-all">
                        <FiBookOpen size={14} />
                      </button>
                    )}
                  </div>
                  <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar">
                    {readingLogs.length ? readingLogs.slice(0, 4).map(l => (
                      <div key={l.id} className="p-2 rounded-lg bg-surface-mutes/50 border border-border flex justify-between items-center text-[10px]">
                        <span className="font-bold text-text-main">{l.duration}m reading</span>
                        <span className="text-text-muted uppercase">{dayjs(l.completedAt).fromNow()}</span>
                      </div>
                    )) : (
                      <p className="text-[10px] text-text-muted italic opacity-40 text-center py-8">No reading logs found</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Source Trace & Ledger Summary */}
              <div className="grid gap-4 2xl:grid-cols-2">
                <div className="rounded-3xl border border-border bg-surface-mutes/50 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary mb-4">Source Trace</p>
                  <div className="p-4 rounded-2xl bg-surface-mutes/20 text-xs leading-relaxed text-text-muted/90">
                    {sourceInboxItem?.content || sourceInboxItem?.rawInput || "Standalone entry context."}
                  </div>
                </div>
                <div className="rounded-3xl border border-border bg-surface-mutes/50 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary mb-4">Ledger Summary</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                    {taskLedgerLogs.map(log => (
                      <div key={log.id} className="p-2.5 rounded-xl bg-surface-mutes/50 border border-border flex justify-between items-center text-[10px]">
                        <span className="font-black text-text-main uppercase tracking-tight truncate mr-4">{log.title}</span>
                        <span className="text-text-muted shrink-0">{dayjs(log.completedAt).format("MMM D")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Knowledge Nodes & Execution Timeline */}
              <div className="grid gap-4 2xl:grid-cols-[0.8fr_1.2fr]">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted mb-2">Connected Nodes</p>
                  {linkedNotes.map(n => (
                    <div key={n.id} className="p-3 rounded-xl bg-surface-base border border-brand-primary/20 flex items-center gap-3">
                      <FiLink className="text-brand-primary" size={12} />
                      <span className="text-xs font-bold text-text-main truncate">{n.title}</span>
                    </div>
                  ))}
                  {!isCompleted && (
                    <button onClick={() => setShowNotePrompt(true)} className="w-full p-4 rounded-2xl border border-dashed border-border text-[9px] font-black uppercase tracking-widest text-text-muted hover:text-brand-primary transition-all">
                      Connect Library
                    </button>
                  )}
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted mb-4">Execution History</p>
                  <div className="border-l border-border ml-2 pl-6 space-y-4">
                    {task.activities?.slice(0, 5).map((a, i) => (
                      <div key={i} className="relative">
                        <div className="absolute -left-[29px] top-1 w-2 h-2 rounded-full bg-brand-primary shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                        <p className="text-[10px] font-black text-text-main uppercase tracking-widest">{a.action}</p>
                        <p className="text-[8px] text-text-muted uppercase mt-0.5">{dayjs(a.timestamp).format("MMM DD · HH:mm")}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Visual Context */}
              <div className="pt-4">
                <ImageGallery parentType="task" parentId={task.id} />
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Footer Actions */}
      <div className="glass border-t border-border p-4 sm:p-5 xl:p-6">
        <button
          onClick={handleMarkDone}
          disabled={isCompleted || isUpdating}
          className={`w-full py-4 rounded-2xl text-white text-xs font-bold uppercase tracking-[0.2em] transition-all shadow-2xl ${isCompleted ? "bg-emerald-500/20 text-emerald-500 shadow-none cursor-default border border-emerald-500/30" : "bg-brand-primary hover:bg-brand-primary/90 hover:scale-[1.02] active:scale-[0.98] shadow-brand-primary/30"}`}
        >
          {isCompleted ? (
            <span className="flex items-center justify-center gap-2">
              <FiCheckCircle size={14} /> Objective Finalized
            </span>
          ) : isUpdating ? (
            <span className="flex items-center justify-center gap-2">
              <FiActivity size={14} className="animate-spin" /> Committing
              State...
            </span>
          ) : readiness.blockers.length > 0 ? (
            "Resolve blockers to complete"
          ) : (
            "Mark as Completed"
          )}
        </button>
      </div>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Objective"
        message="Are you sure you want to terminate this task execution context? This action cannot be reversed."
        confirmText="Confirm Deletion"
      />

      <PromptModal
        isOpen={showSubtaskPrompt}
        onClose={() => setShowSubtaskPrompt(false)}
        onSubmit={handleAddSubtask}
        title="New Execution Step"
        message="Define the next step for this objective."
        placeholder="e.g. Verify database migrations"
      />

      <PromptModal
        isOpen={showTagPrompt}
        onClose={() => setShowTagPrompt(false)}
        onSubmit={handleAddTag}
        title="Link Tag"
        message="Add a classification tag to this task."
        placeholder="e.g. Research, Design, API"
        suggestions={allTags.map((t) => t.name)}
      />

      <PromptModal
        isOpen={showNotePrompt}
        onClose={() => setShowNotePrompt(false)}
        onSubmit={handleLinkNote}
        title="Link Knowledge Node"
        message="Connect this task to a relevant note in your library."
        placeholder="Type note title..."
        suggestions={notes.map((n) => n.title)}
      />

      <PromptModal
        isOpen={showDurationPrompt}
        onClose={() => setShowDurationPrompt(false)}
        onSubmit={handleUpdateDuration}
        title="Execution Span"
        message="How many days should this objective span? This determines its visibility in your workflow."
        placeholder="e.g. 3"
        defaultValue={task.duration?.toString() || "0"}
      />

      <ReadingSessionModal
        key={showReadingSession ? `reading-${task.id}` : "reading-closed"}
        task={task}
        linkedSourceTitle={linkedNotes[0]?.title || task.note?.title || task.title}
        isOpen={showReadingSession}
        onClose={() => setShowReadingSession(false)}
        onSubmit={async (payload) => {
          if (
            schedule.recurrence !== "none" &&
            payload.activeDurationMinutes >=
              (payload.requiredMinutes || executionMeta?.focusMinutesTarget || readiness.focusMinutesTarget)
          ) {
            const nextOccurrenceDates = Array.from(
              new Set([...(scheduleMeta?.occurrenceDates || task.occurrenceDates || []), toDateKey(new Date())]),
            ).sort();
            setScheduleMeta((current) =>
              current
                ? {
                    ...current,
                    occurrenceDates: nextOccurrenceDates,
                    updatedAt: new Date().toISOString(),
                  }
                : current,
            );
            await updateTaskAsync({
              id: task.id,
              updates: { occurrenceDates: nextOccurrenceDates },
            });
          }
          const updatedTask = await logReadingSessionAsync({ taskId: task.id, payload });
          await maybeAdvanceMilestone(updatedTask);
          setShowReadingSession(false);
        }}
        isSubmitting={isLoggingReadingSession}
      />
      <FocusSessionModal
        key={showFocusSession ? `focus-${task.id}` : "focus-closed"}
        task={task}
        requiredMinutes={executionMeta?.focusMinutesTarget || readiness.focusMinutesTarget}
        isOpen={showFocusSession}
        onClose={() => setShowFocusSession(false)}
        onSubmit={async (session) => {
          await handleFocusSessionSubmit(session);
          setShowFocusSession(false);
        }}
      />
    </div>
  );
}

function FocusSummaryCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface-mutes/20 p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">
        {label}
      </p>
      <p className="mt-2 text-lg font-black text-white">{value}</p>
    </div>
  );
}

function FocusSessionModal({
  task,
  requiredMinutes,
  isOpen,
  onClose,
  onSubmit,
}: {
  task: Task;
  requiredMinutes: number;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (session: TaskFocusSession) => Promise<void>;
}) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [activeSeconds, setActiveSeconds] = useState(0);
  const [engagementCount, setEngagementCount] = useState(0);
  const lastInteractionRef = useRef(0);
  const lastSignalRef = useRef(0);



  useEffect(() => {
    if (!isOpen) return;
    lastInteractionRef.current = Date.now();

    const registerSignal = () => {
      const now = Date.now();
      lastInteractionRef.current = now;
      if (now - lastSignalRef.current > 4000) {
        setEngagementCount((current) => current + 1);
        lastSignalRef.current = now;
      }
    };

    const interval = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
      const visible = !document.hidden;
      const recentlyActive = Date.now() - lastInteractionRef.current < 60000;
      if (visible && recentlyActive) {
        setActiveSeconds((current) => current + 1);
      }
    }, 1000);

    const handleVisibility = () => {
      if (!document.hidden) {
        lastInteractionRef.current = Date.now();
      }
    };

    window.addEventListener("mousemove", registerSignal);
    window.addEventListener("keydown", registerSignal);
    window.addEventListener("scroll", registerSignal, true);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("mousemove", registerSignal);
      window.removeEventListener("keydown", registerSignal);
      window.removeEventListener("scroll", registerSignal, true);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isOpen]);

  const activeDurationMinutes = Math.round((activeSeconds / 60) * 10) / 10;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Deep Work Session"
      panelClassName="max-w-2xl"
      contentClassName="space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <ReadingMetric label="Elapsed" value={formatTimer(elapsedSeconds)} />
        <ReadingMetric label="Active" value={formatTimer(activeSeconds)} />
        <ReadingMetric label="Signals" value={String(engagementCount)} />
      </div>

      <div className="rounded-2xl border border-border bg-surface-mutes/50 p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-primary">
          Focus Validation
        </p>
        <p className="mt-2 text-sm leading-6 text-text-muted">
          This session counts as a strong execution pass when active engagement
          reaches at least {requiredMinutes} minutes with visible interaction.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface-mutes/20 p-4">
        <p className="text-sm font-bold text-white">{task.title}</p>
        <p className="mt-2 text-xs leading-5 text-text-muted">
          End the session when you are done. It will be recorded in the task’s
          local focus history and can move the task into progress or completion.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() =>
            onSubmit({
              id: `focus-${Date.now()}`,
              taskId: task.id,
              durationMinutes: activeDurationMinutes,
              requiredMinutes,
              engagementCount,
              status:
                activeDurationMinutes >= requiredMinutes && engagementCount > 0
                  ? "completed"
                  : "partial",
              createdAt: new Date().toISOString(),
            })
          }
          disabled={activeSeconds === 0}
          className="inline-flex items-center gap-2 rounded-2xl bg-brand-primary px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-black transition disabled:opacity-50"
        >
          <FiZap size={15} />
          End Focus Session
        </button>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface-mutes/50 px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-text-main transition hover:bg-white/10"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}

function ReadingSessionModal({
  task,
  linkedSourceTitle,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  task: Task;
  linkedSourceTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: ReadingSessionPayload) => Promise<void>;
  isSubmitting: boolean;
}) {
  const [sourceTitle, setSourceTitle] = useState(linkedSourceTitle);
  const [sourceUrl, setSourceUrl] = useState("");
  const [lastPage, setLastPage] = useState("");
  const [highlight, setHighlight] = useState("");
  const [takeaway, setTakeaway] = useState("");
  const [noteTitle, setNoteTitle] = useState(`${task.title} Reading Insight`);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [activeSeconds, setActiveSeconds] = useState(0);
  const [engagementCount, setEngagementCount] = useState(0);
  const lastInteractionRef = useRef(0);
  const lastSignalRef = useRef(0);



  useEffect(() => {
    if (!isOpen) return;
    lastInteractionRef.current = Date.now();

    const registerSignal = () => {
      const now = Date.now();
      lastInteractionRef.current = now;
      if (now - lastSignalRef.current > 4000) {
        setEngagementCount((current) => current + 1);
        lastSignalRef.current = now;
      }
    };

    const interval = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
      const visible = !document.hidden;
      const recentlyActive = Date.now() - lastInteractionRef.current < 60000;
      if (visible && recentlyActive) {
        setActiveSeconds((current) => current + 1);
      }
    }, 1000);

    const handleVisibility = () => {
      if (!document.hidden) {
        lastInteractionRef.current = Date.now();
      }
    };

    window.addEventListener("mousemove", registerSignal);
    window.addEventListener("keydown", registerSignal);
    window.addEventListener("scroll", registerSignal, true);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("mousemove", registerSignal);
      window.removeEventListener("keydown", registerSignal);
      window.removeEventListener("scroll", registerSignal, true);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isOpen]);

  const requiredMinutes = Math.max(task.estimatedTime || 30, 1);
  const activeDurationMinutes = Math.round((activeSeconds / 60) * 10) / 10;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Active Reading Session"
      panelClassName="max-w-3xl"
      contentClassName="space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <ReadingMetric label="Elapsed" value={formatTimer(elapsedSeconds)} />
        <ReadingMetric label="Active" value={formatTimer(activeSeconds)} />
        <ReadingMetric label="Signals" value={String(engagementCount)} />
      </div>

      <div className="rounded-2xl border border-border bg-surface-mutes/50 p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-primary">
          Smart Completion
        </p>
        <p className="mt-2 text-sm leading-6 text-text-muted">
          The task completes only if active engagement reaches about{" "}
          {Math.min(Math.max(requiredMinutes, 25), 30)} minutes and the session
          stayed visible with real interaction.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          value={sourceTitle}
          onChange={(event) => setSourceTitle(event.target.value)}
          placeholder="Source title"
          className="rounded-2xl border border-border bg-surface-mutes/50 px-4 py-3 text-sm text-text-main outline-none"
        />
        <input
          value={sourceUrl}
          onChange={(event) => setSourceUrl(event.target.value)}
          placeholder="Optional source link"
          className="rounded-2xl border border-border bg-surface-mutes/50 px-4 py-3 text-sm text-text-main outline-none"
        />
        <input
          value={lastPage}
          onChange={(event) => setLastPage(event.target.value)}
          placeholder="Last page / resume point"
          className="rounded-2xl border border-border bg-surface-mutes/50 px-4 py-3 text-sm text-text-main outline-none"
        />
        <input
          value={noteTitle}
          onChange={(event) => setNoteTitle(event.target.value)}
          placeholder="Insight note title"
          className="rounded-2xl border border-border bg-surface-mutes/50 px-4 py-3 text-sm text-text-main outline-none"
        />
      </div>

      <textarea
        value={highlight}
        onChange={(event) => setHighlight(event.target.value)}
        placeholder="Highlight or quote to save..."
        className="min-h-24 w-full rounded-2xl border border-border bg-surface-mutes/50 px-4 py-3 text-sm leading-6 text-text-main outline-none"
      />

      <textarea
        value={takeaway}
        onChange={(event) => setTakeaway(event.target.value)}
        placeholder="What did you learn from this session?"
        className="min-h-28 w-full rounded-2xl border border-border bg-surface-mutes/50 px-4 py-3 text-sm leading-6 text-text-main outline-none"
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() =>
            onSubmit({
              activeDurationMinutes,
              requiredMinutes,
              sourceTitle,
              sourceUrl: sourceUrl || null,
              lastPage: lastPage || null,
              highlight: highlight || null,
              takeaway: takeaway || null,
              noteTitle: noteTitle || null,
              engagementCount,
            })
          }
          disabled={isSubmitting || activeSeconds === 0}
          className="inline-flex items-center gap-2 rounded-2xl bg-brand-primary px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-black transition disabled:opacity-50"
        >
          <FiBookOpen size={15} />
          {isSubmitting ? "Logging..." : "End Session"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface-mutes/50 px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-text-main transition hover:bg-white/10"
        >
          Cancel
        </button>
      </div>

      <p className="text-xs leading-5 text-text-muted">
        Active time tracked so far: {activeDurationMinutes} mins. When you end
        the session, the system will log it, create an insight note if you
        entered content, and mark the task partial or complete based on valid
        engagement.
      </p>
    </Modal>
  );
}

function ReadingMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-mutes/20 p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">
        {label}
      </p>
      <p className="mt-2 text-xl font-extrabold text-white">{value}</p>
    </div>
  );
}

function formatTimer(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
