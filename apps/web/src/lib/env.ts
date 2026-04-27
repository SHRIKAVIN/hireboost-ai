import { z } from 'zod';

const envSchema = z.object({
  VITE_APP_NAME: z.string().default('HireBoost AI'),
  VITE_API_BASE_URL: z.string().url().default('http://localhost:4000/api/v1'),
  VITE_GOOGLE_CLIENT_ID: z.string().optional().default(''),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  console.error('[env] Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid frontend environment variables — see console for details.');
}

export const env = parsed.data;
export type AppEnv = typeof env;
