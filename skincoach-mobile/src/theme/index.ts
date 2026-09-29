import { createContext } from 'react';

import { duration, easing } from './animation';
import { colors, type ColorScheme } from './colors';
import { radius } from './radius';
import { shadow } from './shadow';
import { spacing } from './spacing';
import { typography } from './typography';

export { colors, radius, shadow, spacing, typography, duration, easing };
export type { ColorScheme };

export type ThemeMode = 'light' | 'dark';

export type Theme = {
  mode: ThemeMode;
  colors: ColorScheme;
  spacing: typeof spacing;
  radius: typeof radius;
  shadow: typeof shadow;
  typography: typeof typography;
  duration: typeof duration;
  easing: typeof easing;
};

export function buildTheme(mode: ThemeMode): Theme {
  return {
    mode,
    colors: colors[mode],
    spacing,
    radius,
    shadow,
    typography,
    duration,
    easing,
  };
}

// Default export for contexts/tests created before a real mode is known.
export const ThemeContext = createContext<Theme>(buildTheme('light'));
