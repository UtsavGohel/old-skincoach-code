import { z } from 'zod';

const CLERK_KEY_PREFIX_PATTERN = /^pk_(test|live)_(.+)$/;

// Mirrors Clerk's own validation (a placeholder like "pk_test_placeholder" passes a
// naive prefix regex since "placeholder" is alphanumeric — Clerk's real keys encode
// base64("{frontend-api-host}$"), so decoding is the only reliable check).
function isValidClerkPublishableKey(key: string): boolean {
  const match = CLERK_KEY_PREFIX_PATTERN.exec(key);
  if (!match) {
    return false;
  }
  const encodedHost = match[2];
  if (!encodedHost) {
    return false;
  }
  try {
    return atob(encodedHost).endsWith('$');
  } catch {
    return false;
  }
}

const envSchema = z.object({
  useMockApi: z
    .string()
    .optional()
    .transform((value) => value !== 'false'),
  apiBaseUrl: z.string().url(),
  clerkPublishableKey: z.string().min(1),
});

const rawEnv = envSchema.parse({
  useMockApi: process.env.EXPO_PUBLIC_USE_MOCK_API,
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
  clerkPublishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
});

// A placeholder/malformed key would crash ClerkProvider at mount (it decodes the key
// to derive the Frontend API host). Detect that case so providers/screens can degrade
// gracefully instead of hard-crashing before a real Clerk instance is configured.
const isClerkConfigured = isValidClerkPublishableKey(rawEnv.clerkPublishableKey);

export const env = {
  ...rawEnv,
  isClerkConfigured,
};
