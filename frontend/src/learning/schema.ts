import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  email: z.string().email(),
  userName: z.string().trim().min(1),
  password: z.string().min(8),
  agree: z.boolean(),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
