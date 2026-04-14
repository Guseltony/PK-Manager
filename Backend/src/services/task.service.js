import { prisma } from "../config/db.js";

export const taskCreation = async (data, userId) => {
  const { title, description, status, priority, dueDate, startDate, duration, estimatedTime, tags, noteId, dreamId } = data;
  
  return await prisma.task.create({
    data: {
      title,
      description,
      status: status || "todo",
      priority: priority || "medium",
      dueDate: dueDate ? new Date(dueDate) : null,
      startDate: startDate ? new Date(startDate) : new Date(),
      duration: duration || 1,
      estimatedTime,
      tags: tags || [],
      userId,
      noteId,
      dreamId,
      activities: {
        create: {
          action: "created",
        },
      },
    },
    include: {
      subtasks: true,
      activities: true,
    },
  });
};

export const getUserTasks = async (userId, filters = {}) => {
  const { status, priority, tag, dreamId, noteId, today, focus } = filters;
  
  const where = {
    userId,
  };

  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (tag) where.tags = { has: tag };
  if (dreamId) where.dreamId = dreamId;
  if (noteId) where.noteId = noteId;

  if (today) {
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const endOfToday = new Date(now.setHours(23, 59, 59, 999));
    
    // Task is "today" if it covers today's date range
    where.OR = [
      // Spanning tasks: startDate <= todayEnd AND (Calculated End Date) >= todayStart
      {
        AND: [
          { startDate: { lte: endOfToday } },
          { 
            // This is a bit complex for Prisma without a stored field, 
            // but we can approximate or just check status
            status: { not: "done" } 
          }
        ]
      },
      // Traditional dueDate tasks
      { dueDate: { gte: startOfToday, lte: endOfToday } }
    ];
  }

  if (focus) {
    where.aiScore = { gte: 0.7 };
  }

  if (filters["high-priority"]) {
    where.priority = { in: ["high", "urgent"] };
  }

  return await prisma.task.findMany({
    where,
    include: {
      subtasks: true,
      note: {
        select: { id: true, title: true }
      },
      dream: {
        select: { id: true, title: true }
      },
    },
    orderBy: [
      { aiScore: "desc" },
      { createdAt: "desc" },
    ],
  });
};

export const getTask = async (taskId, userId) => {
  return await prisma.task.findFirst({
    where: { id: taskId, userId },
    include: {
      subtasks: true,
      activities: {
        orderBy: { timestamp: "desc" }
      },
      note: true,
      dream: true,
    },
  });
};

export const updateTask = async (taskId, userId, data) => {
  const { title, description, status, priority, dueDate, startDate, duration, estimatedTime, tags, noteId, dreamId, aiScore, completedAt } = data;
  
  // If status is changing to done, set completedAt if not provided
  let finalCompletedAt = completedAt;
  if (status === "done" && !completedAt) {
    finalCompletedAt = new Date().toISOString();
  } else if (status && status !== "done") {
    finalCompletedAt = null;
  }

  const task = await prisma.task.update({
    where: { id: taskId, userId },
    data: {
      title,
      description,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : dueDate,
      startDate: startDate ? new Date(startDate) : startDate,
      duration,
      estimatedTime,
      tags,
      noteId,
      dreamId,
      aiScore,
      completedAt: finalCompletedAt ? new Date(finalCompletedAt) : finalCompletedAt,
      activities: {
        create: {
          action: status === "done" ? "completed" : "updated",
        },
      },
    },
    include: {
      subtasks: true,
      activities: true,
    },
  });

  return task;
};

export const deleteTask = async (taskId, userId) => {
  return await prisma.task.delete({
    where: { id: taskId, userId },
  });
};

export const addSubtask = async (taskId, userId, title) => {
  // First verify task ownership
  const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
  if (!task) throw new Error("Task not found or access denied");

  return await prisma.subtask.create({
    data: {
      taskId,
      title,
      status: "todo",
    },
  });
};

export const updateSubtask = async (subtaskId, taskId, userId, data) => {
  // Verify task ownership
  const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
  if (!task) throw new Error("Task not found or access denied");

  return await prisma.subtask.update({
    where: { id: subtaskId, taskId },
    data,
  });
};

export const deleteSubtask = async (subtaskId, taskId, userId) => {
  const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
  if (!task) throw new Error("Task not found or access denied");

  return await prisma.subtask.delete({
    where: { id: subtaskId, taskId },
  });
};
