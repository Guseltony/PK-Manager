import dayjs from "dayjs";
import { Task } from "@/src/types/task";

type FocusContext = {
  now?: Date;
  skippedTaskIds?: string[];
};

export type RankedFocusTask = Task & {
  focusScore: number;
  focusReasons: string[];
  urgencyLabel: string;
};

const priorityWeights: Record<Task["priority"], number> = {
  low: 15,
  medium: 28,
  high: 48,
  urgent: 64,
};

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

const getTimeBucket = (date: Date) => {
  const hour = date.getHours();

  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
};

const normalizeAiScore = (value: number | null) => {
  if (value == null) return 0;
  if (value <= 1) return value;
  return clamp(value / 100, 0, 1);
};

const getUrgencyScore = (task: Task, now: dayjs.Dayjs) => {
  if (!task.dueDate) return 8;

  const due = dayjs(task.dueDate);
  const hoursUntilDue = due.diff(now, "hour", true);

  if (hoursUntilDue < 0) return 70;
  if (hoursUntilDue <= 6) return 52;
  if (hoursUntilDue <= 24) return 36;
  if (hoursUntilDue <= 72) return 22;
  return 10;
};

const getUrgencyLabel = (task: Task, now: dayjs.Dayjs) => {
  if (!task.dueDate) return "No deadline";

  const due = dayjs(task.dueDate);
  const hoursUntilDue = due.diff(now, "hour", true);

  if (hoursUntilDue < 0) return "Overdue";
  if (hoursUntilDue <= 6) return "Due soon";
  if (hoursUntilDue <= 24) return "Due today";
  if (hoursUntilDue <= 72) return "Upcoming";
  return "Planned";
};

const getContextScore = (task: Task, bucket: ReturnType<typeof getTimeBucket>) => {
  const estimatedTime = task.estimatedTime ?? 0;

  if (bucket === "morning") {
    if (estimatedTime >= 45) return 12;
    if (estimatedTime >= 20) return 8;
  }

  if (bucket === "afternoon") {
    if (estimatedTime >= 20 && estimatedTime <= 60) return 10;
    if (estimatedTime > 0) return 6;
  }

  if (bucket === "evening") {
    if (estimatedTime > 0 && estimatedTime <= 30) return 14;
    if (estimatedTime > 30 && estimatedTime <= 60) return 8;
    return 2;
  }

  return 4;
};

const getFocusReasons = (task: Task, now: dayjs.Dayjs, bucket: ReturnType<typeof getTimeBucket>) => {
  const reasons: string[] = [];

  if (task.priority === "urgent" || task.priority === "high") {
    reasons.push(`${task.priority} priority`);
  }

  if (task.dueDate) {
    const due = dayjs(task.dueDate);
    if (due.isBefore(now)) {
      reasons.push("overdue");
    } else if (due.diff(now, "hour", true) <= 24) {
      reasons.push("deadline approaching");
    }
  }

  if (task.dream) {
    reasons.push("goal linked");
  }

  if ((task.estimatedTime ?? 0) > 0) {
    if (bucket === "morning" && (task.estimatedTime ?? 0) >= 45) {
      reasons.push("deep work fit");
    }

    if (bucket === "evening" && (task.estimatedTime ?? 0) <= 30) {
      reasons.push("light finish");
    }
  }

  if (normalizeAiScore(task.aiScore) >= 0.7) {
    reasons.push("AI boosted");
  }

  return reasons.slice(0, 3);
};

export const buildFocusQueue = (
  tasks: Task[],
  context: FocusContext = {},
): RankedFocusTask[] => {
  const nowDate = context.now ?? new Date();
  const now = dayjs(nowDate);
  const bucket = getTimeBucket(nowDate);
  const skipped = new Set(context.skippedTaskIds ?? []);

  return tasks
    .filter((task) => task.status !== "done")
    .map((task) => {
      const aiWeight = normalizeAiScore(task.aiScore) * 18;
      const dreamWeight = task.dream ? 12 : 0;
      const skipPenalty = skipped.has(task.id) ? 40 : 0;
      const urgencyWeight = getUrgencyScore(task, now);
      const contextWeight = getContextScore(task, bucket);
      const focusScore =
        priorityWeights[task.priority] +
        urgencyWeight +
        dreamWeight +
        contextWeight +
        aiWeight -
        skipPenalty;

      return {
        ...task,
        focusScore,
        focusReasons: getFocusReasons(task, now, bucket),
        urgencyLabel: getUrgencyLabel(task, now),
      };
    })
    .sort((left, right) => {
      if (right.focusScore !== left.focusScore) {
        return right.focusScore - left.focusScore;
      }

      if (left.dueDate && right.dueDate) {
        return dayjs(left.dueDate).valueOf() - dayjs(right.dueDate).valueOf();
      }

      if (left.dueDate) return -1;
      if (right.dueDate) return 1;
      return dayjs(right.createdAt).valueOf() - dayjs(left.createdAt).valueOf();
    });
};
