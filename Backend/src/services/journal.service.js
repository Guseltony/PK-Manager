import { prisma } from "../config/db.js";
import { generateJournalInsights } from "./insights.service.js";

/**
 * Gets the journal entry for a specific date (usually today).
 * If none exists, it optionally creates an empty one.
 */
export const getJournalEntryByDate = async (userId, dateString) => {
  const dateStr = dateString ? new Date(dateString) : new Date();
  const startOfDay = new Date(dateStr.setHours(0, 0, 0, 0));
  
  let entry = await prisma.journalEntry.findFirst({
    where: {
      userId,
      date: startOfDay,
    },
    include: {
      insights: true,
      mentions: true,
    }
  });

  if (!entry) {
    entry = await prisma.journalEntry.create({
      data: {
        userId,
        date: startOfDay,
        content: "",
      },
      include: {
        insights: true,
        mentions: true,
      }
    });
  }

  return entry;
};

/**
 * Update the journal entry content, mood, or highlights
 */
export const updateJournalEntry = async (journalId, userId, data) => {
  const { content, mood, highlights } = data;
  
  const entry = await prisma.journalEntry.update({
    where: {
      id: journalId,
      userId, // ensure security
    },
    data: {
      content,
      mood,
      highlights,
    },
    include: {
      insights: true,
      mentions: true,
    }
  });

  // Track mood in log if mood changed
  if (mood) {
    await prisma.journalMoodLog.upsert({
      where: {
        userId_date: {
          userId,
          date: entry.date,
        }
      },
      update: { mood },
      create: { userId, date: entry.date, mood }
    });
  }

  // Trigger V3 insight engine (non-blocking)
  if (content && content.trim().length > 50) {
    generateJournalInsights(journalId, userId, content).catch(() => {});
  }

  return entry;
};

/**
 * Fetch timeline entries (past X days)
 */
export const getJournalTimeline = async (userId, limit = 10, skip = 0) => {
  return await prisma.journalEntry.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: parseInt(limit),
    skip: parseInt(skip),
  });
};
