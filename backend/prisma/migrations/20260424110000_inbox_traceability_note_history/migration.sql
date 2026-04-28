ALTER TABLE "Note" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "TaskCompletionLog" ALTER COLUMN "tags" DROP DEFAULT;

-- Add source inbox traceability to routed entities
ALTER TABLE "Note" ADD COLUMN "sourceInboxId" TEXT;
ALTER TABLE "Task" ADD COLUMN "sourceInboxId" TEXT;
ALTER TABLE "Dream" ADD COLUMN "sourceInboxId" TEXT;
ALTER TABLE "Idea" ADD COLUMN "sourceInboxId" TEXT;

-- Add note history snapshots
CREATE TABLE "NoteVersion" (
  "id" TEXT NOT NULL,
  "noteId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "contentType" TEXT NOT NULL DEFAULT 'markdown',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "NoteVersion_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "NoteVersion_noteId_createdAt_idx" ON "NoteVersion"("noteId", "createdAt");

ALTER TABLE "NoteVersion"
ADD CONSTRAINT "NoteVersion_noteId_fkey"
FOREIGN KEY ("noteId") REFERENCES "Note"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
