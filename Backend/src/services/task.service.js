import { prisma } from "../config/db.js";
import { createTagLinks, syncTags, tagInclude } from "../utils/tagHelper.js";

const normalizeTags = (tags = []) =>
  tags
    .map((tag) => {
      if (typeof tag === "string") {
        return { name: tag };
      }

      if (tag?.name) {
        return { name: tag.name, color: tag.color };
      }

      if (tag?.tag?.name) {
        return { name: tag.tag.name, color: tag.tag.color };
      }

      return null;
    })
    .filter(Boolean)
    .slice(0, 2);

const ensureRequiredTags = (tags = [], title = "") => {
  if (tags.length > 0) return tags.slice(0, 2);

  const fallback = title
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase())
    .filter(Boolean);

  if (fallback.length > 0) {
    return Array.from(new Map(fallback.map((name) => [name, { name }])).values()).slice(0, 2);
  }

  return [{ name: "general" }];
};

const normalizeNoteIds = (noteIds = [], noteId) => {
  const merged = [
    ...(Array.isArray(noteIds) ? noteIds : []),
    ...(noteId ? [noteId] : []),
  ].filter(Boolean);

  return Array.from(new Set(merged));
};

const resolveOwnedNoteIds = async (candidateNoteIds, userId) => {
  if (!candidateNoteIds.length) {
    return [];
  }

  const ownedNotes = await prisma.note.findMany({
    where: {
      id: { in: candidateNoteIds },
      userId,
    },
    select: { id: true },
  });

  return candidateNoteIds.filter((id) =>
    ownedNotes.some((note) => note.id === id),
  );
};

const createTaskNoteLinks = (noteIds = []) => {
  if (!noteIds.length) return undefined;

  return {
    create: noteIds.map((id) => ({
      note: {
        connect: { id },
      },
    })),
  };
};

const syncTaskNoteLinks = (noteIds = []) => ({
  deleteMany: {},
  ...(noteIds.length
    ? {
        create: noteIds.map((id) => ({
          note: {
            connect: { id },
          },
        })),
      }
    : {}),
});

const taskInclude = {
  ...tagInclude(),
  subtasks: true,
  activities: true,
  note: {
    select: { id: true, title: true, updatedAt: true },
  },
  notes: {
    include: {
      note: {
        select: {
          id: true,
          title: true,
          updatedAt: true,
          contentType: true,
        },
      },
    },
  },
  dream: {
    select: { id: true, title: true },
  },
};

export const taskCreation = async (data, userId) => {
  const {
    title,
    description,
    status,
    priority,
    dueDate,
    startDate,
    estimatedTime,
    duration,
    tags,
    noteId,
    noteIds,
    dreamId,
  } = data;
  const normalizedTags = ensureRequiredTags(normalizeTags(tags), title);
  const resolvedNoteIds = await resolveOwnedNoteIds(
    normalizeNoteIds(noteIds, noteId),
    userId,
  );
  
  return await prisma.task.create({
    data: {
      title,
      description,
      status: status || "todo",
      priority: priority || "medium",
      dueDate: dueDate ? new Date(dueDate) : null,
      startDate: startDate ? new Date(startDate) : undefined,
      estimatedTime,
      duration,
      tags: createTagLinks(normalizedTags, userId),
      userId,
      noteId: resolvedNoteIds[0] || null,
      notes: createTaskNoteLinks(resolvedNoteIds),
      dreamId,
      activities: {
        create: {
          action: "created",
        },
      },
    },
    include: taskInclude,
  });
};

export const createManyTasks = async (tasks, userId, shared = {}) => {
  return Promise.all(
    tasks.map((task) =>
      taskCreation(
        {
          ...task,
          noteId: task.noteId ?? shared.noteId ?? null,
          noteIds: task.noteIds ?? shared.noteIds ?? undefined,
          dreamId: task.dreamId ?? shared.dreamId ?? null,
        },
        userId,
      ),
    ),
  );
};

export const getUserTasks = async (userId, filters = {}) => {
  const { status, priority, tag, dreamId, noteId, today, upcoming, overdue, focus } = filters;
  
  const where = {
    userId,
  };

  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (tag) {
    where.tags = {
      some: {
        tag: {
          name: tag.toLowerCase(),
        },
      },
    };
  }
  if (dreamId) where.dreamId = dreamId;
  if (noteId) {
    where.OR = [
      ...(where.OR || []),
      { noteId },
      {
        notes: {
          some: {
            noteId,
          },
        },
      },
    ];
  }

  const now = new Date();
  const startOfToday = new Date(now.setHours(0, 0, 0, 0));
  const endOfToday = new Date(now.setHours(23, 59, 59, 999));

  if (today) {
    where.OR = [
      { dueDate: { gte: startOfToday, lte: endOfToday } },
      { 
        AND: [
          { startDate: { lte: endOfToday } },
          { status: { not: "done" } }
        ]
      }
    ];
  } else if (upcoming) {
    where.AND = [
      { dueDate: { gt: endOfToday } },
      { status: { not: "done" } }
    ];
  } else if (overdue) {
    where.AND = [
      { dueDate: { lt: startOfToday } },
      { status: { not: "done" } }
    ];
  }

  if (focus || filters["high-priority"]) {
    where.priority = { in: ["high", "urgent"] };
    where.status = { not: "done" };
  }

  return await prisma.task.findMany({
    where,
    include: {
      ...taskInclude,
    },
    orderBy: [
      { priority: "desc" },
      { dueDate: "asc" },
      { createdAt: "desc" },
    ],
  });
};

export const getTask = async (taskId, userId) => {
  return await prisma.task.findFirst({
    where: { id: taskId, userId },
    include: {
      ...taskInclude,
      activities: {
        orderBy: { timestamp: "desc" }
      },
    },
  });
};

export const updateTask = async (taskId, userId, data) => {
  const {
    title,
    description,
    status,
    priority,
    dueDate,
    startDate,
    duration,
    estimatedTime,
    tags,
    noteId,
    noteIds,
    dreamId,
    aiScore,
    completedAt,
  } = data;
  const normalizedTags = normalizeTags(tags);
  const shouldSyncNotes = Object.prototype.hasOwnProperty.call(data, "noteId")
    || Object.prototype.hasOwnProperty.call(data, "noteIds");
  const resolvedNoteIds = shouldSyncNotes
    ? await resolveOwnedNoteIds(normalizeNoteIds(noteIds, noteId), userId)
    : null;
  
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
      tags: tags ? syncTags(ensureRequiredTags(normalizedTags, title), userId) : undefined,
      noteId: shouldSyncNotes ? resolvedNoteIds[0] || null : undefined,
      notes: shouldSyncNotes ? syncTaskNoteLinks(resolvedNoteIds) : undefined,
      dreamId,
      aiScore,
      completedAt: finalCompletedAt ? new Date(finalCompletedAt) : finalCompletedAt,
      activities: {
        create: {
          action: status === "done" ? "completed" : 
                  title ? `Renamed to: ${title}` : 
                  status ? `Status changed to: ${status}` : 
                  priority ? `Priority set to: ${priority}` : "updated",
        },
      },
    },
    include: taskInclude,
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

  const subtask = await prisma.subtask.create({
    data: {
      taskId,
      title,
      status: "todo",
    },
  });

  await prisma.taskActivity.create({
    data: {
      taskId,
      action: `Subtask created: ${title}`,
    }
  });

  return subtask;
};

export const updateSubtask = async (subtaskId, taskId, userId, data) => {
  // Verify task ownership
  const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
  if (!task) throw new Error("Task not found or access denied");

  const subtask = await prisma.subtask.update({
    where: { id: subtaskId, taskId },
    data,
  });

  await prisma.taskActivity.create({
    data: {
      taskId,
      action: data.status === "done" ? `Subtask completed: ${subtask.title}` : `Subtask updated: ${subtask.title}`,
    }
  });

  return subtask;
};

export const deleteSubtask = async (subtaskId, taskId, userId) => {
  const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
  if (!task) throw new Error("Task not found or access denied");

  const subtask = await prisma.subtask.delete({
    where: { id: subtaskId, taskId },
  });

  await prisma.taskActivity.create({
    data: {
      taskId,
      action: `Subtask removed: ${subtask.title}`,
    }
  });

  return subtask;
};
