// Bridges Clerk's session token (only obtainable from a React hook, useAuth().getToken)
// to the plain-module API client. A component inside <ClerkProvider> registers the
// getter at mount (see useSyncClerkAuthStore); request() reads it per call to attach
// the Bearer token. Kept as a module singleton so api/*.api.ts stay hook-free (docs/18).
type TokenGetter = () => Promise<string | null>;

let tokenGetter: TokenGetter | null = null;

export function setAuthTokenGetter(getter: TokenGetter | null): void {
  tokenGetter = getter;
}

// Returns the current Clerk session JWT, or null when signed out / not yet registered.
// Never throws — a failure to mint a token just means an unauthenticated request.
export async function getAuthToken(): Promise<string | null> {
  if (!tokenGetter) {
    return null;
  }
  try {
    return await tokenGetter();
  } catch {
    return null;
  }
}
