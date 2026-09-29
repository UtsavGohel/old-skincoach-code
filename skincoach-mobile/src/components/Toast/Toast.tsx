import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import { useToastStore, type ToastVariant } from '@/store/toast.store';
import type { ColorScheme } from '@/theme';
import type { IconComponent } from '@/types/icon';

const AUTO_DISMISS_MS = 3000;

const VARIANT_ICON: Record<ToastVariant, IconComponent> = {
  success: CheckCircle2,
  warning: TriangleAlert,
  error: AlertCircle,
  info: Info,
};

// docs/03 Toast: rounded, floating, bottom position, auto-dismiss.
export function ToastHost(): React.JSX.Element | null {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { message, variant, hideToast } = useToastStore();
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!message) return;
    opacity.value = withTiming(1, { duration: theme.duration.fast });
    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: theme.duration.fast });
      setTimeout(hideToast, theme.duration.fast);
    }, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [message, opacity, theme, hideToast]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (!message) return null;

  const Icon = VARIANT_ICON[variant];
  const color = variantColor(theme.colors, variant);

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      style={[
        styles.container,
        animatedStyle,
        {
          bottom: insets.bottom + theme.spacing.lg,
          backgroundColor: theme.colors.inverseSurface,
          borderRadius: theme.radius.full,
          paddingHorizontal: theme.spacing.md,
        },
      ]}
    >
      <Icon size={18} color={color} />
      <Text variant="labelMd" color="inverseOnSurface" style={styles.text}>
        {message}
      </Text>
    </Animated.View>
  );
}

function variantColor(colors: ColorScheme, variant: ToastVariant): string {
  switch (variant) {
    case 'success':
      return colors.success;
    case 'warning':
      return colors.warning;
    case 'error':
      return colors.error;
    default:
      return colors.inverseOnSurface;
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  text: {
    flex: 1,
  },
});
