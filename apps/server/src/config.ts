import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  REMINDER_CHECK_INTERVAL_MS: z.coerce.number().int().positive().default(60_000),
  SETTINGS_SYNC_INTERVAL_MS: z.coerce.number().int().positive().default(30_000),
  CORS_ORIGIN: z.string().default("*"),
});

export const config = envSchema.parse(process.env);
