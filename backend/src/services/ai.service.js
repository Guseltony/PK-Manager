import { prisma } from "../config/db.js";
import { groqJsonCompletion } from "./groq.service.js";
import { loadPrompt } from "../utils/promptLoader.js";
import {
  aiDashboardSummaryResponseSchema,
  aiLedgerInsightResponseSchema,
  aiTaskEnrichmentResponseSchema,
  aiSubtaskPlanResponseSchema,
  dreamIntelligenceResponseSchema,
  focusCoachResponseSchema,
  ideaPlanResponseSchema,
  journalReflectionResponseSchema,
  noteAnalysisResponseSchema,
  taskPlanResponseSchema,
} from "../validators/ai.schema.js";
import { syncTags, tagInclude } from "../utils/tagHelper.js";

const PK_MANAGER_AI_CORE_PROMPT = `
You are PK-Manager's embedded intelligence layer.

Work like a precise product copilot:
- stay grounded in supplied context
- produce useful, non-generic answers
- prefer specific observations over broad advice
- avoid repeating the prompt or input
- keep outputs compact but information-dense
- never invent unavailable facts
- if data is sparse, say so directly and stay conservative
- reuse the user's domain language when it improves clarity
`.trim();

const jsonPrompt = (payload) =>
  `Return valid JSON only.\n\nInput:\n${JSON.stringify(payload, null, 2)}`;

const composeSystemPrompt = (prompt, instruction = "") =>
  [PK_MANAGER_AI_CORE_PROMPT, prompt, instruction].filter(Boolean).join("\n\n");

const normalizeTask = (task) => ({
  ...task,
  description: task.description ?? null,
  estimatedTime: task.estimatedTime ?? null,
  duration: task.duration ?? null,
  startDate: task.startDate ?? null,
  dueDate: task.dueDate ?? null,
  tags: Array.from(new Set((task.tags || []).map((tag) => tag.trim().toLowerCase()).filter(Boolean))).slice(0, 2),
  status: "todo",
});

const normalizeTagNames = (tags = []) =>
  Array.from(new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean)));

const deriveExecutionWindow = (logs) => {
  if (!logs.length) {
    return "Not enough execution history yet to identify a stable completion window.";
  }

  const windows = {
    early_morning: 0,
    late_morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0,
  };

  logs.forEach((log) => {
    const hour = new Date(log.completedAt).getHours();
    if (hour < 9) windows.early_morning += 1;
    else if (hour < 12) windows.late_morning += 1;
    else if (hour < 17) windows.afternoon += 1;
    else if (hour < 21) windows.evening += 1;
    else windows.night += 1;
  });

  const [strongest] = Object.entries(windows).sort((a, b) => b[1] - a[1]);
  const labels = {
    early_morning: "Early morning is the strongest completion window.",
    late_morning: "Late morning is the strongest completion window.",
    afternoon: "Afternoon is the strongest completion window.",
    evening: "Evening is the strongest completion window.",
    night: "Night is the strongest completion window.",
  };

  return labels[strongest[0]];
};

const deriveStreakDays = (summaries) => {
  const dateKeys = new Set(
    summaries
      .filter((summary) => (summary.completedTasks ?? 0) > 0)
      .map((summary) => new Date(summary.date).toISOString().slice(0, 10)),
  );

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (dateKeys.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

const buildLedgerFallback = ({ logs, summaries, openTasks }) => {
  const streakDays = deriveStreakDays(summaries);
  const strongestTags = Object.entries(
    logs.reduce((acc, log) => {
      (log.tags || []).forEach((tag) => {
        if (!tag) return;
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([tag]) => tag);

  const completedRecently = summaries
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7)
    .reduce((total, summary) => total + (summary.completedTasks || 0), 0);

  const overdueTasks = openTasks.filter(
    (task) => task.dueDate && new Date(task.dueDate).getTime() < Date.now(),
  );

  return {
    summary: logs.length
      ? `Ledger history shows ${logs.length} logged completions with ${completedRecently} completions across the last 7 tracked days.`
      : "Ledger history is still sparse, so this readout is based on early execution signals.",
    momentum:
      streakDays >= 3
        ? `Execution is active with a ${streakDays}-day completion streak.`
        : completedRecently > 0
          ? "Execution is moving, but consistency is still forming."
          : "Momentum is currently low and needs a small completion win to restart.",
    streakDays,
    peakExecutionWindow: deriveExecutionWindow(logs),
    strongestTags,
    risks: [
      ...(overdueTasks.length > 0
        ? [`${overdueTasks.length} open task${overdueTasks.length > 1 ? "s are" : " is"} overdue and may be diluting execution focus.`]
        : []),
      ...(strongestTags.length <= 1 && logs.length >= 5
        ? ["Execution is concentrated in a narrow topic band, which may leave other goals under-served."]
        : []),
      ...(streakDays === 0
        ? ["There is no active daily completion streak right now."]
        : []),
    ].slice(0, 4),
    recommendations: [
      overdueTasks.length > 0
        ? "Clear the most overdue task first, then rebuild momentum with one short same-day win."
        : "Pick one high-value task and complete it early in your strongest execution window.",
      strongestTags.length > 0
        ? `Use the ledger's strongest tag pattern (${strongestTags.slice(0, 2).join(", ")}) to batch related work more deliberately.`
        : "Log a few more completed tasks before making major process changes.",
      "Review the ledger every few days to spot which goals are getting execution and which are only getting attention.",
    ].filter(Boolean).slice(0, 4),
  };
};

const getNoteTextForAi = (note) => {
  if (note.contentType !== "richtext") {
    return note.content;
  }

  try {
    const parsed = JSON.parse(note.content);
    if (typeof parsed?.html === "string") {
      return parsed.html
        .replace(/<img[^>]*alt="([^"]*)"[^>]*>/gi, " $1 ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }
  } catch {
    return note.content;
  }

  return note.content;
};

const withFallback = async (runner, fallback) => {
  try {
    return await runner();
  } catch {
    return fallback();
  }
};

const getUserContext = async (userId) => {
  const [tasks, dreams, notes, tags] = await Promise.all([
    prisma.task.findMany({
      where: { userId, status: { not: "done" } },
      select: { id: true, title: true, priority: true, status: true, dueDate: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.dream.findMany({
      where: { userId },
      select: { id: true, title: true, priority: true, status: true, progress: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.note.findMany({
      where: { userId },
      select: { id: true, title: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
    prisma.tag.findMany({
      where: { userId },
      select: { id: true, name: true, color: true },
      orderBy: { name: "asc" },
      take: 30,
    }),
  ]);

  return { tasks, dreams, notes, tags };
};

export const generateTaskPlan = async (userId, { input, sourceType = "general" }) => {
  const prompt = await loadPrompt("GroqAgentprompt.md");
  const context = await getUserContext(userId);

  return withFallback(
    async () => {
      const raw = await groqJsonCompletion({
        systemPrompt: composeSystemPrompt(prompt),
        userPrompt: jsonPrompt({
          today: new Date().toISOString().slice(0, 10),
          sourceType,
          input,
          existingTasks: context.tasks,
          existingDreams: context.dreams,
          existingNotes: context.notes,
          existingTags: context.tags.map((tag) => tag.name),
        }),
      });

      const parsed = taskPlanResponseSchema.parse(raw);

      return {
        ...parsed,
        tasks: parsed.tasks.map(normalizeTask),
      };
    },
    () => {
      const chunks = input
        .split(/(?:,|\n| then | and then )/i)
        .map((chunk) => chunk.trim())
        .filter(Boolean)
        .slice(0, 5);

      const tasks = (chunks.length ? chunks : [input.trim()]).map((chunk, index) =>
        normalizeTask({
          title: chunk.charAt(0).toUpperCase() + chunk.slice(1),
          description: `Complete: ${chunk}`,
          priority: index === 0 ? "high" : "medium",
          estimatedTime: 30,
          dueDate: null,
          tags: sourceType === "journal" ? ["reflection"] : sourceType === "idea" ? ["idea"] : ["planning"],
        }),
      );

      return {
        intent: "task_breakdown",
        summary: "Generated a fallback execution plan based on the request.",
        tasks,
      };
    },
  );
};

export const analyzeIdea = async (userId, ideaId) => {
  const [prompt, idea, context] = await Promise.all([
    loadPrompt("Ideasprompt.md"),
    prisma.idea.findFirst({
      where: { id: ideaId, userId },
      include: { tags: { include: { tag: true } }, links: true },
    }),
    getUserContext(userId),
  ]);

  if (!idea) {
    throw new Error("Idea not found");
  }

  return withFallback(
    async () => {
      const raw = await groqJsonCompletion({
        systemPrompt: composeSystemPrompt(
          prompt,
          "Return only JSON with summary, recommendation, suggestedTags, and suggestedTasks.",
        ),
        userPrompt: jsonPrompt({
          idea: {
            id: idea.id,
            content: idea.content,
            status: idea.status,
            tags: idea.tags.map((item) => item.tag.name),
            links: idea.links,
          },
          existingTasks: context.tasks,
          existingDreams: context.dreams,
          existingNotes: context.notes,
          existingTags: context.tags.map((tag) => tag.name),
          today: new Date().toISOString().slice(0, 10),
        }),
      });

      const parsed = ideaPlanResponseSchema.parse(raw);

      return {
        ...parsed,
        suggestedTags: normalizeTagNames(parsed.suggestedTags),
        suggestedTasks: parsed.suggestedTasks.map(normalizeTask),
      };
    },
    () => ({
      summary: "This idea looks ready to become execution work.",
      recommendation: "task",
      suggestedTags: normalizeTagNames(idea.tags.map((item) => item.tag.name)),
      suggestedTasks: [
        normalizeTask({
          title: idea.content.split("\n")[0].slice(0, 80),
          description: idea.content,
          priority: "medium",
          estimatedTime: 30,
          dueDate: null,
          tags: normalizeTagNames(idea.tags.map((item) => item.tag.name)),
        }),
      ],
    }),
  );
};

export const analyzeNote = async (userId, noteId) => {
  const [prompt, note, context] = await Promise.all([
    loadPrompt("NotePrompt.md"),
    prisma.note.findFirst({
      where: { id: noteId, userId },
      include: {
        tags: { include: { tag: true } },
        tasks: {
          select: { id: true, title: true, status: true, priority: true },
        },
      },
    }),
    getUserContext(userId),
  ]);

  if (!note) {
    throw new Error("Note not found");
  }

  const result = await withFallback(
    async () => {
      const raw = await groqJsonCompletion({
        systemPrompt: composeSystemPrompt(
          prompt,
          "Return only JSON with summary, keyInsights, suggestedTags, and suggestedTasks.",
        ),
        userPrompt: jsonPrompt({
          note: {
            id: note.id,
            title: note.title,
            content: getNoteTextForAi(note),
            tags: note.tags.map((item) => item.tag.name),
            linkedTasks: note.tasks,
          },
          existingTasks: context.tasks,
          existingDreams: context.dreams,
          existingTags: context.tags.map((tag) => tag.name),
          today: new Date().toISOString().slice(0, 10),
        }),
      });

      const parsed = noteAnalysisResponseSchema.parse(raw);

      return {
        ...parsed,
        suggestedTags: normalizeTagNames(parsed.suggestedTags),
        suggestedTasks: parsed.suggestedTasks.map(normalizeTask),
      };
    },
    () => ({
      summary: "Generated a fallback analysis from your note structure.",
      keyInsights: [note.title || "Untitled note", "Consider turning the strongest insight into action."],
      suggestedTags: normalizeTagNames(note.tags.map((item) => item.tag.name)),
      suggestedTasks: [],
    }),
  );

  const mergedTags = normalizeTagNames([
    ...note.tags.map((item) => item.tag.name),
    ...result.suggestedTags,
  ]);

  await prisma.note.update({
    where: { id: noteId },
    data: {
      tags: syncTags(mergedTags.map((name) => ({ name })), userId),
    },
    include: {
      ...tagInclude(),
    },
  });

  return result;
};

export const reflectJournalEntry = async (userId, journalId) => {
  const [prompt, entry, context] = await Promise.all([
    loadPrompt("Journalprompt.md"),
    prisma.journalEntry.findFirst({
      where: { id: journalId, userId },
      include: {
        tags: { include: { tag: true } },
        insights: true,
        mentions: true,
      },
    }),
    getUserContext(userId),
  ]);

  if (!entry) {
    throw new Error("Journal entry not found");
  }

  const parsed = await withFallback(
    async () => {
      const raw = await groqJsonCompletion({
        systemPrompt: composeSystemPrompt(
          prompt,
          "Return only JSON with summary, insights, suggestedTags, and extractedTasks.",
        ),
        userPrompt: jsonPrompt({
          journal: {
            id: entry.id,
            date: entry.date,
            mood: entry.mood,
            content: entry.content,
            tags: entry.tags.map((item) => item.tag.name),
          },
          existingTasks: context.tasks,
          existingDreams: context.dreams,
          existingTags: context.tags.map((tag) => tag.name),
          today: new Date().toISOString().slice(0, 10),
        }),
      });

      return journalReflectionResponseSchema.parse(raw);
    },
    () => ({
      summary: "Fallback reflection generated from your journal entry.",
      insights: [
        {
          type: "reflection",
          message: "There is enough material here to extract at least one concrete next step.",
        },
      ],
      suggestedTags: normalizeTagNames(entry.tags.map((item) => item.tag.name)),
      extractedTasks: [],
    }),
  );
  const tagsToSync = normalizeTagNames([
    ...entry.tags.map((item) => item.tag.name),
    ...parsed.suggestedTags,
  ]);

  await prisma.$transaction(async (tx) => {
    await tx.journalEntry.update({
      where: { id: journalId },
      data: {
        tags: syncTags(tagsToSync.map((name) => ({ name })), userId),
      },
    });

    await tx.journalInsight.deleteMany({ where: { journalId } });

    if (parsed.insights.length > 0) {
      await tx.journalInsight.createMany({
        data: parsed.insights.map((insight) => ({
          userId,
          journalId,
          type: insight.type,
          message: insight.message,
        })),
      });
    }

    await tx.journalTaskMention.deleteMany({ where: { journalId } });

    if (parsed.extractedTasks.length > 0) {
      await tx.journalTaskMention.createMany({
        data: parsed.extractedTasks.map((task) => ({
          journalId,
          extractedText: task.title,
          suggestedTask: true,
        })),
      });
    }
  });

  const refreshedEntry = await prisma.journalEntry.findFirst({
    where: { id: journalId, userId },
    include: {
      ...tagInclude(),
      insights: true,
      mentions: true,
    },
  });

  return {
    summary: parsed.summary,
    suggestedTags: tagsToSync,
    extractedTasks: parsed.extractedTasks.map(normalizeTask),
    entry: refreshedEntry,
  };
};

export const generateDreamIntelligence = async (userId, dreamId) => {
  const [prompt, dream, context] = await Promise.all([
    loadPrompt("Goalprompt.md"),
    prisma.dream.findFirst({
      where: { id: dreamId, userId },
      include: {
        tags: { include: { tag: true } },
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            dueDate: true,
          },
        },
        notes: {
          select: { id: true, title: true, updatedAt: true },
        },
        milestones: true,
        insights: true,
      },
    }),
    getUserContext(userId),
  ]);

  if (!dream) {
    throw new Error("Dream not found");
  }

  const parsed = await withFallback(
    async () => {
      const raw = await groqJsonCompletion({
        systemPrompt: composeSystemPrompt(
          prompt,
          "Return only JSON with summary, healthScore, aiScore, insights, suggestedMilestones, and suggestedTasks.",
        ),
        userPrompt: jsonPrompt({
          dream: {
            id: dream.id,
            title: dream.title,
            description: dream.description,
            status: dream.status,
            category: dream.category,
            priority: dream.priority,
            progress: dream.progress,
            healthScore: dream.healthScore,
            targetDate: dream.targetDate,
            tags: dream.tags.map((item) => item.tag.name),
            tasks: dream.tasks,
            milestones: dream.milestones,
            notes: dream.notes,
          },
          existingTasks: context.tasks,
          existingNotes: context.notes,
          today: new Date().toISOString().slice(0, 10),
        }),
      });

      return dreamIntelligenceResponseSchema.parse(raw);
    },
    () => ({
      summary: "Fallback dream intelligence generated from current progress and linked execution.",
      healthScore: dream.healthScore,
      aiScore: dream.aiScore ?? null,
      insights: [
        {
          type: "progress",
          message: dream.progress > 0 ? "Momentum exists. Keep shipping linked tasks." : "This dream needs an initial execution push.",
        },
      ],
      suggestedMilestones: [],
      suggestedTasks: [],
    }),
  );

  await prisma.$transaction(async (tx) => {
    await tx.dreamInsight.deleteMany({ where: { dreamId } });

    if (parsed.insights.length > 0) {
      await tx.dreamInsight.createMany({
        data: parsed.insights.map((insight) => ({
          dreamId,
          type: insight.type,
          message: insight.message,
        })),
      });
    }

    await tx.dream.update({
      where: { id: dreamId },
      data: {
        aiScore: parsed.aiScore ?? undefined,
        healthScore: parsed.healthScore ?? undefined,
      },
    });
  });

  const refreshedDream = await prisma.dream.findFirst({
    where: { id: dreamId, userId },
    include: {
      tags: { include: { tag: true } },
      tasks: true,
      notes: { select: { id: true, title: true, updatedAt: true } },
      milestones: { orderBy: { createdAt: "asc" } },
      insights: { orderBy: { createdAt: "desc" } },
      activities: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  return {
    summary: parsed.summary,
    suggestedMilestones: parsed.suggestedMilestones,
    suggestedTasks: parsed.suggestedTasks.map(normalizeTask),
    dream: refreshedDream,
  };
};

export const generateFocusCoaching = async (userId) => {
  const [prompt, tasks, analytics] = await Promise.all([
    loadPrompt("Focussystemprompt.md"),
    prisma.task.findMany({
      where: { userId, status: { not: "done" } },
      select: {
        id: true,
        title: true,
        description: true,
        priority: true,
        dueDate: true,
        estimatedTime: true,
        aiScore: true,
      },
      orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
      take: 8,
    }),
    prisma.focusAnalytics.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 14,
    }),
  ]);

  return withFallback(
    async () => {
      const raw = await groqJsonCompletion({
        systemPrompt: composeSystemPrompt(
          prompt,
          "Return only JSON with summary, coaching, and taskOrder.",
        ),
        userPrompt: jsonPrompt({
          today: new Date().toISOString().slice(0, 10),
          focusTasks: tasks,
          analytics,
        }),
      });

      return focusCoachResponseSchema.parse(raw);
    },
    () => ({
      summary: "Fallback focus coaching generated from live task priority and urgency.",
      coaching: [
        "Start with the top urgent or high-priority task before opening anything else.",
        "Keep this session short and finish one task cleanly before switching context.",
      ],
      taskOrder: tasks.slice(0, 3).map((task) => ({
        taskId: task.id,
        title: task.title,
        reason: task.dueDate ? "Has a deadline attached." : "Highest available priority in the queue.",
      })),
    }),
  );
};

export const generateTaskSubtasks = async (userId, taskId) => {
  const [task, context] = await Promise.all([
    prisma.task.findFirst({
      where: { id: taskId, userId },
      include: {
        ...tagInclude(),
        subtasks: true,
        note: { select: { id: true, title: true } },
        dream: { select: { id: true, title: true } },
      },
    }),
    getUserContext(userId),
  ]);

  if (!task) {
    throw new Error("Task not found");
  }

  return withFallback(
    async () => {
      const raw = await groqJsonCompletion({
        systemPrompt: composeSystemPrompt(
          "You break one task into concrete subtasks for a productivity app.",
          "Return JSON only with summary and subtasks.",
        ),
        userPrompt: jsonPrompt({
          task: {
            title: task.title,
            description: task.description,
            priority: task.priority,
            dueDate: task.dueDate,
            existingSubtasks: task.subtasks.map((subtask) => subtask.title),
            note: task.note,
            dream: task.dream,
            tags: task.tags.map((item) => item.tag.name),
          },
          existingTasks: context.tasks,
        }),
      });

      return aiSubtaskPlanResponseSchema.parse(raw);
    },
    () => ({
      summary: "Fallback subtasks generated from the task title and description.",
      subtasks: [
        { title: `Clarify scope for ${task.title}` },
        { title: `Execute core work for ${task.title}` },
        { title: `Review and finalize ${task.title}` },
      ],
    }),
  );
};

export const enrichTaskWithAi = async (userId, taskId) => {
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId },
    include: {
      ...tagInclude(),
      subtasks: true,
      note: { select: { id: true, title: true } },
      dream: { select: { id: true, title: true, description: true, targetDate: true } },
    },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  return withFallback(
    async () => {
      const raw = await groqJsonCompletion({
        systemPrompt: composeSystemPrompt(
          "You improve one productivity task for a PKM app. Fill missing objective details, tags, timing, and duration.",
          "Return JSON only with summary and task.",
        ),
        userPrompt: jsonPrompt({
          today: new Date().toISOString().slice(0, 10),
          task: {
            title: task.title,
            description: task.description,
            priority: task.priority,
            estimatedTime: task.estimatedTime,
            duration: task.duration,
            startDate: task.startDate,
            dueDate: task.dueDate,
            tags: task.tags.map((item) => item.tag.name),
            note: task.note,
            dream: task.dream,
          },
        }),
      });

      const parsed = aiTaskEnrichmentResponseSchema.parse(raw);
      return {
        summary: parsed.summary,
        task: normalizeTask({
          ...task,
          ...parsed.task,
          title: parsed.task.title || task.title,
        }),
      };
    },
    () => ({
      summary: "Applied fallback enrichment based on the task title and linked context.",
      task: normalizeTask({
        title: task.title,
        description: task.description || `Complete the objective: ${task.title}`,
        priority: task.priority,
        estimatedTime: task.estimatedTime ?? 30,
        duration: task.duration ?? 1,
        startDate: task.startDate ?? new Date().toISOString(),
        dueDate: task.dueDate ?? task.dream?.targetDate ?? null,
        tags: normalizeTagNames(task.tags.map((item) => item.tag.name)),
      }),
    }),
  );
};

export const generateDashboardSummary = async (userId) => {
  const [tasks, notes, dreams, journal, focusAnalytics] = await Promise.all([
    prisma.task.findMany({
      where: { userId },
      select: { id: true, title: true, status: true, priority: true, dueDate: true },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
    prisma.note.findMany({
      where: { userId },
      select: { id: true, title: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),
    prisma.dream.findMany({
      where: { userId },
      select: { id: true, title: true, progress: true, priority: true, status: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.journalEntry.findFirst({
      where: { userId },
      orderBy: { date: "desc" },
      select: { id: true, date: true, mood: true, content: true },
    }),
    prisma.focusAnalytics.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 7,
    }),
  ]);

  return withFallback(
    async () => {
      const raw = await groqJsonCompletion({
        systemPrompt: composeSystemPrompt(
          "You summarize a personal knowledge management dashboard.",
          "Return JSON only with summary, priorities, blockers, and momentum.",
        ),
        userPrompt: jsonPrompt({
          today: new Date().toISOString().slice(0, 10),
          tasks,
          notes,
          dreams,
          journal,
          focusAnalytics,
        }),
      });

      return aiDashboardSummaryResponseSchema.parse(raw);
    },
    () => {
      const openTasks = tasks.filter((task) => task.status !== "done");
      const urgentTasks = openTasks.filter((task) => ["urgent", "high"].includes(task.priority)).slice(0, 3);
      const blocked = openTasks.filter((task) => task.dueDate && new Date(task.dueDate) < new Date()).slice(0, 2);

      return {
        summary: `You have ${openTasks.length} active tasks, ${notes.length} recently active notes, and ${dreams.filter((dream) => dream.status === "active").length} active dreams in motion.`,
        priorities: urgentTasks.map((task) => task.title),
        blockers: blocked.map((task) => `${task.title} is overdue`),
        momentum: focusAnalytics[0]?.tasksCompleted
          ? `Focus momentum is active with ${focusAnalytics[0].tasksCompleted} focused completions recently.`
          : "Momentum is quiet right now; a small win today will restart the engine.",
      };
    },
  );
};

export const analyzeLedger = async (userId) => {
  const [prompt, logs, summaries, openTasks, activeDreams] = await Promise.all([
    loadPrompt("newLedgerPrompt.md"),
    prisma.taskCompletionLog.findMany({
      where: { userId },
      orderBy: { completedAt: "desc" },
      take: 120,
      select: {
        title: true,
        priority: true,
        status: true,
        tags: true,
        duration: true,
        completedAt: true,
      },
    }),
    prisma.dailySummary.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 45,
      select: {
        date: true,
        completedTasks: true,
        totalDuration: true,
        productivityScore: true,
      },
    }),
    prisma.task.findMany({
      where: { userId, status: { not: "done" } },
      orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
      take: 20,
      select: {
        title: true,
        priority: true,
        dueDate: true,
        dreamId: true,
      },
    }),
    prisma.dream.findMany({
      where: { userId, status: "active" },
      take: 10,
      select: {
        title: true,
        progress: true,
        priority: true,
      },
    }),
  ]);

  return withFallback(
    async () => {
      const raw = await groqJsonCompletion({
        systemPrompt: composeSystemPrompt(prompt),
        userPrompt: jsonPrompt({
          today: new Date().toISOString().slice(0, 10),
          logs,
          summaries,
          activeDreams,
          openTasks,
        }),
      });

      const parsed = aiLedgerInsightResponseSchema.parse(raw);

      return {
        ...parsed,
        strongestTags: normalizeTagNames(parsed.strongestTags).slice(0, 6),
      };
    },
    () => buildLedgerFallback({ logs, summaries, openTasks }),
  );
};
