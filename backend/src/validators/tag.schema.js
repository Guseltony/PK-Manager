import { z } from "zod";

export const createTagSchema = z.object({
  name: z.string().trim().min(1, "tag name is required").toLowerCase(),
  color: z.string().trim().min(1, "tag color is required").optional(),
});

export const updateTagSchema = z
  .object({
    name: z.string().trim().min(1).toLowerCase().optional(),
    color: z.union([z.string().trim().min(1), z.null()]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "at least one field must be updated",
  });

export const tagResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  color: z.string().nullable().optional(),
  count: z.number().optional(),
  userId: z.string().uuid(),
  createdAt: z.string().datetime().optional(),
  notes: z.array(z.any()).optional(),
  tasks: z.array(z.any()).optional(),
  dreams: z.array(z.any()).optional(),
  journals: z.array(z.any()).optional(),
  ideas: z.array(z.any()).optional(),
});

export const allTagResponseSchema = z.array(tagResponseSchema);
