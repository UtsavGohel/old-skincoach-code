import { type PropsWithChildren, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { useSettingsStore } from '@/store/settings.store';
import { buildTheme, ThemeContext } from '@/theme';

// Resolves the active theme from the user's Settings preference (docs/09's persisted
// settings.store `themePreference: 'light' | 'dark' | 'system'`), falling back to the OS
// color scheme when set to 'system'. Phase 11 wires the Appearance selector to this.
export function ThemeProvider({ children }: PropsWithChildren): React.JSX.Element {
  const systemScheme = useColorScheme();
  const preference = useSettingsStore((state) => state.themePreference);
  const theme = useMemo(() => {
    const mode = preference === 'system' ? (systemScheme ?? 'light') : preference;
    return buildTheme(mode === 'dark' ? 'dark' : 'light');
  }, [preference, systemScheme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}
