import { load } from '@expo/env';
import { setUpTests } from 'react-native-reanimated';

// Plain `jest` (unlike `expo start`/`expo export`) doesn't go through Expo CLI, so
// EXPO_PUBLIC_* vars from .env aren't in process.env yet — load them the same way
// Expo CLI does before any app code (which reads them at module scope) is imported.
load(__dirname);

// react-native-mmkv is a Nitro/Turbo native module with no JS fallback, so it throws
// when imported under Jest (no native binary). Any store using persist() pulls it in
// at module scope, so mock it with an in-memory Map matching the v4 createMMKV API
// (getString/set/remove) used in src/store/storage.ts.
jest.mock('react-native-mmkv', () => {
  const store = new Map<string, string>();
  return {
    createMMKV: () => ({
      getString: (key: string): string | undefined => store.get(key) ?? undefined,
      set: (key: string, value: string): void => {
        store.set(key, String(value));
      },
      remove: (key: string): void => {
        store.delete(key);
      },
    }),
  };
});

setUpTests();
