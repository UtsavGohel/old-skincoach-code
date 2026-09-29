import { type PropsWithChildren } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { ToastHost } from '@/components/Toast';
import { env } from '@/constants/env';
import { useSyncClerkAuthStore } from '@/features/auth/useSyncClerkAuthStore';
import { ClerkAuthProvider } from '@/providers/ClerkAuthProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';

// Only mounted when Clerk is actually configured — this hook requires a
// <ClerkProvider> ancestor, which ClerkAuthProvider skips rendering otherwise.
function ClerkAuthSync(): null {
  useSyncClerkAuthStore();
  return null;
}

export function AppProviders({ children }: PropsWithChildren): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <ThemeProvider>
          <SafeAreaProvider>
            <ClerkAuthProvider>
              {env.isClerkConfigured ? <ClerkAuthSync /> : null}
              <QueryProvider>
                <BottomSheetModalProvider>
                  {children}
                  <ToastHost />
                </BottomSheetModalProvider>
              </QueryProvider>
            </ClerkAuthProvider>
          </SafeAreaProvider>
        </ThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
