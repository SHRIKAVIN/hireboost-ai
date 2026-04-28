import { z } from 'zod';

/** API routes live under `/api/v1` by default; allow env to be just the origin (common deploy mistake). */
function normalizeViteApiBaseUrl(raw: string): string {
  const u = new URL(raw);
  let path = u.pathname.replace(/\/+$/, '');
  if (path === '' || path === '/') {
    path = '/api/v1';
  }
  return `${u.origin}${path}`;
}

const envSchema = z.object({
  VITE_APP_NAME: z.string().default('HireBoost AI'),
  VITE_API_BASE_URL: z.preprocess((raw) => {
    const s =
      raw === undefined || raw === '' || typeof raw !== 'string'
        ? 'http://localhost:4000/api/v1'
        : raw;
    return normalizeViteApiBaseUrl(s);
  }, z.string().url()),
  VITE_GOOGLE_CLIENT_ID: z.string().optional().default(''),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  console.error('[env] Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid frontend environment variables — see console for details.');
}

export const env = parsed.data;
export type AppEnv = typeof env;
