import { prisma } from "../config/db.js";

const settingsSelect = {
  id: true,
  userId: true,
  aiStrictness: true,
  aiProactiveness: true,
  aiReasoningDepth: true,
  autoTaskGenerationFromDreams: true,
  autoLinkingKnowledgeGraph: true,
  autoInsightFrequency: true,
  inboxRoutingSensitivity: true,
  taskPrioritizationMode: true,
  deadlineEnforcement: true,
  ledgerStrictness: true,
  failureVisibility: true,
  autoProjectGeneration: true,
  autoTaskBreakdownFromDreams: true,
  dreamProgressSensitivity: true,
  taskReminders: true,
  focusSessionAlerts: true,
  dailyInsightSummaries: true,
  missedJournalReminders: true,
  createdAt: true,
  updatedAt: true,
};

export const getOrCreateUserSettings = async (userId) => {
  const existing = await prisma.userSettings.findUnique({
    where: { userId },
    select: settingsSelect,
  });

  if (existing) {
    return existing;
  }

  return prisma.userSettings.create({
    data: { userId },
    select: settingsSelect,
  });
};

export const updateUserSettings = async (userId, updates) => {
  await getOrCreateUserSettings(userId);

  return prisma.userSettings.update({
    where: { userId },
    data: updates,
    select: settingsSelect,
  });
};

export const resetUserSettings = async (userId) => {
  await prisma.userSettings.deleteMany({
    where: { userId },
  });

  return prisma.userSettings.create({
    data: { userId },
    select: settingsSelect,
  });
};
