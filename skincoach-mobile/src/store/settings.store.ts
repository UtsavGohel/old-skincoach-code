import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type { ThemeMode } from '@/theme';

import { zustandMmkvStorage } from './storage';

// docs/11 Notification Types (the five user-facing, toggleable ones — Subscription and
// System notifications aren't user-configurable). docs/19: cover all five, using
// "Weekly Summary" (not the mockup's "Weekly Progress") and including "Achievement".
export type NotificationType =
  'dailyScan' | 'routine' | 'aiInsight' | 'weeklySummary' | 'achievement';

// 'system' follows the OS; 'light'/'dark' are explicit overrides (docs/09).
export type ThemePreference = ThemeMode | 'system';

// docs/11 Notification Timing — the scheduled reminders whose time the user can customize
// (Morning/Night are the two halves of the Routine reminder; Weekly Summary is Sunday).
export type ReminderKey =
  'dailyScan' | 'morningRoutine' | 'nightRoutine' | 'weeklySummary';

type SettingsState = {
  themePreference: ThemePreference;
  notifications: Record<NotificationType, boolean>;
  // Stored as display strings (e.g. "9:00 AM") — the scheduler will parse these when
  // real local notifications are wired (Phase 20). Defaults per docs/11 Notification Timing.
  reminderTimes: Record<ReminderKey, string>;
  // docs/11 Quiet Hours (default 10:00 PM – 7:00 AM): never send during this window.
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
};

type SettingsActions = {
  setThemePreference: (preference: ThemePreference) => void;
  toggleNotification: (type: NotificationType) => void;
  setReminderTime: (key: ReminderKey, time: string) => void;
  toggleQuietHours: () => void;
  setQuietHours: (bound: 'start' | 'end', time: string) => void;
};

const initialState: SettingsState = {
  themePreference: 'system',
  notifications: {
    dailyScan: true,
    routine: true,
    aiInsight: true,
    weeklySummary: true,
    achievement: true,
  },
  reminderTimes: {
    dailyScan: '9:00 AM',
    morningRoutine: '8:00 AM',
    nightRoutine: '9:00 PM',
    weeklySummary: '7:00 PM',
  },
  quietHoursEnabled: true,
  quietHoursStart: '10:00 PM',
  quietHoursEnd: '7:00 AM',
};

// Device-local, MMKV-persisted settings (docs/09: Settings-class state is the durable
// tier). In mock-data mode this stands in for the eventual GET/PATCH /users/me/settings;
// screens read/write it through the same shape either way.
export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      ...initialState,
      setThemePreference: (themePreference) => set({ themePreference }),
      toggleNotification: (type) =>
        set((state) => ({
          notifications: {
            ...state.notifications,
            [type]: !state.notifications[type],
          },
        })),
      setReminderTime: (key, time) =>
        set((state) => ({
          reminderTimes: { ...state.reminderTimes, [key]: time },
        })),
      toggleQuietHours: () =>
        set((state) => ({ quietHoursEnabled: !state.quietHoursEnabled })),
      setQuietHours: (bound, time) =>
        set(bound === 'start' ? { quietHoursStart: time } : { quietHoursEnd: time }),
    }),
    {
      name: 'skincoach-settings',
      storage: createJSONStorage(() => zustandMmkvStorage),
    },
  ),
);
