import { Platform, ViewStyle } from 'react-native';

// Source: docs/03 Shadows ("soft elevation," "avoid harsh shadows"). iOS uses the
// shadow* properties; Android has no equivalent and relies on `elevation` instead,
// so both are provided — each platform ignores the properties it doesn't use.
function buildShadow(
  opacity: number,
  blur: number,
  yOffset: number,
  elevation: number,
): ViewStyle {
  return Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000000',
      shadowOpacity: opacity,
      shadowRadius: blur / 2,
      shadowOffset: { width: 0, height: yOffset },
    },
    android: { elevation },
    default: {},
  }) as ViewStyle;
}

export const shadow = {
  card: buildShadow(0.05, 20, 6, 3),
  button: buildShadow(0.08, 20, 6, 4),
} as const;
