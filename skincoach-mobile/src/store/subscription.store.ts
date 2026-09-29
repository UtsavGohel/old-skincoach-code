import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { zustandMmkvStorage } from './storage';

// docs/10 Subscription Status values. In mock-data mode this stands in for the eventual
// backend-verified subscription (Phase 19) — the real purchase must always be verified
// server-side (docs/10 "Never trust the mobile app"); this local flip is a UI stub.
export type SubscriptionStatus = 'free' | 'pro' | 'expired' | 'cancelled' | 'pending';

// docs/10 Pricing: Monthly $9.99 / Yearly $79.99 (Save 33%, always highlighted).
export type BillingPlan = 'monthly' | 'yearly';

type SubscriptionState = {
  status: SubscriptionStatus;
  plan?: BillingPlan;
};

type SubscriptionActions = {
  // Mock purchase: RevenueCat is stubbed (docs/19), so this simply flips to Pro after the
  // screen simulates a store round-trip. Replaced by verified IAP in Phase 19.
  activatePro: (plan: BillingPlan) => void;
  restore: () => void;
  cancel: () => void;
};

// Selector helper used by feature-gating checks (kept trivial for now — real gating lands
// with the backend). Pro access is granted while the subscription is active.
export const selectIsPro = (state: SubscriptionState): boolean => state.status === 'pro';

export const useSubscriptionStore = create<SubscriptionState & SubscriptionActions>()(
  persist(
    (set) => ({
      status: 'free',
      plan: undefined,
      activatePro: (plan) => set({ status: 'pro', plan }),
      restore: () => set({ status: 'pro' }),
      cancel: () => set({ status: 'cancelled' }),
    }),
    {
      name: 'skincoach-subscription',
      storage: createJSONStorage(() => zustandMmkvStorage),
    },
  ),
);
