import { createMMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

// react-native-mmkv v4 rewrote its API around Nitro Modules: instances now come from
// createMMKV(), not `new MMKV()` (that constructor is a type-only export in v4).
export const mmkvStorage = createMMKV({ id: 'skincoach-storage' });

// Adapts MMKV (sync, key/value) to Zustand's persist middleware storage interface.
// docs/09: persist only Auth/Settings/Theme/Language/Subscription — never API responses.
export const zustandMmkvStorage: StateStorage = {
  getItem: (name) => mmkvStorage.getString(name) ?? null,
  setItem: (name, value) => mmkvStorage.set(name, value),
  removeItem: (name) => {
    mmkvStorage.remove(name);
  },
};
