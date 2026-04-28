import { z } from "zod";

export const knowledgeGraphQuerySchema = z.object({
  type: z.enum(["task", "idea", "note", "dream", "journal"]).optional(),
  dreamId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(10).max(500).optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
});

export const manualKnowledgeEdgeSchema = z.object({
  fromType: z.enum(["task", "idea", "note", "dream", "journal"]),
  fromId: z.string().uuid(),
  toType: z.enum(["task", "idea", "note", "dream", "journal"]),
  toId: z.string().uuid(),
  relationType: z.string().trim().min(2).max(40),
  strength: z.number().min(0.1).max(1).optional(),
});
