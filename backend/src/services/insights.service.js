import { prisma } from "../config/db.js";

// Simple keyword-based insight detector 
const STRESS_KEYWORDS = ["stressed", "overwhelmed", "tired", "frustrated", "stuck", "hard", "difficult", "failed", "burnout", "anxious", "anxious", "struggle"];
const POSITIVE_KEYWORDS = ["great", "happy", "productive", "focused", "proud", "excited", "accomplished", "finished", "breakthrough", "win", "progress"];
const PLANNING_KEYWORDS = ["need to", "should", "have to", "must", "plan to", "going to", "tomorrow", "will", "deadline", "finish"];

/**
 * Analyze a journal entry and generate subtle pattern-based insights.
 */
export const generateJournalInsights = async (journalId, userId, content) => {
  const lower = content.toLowerCase();
  const insights = [];
  
  // Check for stress signals
  const stressSignals = STRESS_KEYWORDS.filter(kw => lower.includes(kw));
  if (stressSignals.length >= 2) {
    insights.push({
      journalId,
      userId,
      message: `You seem to be carrying some weight today — mentions of "${stressSignals.slice(0, 2).join('" and "')}". Consider identifying what's in your control.`,
      type: "pattern",
    });
  }

  // Check for positive momentum
  const positiveSignals = POSITIVE_KEYWORDS.filter(kw => lower.includes(kw));
  if (positiveSignals.length >= 2) {
    insights.push({
      journalId,
      userId,
      message: `Strong day! You expressed real momentum: "${positiveSignals.slice(0, 2).join('" and "')}". What was the key driver?`,
      type: "reflection",
    });
  }

  // Check for planning signals → suggest task
  const planningSignals = PLANNING_KEYWORDS.filter(kw => lower.includes(kw));
  if (planningSignals.length >= 1) {
    insights.push({
      journalId,
      userId,
      message: `You mentioned intentions for action. Consider converting outstanding commitments into tasks before tomorrow.`,
      type: "suggestion",
    });
  }

  // Only insert new insights (avoid duplicates on re-saves)
  if (insights.length > 0) {
    await prisma.journalInsight.deleteMany({ where: { journalId } });
    await prisma.journalInsight.createMany({ data: insights });
  }

  return insights;
};

/**
 * Analyze mood trends for the past 7 days.
 */
export const getMoodTrend = async (userId) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const logs = await prisma.journalMoodLog.findMany({
    where: { userId, date: { gte: sevenDaysAgo } },
    orderBy: { date: "asc" },
  });

  const MOOD_SCORES = { great: 4, good: 3, neutral: 2, bad: 1 };
  const avg = logs.length > 0
    ? logs.reduce((sum, l) => sum + (MOOD_SCORES[l.mood] || 2), 0) / logs.length
    : null;

  return {
    logs,
    average: avg,
    summary: avg
      ? avg >= 3.5 ? "Excellent week — consistent high energy."
      : avg >= 2.5 ? "Solid week — mostly positive with some variation."
      : avg >= 1.5 ? "Challenging week — consider patterns causing low mood."
      : "Tough week — be kind to yourself."
      : "Not enough data yet.",
  };
};
