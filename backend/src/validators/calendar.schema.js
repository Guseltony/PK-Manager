import { z } from "zod";

export const calendarOverviewQuerySchema = z.object({
  view: z.enum(["day", "week", "month"]).default("day"),
  date: z.string().trim().optional(),
});

export const calendarDateQuerySchema = z.object({
  date: z.string().trim().optional(),
});

export const rescheduleTaskSchema = z.object({
  startDate: z.string().datetime().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
});

export const createFocusBlockSchema = z.object({
  taskId: z.string().uuid().nullable().optional(),
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().nullable().optional(),
  plannedStart: z.string().datetime(),
  plannedEnd: z.string().datetime(),
});

export const updateFocusBlockSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().nullable().optional(),
  plannedStart: z.string().datetime().optional(),
  plannedEnd: z.string().datetime().optional(),
  status: z.enum(["planned", "completed", "canceled"]).optional(),
  taskId: z.string().uuid().nullable().optional(),
});
