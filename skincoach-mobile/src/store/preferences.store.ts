import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { zustandMmkvStorage } from './storage';

// Device-local UI preferences (not synced to the server, unlike the profile). Persisted
// so they survive restarts — e.g. whether the user has already seen the scan guidelines,
// so daily scans jump straight to the camera instead of re-showing the tips every time.
type PreferencesState = {
  hasSeenScanGuidelines: boolean;
};

type PreferencesActions = {
  markScanGuidelinesSeen: () => void;
};

export const usePreferencesStore = create<PreferencesState & PreferencesActions>()(
  persist(
    (set) => ({
      hasSeenScanGuidelines: false,
      markScanGuidelinesSeen: () => set({ hasSeenScanGuidelines: true }),
    }),
    {
      name: 'skincoach-preferences',
      storage: createJSONStorage(() => zustandMmkvStorage),
    },
  ),
);
