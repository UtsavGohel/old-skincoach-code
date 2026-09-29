import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type { UserProfileDraft } from '@/features/profile/profile.types';
import { zustandMmkvStorage } from './storage';

type UserState = {
  // Built up across the onboarding steps; persisted so a mid-onboarding app restart
  // doesn't lose the user's answers.
  profileDraft: UserProfileDraft;
  // Gates returning-user routing (skip Welcome/onboarding). Persisted because Splash
  // reads it on cold start to decide where to land — the whole point is that it
  // survives restarts. Real backend (Phase 15+) will hydrate this from the server;
  // until then this local flag is the source of truth (mock-data mode).
  hasCompletedOnboarding: boolean;
};

type UserActions = {
  updateProfileDraft: (patch: Partial<UserProfileDraft>) => void;
  completeOnboarding: () => void;
  resetProfile: () => void;
};

const initialState: UserState = {
  profileDraft: {},
  hasCompletedOnboarding: false,
};

// docs/09: Settings/Auth/Subscription-class state is MMKV-persisted; the onboarding
// profile + completion flag belong to that durable tier (not transient UI state, not
// server-cache). In mock-data mode this store stands in for the eventual
// GET/PATCH /users/me — screens read/write it through the same shape either way.
export const useUserStore = create<UserState & UserActions>()(
  persist(
    (set) => ({
      ...initialState,
      updateProfileDraft: (patch) =>
        set((state) => ({ profileDraft: { ...state.profileDraft, ...patch } })),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      resetProfile: () => set(initialState),
    }),
    {
      name: 'skincoach-user',
      storage: createJSONStorage(() => zustandMmkvStorage),
    },
  ),
);
