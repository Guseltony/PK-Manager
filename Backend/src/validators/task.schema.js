import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  estimatedTime: z.number().int().positive().optional(),
  tags: z.array(z.string()).optional(),
  noteId: z.string().uuid().optional().nullable(),
  dreamId: z.string().uuid().optional().nullable(),
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  estimatedTime: z.number().int().positive().optional(),
  tags: z.array(z.string()).optional(),
  noteId: z.string().uuid().optional().nullable(),
  dreamId: z.string().uuid().optional().nullable(),
  aiScore: z.number().optional(),
  completedAt: z.string().datetime().optional().nullable(),
});
