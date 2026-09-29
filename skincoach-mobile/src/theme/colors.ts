// Source of truth: skincoach_design/organic_vitality/DESIGN.md (light palette only —
// see the `dark` derivation note below). Verify against docs/03 + DESIGN.md per the
// Phase 1 completion check in docs/19.

export type ColorScheme = {
  // Core surfaces
  background: string;
  onBackground: string;
  surface: string;
  surfaceDim: string;
  surfaceBright: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  surfaceVariant: string;
  onSurface: string;
  onSurfaceVariant: string;
  outline: string;
  outlineVariant: string;
  inverseSurface: string;
  inverseOnSurface: string;
  inversePrimary: string;
  surfaceTint: string;
  // Brand
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  primaryFixed: string;
  primaryFixedDim: string;
  onPrimaryFixed: string;
  onPrimaryFixedVariant: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  secondaryFixed: string;
  secondaryFixedDim: string;
  onSecondaryFixed: string;
  onSecondaryFixedVariant: string;
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  tertiaryFixed: string;
  tertiaryFixedDim: string;
  onTertiaryFixed: string;
  onTertiaryFixedVariant: string;
  // Status
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  warning: string;
  onWarning: string;
  // docs/03 semantic aliases, for everyday component use instead of the raw M3-style
  // token names above
  textPrimary: string;
  textSecondary: string;
  border: string;
  success: string;
};

const light: ColorScheme = {
  background: '#f9faf7',
  onBackground: '#1a1c1b',
  surface: '#f9faf7',
  surfaceDim: '#d9dad8',
  surfaceBright: '#f9faf7',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f3f4f1',
  surfaceContainer: '#edeeec',
  surfaceContainerHigh: '#e8e8e6',
  surfaceContainerHighest: '#e2e3e0',
  surfaceVariant: '#e2e3e0',
  onSurface: '#1a1c1b',
  onSurfaceVariant: '#404845',
  outline: '#717975',
  outlineVariant: '#c0c8c4',
  inverseSurface: '#2e3130',
  inverseOnSurface: '#f0f1ef',
  inversePrimary: '#a1d0c1',
  surfaceTint: '#3a675b',
  primary: '#386458',
  onPrimary: '#ffffff',
  primaryContainer: '#507d70',
  onPrimaryContainer: '#f4fffa',
  primaryFixed: '#bdeddd',
  primaryFixedDim: '#a1d0c1',
  onPrimaryFixed: '#002019',
  onPrimaryFixedVariant: '#214e43',
  secondary: '#3f665b',
  onSecondary: '#ffffff',
  secondaryContainer: '#c1ecde',
  onSecondaryContainer: '#456c61',
  secondaryFixed: '#c1ecde',
  secondaryFixedDim: '#a6cfc2',
  onSecondaryFixed: '#002019',
  onSecondaryFixedVariant: '#274e44',
  tertiary: '#46615b',
  onTertiary: '#ffffff',
  tertiaryContainer: '#5f7a73',
  onTertiaryContainer: '#f4fffa',
  tertiaryFixed: '#cbe9e0',
  tertiaryFixedDim: '#afcdc5',
  onTertiaryFixed: '#04201b',
  onTertiaryFixedVariant: '#314c46',
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',
  // Not in DESIGN.md (no warning token was exported) — a muted amber chosen to match
  // the palette's desaturated, earthy tone rather than a saturated/alarming hue.
  warning: '#c08a3e',
  onWarning: '#ffffff',
  textPrimary: '#1a1c1b',
  textSecondary: '#404845',
  border: '#c0c8c4',
  // docs/03 lists Success as a distinct "Soft Green," but the actual mockups (audited
  // in docs/19) color positive/improving states with the primary sage tone, not a
  // separate hue — reusing primary here matches real usage and the palette's
  // restraint principle rather than inventing a new color.
  success: '#386458',
};

// DESIGN.md only exports a light scheme, but its inverse-*/*-fixed-dim tokens are
// standard Material-3 dynamic-color remnants that only make sense paired with a dark
// scheme — this derives one systematically from those tonal relationships (e.g. dark
// primary = light's primaryFixedDim/inversePrimary) rather than guessing arbitrary
// new hues. TODO: replace with real exported dark-mode design values if/when they
// exist (docs/19 Phase 1 note).
const dark: ColorScheme = {
  background: '#1a1c1b',
  onBackground: '#e2e3e0',
  surface: '#1a1c1b',
  surfaceDim: '#141615',
  surfaceBright: '#40423f',
  surfaceContainerLowest: '#0f1110',
  surfaceContainerLow: '#232524',
  surfaceContainer: '#272928',
  surfaceContainerHigh: '#323433',
  surfaceContainerHighest: '#3d3f3d',
  surfaceVariant: '#404845',
  onSurface: '#e2e3e0',
  onSurfaceVariant: '#c0c8c4',
  outline: '#8a938e',
  outlineVariant: '#404845',
  inverseSurface: '#e2e3e0',
  inverseOnSurface: '#2e3130',
  inversePrimary: '#386458',
  surfaceTint: '#a1d0c1',
  primary: '#a1d0c1',
  onPrimary: '#0a372e',
  primaryContainer: '#214e43',
  onPrimaryContainer: '#bdeddd',
  primaryFixed: '#bdeddd',
  primaryFixedDim: '#a1d0c1',
  onPrimaryFixed: '#002019',
  onPrimaryFixedVariant: '#214e43',
  secondary: '#a6cfc2',
  onSecondary: '#0a352c',
  secondaryContainer: '#274e44',
  onSecondaryContainer: '#c1ecde',
  secondaryFixed: '#c1ecde',
  secondaryFixedDim: '#a6cfc2',
  onSecondaryFixed: '#002019',
  onSecondaryFixedVariant: '#274e44',
  tertiary: '#afcdc5',
  onTertiary: '#15332e',
  tertiaryContainer: '#314c46',
  onTertiaryContainer: '#cbe9e0',
  tertiaryFixed: '#cbe9e0',
  tertiaryFixedDim: '#afcdc5',
  onTertiaryFixed: '#04201b',
  onTertiaryFixedVariant: '#314c46',
  error: '#ffb4ab',
  onError: '#690005',
  errorContainer: '#93000a',
  onErrorContainer: '#ffdad6',
  warning: '#e3b673',
  onWarning: '#402d00',
  textPrimary: '#e2e3e0',
  textSecondary: '#c0c8c4',
  border: '#404845',
  success: '#a1d0c1',
};

export const colors = { light, dark };
