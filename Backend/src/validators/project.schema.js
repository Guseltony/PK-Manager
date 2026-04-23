import { z } from "zod";

export const createProjectSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().optional().nullable(),
  status: z.enum(["not_started", "in_progress", "completed", "paused"]).optional(),
  dreamId: z.string().uuid("Dream is required"),
});

export const updateProjectSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().optional().nullable(),
  status: z.enum(["not_started", "in_progress", "completed", "paused"]).optional(),
  dreamId: z.string().uuid().optional(),
});

export const generateProjectsSchema = z.object({
  persist: z.boolean().optional().default(true),
});
