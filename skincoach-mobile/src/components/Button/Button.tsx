import { useCallback } from 'react';
import { Pressable, StyleSheet, type PressableProps, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import type { IconComponent } from '@/types/icon';

export type ButtonVariant = 'primary' | 'secondary' | 'text';

export type ButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
  /** Optional icon, e.g. a provider logo on an SSO button or a trailing arrow on a CTA. */
  icon?: IconComponent;
  /** Which side the icon sits on. Defaults to leading. */
  iconPosition?: 'leading' | 'trailing';
  style?: ViewStyle;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// docs/03 Buttons: Primary (full width, 56px, 20px radius, sage bg, white text, soft
// shadow, light haptic, pressed scale 98%), Secondary (white bg, dark text, light
// border), Text (no bg, sage text). docs/18: every button needs accessibilityLabel.
export function Button({
  label,
  variant = 'primary',
  loading = false,
  fullWidth = true,
  icon: Icon,
  iconPosition = 'leading',
  disabled,
  onPressIn,
  onPressOut,
  onPress,
  style,
  ...props
}: ButtonProps): React.JSX.Element {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const isDisabled = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(
    (e: Parameters<NonNullable<PressableProps['onPressIn']>>[0]) => {
      scale.value = withTiming(0.98, {
        duration: theme.duration.fast,
        easing: theme.easing.standard,
      });
      onPressIn?.(e);
    },
    [scale, theme, onPressIn],
  );

  const handlePressOut = useCallback(
    (e: Parameters<NonNullable<PressableProps['onPressOut']>>[0]) => {
      scale.value = withTiming(1, {
        duration: theme.duration.fast,
        easing: theme.easing.standard,
      });
      onPressOut?.(e);
    },
    [scale, theme, onPressOut],
  );

  const handlePress = useCallback(
    (e: Parameters<NonNullable<PressableProps['onPress']>>[0]) => {
      if (variant === 'primary') {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onPress?.(e);
    },
    [variant, onPress],
  );

  const variantStyle = variantStyles(theme)[variant];

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[
        styles.base,
        { borderRadius: theme.radius.button, paddingHorizontal: theme.spacing.lg },
        variantStyle.container,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        animatedStyle,
        style,
      ]}
      {...props}
    >
      {Icon && !loading && iconPosition === 'leading' ? (
        <Icon size={20} color={theme.colors[variantStyle.textColor]} />
      ) : null}
      <Text variant="bodyMd" color={variantStyle.textColor} style={styles.label}>
        {loading ? '···' : label}
      </Text>
      {Icon && !loading && iconPosition === 'trailing' ? (
        <Icon size={20} color={theme.colors[variantStyle.textColor]} />
      ) : null}
    </AnimatedPressable>
  );
}

function variantStyles(theme: ReturnType<typeof useTheme>) {
  return {
    primary: {
      container: {
        backgroundColor: theme.colors.primary,
        ...theme.shadow.button,
      } as ViewStyle,
      textColor: 'onPrimary' as const,
    },
    secondary: {
      container: {
        backgroundColor: theme.colors.surfaceContainerLowest,
        borderWidth: 1,
        borderColor: theme.colors.border,
      } as ViewStyle,
      textColor: 'textPrimary' as const,
    },
    text: {
      container: {
        backgroundColor: 'transparent',
      } as ViewStyle,
      textColor: 'primary' as const,
    },
  };
}

const styles = StyleSheet.create({
  base: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontWeight: '600',
  },
});
