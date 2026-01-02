import { z } from "zod";

export const createNoteSchema = z.object({
  title: z.string().trim().min(1, "title is required").toLowerCase(),
  content: z.string().trim().min(2, "required"),
  tagsArray: z
    .array(
      z.object({
        name: z.string().trim().min(1, "tag name is required").toLowerCase(),
        color: z.string().trim().min(1, "tag color is required").optional(),
      })
    )
    .optional(),
});

export const updateNoteSchema = z.object({
  title: z.string().trim().min(1, "title is required").toLowerCase(),
  content: z.string().trim().min(2, "required"),
  tagsArray: z
    .array(
      z.object({
        name: z.string().trim().min(1, "tag name is required").toLowerCase(),
        color: z.string().trim().min(1, "tag color is required").optional(),
      })
    )
    .optional(),
});

export const noteResponseSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  content: z.string(),
  isArchived: z.boolean(),
  userId: z.uuid(),
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
      id: z.uuid(),
      name: z.string(),
      color: z.string().nullable().optional(),
      userId: z.uuid(),
      createdAt: z.preprocess((arg) => {
        if (arg instanceof Date) return arg.toISOString();
        return arg;
      }, z.string().datetime()),
      // createdAt: z.iso.datetime(),
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
