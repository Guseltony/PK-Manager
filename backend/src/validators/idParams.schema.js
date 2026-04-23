import { z } from "zod";

export const idParamSchema = z.object({
  id: z.string().uuid("invalid id format"),
  subtaskId: z.string().uuid("invalid subtask id format").optional(),
  milestoneId: z.string().uuid("invalid milestone id format").optional(),
});
