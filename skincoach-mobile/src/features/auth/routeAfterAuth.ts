import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { isMockApiEnabled } from '@/api/client';
import { getMe, type MeResponse } from '@/api/user.api';
import type { RootStackParamList } from '@/navigation/types';
import { useUserStore } from '@/store/user.store';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// A user has finished onboarding once their profile row carries the core answers.
export function isOnboardingComplete(me: MeResponse): boolean {
  return (
    me.profile != null && me.profile.skinType != null && me.profile.primaryGoal != null
  );
}

// Source of truth for "has this signed-in user onboarded?": the server in real mode,
// the local persisted flag in mock-data mode. A failed /users/me (e.g. a brand-new
// user whose Clerk webhook hasn't synced yet) is treated as "not onboarded" — they're
// routed to Onboarding, which is where a new user belongs anyway.
export async function hasCompletedOnboarding(): Promise<boolean> {
  if (isMockApiEnabled) {
    console.log('[auth] mock mode → local onboarding flag');
    return useUserStore.getState().hasCompletedOnboarding;
  }
  try {
    console.log('[auth] fetching /users/me ...');
    const me = await getMe();
    console.log('[auth] /users/me ok, profile:', JSON.stringify(me.profile));
    return isOnboardingComplete(me);
  } catch (error) {
    console.log(
      '[auth] /users/me failed → treat as not onboarded:',
      error instanceof Error ? error.message : String(error),
    );
    return false;
  }
}

// Called after any successful Clerk sign-in (Splash cold-start, SSO, email) to land the
// user on the right screen.
export async function routeAfterAuth(navigation: Nav): Promise<void> {
  console.log('[auth] routeAfterAuth: start');
  const complete = await hasCompletedOnboarding();
  const target = complete ? 'HomeTabs' : 'Onboarding';
  console.log('[auth] routeAfterAuth: navigating →', target);
  navigation.reset({ index: 0, routes: [{ name: target }] });
}
