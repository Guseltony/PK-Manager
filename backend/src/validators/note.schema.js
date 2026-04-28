import { z } from "zod";

const contentTypeSchema = z.enum(["markdown", "richtext"]);

export const createNoteSchema = z.object({
  title: z.string().trim().min(1, "title is required").toLowerCase(),
  content: z.string().trim().min(2, "required"),
  contentType: contentTypeSchema.optional(),
  sourceInboxId: z.string().uuid().optional().nullable(),
  dreamId: z.string().uuid().optional().nullable(),
  tagsArray: z
    .array(
      z.object({
        name: z.string().trim().min(1, "tag name is required").toLowerCase(),
        color: z.string().trim().min(1, "tag color is required").optional(),
      })
    )
    .optional(),
});

export const updateNoteSchema = createNoteSchema.partial();

export const noteResponseSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  content: z.string(),
  contentType: contentTypeSchema.default("markdown"),
  sourceInboxId: z.uuid().nullable().optional(),
  dreamId: z.uuid().nullable().optional(),
  isArchived: z.boolean(),
  userId: z.uuid(),
  dream: z
    .object({
      id: z.uuid(),
      title: z.string(),
    })
    .nullable()
    .optional(),
  tasks: z
    .array(
      z.object({
        id: z.uuid(),
        title: z.string(),
        status: z.enum(["todo", "in_progress", "done"]),
        priority: z.enum(["low", "medium", "high", "urgent"]),
        updatedAt: z.preprocess((arg) => {
          if (arg instanceof Date) return arg.toISOString();
          return arg;
        }, z.iso.datetime()),
      }),
    )
    .optional()
    .default([]),
  createdAt: z.preprocess((arg) => {
    if (arg instanceof Date) return arg.toISOString();
    return arg;
  }, z.iso.datetime()),
  updatedAt: z.preprocess((arg) => {
    if (arg instanceof Date) return arg.toISOString();
    return arg;
  }, z.iso.datetime()),
  tags: z.array(
    z.object({
      // id: z.uuid(),
      // noteId: z.uuid(),
      // tagId: z.uuid(),
      tag: z.object({
        // id: z.uuid(),
        name: z.string(),
        color: z.string().nullable().optional(),
        // userId: z.uuid(),
        // createdAt: z.preprocess((arg) => {
        //   if (arg instanceof Date) return arg.toISOString();
        //   return arg;
        // }, z.string().datetime()),
        // // createdAt: z.iso.datetime(),
      }),
    })
  ),
  // createdAt: z.preprocess((arg) => {
  //   if (arg instanceof Date) return arg.toISOString();
  //   return arg;
  // }, z.string().datetime()),
  // updatedAt: z.preprocess((arg) => {
  //   if (arg instanceof Date) return arg.toISOString();
  //   return arg;
  // }, z.string().datetime()),
});

export const allNoteResponseSchema = z.array(noteResponseSchema);
