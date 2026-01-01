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
