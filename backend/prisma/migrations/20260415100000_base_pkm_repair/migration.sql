DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TaskStatus') THEN
    CREATE TYPE "TaskStatus" AS ENUM ('todo', 'in_progress', 'done');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Priority') THEN
    CREATE TYPE "Priority" AS ENUM ('low', 'medium', 'high', 'urgent');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DreamStatus') THEN
    CREATE TYPE "DreamStatus" AS ENUM ('active', 'paused', 'completed');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'IdeaStatus') THEN
    CREATE TYPE "IdeaStatus" AS ENUM ('raw', 'in_progress', 'converted');
  END IF;
END $$;

ALTER TABLE "Note" ADD COLUMN IF NOT EXISTS "dreamId" TEXT;

CREATE TABLE IF NOT EXISTS "Task" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "status" "TaskStatus" NOT NULL DEFAULT 'todo',
  "priority" "Priority" NOT NULL DEFAULT 'medium',
  "dueDate" TIMESTAMP(3),
  "estimatedTime" INTEGER,
  "userId" TEXT NOT NULL,
  "noteId" TEXT,
  "dreamId" TEXT,
  "aiScore" DOUBLE PRECISION,
  "suggestedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "startDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "duration" INTEGER DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "TaskTag" (
  "id" TEXT NOT NULL,
  "taskId" TEXT NOT NULL,
  "tagId" TEXT NOT NULL,
  CONSTRAINT "TaskTag_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Subtask" (
  "id" TEXT NOT NULL,
  "taskId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "status" "TaskStatus" NOT NULL DEFAULT 'todo',
  CONSTRAINT "Subtask_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Dream" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "status" "DreamStatus" NOT NULL DEFAULT 'active',
  "category" TEXT,
  "priority" "Priority" NOT NULL DEFAULT 'medium',
  "targetDate" TIMESTAMP(3),
  "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "healthScore" DOUBLE PRECISION NOT NULL DEFAULT 100,
  "aiScore" DOUBLE PRECISION,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Dream_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "DreamTag" (
  "id" TEXT NOT NULL,
  "dreamId" TEXT NOT NULL,
  "tagId" TEXT NOT NULL,
  CONSTRAINT "DreamTag_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "DreamMilestone" (
  "id" TEXT NOT NULL,
  "dreamId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,
  "targetDate" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DreamMilestone_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "DreamInsight" (
  "id" TEXT NOT NULL,
  "dreamId" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DreamInsight_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "DreamActivity" (
  "id" TEXT NOT NULL,
  "dreamId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DreamActivity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "TaskActivity" (
  "id" TEXT NOT NULL,
  "taskId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TaskActivity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "TaskCompletionLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "taskId" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "priority" "Priority" NOT NULL DEFAULT 'medium',
  "status" TEXT NOT NULL DEFAULT 'done',
  "duration" INTEGER,
  "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "goalId" TEXT,
  "noteId" TEXT,
  "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TaskCompletionLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "DailySummary" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "totalTasks" INTEGER NOT NULL DEFAULT 0,
  "completedTasks" INTEGER NOT NULL DEFAULT 0,
  "totalDuration" INTEGER DEFAULT 0,
  "productivityScore" DOUBLE PRECISION DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DailySummary_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ProductivityInsight" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProductivityInsight_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "JournalEntry" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "content" TEXT NOT NULL,
  "mood" TEXT,
  "highlights" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "JournalTag" (
  "id" TEXT NOT NULL,
  "journalEntryId" TEXT NOT NULL,
  "tagId" TEXT NOT NULL,
  CONSTRAINT "JournalTag_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "JournalInsight" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "journalId" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "JournalInsight_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "JournalTaskMention" (
  "id" TEXT NOT NULL,
  "journalId" TEXT NOT NULL,
  "extractedText" TEXT NOT NULL,
  "suggestedTask" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "JournalTaskMention_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "JournalMoodLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "mood" TEXT NOT NULL,
  CONSTRAINT "JournalMoodLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Idea" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL DEFAULT 'Untitled Idea',
  "description" TEXT,
  "content" TEXT NOT NULL,
  "status" "IdeaStatus" NOT NULL DEFAULT 'raw',
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Idea_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "IdeaTag" (
  "id" TEXT NOT NULL,
  "ideaId" TEXT NOT NULL,
  "tagId" TEXT NOT NULL,
  CONSTRAINT "IdeaTag_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "IdeaLink" (
  "id" TEXT NOT NULL,
  "ideaId" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "IdeaLink_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Image" (
  "id" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "publicId" TEXT NOT NULL,
  "width" INTEGER,
  "height" INTEGER,
  "size" INTEGER,
  "format" TEXT,
  "userId" TEXT NOT NULL,
  "parentType" TEXT NOT NULL,
  "parentId" TEXT,
  "aiProcessed" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Task_userId_idx" ON "Task"("userId");
CREATE INDEX IF NOT EXISTS "Task_dreamId_idx" ON "Task"("dreamId");
CREATE UNIQUE INDEX IF NOT EXISTS "TaskTag_taskId_tagId_key" ON "TaskTag"("taskId", "tagId");
CREATE INDEX IF NOT EXISTS "Dream_userId_idx" ON "Dream"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "DreamTag_dreamId_tagId_key" ON "DreamTag"("dreamId", "tagId");
CREATE INDEX IF NOT EXISTS "TaskCompletionLog_userId_completedAt_idx" ON "TaskCompletionLog"("userId", "completedAt");
CREATE UNIQUE INDEX IF NOT EXISTS "DailySummary_userId_date_key" ON "DailySummary"("userId", "date");
CREATE INDEX IF NOT EXISTS "JournalEntry_userId_date_idx" ON "JournalEntry"("userId", "date");
CREATE UNIQUE INDEX IF NOT EXISTS "JournalTag_journalEntryId_tagId_key" ON "JournalTag"("journalEntryId", "tagId");
CREATE UNIQUE INDEX IF NOT EXISTS "JournalMoodLog_userId_date_key" ON "JournalMoodLog"("userId", "date");
CREATE INDEX IF NOT EXISTS "Idea_userId_idx" ON "Idea"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "IdeaTag_ideaId_tagId_key" ON "IdeaTag"("ideaId", "tagId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Note_dreamId_fkey') THEN
    ALTER TABLE "Note" ADD CONSTRAINT "Note_dreamId_fkey" FOREIGN KEY ("dreamId") REFERENCES "Dream"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Task_userId_fkey') THEN
    ALTER TABLE "Task" ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Task_noteId_fkey') THEN
    ALTER TABLE "Task" ADD CONSTRAINT "Task_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Task_dreamId_fkey') THEN
    ALTER TABLE "Task" ADD CONSTRAINT "Task_dreamId_fkey" FOREIGN KEY ("dreamId") REFERENCES "Dream"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TaskTag_taskId_fkey') THEN
    ALTER TABLE "TaskTag" ADD CONSTRAINT "TaskTag_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TaskTag_tagId_fkey') THEN
    ALTER TABLE "TaskTag" ADD CONSTRAINT "TaskTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Subtask_taskId_fkey') THEN
    ALTER TABLE "Subtask" ADD CONSTRAINT "Subtask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Dream_userId_fkey') THEN
    ALTER TABLE "Dream" ADD CONSTRAINT "Dream_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DreamTag_dreamId_fkey') THEN
    ALTER TABLE "DreamTag" ADD CONSTRAINT "DreamTag_dreamId_fkey" FOREIGN KEY ("dreamId") REFERENCES "Dream"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DreamTag_tagId_fkey') THEN
    ALTER TABLE "DreamTag" ADD CONSTRAINT "DreamTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DreamMilestone_dreamId_fkey') THEN
    ALTER TABLE "DreamMilestone" ADD CONSTRAINT "DreamMilestone_dreamId_fkey" FOREIGN KEY ("dreamId") REFERENCES "Dream"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DreamInsight_dreamId_fkey') THEN
    ALTER TABLE "DreamInsight" ADD CONSTRAINT "DreamInsight_dreamId_fkey" FOREIGN KEY ("dreamId") REFERENCES "Dream"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DreamActivity_dreamId_fkey') THEN
    ALTER TABLE "DreamActivity" ADD CONSTRAINT "DreamActivity_dreamId_fkey" FOREIGN KEY ("dreamId") REFERENCES "Dream"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TaskActivity_taskId_fkey') THEN
    ALTER TABLE "TaskActivity" ADD CONSTRAINT "TaskActivity_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TaskCompletionLog_userId_fkey') THEN
    ALTER TABLE "TaskCompletionLog" ADD CONSTRAINT "TaskCompletionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TaskCompletionLog_taskId_fkey') THEN
    ALTER TABLE "TaskCompletionLog" ADD CONSTRAINT "TaskCompletionLog_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TaskCompletionLog_goalId_fkey') THEN
    ALTER TABLE "TaskCompletionLog" ADD CONSTRAINT "TaskCompletionLog_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Dream"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TaskCompletionLog_noteId_fkey') THEN
    ALTER TABLE "TaskCompletionLog" ADD CONSTRAINT "TaskCompletionLog_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DailySummary_userId_fkey') THEN
    ALTER TABLE "DailySummary" ADD CONSTRAINT "DailySummary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProductivityInsight_userId_fkey') THEN
    ALTER TABLE "ProductivityInsight" ADD CONSTRAINT "ProductivityInsight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'JournalEntry_userId_fkey') THEN
    ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'JournalTag_journalEntryId_fkey') THEN
    ALTER TABLE "JournalTag" ADD CONSTRAINT "JournalTag_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'JournalTag_tagId_fkey') THEN
    ALTER TABLE "JournalTag" ADD CONSTRAINT "JournalTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'JournalInsight_userId_fkey') THEN
    ALTER TABLE "JournalInsight" ADD CONSTRAINT "JournalInsight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'JournalInsight_journalId_fkey') THEN
    ALTER TABLE "JournalInsight" ADD CONSTRAINT "JournalInsight_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "JournalEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'JournalTaskMention_journalId_fkey') THEN
    ALTER TABLE "JournalTaskMention" ADD CONSTRAINT "JournalTaskMention_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "JournalEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'JournalMoodLog_userId_fkey') THEN
    ALTER TABLE "JournalMoodLog" ADD CONSTRAINT "JournalMoodLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Idea_userId_fkey') THEN
    ALTER TABLE "Idea" ADD CONSTRAINT "Idea_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'IdeaTag_ideaId_fkey') THEN
    ALTER TABLE "IdeaTag" ADD CONSTRAINT "IdeaTag_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'IdeaTag_tagId_fkey') THEN
    ALTER TABLE "IdeaTag" ADD CONSTRAINT "IdeaTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'IdeaLink_ideaId_fkey') THEN
    ALTER TABLE "IdeaLink" ADD CONSTRAINT "IdeaLink_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Image_userId_fkey') THEN
    ALTER TABLE "Image" ADD CONSTRAINT "Image_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
