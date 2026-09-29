import { env } from '@/constants/env';

import { getAuthToken } from './auth-token';
import { ApiError, NetworkError } from './errors';

const DEFAULT_MOCK_DELAY_MS = 500;

// Every api/*.api.ts function should branch on env.useMockApi and call one of these
// two helpers — never fetch()/axios() directly from screens or hooks (docs/18).
export const isMockApiEnabled = env.useMockApi;

// Resolves with fixture data after a simulated network delay, so loading states are
// exercised the same way they will be against the real API. Pass a lower delay in
// tests. A `shouldFail` fixture can be passed to exercise error/empty states too.
export async function mockRequest<T>(
  data: T,
  options?: { delayMs?: number; failWith?: ApiError },
): Promise<T> {
  await new Promise((resolve) =>
    setTimeout(resolve, options?.delayMs ?? DEFAULT_MOCK_DELAY_MS),
  );
  if (options?.failWith) {
    throw options.failWith;
  }
  return data;
}

type RequestOptions = Omit<RequestInit, 'body'> & { body?: unknown };

const REQUEST_TIMEOUT_MS = 15000;

// Real HTTP client for skincoach-api, used once env.useMockApi is false (Phase 21).
export async function request<T>(path: string, options?: RequestOptions): Promise<T> {
  // Attach the Clerk session JWT so the request passes the backend's ClerkAuthGuard.
  const token = await getAuthToken();
  // Abort so a stalled connection (device can't reach the server) fails fast instead
  // of hanging the caller (e.g. auth routing) forever.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(`${env.apiBaseUrl}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
      body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new NetworkError();
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(
      body?.message ?? `Request failed with status ${response.status}`,
      response.status,
      body?.code,
    );
  }

  return (await response.json()) as T;
}
