import { z } from "zod";

export const focusSessionActionSchema = z.object({
  durationSeconds: z.number().int().min(0).max(24 * 60 * 60).optional(),
});

export const focusTaskActionSchema = z.object({
  durationSeconds: z.number().int().min(0).max(24 * 60 * 60).optional(),
});

export const focusSessionParamSchema = z.object({
  sessionId: z.string().uuid("invalid session id format"),
});

export const focusTaskParamSchema = z.object({
  sessionId: z.string().uuid("invalid session id format"),
  taskId: z.string().uuid("invalid task id format"),
});
