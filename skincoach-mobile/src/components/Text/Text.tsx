import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/theme';

export type TextVariant =
  | 'displayLg'
  | 'headlineLg'
  | 'headlineLgMobile'
  | 'headlineMd'
  | 'bodyLg'
  | 'bodyMd'
  | 'labelMd'
  | 'labelSm';

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  color?: keyof ColorScheme;
};

// docs/03 Reusability Rules: "No screen should create its own unique typography" —
// every piece of text in the app should go through this instead of a raw <Text>.
export function Text({
  variant = 'bodyMd',
  color = 'textPrimary',
  style,
  ...props
}: TextProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <RNText
      style={[theme.typography[variant], { color: theme.colors[color] }, style]}
      {...props}
    />
  );
}
