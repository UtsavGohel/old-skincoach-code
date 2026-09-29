import { View, type ViewProps, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/useTheme';

export type CardVariant = 'hero' | 'information';

export type CardProps = ViewProps & {
  variant?: CardVariant;
  style?: ViewStyle;
};

// docs/03 Cards: 24px radius, white background, soft shadow, 20px padding. Hero Card
// is used for Skin Score/Today's Summary/AI Insight (visually identical container to
// Information Card — the distinction is what content goes inside, not the shell).
export function Card({
  variant = 'information',
  style,
  children,
  ...props
}: CardProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surfaceContainerLowest,
          borderRadius: theme.radius.card,
          padding: theme.spacing.screenPadding,
          ...theme.shadow.card,
        },
        variant === 'hero' && { alignItems: 'center' },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
