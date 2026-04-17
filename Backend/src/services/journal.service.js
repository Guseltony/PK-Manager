import { prisma } from "../config/db.js";
import { generateJournalInsights } from "./insights.service.js";
import { syncTags, tagInclude } from "../utils/tagHelper.js";

/**
 * Gets the journal entry for a specific date (usually today).
 * If none exists, it optionally creates an empty one.
 */
export const getJournalEntryByDate = async (userId, dateString) => {
  // Standardize the date to the start of the UTC day to avoid timezone shifts
  // We use a safe date range or consistent midnight UTC approach
  const requestedDate = dateString ? new Date(dateString) : new Date();
  
  // Validating date to prevent "Invalid Date" errors
  if (isNaN(requestedDate.getTime())) {
    throw new Error("Invalid date formatted provided");
  }

  const startOfDay = new Date(Date.UTC(requestedDate.getUTCFullYear(), requestedDate.getUTCMonth(), requestedDate.getUTCDate()));
  
  let entry = await prisma.journalEntry.findFirst({
    where: {
      userId,
      date: startOfDay,
    },
    include: {
      ...tagInclude(),
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
        ...tagInclude(),
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
      tags: data.tags ? syncTags(data.tags, userId) : undefined,
    },
    include: {
      ...tagInclude(),
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
  const takeVal = parseInt(limit);
  const skipVal = parseInt(skip);
  
  return await prisma.journalEntry.findMany({
    where: { userId },
    include: {
      ...tagInclude(),
    },
    orderBy: { date: "desc" },
    take: isNaN(takeVal) ? 10 : takeVal,
    skip: isNaN(skipVal) ? 0 : skipVal,
  });
};
