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

const normalizeWeeklyDays = (weeklyDays = []) =>
  Array.from(
    new Set(
      (Array.isArray(weeklyDays) ? weeklyDays : [])
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value >= 0 && value <= 6),
    ),
  ).sort((left, right) => left - right);

const normalizeOccurrenceDates = (occurrenceDates = []) =>
  Array.from(
    new Set(
      (Array.isArray(occurrenceDates) ? occurrenceDates : [])
        .map((value) => String(value).trim())
        .filter(Boolean),
    ),
  ).sort();

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

const resolveOwnedProject = async (projectId, userId) => {
  if (!projectId) {
    return null;
  }

  return prisma.project.findFirst({
    where: { id: projectId, userId },
    select: { id: true, dreamId: true },
  });
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
  project: {
    select: { id: true, title: true, status: true, dreamId: true, progress: true },
  },
  taskLogs: {
    orderBy: { completedAt: "desc" },
    take: 12,
  },
};

const READING_COMPLETION_THRESHOLD = 25;

const toDateKey = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
};

const addDays = (dateKey, days) => {
  const date = new Date(`${dateKey}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
};

const compareDateKeys = (left, right) => {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
};

const getScheduleBucket = (task, today) => {
  if (task.status === "done") return "completed";

  const scheduledDate = task.startDate ? toDateKey(task.startDate) : null;
  const dueDate = task.dueDate ? toDateKey(task.dueDate) : null;
  const durationDays = Math.max(task.duration || 1, 1);
  const endDate = scheduledDate ? addDays(scheduledDate, durationDays - 1) : null;
  const recurrence = task.recurrence || "none";
  const weeklyDays = normalizeWeeklyDays(task.weeklyDays || []);
  const occurrenceDates = normalizeOccurrenceDates(task.occurrenceDates || []);
  const todayWeekday = new Date(`${today}T00:00:00`).getDay();

  const recurringDueToday =
    recurrence === "daily"
      ? !occurrenceDates.includes(today)
      : recurrence === "weekly"
        ? weeklyDays.includes(todayWeekday) && !occurrenceDates.includes(today)
        : false;

  if (
    (dueDate && compareDateKeys(dueDate, today) < 0) ||
    (recurrence === "none" && endDate && compareDateKeys(endDate, today) < 0)
  ) {
    return scheduledDate ? "carryover" : "overdue";
  }

  if (
    recurringDueToday ||
    task.isTodayCommitment ||
    (dueDate && compareDateKeys(dueDate, today) === 0) ||
    (scheduledDate && compareDateKeys(scheduledDate, today) === 0) ||
    (recurrence === "none" &&
      scheduledDate &&
      endDate &&
      compareDateKeys(scheduledDate, today) <= 0 &&
      compareDateKeys(endDate, today) >= 0)
  ) {
    return "today";
  }

  if (
    (scheduledDate && compareDateKeys(scheduledDate, today) > 0) ||
    (dueDate && compareDateKeys(dueDate, today) > 0)
  ) {
    return "upcoming";
  }

  if (task.status === "in_progress") return "active";

  return "backlog";
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
    recurrence,
    weeklyDays,
    occurrenceDates,
    isTodayCommitment,
    lastRescheduledAt,
    tags,
    noteId,
    noteIds,
    dreamId,
    projectId,
  } = data;
  const normalizedTags = ensureRequiredTags(normalizeTags(tags), title);
  const resolvedNoteIds = await resolveOwnedNoteIds(
    normalizeNoteIds(noteIds, noteId),
    userId,
  );
  const ownedProject = await resolveOwnedProject(projectId, userId);

  if (projectId && !ownedProject) {
    throw new Error("Project not found or access denied");
  }

  const resolvedDreamId = ownedProject?.dreamId ?? dreamId ?? null;
  
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
      recurrence: recurrence || "none",
      weeklyDays: normalizeWeeklyDays(weeklyDays),
      occurrenceDates: normalizeOccurrenceDates(occurrenceDates),
      isTodayCommitment: Boolean(isTodayCommitment),
      lastRescheduledAt: lastRescheduledAt ? new Date(lastRescheduledAt) : null,
      tags: createTagLinks(normalizedTags, userId),
      userId,
      noteId: resolvedNoteIds[0] || null,
      notes: createTaskNoteLinks(resolvedNoteIds),
      dreamId: resolvedDreamId,
      projectId: ownedProject?.id || null,
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
          projectId: task.projectId ?? shared.projectId ?? null,
        },
        userId,
      ),
    ),
  );
};

export const getUserTasks = async (userId, filters = {}) => {
  const { status, priority, tag, dreamId, projectId, noteId, today, upcoming, overdue, carryover, focus } = filters;
  
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
  if (projectId) where.projectId = projectId;
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

  if (focus || filters["high-priority"]) {
    where.priority = { in: ["high", "urgent"] };
    where.status = { not: "done" };
  }

  const tasks = await prisma.task.findMany({
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

  const todayKey = toDateKey(new Date());

  if (today) {
    return tasks.filter((task) => getScheduleBucket(task, todayKey) === "today");
  }
  if (upcoming) {
    return tasks.filter((task) => getScheduleBucket(task, todayKey) === "upcoming");
  }
  if (overdue) {
    return tasks.filter((task) => getScheduleBucket(task, todayKey) === "overdue");
  }
  if (carryover) {
    return tasks.filter((task) => getScheduleBucket(task, todayKey) === "carryover");
  }

  return tasks;
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

export const logReadingSession = async (taskId, userId, payload) => {
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId },
    include: taskInclude,
  });

  if (!task) {
    throw new Error("Task not found");
  }

  const activeDurationMinutes = Math.max(0, Number(payload.activeDurationMinutes || 0));
  const requiredMinutes = Math.max(
    1,
    Number(payload.requiredMinutes || task.estimatedTime || 30),
  );
  const threshold = Math.max(READING_COMPLETION_THRESHOLD, Math.min(requiredMinutes, 30));
  const engaged = activeDurationMinutes >= threshold && (payload.engagementCount || 0) > 0;
  const sessionStatus = engaged
    ? "completed"
    : activeDurationMinutes > 0
      ? "partial"
      : "missed";

  const noteBody = [
    payload.highlight?.trim() ? `## Highlight\n\n${payload.highlight.trim()}` : "",
    payload.takeaway?.trim() ? `## Takeaway\n\n${payload.takeaway.trim()}` : "",
    payload.lastPage?.trim() ? `## Resume Point\n\nLast page/position: ${payload.lastPage.trim()}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const sessionTitle = payload.sourceTitle?.trim() || task.title;

  return prisma.$transaction(async (tx) => {
    let readingNote = null;

    if (noteBody) {
      readingNote = await tx.note.create({
        data: {
          title:
            payload.noteTitle?.trim() ||
            `${task.title} Reading Session`,
          content: noteBody,
          contentType: "markdown",
          userId,
          dreamId: task.dreamId || null,
        },
      });

      await tx.taskNoteLink.upsert({
        where: {
          taskId_noteId: {
            taskId: task.id,
            noteId: readingNote.id,
          },
        },
        create: {
          taskId: task.id,
          noteId: readingNote.id,
        },
        update: {},
      });
    }

    const nextOccurrenceDates =
      task.recurrence && task.recurrence !== "none" && engaged
        ? normalizeOccurrenceDates([...(task.occurrenceDates || []), toDateKey(new Date())])
        : task.occurrenceDates || [];

    await tx.taskCompletionLog.create({
      data: {
        userId,
        taskId: task.id,
        title: `${task.title} · Reading Session`,
        description: [
          `Source: ${sessionTitle}`,
          payload.lastPage?.trim() ? `Resume: ${payload.lastPage.trim()}` : "",
          payload.sourceUrl?.trim() ? `Link: ${payload.sourceUrl.trim()}` : "",
          `Engagement signals: ${payload.engagementCount || 0}`,
        ]
          .filter(Boolean)
          .join("\n"),
        priority: task.priority,
        status: sessionStatus,
        duration: activeDurationMinutes,
        tags: Array.from(
          new Set([
            "reading",
            ...((task.tags || []).map((item) => item.tag?.name).filter(Boolean)),
          ]),
        ),
        goalId: task.dreamId || null,
        noteId: readingNote?.id || task.noteId || null,
        completedAt: new Date(),
      },
    });

    const updateData = {
      status:
        task.recurrence && task.recurrence !== "none"
          ? "in_progress"
          : engaged
            ? "done"
            : "in_progress",
      completedAt:
        task.recurrence && task.recurrence !== "none"
          ? null
          : engaged
            ? new Date()
            : task.completedAt,
      occurrenceDates: nextOccurrenceDates,
      activities: {
        create: {
          action:
            task.recurrence && task.recurrence !== "none" && engaged
              ? `recurring reading occurrence logged (${activeDurationMinutes}m)`
              : engaged
            ? `completed via active reading (${activeDurationMinutes}m)`
            : `reading session logged (${activeDurationMinutes}m partial)`,
        },
      },
    };

    const updatedTask = await tx.task.update({
      where: { id: task.id },
      data: updateData,
      include: taskInclude,
    });

    return {
      task: updatedTask,
      readingNote,
      session: {
        activeDurationMinutes,
        requiredMinutes,
        status: sessionStatus,
        sourceTitle: sessionTitle,
      },
    };
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
    recurrence,
    weeklyDays,
    occurrenceDates,
    isTodayCommitment,
    lastRescheduledAt,
    tags,
    noteId,
    noteIds,
    dreamId,
    projectId,
    aiScore,
    completedAt,
  } = data;
  const normalizedTags = normalizeTags(tags);
  const shouldSyncNotes = Object.prototype.hasOwnProperty.call(data, "noteId")
    || Object.prototype.hasOwnProperty.call(data, "noteIds");
  const resolvedNoteIds = shouldSyncNotes
    ? await resolveOwnedNoteIds(normalizeNoteIds(noteIds, noteId), userId)
    : null;
  const shouldSyncProject = Object.prototype.hasOwnProperty.call(data, "projectId");
  const ownedProject = shouldSyncProject ? await resolveOwnedProject(projectId, userId) : null;
  if (shouldSyncProject && projectId && !ownedProject) {
    throw new Error("Project not found or access denied");
  }
  const resolvedDreamId = shouldSyncProject
    ? ownedProject?.dreamId || null
    : dreamId;
  
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
      recurrence,
      weeklyDays: weeklyDays ? normalizeWeeklyDays(weeklyDays) : undefined,
      occurrenceDates: occurrenceDates
        ? normalizeOccurrenceDates(occurrenceDates)
        : undefined,
      isTodayCommitment,
      lastRescheduledAt: lastRescheduledAt
        ? new Date(lastRescheduledAt)
        : lastRescheduledAt,
      tags: tags ? syncTags(ensureRequiredTags(normalizedTags, title), userId) : undefined,
      noteId: shouldSyncNotes ? resolvedNoteIds[0] || null : undefined,
      notes: shouldSyncNotes ? syncTaskNoteLinks(resolvedNoteIds) : undefined,
      dreamId: resolvedDreamId,
      projectId: shouldSyncProject ? ownedProject?.id || null : undefined,
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
