import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(10),
  NODE_ENV: z.string(),
});

export const env = envSchema.parse(process.env);
