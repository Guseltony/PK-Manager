import { z } from "zod";

export const inboxCaptureSchema = z.object({
  rawInput: z.string().trim().min(1, "Inbox input is required"),
  source: z.string().trim().min(1).max(50).optional(),
});

export const inboxListSchema = z.object({
  status: z.enum(["queued", "processing", "routed", "failed"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

