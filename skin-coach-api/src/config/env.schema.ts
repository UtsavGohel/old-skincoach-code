import { z } from 'zod';

// Validated once at boot (via ConfigModule.forRoot's `validate`) so a missing/malformed
// env var fails fast on startup instead of surfacing as a confusing runtime error deep
// inside a request handler.
export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),

  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),

  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_WEBHOOK_SECRET: z.string().min(1),
  // Optional PEM for networkless JWT verification; falls back to fetching JWKS via
  // CLERK_SECRET_KEY when empty/unset (see ClerkAuthGuard).
  CLERK_JWT_KEY: z.string().optional(),

  GEMINI_API_KEY: z.string().min(1),

  // S3-compatible object storage (Supabase Storage in dev, Cloudflare R2 in prod —
  // same interface, only these values change). See StorageService.
  STORAGE_ENDPOINT: z.string().url(),
  STORAGE_REGION: z.string().min(1),
  STORAGE_ACCESS_KEY_ID: z.string().min(1),
  STORAGE_SECRET_ACCESS_KEY: z.string().min(1),
  STORAGE_BUCKET: z.string().min(1),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    throw new Error(
      `Invalid environment configuration:\n${parsed.error.message}`,
    );
  }
  return parsed.data;
}
