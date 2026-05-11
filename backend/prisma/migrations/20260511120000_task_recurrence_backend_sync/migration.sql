-- CreateEnum
CREATE TYPE "TaskRecurrence" AS ENUM ('none', 'daily', 'weekly', 'monthly');

-- AlterTable
ALTER TABLE "Task"
ADD COLUMN     "recurrence" "TaskRecurrence" NOT NULL DEFAULT 'none',
ADD COLUMN     "weeklyDays" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN     "occurrenceDates" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "isTodayCommitment" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastRescheduledAt" TIMESTAMP(3);
