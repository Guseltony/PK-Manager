DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name='Dream' AND column_name='parentDreamId'
  ) THEN
    ALTER TABLE "Dream" ADD COLUMN "parentDreamId" TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name='Dream' AND column_name='parentDreamId' AND data_type <> 'text'
  ) THEN
    ALTER TABLE "Dream" ALTER COLUMN "parentDreamId" TYPE TEXT USING "parentDreamId"::text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Dream_parentDreamId_fkey'
  ) THEN
    ALTER TABLE "Dream"
      ADD CONSTRAINT "Dream_parentDreamId_fkey"
      FOREIGN KEY ("parentDreamId")
      REFERENCES "Dream"("id")
      ON DELETE SET NULL
      ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "Dream_userId_parentDreamId_idx" ON "Dream"("userId", "parentDreamId");