// get user

import { prisma } from "../libs/prisma.js";

const userProfileSelect = {
  id: true,
  name: true,
  email: true,
  username: true,
  avatar: true,
  provider: true,
  googleId: true,
  emailVerified: true,
  verifiedAt: true,
  createdAt: true,
  updatedAt: true,
  settings: {
    select: {
      aiStrictness: true,
      aiProactiveness: true,
      autoTaskGenerationFromDreams: true,
      autoLinkingKnowledgeGraph: true,
      taskPrioritizationMode: true,
      focusSessionAlerts: true,
      dailyInsightSummaries: true,
    },
  },
  _count: {
    select: {
      session: true,
      notes: true,
      tasks: true,
      dreams: true,
      projects: true,
      inboxItems: true,
      ideas: true,
    },
  },
};

const getUser = async (user_id) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: user_id,
      },
      select: userProfileSelect,
    });

    if (!user) {
      throw new Error("User not found, please log in");
    }

    return user;
  } catch (error) {
    throw new Error(error);
  }
};

const updateUser = async (user_id, data) => {
  try {
    const user = await prisma.user.update({
      where: {
        id: user_id,
      },
      data,
      select: userProfileSelect,
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    throw new Error(error);
  }
};

const getUserStats = async (user_id) => {
  try {
    const today = new Date();
    const todayKey = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
    );
    const weekStart = new Date(todayKey);
    weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));

    const [
      notesCount,
      tasksCount,
      dreamsCount,
      projectsCount,
      ideasCount,
      inboxCount,
      completedTasksCount,
      activeTasksCount,
      recurringTasksCount,
      focusSessionsCount,
      ledgerEntriesCount,
      focusMinutesAggregate,
      completedThisWeek,
      dueTodayCount,
      plannedFocusBlocksCount,
      lastTaskCompleted,
      lastFocusSession,
      lastInboxCapture,
      lastNoteUpdated,
    ] = await Promise.all([
      prisma.note.count({ where: { userId: user_id } }),
      prisma.task.count({ where: { userId: user_id } }),
      prisma.dream.count({ where: { userId: user_id } }),
      prisma.project.count({ where: { userId: user_id } }),
      prisma.idea.count({ where: { userId: user_id } }),
      prisma.inboxItem.count({ where: { userId: user_id } }),
      prisma.task.count({ where: { userId: user_id, status: "done" } }),
      prisma.task.count({
        where: { userId: user_id, status: { in: ["todo", "in_progress"] } },
      }),
      prisma.task.count({
        where: { userId: user_id, recurrence: { not: "none" } },
      }),
      prisma.focusSession.count({ where: { userId: user_id } }),
      prisma.taskCompletionLog.count({ where: { userId: user_id } }),
      prisma.focusAnalytics.aggregate({
        where: { userId: user_id },
        _sum: { totalFocusTime: true },
      }),
      prisma.taskCompletionLog.count({
        where: {
          userId: user_id,
          completedAt: { gte: weekStart },
        },
      }),
      prisma.task.count({
        where: {
          userId: user_id,
          dueDate: {
            gte: todayKey,
            lt: new Date(todayKey.getTime() + 24 * 60 * 60 * 1000),
          },
          status: { not: "done" },
        },
      }),
      prisma.plannedFocusBlock.count({
        // FocusBlockStatus enum currently supports: planned, completed, canceled
        // If we later add an "active" status, we can extend this filter.
        where: { userId: user_id, status: "planned" },
      }),
      prisma.taskCompletionLog.findFirst({
        where: { userId: user_id },
        orderBy: { completedAt: "desc" },
        select: { completedAt: true, title: true },
      }),
      prisma.focusSession.findFirst({
        where: { userId: user_id },
        orderBy: { startedAt: "desc" },
        select: { startedAt: true, completedCount: true },
      }),
      prisma.inboxItem.findFirst({
        where: { userId: user_id },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true, status: true, type: true },
      }),
      prisma.note.findFirst({
        where: { userId: user_id },
        orderBy: { updatedAt: "desc" },
        select: { updatedAt: true, title: true },
      }),
    ]);

    return {
      notesCount,
      tasksCount,
      dreamsCount,
      projectsCount,
      ideasCount,
      inboxCount,
      completedTasksCount,
      activeTasksCount,
      recurringTasksCount,
      focusSessionsCount,
      ledgerEntriesCount,
      focusMinutesTotal: focusMinutesAggregate._sum.totalFocusTime || 0,
      completedThisWeek,
      dueTodayCount,
      plannedFocusBlocksCount,
      lastTaskCompletedAt: lastTaskCompleted?.completedAt || null,
      lastTaskCompletedTitle: lastTaskCompleted?.title || null,
      lastFocusSessionAt: lastFocusSession?.startedAt || null,
      lastFocusSessionCompletedCount: lastFocusSession?.completedCount || 0,
      lastInboxCaptureAt: lastInboxCapture?.createdAt || null,
      lastInboxCaptureStatus: lastInboxCapture?.status || null,
      lastInboxCaptureType: lastInboxCapture?.type || null,
      lastNoteUpdatedAt: lastNoteUpdated?.updatedAt || null,
      lastNoteUpdatedTitle: lastNoteUpdated?.title || null,
    };
  } catch (error) {
    throw new Error(error);
  }
};

const getAllUser = async () => {
  try {
    const Users = await prisma.user.findMany({
      include: {
        session: true,
        notes: true,
        tag: true,
      },
    });

    if (!Users) {
      throw new Error("Users can't be fetch");
    }

    return Users;
  } catch (error) {
    throw new Error(error);
  }
};

export { getUser, updateUser, getUserStats, getAllUser };

