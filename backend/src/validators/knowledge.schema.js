import { z } from "zod";

export const knowledgeGraphQuerySchema = z.object({
  type: z.enum(["task", "idea", "note", "dream", "journal"]).optional(),
  dreamId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(10).max(500).optional(),
});
