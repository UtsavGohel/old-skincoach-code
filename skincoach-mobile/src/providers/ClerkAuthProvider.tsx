import { type PropsWithChildren } from 'react';
import { Platform } from 'react-native';
import { ClerkProvider, type TokenCache } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';

import { env } from '@/constants/env';

// SecureStore isn't available on web; Clerk's web SDK path handles its own session
// storage, so the token cache is only needed (and only works) on native platforms.
const secureStoreTokenCache: TokenCache = {
  getToken: (key) => SecureStore.getItemAsync(key).catch(() => null),
  saveToken: (key, value) => SecureStore.setItemAsync(key, value),
  clearToken: (key) => SecureStore.deleteItemAsync(key),
};

export function ClerkAuthProvider({ children }: PropsWithChildren): React.JSX.Element {
  if (!env.isClerkConfigured) {
    // No valid publishable key yet (fresh checkout / Phase 0-1 work that doesn't
    // touch auth). Render children without ClerkProvider rather than crashing the
    // whole app — screens that need Clerk hooks aren't built until Phase 2, by which
    // point a real test-mode key must be set in .env.
    if (__DEV__) {
      console.warn(
        '[ClerkAuthProvider] EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is missing/invalid — ' +
          'rendering without Clerk. Set a real test-mode key before building Phase 2 (auth).',
      );
    }
    return <>{children}</>;
  }

  return (
    <ClerkProvider
      publishableKey={env.clerkPublishableKey}
      tokenCache={Platform.OS === 'web' ? undefined : secureStoreTokenCache}
    >
      {children}
    </ClerkProvider>
  );
}
