import { z } from "zod";

export const createDreamSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().optional(),
  category: z.string().trim().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  targetDate: z.string().optional().nullable(),
});

export const updateDreamSchema = z.object({
  title: z.string().trim().optional(),
  description: z.string().trim().optional(),
  status: z.enum(["active", "paused", "completed"]).optional(),
  category: z.string().trim().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  targetDate: z.string().optional().nullable(),
});

export const createMilestoneSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().optional(),
  weight: z.number().optional(),
  targetDate: z.string().optional().nullable(),
});
