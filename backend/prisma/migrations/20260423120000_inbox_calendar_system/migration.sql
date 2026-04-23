CREATE TYPE "InboxItemType" AS ENUM ('TASK', 'IDEA', 'NOTE', 'JOURNAL', 'DREAM');
CREATE TYPE "InboxProcessingStatus" AS ENUM ('queued', 'processing', 'routed', 'failed');
CREATE TYPE "FocusBlockStatus" AS ENUM ('planned', 'completed', 'canceled');

CREATE TABLE "PlannedFocusBlock" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "taskId" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "plannedStart" TIMESTAMP(3) NOT NULL,
  "plannedEnd" TIMESTAMP(3) NOT NULL,
  "status" "FocusBlockStatus" NOT NULL DEFAULT 'planned',
  "aiScore" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PlannedFocusBlock_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InboxItem" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "rawInput" TEXT NOT NULL,
  "title" TEXT,
  "content" TEXT,
  "source" TEXT NOT NULL DEFAULT 'Inbox',
  "type" "InboxItemType",
  "status" "InboxProcessingStatus" NOT NULL DEFAULT 'queued',
  "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "confidence" DOUBLE PRECISION,
  "suggestedActions" JSONB,
  "links" JSONB,
  "processedPayload" JSONB,
  "routedEntityType" TEXT,
  "routedEntityId" TEXT,
  "processingError" TEXT,
  "processedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "InboxItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PlannedFocusBlock_userId_plannedStart_idx" ON "PlannedFocusBlock"("userId", "plannedStart");
CREATE INDEX "PlannedFocusBlock_userId_status_idx" ON "PlannedFocusBlock"("userId", "status");
CREATE INDEX "InboxItem_userId_status_createdAt_idx" ON "InboxItem"("userId", "status", "createdAt");
CREATE INDEX "InboxItem_userId_createdAt_idx" ON "InboxItem"("userId", "createdAt");

ALTER TABLE "PlannedFocusBlock"
ADD CONSTRAINT "PlannedFocusBlock_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PlannedFocusBlock"
ADD CONSTRAINT "PlannedFocusBlock_taskId_fkey"
FOREIGN KEY ("taskId") REFERENCES "Task"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "InboxItem"
ADD CONSTRAINT "InboxItem_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
