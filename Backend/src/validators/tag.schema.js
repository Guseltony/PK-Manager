import { z } from "zod";

export const createTagSchema = z.object({
  name: z.string().trim().min(1, "tag name is required").toLowerCase(),
  color: z.string().trim().min(1, "tag color is required").optional(),
});

export const updateTagSchema = z
  .object({
    name: z.string().trim().min(1).toLowerCase().optional(),
    color: z.string().trim().min(1).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "at least one field must be updated",
  });

export const tagResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  color: z.string().nullable().optional(),
  userId: z.uuid(),
  createdAt: z.iso.datetime(),
  // updatedAt: z.datetime(), // optional if you include
  // createdAt: z.preprocess((arg) => {
  //   if (arg instanceof Date) return arg.toISOString();
  //   return arg;
  // }, z.string().datetime()),
});

export const allTagResponseSchema = z.array(tagResponseSchema);