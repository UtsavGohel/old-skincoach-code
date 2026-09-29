import { useEffect } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';

export type SkeletonProps = {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: ViewStyle;
};

// docs/03 Loading Components: skeleton cards / shimmer / animated placeholder.
// "Avoid traditional loading spinners" — never use ActivityIndicator in this app.
export function Skeleton({
  width = '100%',
  height = 16,
  radius,
  style,
}: SkeletonProps): React.JSX.Element {
  const theme = useTheme();
  const shimmer = useSharedValue(0.5);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: theme.duration.slow * 3, easing: theme.easing.standard }),
      -1,
      true,
    );
  }, [shimmer, theme]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: shimmer.value,
  }));

  return (
    <Animated.View
      style={[
        styles.base,
        {
          width,
          height,
          borderRadius: radius ?? theme.radius.smallComponent,
          backgroundColor: theme.colors.surfaceContainerHigh,
        },
        animatedStyle,
        style,
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});
