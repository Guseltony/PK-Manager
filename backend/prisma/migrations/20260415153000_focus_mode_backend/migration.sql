-- CreateTable
CREATE TABLE "FocusSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "selectedTaskIds" TEXT[],
    "completedTaskIds" TEXT[],
    "skippedTaskIds" TEXT[],
    "completedCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FocusSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskFocusMeta" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "aiScore" DOUBLE PRECISION,
    "skipCount" INTEGER NOT NULL DEFAULT 0,
    "completedInFocusCount" INTEGER NOT NULL DEFAULT 0,
    "lastSkippedAt" TIMESTAMP(3),
    "focusSelectedAt" TIMESTAMP(3),
    "lastCompletedAt" TIMESTAMP(3),

    CONSTRAINT "TaskFocusMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FocusAnalytics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "sessions" INTEGER NOT NULL DEFAULT 0,
    "tasksCompleted" INTEGER NOT NULL DEFAULT 0,
    "totalFocusTime" INTEGER NOT NULL DEFAULT 0,
    "avgFocusScore" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FocusAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FocusSession_userId_startedAt_idx" ON "FocusSession"("userId", "startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "TaskFocusMeta_taskId_key" ON "TaskFocusMeta"("taskId");

-- CreateIndex
CREATE INDEX "TaskFocusMeta_userId_lastSkippedAt_idx" ON "TaskFocusMeta"("userId", "lastSkippedAt");

-- CreateIndex
CREATE UNIQUE INDEX "FocusAnalytics_userId_date_key" ON "FocusAnalytics"("userId", "date");

-- AddForeignKey
ALTER TABLE "FocusSession" ADD CONSTRAINT "FocusSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskFocusMeta" ADD CONSTRAINT "TaskFocusMeta_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskFocusMeta" ADD CONSTRAINT "TaskFocusMeta_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FocusAnalytics" ADD CONSTRAINT "FocusAnalytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
