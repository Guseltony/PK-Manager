-- Create enums
CREATE TYPE "ProjectStatus" AS ENUM ('not_started', 'in_progress', 'completed', 'paused');
CREATE TYPE "AiStrictnessLevel" AS ENUM ('low', 'medium', 'high');
CREATE TYPE "AiProactivenessLevel" AS ENUM ('passive', 'active', 'autonomous');
CREATE TYPE "AiReasoningDepth" AS ENUM ('fast', 'balanced', 'deep');
CREATE TYPE "AutoInsightFrequency" AS ENUM ('real_time', 'hourly', 'daily');
CREATE TYPE "InboxRoutingSensitivity" AS ENUM ('strict', 'flexible');
CREATE TYPE "TaskPrioritizationMode" AS ENUM ('manual', 'ai_assisted', 'fully_automated');
CREATE TYPE "DeadlineEnforcementLevel" AS ENUM ('soft', 'medium', 'strict');
CREATE TYPE "LedgerStrictnessLevel" AS ENUM ('soft', 'balanced', 'strict');
CREATE TYPE "FailureVisibilityLevel" AS ENUM ('hidden', 'user_only', 'dashboard_and_insights');
CREATE TYPE "DreamProgressSensitivity" AS ENUM ('low', 'medium', 'high');

-- Alter table
ALTER TABLE "Task" ADD COLUMN "projectId" TEXT;

-- Create tables
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dreamId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'not_started',
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "aiStrictness" "AiStrictnessLevel" NOT NULL DEFAULT 'medium',
    "aiProactiveness" "AiProactivenessLevel" NOT NULL DEFAULT 'active',
    "aiReasoningDepth" "AiReasoningDepth" NOT NULL DEFAULT 'balanced',
    "autoTaskGenerationFromDreams" BOOLEAN NOT NULL DEFAULT true,
    "autoLinkingKnowledgeGraph" BOOLEAN NOT NULL DEFAULT true,
    "autoInsightFrequency" "AutoInsightFrequency" NOT NULL DEFAULT 'daily',
    "inboxRoutingSensitivity" "InboxRoutingSensitivity" NOT NULL DEFAULT 'flexible',
    "taskPrioritizationMode" "TaskPrioritizationMode" NOT NULL DEFAULT 'ai_assisted',
    "deadlineEnforcement" "DeadlineEnforcementLevel" NOT NULL DEFAULT 'medium',
    "ledgerStrictness" "LedgerStrictnessLevel" NOT NULL DEFAULT 'balanced',
    "failureVisibility" "FailureVisibilityLevel" NOT NULL DEFAULT 'user_only',
    "autoProjectGeneration" BOOLEAN NOT NULL DEFAULT true,
    "autoTaskBreakdownFromDreams" BOOLEAN NOT NULL DEFAULT true,
    "dreamProgressSensitivity" "DreamProgressSensitivity" NOT NULL DEFAULT 'medium',
    "taskReminders" BOOLEAN NOT NULL DEFAULT true,
    "focusSessionAlerts" BOOLEAN NOT NULL DEFAULT true,
    "dailyInsightSummaries" BOOLEAN NOT NULL DEFAULT true,
    "missedJournalReminders" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX "Task_projectId_idx" ON "Task"("projectId");
CREATE INDEX "Project_userId_createdAt_idx" ON "Project"("userId", "createdAt");
CREATE INDEX "Project_dreamId_createdAt_idx" ON "Project"("dreamId", "createdAt");
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- Add foreign keys
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Project" ADD CONSTRAINT "Project_dreamId_fkey" FOREIGN KEY ("dreamId") REFERENCES "Dream"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
