import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().trim().min(2, "First Name Required"),
  lastName: z.string().trim().min(2, "Last Name Required"),
  email: z.string().email("Invalid email address"),
  userName: z.string().trim().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  agree: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms",
  }),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
