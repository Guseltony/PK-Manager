import { prisma } from "../config/db.js";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const startOfDay = (date = new Date()) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

const getPeakWindow = (sessions) => {
  if (!sessions.length) return null;
  const buckets = { morning: 0, afternoon: 0, evening: 0 };
  sessions.forEach((session) => {
    const hour = new Date(session.startedAt).getHours();
    if (hour < 12) buckets.morning += session.completedCount || 0;
    else if (hour < 18) buckets.afternoon += session.completedCount || 0;
    else buckets.evening += session.completedCount || 0;
  });
  return Object.entries(buckets).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
};

const buildInsight = ({ userId, type, title, description, evidence, recommendation, confidence }) => ({
  userId,
  type,
  title,
  description,
  evidence,
  recommendation,
  confidence: clamp(confidence, 0.35, 0.98),
});

export const computeInsights = async (userId) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [tasks, taskLogs, summaries, focusSessions, focusAnalytics, journals, dreams, notes, ideas] = await Promise.all([
    prisma.task.findMany({
      where: { userId },
      include: {
        dream: { select: { id: true, title: true } },
        tags: { include: { tag: true } },
      },
    }),
    prisma.taskCompletionLog.findMany({
      where: { userId, completedAt: { gte: thirtyDaysAgo } },
      orderBy: { completedAt: "desc" },
    }),
    prisma.dailySummary.findMany({
      where: { userId, date: { gte: thirtyDaysAgo } },
      orderBy: { date: "desc" },
    }),
    prisma.focusSession.findMany({
      where: { userId, startedAt: { gte: thirtyDaysAgo } },
      orderBy: { startedAt: "desc" },
    }),
    prisma.focusAnalytics.findMany({
      where: { userId, date: { gte: thirtyDaysAgo } },
      orderBy: { date: "desc" },
    }),
    prisma.journalEntry.findMany({
      where: { userId, date: { gte: thirtyDaysAgo } },
      orderBy: { date: "desc" },
      include: { insights: true },
    }),
    prisma.dream.findMany({
      where: { userId },
      include: {
        tasks: {
          select: { id: true, status: true, updatedAt: true, createdAt: true },
        },
        milestones: true,
      },
    }),
    prisma.note.findMany({
      where: { userId },
      include: {
        tasks: { select: { id: true } },
        taskLinks: { select: { id: true } },
      },
    }),
    prisma.idea.findMany({
      where: { userId },
      include: { links: true },
    }),
  ]);

  const insights = [];
  const openTasks = tasks.filter((task) => task.status !== "done");
  const overdueTasks = openTasks.filter((task) => task.dueDate && new Date(task.dueDate) < new Date());
  const completedTasks = tasks.filter((task) => task.status === "done");
  const completionRate = tasks.length ? completedTasks.length / tasks.length : 0;

  if (tasks.length > 0) {
    insights.push(
      buildInsight({
        userId,
        type: "productivity",
        title: "Execution reliability baseline",
        description: `Your current task completion rate is ${Math.round(completionRate * 100)}%, with ${overdueTasks.length} open overdue tasks affecting execution confidence.`,
        evidence: [
          `${completedTasks.length} of ${tasks.length} tracked tasks are complete`,
          `${overdueTasks.length} tasks are overdue right now`,
        ],
        recommendation:
          overdueTasks.length > 0
            ? "Clear the oldest overdue task first, then reduce in-progress sprawl to rebuild reliability."
            : "Protect your current execution rhythm by keeping the active queue small and time-bound.",
        confidence: 0.8,
      }),
    );
  }

  const peakWindow = getPeakWindow(focusSessions);
  if (peakWindow && focusSessions.length > 1) {
    insights.push(
      buildInsight({
        userId,
        type: "focus",
        title: "Best focus window detected",
        description: `Your strongest focus completion pattern is in the ${peakWindow}, where completed focus-session output is highest.`,
        evidence: [
          `${focusSessions.length} focus sessions analyzed`,
          `Peak completion bucket: ${peakWindow}`,
        ],
        recommendation: `Schedule your highest-cognitive tasks and planned focus blocks during the ${peakWindow} window.`,
        confidence: 0.74,
      }),
    );
  }

  const avgProductivity = summaries.length
    ? summaries.reduce((sum, item) => sum + (item.productivityScore || 0), 0) / summaries.length
    : 0;
  const weakRecentDays = summaries.filter((item) => (item.productivityScore || 0) < 20).length;
  if (summaries.length > 0) {
    insights.push(
      buildInsight({
        userId,
        type: "behavior",
        title: "Consistency drift signal",
        description: `Your rolling productivity average is ${Math.round(avgProductivity)}, and ${weakRecentDays} recent tracked days landed below a healthy execution threshold.`,
        evidence: [
          `${summaries.length} daily summaries analyzed`,
          `${weakRecentDays} days scored below 20 productivity points`,
        ],
        recommendation:
          weakRecentDays >= 3
            ? "Shrink your daily plan and anchor one non-negotiable completion before adding optional work."
            : "Your consistency is holding. Keep using small daily completions to prevent drift.",
        confidence: 0.71,
      }),
    );
  }

  const stalledDreams = dreams.filter((dream) => {
    const recentTask = dream.tasks.some((task) => new Date(task.updatedAt || task.createdAt) >= sevenDaysAgo);
    return !recentTask;
  });
  if (dreams.length > 0) {
    insights.push(
      buildInsight({
        userId,
        type: "goal_progress",
        title: stalledDreams.length > 0 ? "Some dreams are losing execution support" : "Dream execution is attached to active work",
        description:
          stalledDreams.length > 0
            ? `${stalledDreams.length} dreams have no active task movement in the last 7 days, which suggests identity goals are not being translated into execution.`
            : "Your current dreams still have active task movement, which keeps long-term direction connected to action.",
        evidence: [
          `${dreams.length} dreams reviewed`,
          `${stalledDreams.length} dreams have no task updates in the last 7 days`,
        ],
        recommendation:
          stalledDreams.length > 0
            ? "Attach at least one live task or milestone to each stalled dream so progress becomes visible again."
            : "Keep reviewing dream-linked tasks weekly so active goals do not quietly stall.",
        confidence: 0.78,
      }),
    );
  }

  const moodWeights = { great: 4, good: 3, neutral: 2, bad: 1 };
  const recentMoodAverage = journals.length
    ? journals.reduce((sum, entry) => sum + (moodWeights[entry.mood] || 2), 0) / journals.length
    : 0;
  const lowMoodEntries = journals.filter((entry) => entry.mood === "bad" || entry.mood === "neutral").length;
  if (journals.length > 0) {
    insights.push(
      buildInsight({
        userId,
        type: "emotional",
        title: "Journal mood trend",
        description:
          recentMoodAverage < 2.3
            ? "Recent journal signals show a lower emotional baseline, which may be reducing execution energy."
            : "Recent journal signals show a stable-to-positive emotional baseline supporting execution.",
        evidence: [
          `${journals.length} journal entries analyzed`,
          `${lowMoodEntries} entries were neutral or low mood`,
        ],
        recommendation:
          recentMoodAverage < 2.3
            ? "Reduce plan pressure on low-energy days and use journaling to define one humane next step instead of a full workload."
            : "When your mood is stable, front-load the most meaningful task because momentum compounds on good days.",
        confidence: 0.67,
      }),
    );
  }

  const linkedNotes = notes.filter((note) => (note.tasks?.length || 0) + (note.taskLinks?.length || 0) > 0).length;
  const ideaConversions = ideas.filter((idea) => idea.links.length > 0).length;
  if (notes.length > 0 || ideas.length > 0) {
    insights.push(
      buildInsight({
        userId,
        type: "productivity",
        title: "Knowledge-to-action ratio",
        description: `About ${linkedNotes}/${notes.length || 1} notes and ${ideaConversions}/${ideas.length || 1} ideas currently connect to execution entities, which shows how much captured thinking is turning into action.`,
        evidence: [
          `${linkedNotes} notes have direct task links`,
          `${ideaConversions} ideas have been converted or linked`,
        ],
        recommendation:
          linkedNotes < Math.max(1, Math.ceil(notes.length * 0.3))
            ? "Review isolated notes weekly and convert one strong insight into a task, dream milestone, or idea link."
            : "Your knowledge base is feeding execution. Keep using AI note analysis to convert thinking into clear next steps.",
        confidence: 0.69,
      }),
    );
  }

  return insights
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 8);
};

export const getInsightsOverview = async (userId, filters = {}) => {
  const computed = await computeInsights(userId);

  await prisma.$transaction([
    prisma.insightRecord.deleteMany({ where: { userId } }),
    prisma.insightRecord.createMany({
      data: computed.map((insight) => ({
        ...insight,
        evidence: insight.evidence,
      })),
    }),
  ]);

  const persisted = await prisma.insightRecord.findMany({
    where: {
      userId,
      ...(filters.type ? { type: filters.type } : {}),
    },
    orderBy: [{ confidence: "desc" }, { createdAt: "desc" }],
  });

  const totals = {
    totalInsights: persisted.length,
    byType: persisted.reduce((acc, insight) => {
      acc[insight.type] = (acc[insight.type] || 0) + 1;
      return acc;
    }, {}),
  };

  const topRecommendation = persisted[0]?.recommendation || "Capture more activity to unlock stronger behavioral intelligence.";

  return {
    insights: persisted.map((insight) => ({
      ...insight,
      evidence: Array.isArray(insight.evidence) ? insight.evidence : [],
    })),
    totals,
    topRecommendation,
  };
};
