import { z } from "zod";

export const insightListQuerySchema = z.object({
  type: z.enum(["productivity", "behavior", "goal_progress", "focus", "emotional"]).optional(),
});

