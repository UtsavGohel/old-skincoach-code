import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-expo';

import { setAuthTokenGetter } from '@/api/auth-token';
import { useAuthStore } from '@/store/auth.store';

// Mirrors Clerk's live session state into our Zustand auth store so the rest of the
// app reads auth the same way it reads every other domain store (docs/09), without
// every consumer needing to import Clerk hooks directly. Also registers Clerk's
// getToken with the API client so request() can attach the Bearer token. Must be
// rendered inside <ClerkProvider>.
export function useSyncClerkAuthStore(): void {
  const { isLoaded, isSignedIn, userId, getToken } = useAuth();
  const setAuthState = useAuthStore((state) => state.setAuthState);

  useEffect(() => {
    setAuthState({ isLoaded, isSignedIn: isSignedIn ?? false, userId: userId ?? null });
  }, [isLoaded, isSignedIn, userId, setAuthState]);

  useEffect(() => {
    // getToken() returns the short-lived Clerk session JWT (Clerk refreshes it).
    setAuthTokenGetter(() => getToken());
    return () => setAuthTokenGetter(null);
  }, [getToken]);
}
