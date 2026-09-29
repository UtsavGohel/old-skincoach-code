import { Easing } from 'react-native-reanimated';

// Source: docs/03 Animations — 200-300ms, fade/slide/scale only, never bounce
// (docs/19's audit found the mockups violate this in two places — analysis-complete's
// checkmark and progress-trends' trend icon — this is the canonical calm easing to
// use instead everywhere in the app).
export const duration = {
  fast: 200,
  base: 250,
  slow: 300,
} as const;

// Calm, no-overshoot easing — never Easing.back()/bounce()/elastic().
export const easing = {
  standard: Easing.out(Easing.cubic),
  enter: Easing.out(Easing.quad),
  exit: Easing.in(Easing.quad),
} as const;
