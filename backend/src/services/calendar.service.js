import { prisma } from "../config/db.js";

const toDate = (value) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date provided");
  }
  return date;
};

const startOfDay = (date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

const endOfDay = (date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));

const startOfWeek = (date) => {
  const day = date.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  const base = startOfDay(date);
  base.setUTCDate(base.getUTCDate() + diff);
  return base;
};

const endOfWeek = (date) => {
  const base = startOfWeek(date);
  base.setUTCDate(base.getUTCDate() + 6);
  return endOfDay(base);
};

const startOfMonth = (date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));

const endOfMonth = (date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 23, 59, 59, 999));

const getRange = (view, date) => {
  if (view === "week") {
    return { start: startOfWeek(date), end: endOfWeek(date) };
  }
  if (view === "month") {
    return { start: startOfMonth(date), end: endOfMonth(date) };
  }
  return { start: startOfDay(date), end: endOfDay(date) };
};

const enumerateDays = (start, end) => {
  const days = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    days.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
};

const isWithinRange = (value, start, end) => value && new Date(value) >= start && new Date(value) <= end;

const mapTaskEvent = (task) => ({
  id: `task-${task.id}`,
  eventType: "task",
  sourceId: task.id,
  title: task.title,
  startsAt: task.startDate || task.dueDate || task.createdAt,
  endsAt: task.dueDate || task.startDate || task.createdAt,
  editable: task.status !== "done",
  status: task.status,
  meta: {
    priority: task.priority,
    dueDate: task.dueDate,
    startDate: task.startDate,
    note: task.note ? { id: task.note.id, title: task.note.title } : null,
    dream: task.dream ? { id: task.dream.id, title: task.dream.title } : null,
  },
});

const mapPlannedFocusEvent = (block) => ({
  id: `focus-block-${block.id}`,
  eventType: "focus",
  sourceId: block.id,
  title: block.title,
  startsAt: block.plannedStart,
  endsAt: block.plannedEnd,
  editable: block.status === "planned",
  status: block.status,
  meta: {
    taskId: block.taskId,
    description: block.description,
    aiScore: block.aiScore,
  },
});

const mapCompletedFocusEvent = (session) => ({
  id: `focus-session-${session.id}`,
  eventType: "focus",
  sourceId: session.id,
  title: `Focus session (${session.completedCount} completed)`,
  startsAt: session.startedAt,
  endsAt: session.endedAt || session.startedAt,
  editable: false,
  status: session.endedAt ? "completed" : "active",
  meta: {
    completedCount: session.completedCount,
    selectedTaskIds: session.selectedTaskIds,
    completedTaskIds: session.completedTaskIds,
  },
});

const mapJournalEvent = (entry) => ({
  id: `journal-${entry.id}`,
  eventType: "journal",
  sourceId: entry.id,
  title: entry.content?.trim()
    ? entry.content.trim().slice(0, 60)
    : "Journal entry",
  startsAt: entry.date,
  endsAt: entry.date,
  editable: true,
  status: entry.content?.trim() ? "written" : "empty",
  meta: {
    mood: entry.mood,
  },
});

const mapLedgerEvent = (summary) => ({
  id: `ledger-${summary.date.toISOString()}`,
  eventType: "ledger",
  sourceId: summary.id || summary.date.toISOString(),
  title: `${summary.completedTasks} completed`,
  startsAt: summary.date,
  endsAt: summary.date,
  editable: false,
  status: "read_only",
  meta: {
    completedTasks: summary.completedTasks,
    totalTasks: summary.totalTasks,
    productivityScore: summary.productivityScore,
  },
});

export const getCalendarOverview = async (userId, { view = "day", date }) => {
  const anchor = toDate(date);
  const range = getRange(view, anchor);

  const [tasks, plannedFocusBlocks, focusSessions, journalEntries, ledgerSummaries] = await Promise.all([
    prisma.task.findMany({
      where: {
        userId,
        OR: [
          { startDate: { gte: range.start, lte: range.end } },
          { dueDate: { gte: range.start, lte: range.end } },
          {
            AND: [
              { startDate: { lte: range.end } },
              { dueDate: { gte: range.start } },
            ],
          },
        ],
      },
      include: {
        note: { select: { id: true, title: true } },
        dream: { select: { id: true, title: true } },
      },
      orderBy: [{ dueDate: "asc" }, { priority: "desc" }],
    }),
    prisma.plannedFocusBlock.findMany({
      where: {
        userId,
        plannedStart: { lte: range.end },
        plannedEnd: { gte: range.start },
      },
      orderBy: { plannedStart: "asc" },
    }),
    prisma.focusSession.findMany({
      where: {
        userId,
        startedAt: { gte: range.start, lte: range.end },
      },
      orderBy: { startedAt: "asc" },
    }),
    prisma.journalEntry.findMany({
      where: {
        userId,
        date: { gte: range.start, lte: range.end },
      },
      orderBy: { date: "asc" },
    }),
    prisma.dailySummary.findMany({
      where: {
        userId,
        date: { gte: range.start, lte: range.end },
      },
      orderBy: { date: "asc" },
    }),
  ]);

  const events = [
    ...tasks.map(mapTaskEvent),
    ...plannedFocusBlocks.map(mapPlannedFocusEvent),
    ...focusSessions.map(mapCompletedFocusEvent),
    ...journalEntries.map(mapJournalEvent),
    ...ledgerSummaries.map(mapLedgerEvent),
  ].sort((left, right) => new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime());

  const days = enumerateDays(startOfDay(range.start), startOfDay(range.end)).map((day) => {
    const key = day.toISOString().slice(0, 10);
    const dayEvents = events.filter((event) => event.startsAt?.toString().slice(0, 10) === key);
    const ledgerSummary = ledgerSummaries.find((summary) => summary.date.toISOString().slice(0, 10) === key);
    const hasJournal = journalEntries.some((entry) => entry.date.toISOString().slice(0, 10) === key && entry.content.trim().length > 0);

    return {
      date: key,
      events: dayEvents,
      hasJournal,
      productivityScore: ledgerSummary?.productivityScore ?? 0,
      completedTasks: ledgerSummary?.completedTasks ?? 0,
      missingJournal: !hasJournal,
    };
  });

  return {
    view,
    range: {
      start: range.start,
      end: range.end,
    },
    days,
    events,
  };
};

export const getCalendarDayDetails = async (userId, date) => {
  const anchor = toDate(date);
  const rangeStart = startOfDay(anchor);
  const rangeEnd = endOfDay(anchor);

  const [plannedTasks, completedTasks, plannedFocusBlocks, focusSessions, journalEntry, ledgerSummary] = await Promise.all([
    prisma.task.findMany({
      where: {
        userId,
        OR: [
          { startDate: { gte: rangeStart, lte: rangeEnd } },
          { dueDate: { gte: rangeStart, lte: rangeEnd } },
        ],
      },
      include: {
        note: { select: { id: true, title: true } },
        dream: { select: { id: true, title: true } },
      },
      orderBy: [{ status: "asc" }, { priority: "desc" }],
    }),
    prisma.task.findMany({
      where: {
        userId,
        status: "done",
        completedAt: { gte: rangeStart, lte: rangeEnd },
      },
      orderBy: { completedAt: "desc" },
    }),
    prisma.plannedFocusBlock.findMany({
      where: {
        userId,
        plannedStart: { lte: rangeEnd },
        plannedEnd: { gte: rangeStart },
      },
      orderBy: { plannedStart: "asc" },
    }),
    prisma.focusSession.findMany({
      where: {
        userId,
        startedAt: { gte: rangeStart, lte: rangeEnd },
      },
      orderBy: { startedAt: "asc" },
    }),
    prisma.journalEntry.findFirst({
      where: {
        userId,
        date: rangeStart,
      },
    }),
    prisma.dailySummary.findUnique({
      where: {
        userId_date: {
          userId,
          date: rangeStart,
        },
      },
    }),
  ]);

  const overloadScore =
    plannedTasks.filter((task) => task.status !== "done").length +
    plannedFocusBlocks.filter((block) => block.status === "planned").length;

  return {
    date: rangeStart,
    plannedTasks,
    completedTasks,
    plannedFocusBlocks,
    focusSessions,
    journal: journalEntry,
    ledger: ledgerSummary,
    missingJournal: !journalEntry || !journalEntry.content.trim(),
    productivityScore: ledgerSummary?.productivityScore ?? 0,
    overloadWarning:
      overloadScore >= 6
        ? "This day looks overloaded. Shift lower-priority work or shorten focus blocks."
        : null,
    emptyProductivitySignal:
      !ledgerSummary?.completedTasks && !plannedFocusBlocks.length
        ? "This day has no visible execution signal yet."
        : null,
  };
};

export const rescheduleTaskOnCalendar = async (userId, taskId, data) => {
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  return prisma.task.update({
    where: { id: taskId },
    data: {
      startDate: data.startDate ? new Date(data.startDate) : null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      activities: {
        create: {
          action: "rescheduled from calendar",
        },
      },
    },
  });
};

export const createFocusBlock = async (userId, data) => {
  const plannedStart = new Date(data.plannedStart);
  const plannedEnd = new Date(data.plannedEnd);

  if (plannedEnd <= plannedStart) {
    throw new Error("Focus block end time must be after the start time");
  }

  return prisma.plannedFocusBlock.create({
    data: {
      userId,
      taskId: data.taskId || null,
      title: data.title,
      description: data.description || null,
      plannedStart,
      plannedEnd,
    },
  });
};

export const updateFocusBlock = async (userId, blockId, data) => {
  if (data.plannedStart && data.plannedEnd && new Date(data.plannedEnd) <= new Date(data.plannedStart)) {
    throw new Error("Focus block end time must be after the start time");
  }

  const block = await prisma.plannedFocusBlock.findFirst({
    where: { id: blockId, userId },
  });

  if (!block) {
    throw new Error("Focus block not found");
  }

  return prisma.plannedFocusBlock.update({
    where: { id: blockId },
    data: {
      title: data.title,
      description: data.description,
      taskId: Object.prototype.hasOwnProperty.call(data, "taskId") ? data.taskId : undefined,
      plannedStart: data.plannedStart ? new Date(data.plannedStart) : undefined,
      plannedEnd: data.plannedEnd ? new Date(data.plannedEnd) : undefined,
      status: data.status,
    },
  });
};

export const deleteFocusBlock = async (userId, blockId) => {
  const block = await prisma.plannedFocusBlock.findFirst({
    where: { id: blockId, userId },
  });

  if (!block) {
    throw new Error("Focus block not found");
  }

  return prisma.plannedFocusBlock.delete({
    where: { id: blockId },
  });
};

export const getCalendarSuggestions = async (userId, date) => {
  const anchor = startOfDay(toDate(date));
  const dayEnd = endOfDay(anchor);
  const [openTasks, focusHistory, dailySummary, existingBlocks] = await Promise.all([
    prisma.task.findMany({
      where: {
        userId,
        status: { not: "done" },
      },
      orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
      take: 8,
    }),
    prisma.focusAnalytics.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 10,
    }),
    prisma.dailySummary.findUnique({
      where: {
        userId_date: {
          userId,
          date: anchor,
        },
      },
    }),
    prisma.plannedFocusBlock.findMany({
      where: {
        userId,
        plannedStart: { gte: anchor, lte: dayEnd },
      },
      orderBy: { plannedStart: "asc" },
    }),
  ]);

  const totalPlannedMinutes = existingBlocks.reduce((sum, block) => {
    return sum + Math.round((new Date(block.plannedEnd).getTime() - new Date(block.plannedStart).getTime()) / 60000);
  }, 0);

  const suggestedStartBase = new Date(anchor);
  suggestedStartBase.setUTCHours(focusHistory[0]?.avgFocusScore && focusHistory[0].avgFocusScore > 40 ? 9 : 10, 0, 0, 0);

  const suggestions = openTasks.slice(0, 4).map((task, index) => {
    const start = new Date(suggestedStartBase);
    start.setUTCMinutes(start.getUTCMinutes() + index * 75 + totalPlannedMinutes);
    const end = new Date(start);
    end.setUTCMinutes(end.getUTCMinutes() + Math.min(Math.max(task.estimatedTime || 45, 30), 90));

    const reasonParts = [];
    if (["urgent", "high"].includes(task.priority)) {
      reasonParts.push("high priority");
    }
    if (task.dueDate && new Date(task.dueDate) < dayEnd) {
      reasonParts.push("deadline close");
    }
    if ((focusHistory[0]?.avgFocusScore || 0) > 40) {
      reasonParts.push("matches a strong recent focus window");
    } else {
      reasonParts.push("fills an empty execution window");
    }

    return {
      taskId: task.id,
      title: task.title,
      recommendedStart: start.toISOString(),
      recommendedEnd: end.toISOString(),
      reason: reasonParts.join(", "),
    };
  });

  return {
    summary:
      suggestions.length > 0
        ? "Suggested time blocks are based on task urgency, estimated effort, and recent focus performance."
        : "No scheduling suggestions available because the active task queue is empty.",
    suggestions,
    overloadWarnings: [
      ...(totalPlannedMinutes > 240 ? ["More than four hours of focus time is already planned for this day."] : []),
      ...(dailySummary?.productivityScore && dailySummary.productivityScore < 15 && existingBlocks.length > 3
        ? ["This day has a low recent productivity score but a heavy plan, so trim it down."]
        : []),
    ],
    emptyDaySignals: [
      ...(!existingBlocks.length ? ["No focus blocks are scheduled yet for this day."] : []),
      ...(!(dailySummary?.completedTasks > 0) ? ["Recent completion history for this date is still empty."] : []),
    ],
  };
};
