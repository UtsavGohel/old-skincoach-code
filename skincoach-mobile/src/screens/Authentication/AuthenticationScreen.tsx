import { useEffect, useRef } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { ArrowLeft, HelpCircle, Mail, ScanFace } from 'lucide-react-native';
import { useAuth, useSSO } from '@clerk/clerk-expo';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppBottomSheet } from '@/components/BottomSheet';
import { Text } from '@/components/Text';
import { env } from '@/constants/env';
import { AppleIcon, GoogleIcon } from '@/features/auth/BrandIcons';
import { AuthProviderButton } from '@/features/auth/AuthProviderButton';
import { EmailAuthSheet } from '@/features/auth/EmailAuthSheet';
import { routeAfterAuth } from '@/features/auth/routeAfterAuth';
import { useTheme } from '@/hooks/useTheme';
import { useToastStore } from '@/store/toast.store';
import { useUserStore } from '@/store/user.store';
import type { RootStackParamList } from '@/navigation/types';

// Same asset URL sign_in_to_skincoach/code.html itself uses (no real asset pipeline
// yet — see other screens for the rationale, docs/06 concerns user scan photos only).
const HERO_URI =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDHc93AGf-9gD1C4NMg1rnR1-MZ6zKf3g3KsP90qXApdB5SgI1-LmXWzbmRBtIBsMeWrEIijtaU9fyo0qPl2KlGJBs7DuehYkn0zf4I53nmLa0cl9h-orMZEuW7OTYEKvG141sI3Ysbde3jAYkSToLZAZI2oLzrvfZG0rSSCaXCu8Xm3b_OyuxnnoEnMgGy0wqL9qSHboAF9r6RavhD_3hzQ-62gPARLjq33Z3xYj2Yna7T4fPg-cxFXw';

// Dismisses the in-app browser and returns control to the app once the OAuth redirect
// (skincoach://) fires — without this the SSO flow hangs after the provider screen.
WebBrowser.maybeCompleteAuthSession();

// Android drops the OAuth redirect (→ Clerk signIn.reload comes back `needs_identifier`,
// so re-logins fail) unless the browser is pre-warmed. This is Clerk's documented fix:
// warm up on mount, cool down on unmount. No-op / cheap on iOS.
function useWarmUpBrowser(): void {
  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
}

// Design ref: sign_in_to_skincoach. Renders the complete auth screen regardless of
// Clerk config (UI-first) — Clerk-backed actions live in a child that only mounts its
// hooks when a key exists; without one they degrade to a toast.
export function AuthenticationScreen(): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const showToast = useToastStore((state) => state.showToast);
  const hasCompletedOnboarding = useUserStore((state) => state.hasCompletedOnboarding);

  // Clerk is deferred to the end of the UI pass, so with no key configured the buttons
  // perform a demo sign-in that just advances the flow — first-timers into onboarding,
  // returning users straight to Home — so the rest of the UI is reachable on-device.
  const handleDemoAuth = (): void => {
    showToast('Signed in (demo mode)', 'success');
    navigation.navigate(hasCompletedOnboarding ? 'HomeTabs' : 'Onboarding');
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + theme.spacing.sm }]}>
        <IconButton
          label="Go back"
          icon={ArrowLeft}
          onPress={() => navigation.goBack()}
        />
        <IconButton
          label="Help"
          icon={HelpCircle}
          onPress={() => showToast('Need a hand? Support is coming soon.', 'info')}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.hero, theme.shadow.card]}>
          <Image source={{ uri: HERO_URI }} style={styles.heroImage} resizeMode="cover" />
        </View>

        <View style={styles.titleBlock}>
          <Text variant="headlineLgMobile" color="primary">
            Get Started
          </Text>
          <Text variant="bodyMd" color="textSecondary" style={styles.subtitle}>
            Sign in or create your account to begin your skin journey.
          </Text>
        </View>

        {env.isClerkConfigured ? (
          <ClerkAuthActions />
        ) : (
          <AuthActionsView
            onGoogle={handleDemoAuth}
            onApple={handleDemoAuth}
            onEmail={handleDemoAuth}
          />
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Use Face ID"
          onPress={() => showToast('Biometric sign-in is coming soon.', 'info')}
          style={styles.biometric}
        >
          <View
            style={[styles.biometricCircle, { borderColor: `${theme.colors.primary}33` }]}
          >
            <ScanFace size={28} color={theme.colors.primary} strokeWidth={1.75} />
          </View>
          <Text variant="labelSm" color="textSecondary" style={styles.biometricLabel}>
            Use Face ID
          </Text>
        </Pressable>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + theme.spacing.md }]}>
        <Text variant="labelSm" color="textSecondary" style={styles.footerText}>
          By continuing, you agree to our{' '}
          <Text variant="labelSm" color="primary" style={styles.link}>
            Terms of Service
          </Text>{' '}
          &amp;{' '}
          <Text variant="labelSm" color="primary" style={styles.link}>
            Privacy Policy
          </Text>
        </Text>
      </View>
    </View>
  );
}

function IconButton({
  label,
  icon: Icon,
  onPress,
}: {
  label: string;
  icon: typeof ArrowLeft;
  onPress: () => void;
}): React.JSX.Element {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={8}
      style={styles.iconButton}
    >
      <Icon size={24} color={theme.colors.onSurfaceVariant} />
    </Pressable>
  );
}

// Presentational button cluster — no Clerk dependency, so it renders identically whether
// or not auth is configured; only the handlers differ.
function AuthActionsView({
  onGoogle,
  onApple,
  onEmail,
}: {
  onGoogle: () => void;
  onApple: () => void;
  onEmail: () => void;
}): React.JSX.Element {
  const theme = useTheme();
  return (
    <View style={styles.actions}>
      <AuthProviderButton
        label="Continue with Google"
        variant="light"
        icon={<GoogleIcon />}
        onPress={onGoogle}
      />
      <AuthProviderButton
        label="Continue with Apple"
        variant="light"
        icon={<AppleIcon color={theme.colors.onSurface} />}
        onPress={onApple}
      />
      <AuthProviderButton
        label="Continue with Email"
        variant="tonal"
        icon={<Mail size={20} color={theme.colors.primary} />}
        onPress={onEmail}
      />
    </View>
  );
}

// Split out so Clerk's useSSO is only ever called when a ClerkProvider ancestor exists
// (calling it with a placeholder key would throw — see ClerkAuthProvider).
function ClerkAuthActions(): React.JSX.Element {
  useWarmUpBrowser();
  const { startSSOFlow } = useSSO();
  const { isSignedIn } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const showToast = useToastStore((state) => state.showToast);
  const sheetRef = useRef<BottomSheetModal>(null);
  // Guards against a second tap opening a new browser session while one is pending —
  // that overlap is what triggers "WebBrowser auth session in an invalid state".
  const authInProgress = useRef(false);

  const handleSSO = async (strategy: 'oauth_google' | 'oauth_apple'): Promise<void> => {
    if (authInProgress.current) {
      console.log('[sso] ignored — a sign-in is already in progress');
      return;
    }
    // Already have a session (e.g. returned to the auth screen without logging out)?
    // Clerk would reject a fresh SSO with "already signed in" — just route into the app.
    if (isSignedIn) {
      console.log('[sso] already signed in → routeAfterAuth');
      await routeAfterAuth(navigation);
      return;
    }
    authInProgress.current = true;
    // Where the provider redirects back to. MUST have a non-empty host/path
    // (`skincoach://sso-callback`, not bare `skincoach://`) — Android Custom Tabs
    // drops an empty-host deep link, which shows up as browser.type=dismiss and a
    // failed re-login. This matches the path the Clerk SDK registers by default.
    const redirectUrl = AuthSession.makeRedirectUri({ path: 'sso-callback' });
    console.log('[sso] start', strategy, 'redirectUrl=', redirectUrl);
    try {
      const result = await startSSOFlow({ strategy, redirectUrl });
      // New sign-ups return the session at the top level; existing accounts often
      // return it nested on signIn/signUp instead — check all three.
      const sessionId =
        result.createdSessionId ??
        result.signIn?.createdSessionId ??
        result.signUp?.createdSessionId ??
        null;
      console.log(
        '[sso] resolved. sessionId=',
        sessionId,
        '| signIn=',
        result.signIn?.status,
        '| signUp=',
        result.signUp?.status,
      );
      if (sessionId && result.setActive) {
        await result.setActive({ session: sessionId });
        console.log('[sso] setActive done → routeAfterAuth');
        await routeAfterAuth(navigation);
      } else {
        // No session: the browser redirect didn't carry the OAuth result back.
        // Log the returned URL + type — that's the one piece that tells us why.
        const browser = result.authSessionResult;
        console.log(
          '[sso] NO SESSION. browser.type=',
          browser?.type,
          '| url=',
          browser && browser.type === 'success' ? browser.url : '(none)',
        );
        showToast('Sign-in didn’t complete. Please try again.', 'info');
      }
    } catch (error) {
      console.log('[sso] ERROR:', error instanceof Error ? error.message : String(error));
      showToast('Sign-in was cancelled or failed. Please try again.', 'error');
    } finally {
      authInProgress.current = false;
    }
  };

  return (
    <>
      <AuthActionsView
        onGoogle={() => void handleSSO('oauth_google')}
        onApple={() => void handleSSO('oauth_apple')}
        onEmail={() => sheetRef.current?.present()}
      />
      <AppBottomSheet ref={sheetRef} snapPoints={['70%']}>
        <EmailAuthSheet onAuthenticated={() => void routeAfterAuth(navigation)} />
      </AppBottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  hero: {
    width: 128,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    transform: [{ rotate: '2deg' }],
    marginBottom: 40,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  titleBlock: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 48,
  },
  subtitle: {
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    gap: 16,
  },
  biometric: {
    alignItems: 'center',
    gap: 12,
    marginTop: 48,
  },
  biometricCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  biometricLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    alignItems: 'center',
  },
  footerText: {
    textAlign: 'center',
    lineHeight: 18,
  },
  link: {
    fontWeight: '700',
  },
});
