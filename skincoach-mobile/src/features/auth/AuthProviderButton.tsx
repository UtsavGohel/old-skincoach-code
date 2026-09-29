import { useCallback } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type AuthProviderButtonProps = {
  label: string;
  icon: React.ReactNode;
  variant: 'light' | 'tonal';
  onPress: () => void;
};

// The sign-in mockup's SSO buttons are a distinct cluster from the app's standard
// Button (56px, icon + centred label, pressed-scale): "light" = white card with a soft
// border + ambient shadow (Google/Apple); "tonal" = primary-tinted fill with sage text
// (Email). Kept as a dedicated auth component so the shared Button stays lean.
export function AuthProviderButton({
  label,
  icon,
  variant,
  onPress,
}: AuthProviderButtonProps): React.JSX.Element {
  const theme = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const setScale = useCallback(
    (to: number) => () => {
      scale.value = withTiming(to, {
        duration: theme.duration.fast,
        easing: theme.easing.standard,
      });
    },
    [scale, theme],
  );

  const isTonal = variant === 'tonal';

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      onPressIn={setScale(0.98)}
      onPressOut={setScale(1)}
      style={[
        styles.button,
        { borderRadius: theme.radius.button },
        isTonal
          ? { backgroundColor: `${theme.colors.primary}1A` }
          : [
              styles.lightBorder,
              {
                backgroundColor: theme.colors.surfaceContainerLowest,
                borderColor: theme.colors.outlineVariant,
              },
              theme.shadow.card,
            ],
        animatedStyle,
      ]}
    >
      {icon}
      <Text
        variant="labelMd"
        color={isTonal ? 'primary' : 'onSurface'}
        style={styles.label}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  lightBorder: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  label: {
    fontWeight: '700',
  },
});
