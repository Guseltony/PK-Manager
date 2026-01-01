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
