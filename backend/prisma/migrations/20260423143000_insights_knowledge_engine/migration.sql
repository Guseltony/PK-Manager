CREATE TYPE "InsightType" AS ENUM ('productivity', 'behavior', 'goal_progress', 'focus', 'emotional');
CREATE TYPE "KnowledgeNodeType" AS ENUM ('task', 'idea', 'note', 'dream', 'journal');

CREATE TABLE "InsightRecord" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" "InsightType" NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "evidence" JSONB NOT NULL,
  "recommendation" TEXT NOT NULL,
  "confidence" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "InsightRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "KnowledgeEdge" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "fromType" "KnowledgeNodeType" NOT NULL,
  "fromId" TEXT NOT NULL,
  "toType" "KnowledgeNodeType" NOT NULL,
  "toId" TEXT NOT NULL,
  "relationType" TEXT NOT NULL,
  "strength" DOUBLE PRECISION NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "KnowledgeEdge_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "InsightRecord_userId_type_createdAt_idx" ON "InsightRecord"("userId", "type", "createdAt");
CREATE INDEX "KnowledgeEdge_userId_fromType_fromId_idx" ON "KnowledgeEdge"("userId", "fromType", "fromId");
CREATE INDEX "KnowledgeEdge_userId_toType_toId_idx" ON "KnowledgeEdge"("userId", "toType", "toId");

ALTER TABLE "InsightRecord"
ADD CONSTRAINT "InsightRecord_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "KnowledgeEdge"
ADD CONSTRAINT "KnowledgeEdge_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
