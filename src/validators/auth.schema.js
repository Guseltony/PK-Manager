import { z } from "zod";

// zod schema for registerUser

export const registerUserSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().trim().min(8, "Password must be at least 8 characters"),
  username: z.string().trim().min(3).optional(),
});

export const loginSchema = z.object({
  email: z
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address")
    .toLowerCase(),
  password: z.string().trim().min(8, "Password must be at least 8 characters"),
});