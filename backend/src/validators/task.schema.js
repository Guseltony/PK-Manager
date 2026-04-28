import { z } from "zod";

const tagInputSchema = z.union([
  z.string().trim().min(1),
  z.object({
    name: z.string().trim().min(1),
    color: z.string().trim().optional(),
  }),
  z.object({
    tag: z.object({
      name: z.string().trim().min(1),
      color: z.string().trim().optional(),
    }),
  }),
]);

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().optional().nullable(),
  status: z.enum(["todo", "in_progress", "done"]).optional().nullable(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional().nullable(),
  dueDate: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  estimatedTime: z.number().optional().nullable(),
  duration: z.number().optional().nullable(),
  tags: z.array(tagInputSchema).optional(),
  noteId: z.string().optional().nullable(),
  noteIds: z.array(z.string().uuid()).optional(),
  dreamId: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  dueDate: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  estimatedTime: z.number().int().positive().optional(),
  duration: z.number().int().min(0).optional(),
  tags: z.array(tagInputSchema).optional(),
  noteId: z.string().uuid().optional().nullable(),
  noteIds: z.array(z.string().uuid()).optional(),
  dreamId: z.string().uuid().optional().nullable(),
  projectId: z.string().uuid().optional().nullable(),
  aiScore: z.number().optional(),
  completedAt: z.string().optional().nullable(),
});

export const logReadingSessionSchema = z.object({
  activeDurationMinutes: z.number().min(0),
  requiredMinutes: z.number().min(1).max(720).optional(),
  sourceTitle: z.string().trim().min(1).max(160).optional(),
  sourceUrl: z.string().trim().max(500).optional().nullable(),
  lastPage: z.string().trim().max(80).optional().nullable(),
  highlight: z.string().trim().max(4000).optional().nullable(),
  takeaway: z.string().trim().max(4000).optional().nullable(),
  noteTitle: z.string().trim().max(160).optional().nullable(),
  engagementCount: z.number().int().min(0).optional(),
});
