import { TextStyle } from 'react-native';

// Source of truth: skincoach_design/organic_vitality/DESIGN.md's typography block.
// docs/03 describes a similar but not numerically identical scale (e.g. "Display 32"
// vs DESIGN.md's display-lg at 40, no letter-spacing values at all) — DESIGN.md wins
// here since it's strictly more precise (exact letter-spacing) and matches what the
// audited mockups actually implement (docs/19 Known Mockup Deviations appendix).

export const fontFamilies = {
  plusJakartaSansSemiBold: 'PlusJakartaSans_600SemiBold',
  plusJakartaSansBold: 'PlusJakartaSans_700Bold',
  manropeRegular: 'Manrope_400Regular',
  manropeSemiBold: 'Manrope_600SemiBold',
  manropeBold: 'Manrope_700Bold',
} as const;

// expo-font's useFonts keys must match these exactly.
export const fontsToLoad = {
  PlusJakartaSans_600SemiBold: require('@expo-google-fonts/plus-jakarta-sans/600SemiBold/PlusJakartaSans_600SemiBold.ttf'),
  PlusJakartaSans_700Bold: require('@expo-google-fonts/plus-jakarta-sans/700Bold/PlusJakartaSans_700Bold.ttf'),
  Manrope_400Regular: require('@expo-google-fonts/manrope/400Regular/Manrope_400Regular.ttf'),
  Manrope_600SemiBold: require('@expo-google-fonts/manrope/600SemiBold/Manrope_600SemiBold.ttf'),
  Manrope_700Bold: require('@expo-google-fonts/manrope/700Bold/Manrope_700Bold.ttf'),
};

type TypographyToken = Pick<
  TextStyle,
  'fontFamily' | 'fontSize' | 'fontWeight' | 'lineHeight' | 'letterSpacing'
>;

// letterSpacing below is converted from DESIGN.md's em values to points
// (RN's letterSpacing is absolute, not font-size-relative): pt = em * fontSize.
export const typography: Record<
  | 'displayLg'
  | 'headlineLg'
  | 'headlineLgMobile'
  | 'headlineMd'
  | 'bodyLg'
  | 'bodyMd'
  | 'labelMd'
  | 'labelSm',
  TypographyToken
> = {
  displayLg: {
    fontFamily: fontFamilies.plusJakartaSansBold,
    fontSize: 40,
    fontWeight: '700',
    lineHeight: 48,
    letterSpacing: -0.8,
  },
  headlineLg: {
    fontFamily: fontFamilies.plusJakartaSansBold,
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    letterSpacing: -0.32,
  },
  headlineLgMobile: {
    fontFamily: fontFamilies.plusJakartaSansBold,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    letterSpacing: -0.28,
  },
  headlineMd: {
    fontFamily: fontFamilies.plusJakartaSansSemiBold,
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  },
  bodyLg: {
    fontFamily: fontFamilies.manropeRegular,
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 28,
  },
  bodyMd: {
    fontFamily: fontFamilies.manropeRegular,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  labelMd: {
    fontFamily: fontFamilies.manropeSemiBold,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: 0.28,
  },
  labelSm: {
    fontFamily: fontFamilies.manropeBold,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    letterSpacing: 0.6,
  },
};
