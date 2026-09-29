import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';

import type { Theme as AppTheme } from '@/theme';

// Maps our design-system theme onto React Navigation's Theme shape so screen
// transitions/native headers use our palette instead of RN's default blue/white —
// avoids a jarring flash of unstyled navigation chrome between screens.
export function buildNavigationTheme(appTheme: AppTheme): Theme {
  const base = appTheme.mode === 'dark' ? DarkTheme : DefaultTheme;

  return {
    ...base,
    dark: appTheme.mode === 'dark',
    colors: {
      ...base.colors,
      primary: appTheme.colors.primary,
      background: appTheme.colors.background,
      card: appTheme.colors.surfaceContainerLowest,
      text: appTheme.colors.textPrimary,
      border: appTheme.colors.outlineVariant,
      notification: appTheme.colors.error,
    },
  };
}
