import { prisma } from "../config/db.js";

const MAX_FOCUS_TASKS = 5;
const MIN_FOCUS_TASKS = 3;

const priorityWeights = {
  low: 15,
  medium: 28,
  high: 48,
  urgent: 64,
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const normalizeAiScore = (value) => {
  if (value == null) return 0;
  if (value <= 1) return value;
  return clamp(value / 100, 0, 1);
};

const getTimeBucket = (date) => {
  const hour = date.getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
};

const startOfUtcDay = (date = new Date()) => {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};

const getUrgencyScore = (dueDate, now) => {
  if (!dueDate) return 8;

  const hoursUntilDue = (new Date(dueDate).getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilDue < 0) return 70;
  if (hoursUntilDue <= 6) return 52;
  if (hoursUntilDue <= 24) return 36;
  if (hoursUntilDue <= 72) return 22;
  return 10;
};

const getUrgencyLabel = (dueDate, now) => {
  if (!dueDate) return "No deadline";

  const hoursUntilDue = (new Date(dueDate).getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilDue < 0) return "Overdue";
  if (hoursUntilDue <= 6) return "Due soon";
  if (hoursUntilDue <= 24) return "Due today";
  if (hoursUntilDue <= 72) return "Upcoming";
  return "Planned";
};

const getContextScore = (estimatedTime, bucket) => {
  const minutes = estimatedTime ?? 0;

  if (bucket === "morning") {
    if (minutes >= 45) return 12;
    if (minutes >= 20) return 8;
  }

  if (bucket === "afternoon") {
    if (minutes >= 20 && minutes <= 60) return 10;
    if (minutes > 0) return 6;
  }

  if (bucket === "evening") {
    if (minutes > 0 && minutes <= 30) return 14;
    if (minutes > 30 && minutes <= 60) return 8;
    return 2;
  }

  return 4;
};

const buildReasons = (task, now, bucket, normalizedAiScore) => {
  const reasons = [];

  if (task.priority === "urgent" || task.priority === "high") {
    reasons.push(`${task.priority} priority`);
  }

  if (task.dueDate) {
    const dueDate = new Date(task.dueDate);
    if (dueDate < now) {
      reasons.push("overdue");
    } else {
      const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (hoursUntilDue <= 24) {
        reasons.push("deadline approaching");
      }
    }
  }

  if (task.dream) {
    reasons.push("goal linked");
  }

  if ((task.estimatedTime ?? 0) > 0) {
    if (bucket === "morning" && task.estimatedTime >= 45) reasons.push("deep work fit");
    if (bucket === "evening" && task.estimatedTime <= 30) reasons.push("light finish");
  }

  if (normalizedAiScore >= 0.7) {
    reasons.push("AI boosted");
  }

  return reasons.slice(0, 3);
};

const rankFocusTasks = (tasks, focusMetaMap, now = new Date()) => {
  const bucket = getTimeBucket(now);

  return tasks
    .filter((task) => task.status !== "done")
    .map((task) => {
      const meta = focusMetaMap.get(task.id);
      const normalizedAiScore = normalizeAiScore(meta?.aiScore ?? task.aiScore);
      const hoursSinceSkip = meta?.lastSkippedAt
        ? (now.getTime() - new Date(meta.lastSkippedAt).getTime()) / (1000 * 60 * 60)
        : null;
      const recentSkipPenalty =
        meta?.lastSkippedAt && hoursSinceSkip !== null && hoursSinceSkip < 6
          ? 36
          : meta?.skipCount
            ? Math.min(meta.skipCount * 6, 24)
            : 0;
      const overdueBoost = task.dueDate && new Date(task.dueDate) < now ? 10 : 0;
      const dreamPriorityBoost =
        task.dream?.priority === "urgent"
          ? 12
          : task.dream?.priority === "high"
            ? 8
            : task.dream
              ? 4
              : 0;
      const completionMomentum = meta?.completedInFocusCount
        ? Math.min(meta.completedInFocusCount * 3, 12)
        : 0;
      const urgencyWeight = getUrgencyScore(task.dueDate, now);
      const contextWeight = getContextScore(task.estimatedTime, bucket);
      const focusScore =
        priorityWeights[task.priority] +
        urgencyWeight +
        overdueBoost +
        dreamPriorityBoost +
        contextWeight +
        completionMomentum +
        normalizedAiScore * 18 -
        recentSkipPenalty;

      return {
        ...task,
        aiScore: meta?.aiScore ?? task.aiScore,
        focusMeta: meta
          ? {
              aiScore: meta.aiScore,
              skipCount: meta.skipCount,
              lastSkippedAt: meta.lastSkippedAt,
              focusSelectedAt: meta.focusSelectedAt,
              completedInFocusCount: meta.completedInFocusCount,
            }
          : null,
        focusScore,
        urgencyLabel: getUrgencyLabel(task.dueDate, now),
        focusReasons: buildReasons(task, now, bucket, normalizedAiScore),
      };
    })
    .sort((left, right) => {
      if (right.focusScore !== left.focusScore) {
        return right.focusScore - left.focusScore;
      }

      if (left.dueDate && right.dueDate) {
        return new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime();
      }

      if (left.dueDate) return -1;
      if (right.dueDate) return 1;

      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    });
};

const selectFocusTasks = (rankedTasks) => {
  return rankedTasks.slice(0, Math.min(Math.max(rankedTasks.length, MIN_FOCUS_TASKS), MAX_FOCUS_TASKS));
};

const getFocusData = async (userId) => {
  const tasks = await prisma.task.findMany({
    where: {
      userId,
      status: { not: "done" },
    },
    include: {
      note: {
        select: { id: true, title: true },
      },
      dream: {
        select: { id: true, title: true, priority: true },
      },
    },
  });

  const metas = await prisma.taskFocusMeta.findMany({
    where: { userId },
  });

  const metaMap = new Map(metas.map((meta) => [meta.taskId, meta]));
  const ranked = rankFocusTasks(tasks, metaMap);

  return {
    tasks,
    ranked,
    selected: selectFocusTasks(ranked),
    metaMap,
  };
};

const updateDailyAnalytics = async (userId, { sessions = 0, tasksCompleted = 0, focusScore = null, focusSeconds = 0 }) => {
  const date = startOfUtcDay();
  const existing = await prisma.focusAnalytics.findUnique({
    where: {
      userId_date: {
        userId,
        date,
      },
    },
  });

  if (!existing) {
    return prisma.focusAnalytics.create({
      data: {
        userId,
        date,
        sessions,
        tasksCompleted,
        totalFocusTime: focusSeconds,
        avgFocusScore: focusScore ?? 0,
      },
    });
  }

  const nextSessions = existing.sessions + sessions;
  const nextCompleted = existing.tasksCompleted + tasksCompleted;
  const nextFocusTime = existing.totalFocusTime + focusSeconds;
  let nextAvg = existing.avgFocusScore ?? 0;

  if (focusScore != null) {
    const divisor = Math.max(nextCompleted, 1);
    nextAvg = ((existing.avgFocusScore ?? 0) * Math.max(existing.tasksCompleted, 1) + focusScore) / divisor;
  }

  return prisma.focusAnalytics.update({
    where: {
      userId_date: {
        userId,
        date,
      },
    },
    data: {
      sessions: nextSessions,
      tasksCompleted: nextCompleted,
      totalFocusTime: nextFocusTime,
      avgFocusScore: nextAvg,
    },
  });
};

const hydrateSessionQueue = async (session) => {
  const { selected } = await getFocusData(session.userId);
  const taskIds = selected.map((task) => task.id);

  return prisma.focusSession.update({
    where: { id: session.id },
    data: {
      selectedTaskIds: taskIds,
    },
  });
};

export const getFocusOverview = async (userId) => {
  const [{ selected }, activeSession, analytics] = await Promise.all([
    getFocusData(userId),
    prisma.focusSession.findFirst({
      where: { userId, endedAt: null },
      orderBy: { startedAt: "desc" },
    }),
    prisma.focusAnalytics.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 14,
    }),
  ]);

  const totalCompleted = analytics.reduce((sum, item) => sum + item.tasksCompleted, 0);
  const totalSessions = analytics.reduce((sum, item) => sum + item.sessions, 0);
  const averageScore =
    analytics.length > 0
      ? analytics.reduce((sum, item) => sum + (item.avgFocusScore ?? 0), 0) / analytics.length
      : 0;

  return {
    tasks: selected,
    activeSession,
    analytics: {
      streakDays: analytics.filter((item) => item.tasksCompleted > 0).length,
      totalCompleted,
      totalSessions,
      averageScore,
      history: analytics,
    },
  };
};

export const startFocusSession = async (userId) => {
  const existing = await prisma.focusSession.findFirst({
    where: { userId, endedAt: null },
    orderBy: { startedAt: "desc" },
  });

  if (existing) {
    return hydrateSessionQueue(existing);
  }

  const { selected } = await getFocusData(userId);
  const selectedTaskIds = selected.map((task) => task.id);
  const now = new Date();

  await prisma.taskFocusMeta.createMany({
    data: selectedTaskIds.map((taskId) => ({
      userId,
      taskId,
      focusSelectedAt: now,
    })),
    skipDuplicates: true,
  });

  await Promise.all(
    selectedTaskIds.map((taskId) =>
      prisma.taskFocusMeta.update({
        where: { taskId },
        data: {
          focusSelectedAt: now,
        },
      }),
    ),
  );

  const session = await prisma.focusSession.create({
    data: {
      userId,
      selectedTaskIds,
      completedTaskIds: [],
      skippedTaskIds: [],
    },
  });

  await updateDailyAnalytics(userId, { sessions: 1 });

  return session;
};

export const endFocusSession = async (sessionId, userId, durationSeconds = 0) => {
  const session = await prisma.focusSession.findFirst({
    where: { id: sessionId, userId, endedAt: null },
  });

  if (!session) {
    throw new Error("Active focus session not found");
  }

  const ended = await prisma.focusSession.update({
    where: { id: session.id },
    data: {
      endedAt: new Date(),
    },
  });

  if (durationSeconds > 0) {
    await updateDailyAnalytics(userId, { focusSeconds: durationSeconds });
  }

  return ended;
};

export const completeFocusTask = async (sessionId, taskId, userId, durationSeconds = 0) => {
  const session = await prisma.focusSession.findFirst({
    where: { id: sessionId, userId, endedAt: null },
  });

  if (!session) {
    throw new Error("Active focus session not found");
  }

  const { ranked } = await getFocusData(userId);
  const rankedTask = ranked.find((task) => task.id === taskId);

  if (!rankedTask) {
    throw new Error("Task is no longer available in focus mode");
  }

  await prisma.$transaction(async (tx) => {
    await tx.task.update({
      where: { id: taskId },
      data: {
        status: "done",
        completedAt: new Date(),
        aiScore: rankedTask.focusScore,
        activities: {
          create: {
            action: "completed via focus mode",
          },
        },
      },
    });

    const existingMeta = await tx.taskFocusMeta.findUnique({
      where: { taskId },
    });

    if (!existingMeta) {
      await tx.taskFocusMeta.create({
        data: {
          userId,
          taskId,
          aiScore: rankedTask.focusScore,
          completedInFocusCount: 1,
          focusSelectedAt: new Date(),
          lastCompletedAt: new Date(),
        },
      });
    } else {
      await tx.taskFocusMeta.update({
        where: { taskId },
        data: {
          aiScore: rankedTask.focusScore,
          completedInFocusCount: { increment: 1 },
          lastCompletedAt: new Date(),
          focusSelectedAt: new Date(),
        },
      });
    }

    const nextCompletedTaskIds = session.completedTaskIds.includes(taskId)
      ? session.completedTaskIds
      : [...session.completedTaskIds, taskId];

    await tx.focusSession.update({
      where: { id: session.id },
      data: {
        completedTaskIds: nextCompletedTaskIds,
        completedCount: nextCompletedTaskIds.length,
      },
    });
  });

  await updateDailyAnalytics(userId, {
    tasksCompleted: 1,
    focusScore: rankedTask.focusScore,
    focusSeconds: durationSeconds,
  });

  const refreshedSession = await hydrateSessionQueue(session);
  const overview = await getFocusOverview(userId);

  return {
    session: refreshedSession,
    overview,
  };
};

export const skipFocusTask = async (sessionId, taskId, userId) => {
  const session = await prisma.focusSession.findFirst({
    where: { id: sessionId, userId, endedAt: null },
  });

  if (!session) {
    throw new Error("Active focus session not found");
  }

  const now = new Date();

  const existingMeta = await prisma.taskFocusMeta.findUnique({
    where: { taskId },
  });

  if (!existingMeta) {
    await prisma.taskFocusMeta.create({
      data: {
        userId,
        taskId,
        skipCount: 1,
        lastSkippedAt: now,
      },
    });
  } else {
    await prisma.taskFocusMeta.update({
      where: { taskId },
      data: {
        skipCount: { increment: 1 },
        lastSkippedAt: now,
      },
    });
  }

  const skippedTaskIds = session.skippedTaskIds.includes(taskId)
    ? session.skippedTaskIds
    : [...session.skippedTaskIds, taskId];

  await prisma.focusSession.update({
    where: { id: session.id },
    data: {
      skippedTaskIds,
    },
  });

  const refreshedSession = await hydrateSessionQueue(session);
  const overview = await getFocusOverview(userId);

  return {
    session: refreshedSession,
    overview,
  };
};
