CREATE TABLE "TaskNoteLink" (
  "id" TEXT NOT NULL,
  "taskId" TEXT NOT NULL,
  "noteId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TaskNoteLink_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TaskNoteLink_taskId_noteId_key" ON "TaskNoteLink"("taskId", "noteId");
CREATE INDEX "TaskNoteLink_noteId_idx" ON "TaskNoteLink"("noteId");

ALTER TABLE "TaskNoteLink"
ADD CONSTRAINT "TaskNoteLink_taskId_fkey"
FOREIGN KEY ("taskId") REFERENCES "Task"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TaskNoteLink"
ADD CONSTRAINT "TaskNoteLink_noteId_fkey"
FOREIGN KEY ("noteId") REFERENCES "Note"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "TaskNoteLink" ("id", "taskId", "noteId", "createdAt")
SELECT gen_random_uuid()::text, "id", "noteId", CURRENT_TIMESTAMP
FROM "Task"
WHERE "noteId" IS NOT NULL
ON CONFLICT ("taskId", "noteId") DO NOTHING;
