import { useEffect } from 'react';
import { View, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export type ProgressRingProps = {
  progress: number; // 0-100 — drives the arc
  size?: number;
  strokeWidth?: number;
  label?: string;
  valueLabel?: string;
  // Overrides the big center number (default: the rounded percent). Used by the Routine
  // tab to show a "3 / 5" completion fraction instead of the percentage.
  centerValue?: string;
  style?: ViewStyle;
};

// docs/03 Progress Ring: animated, gradient stroke, large number, small label, used
// for Skin Score / Routine Completion / Weekly Goal.
export function ProgressRing({
  progress,
  size = 192,
  strokeWidth = 12,
  label,
  valueLabel,
  centerValue,
  style,
}: ProgressRingProps): React.JSX.Element {
  const theme = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, progress));

  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(clamped, {
      duration: theme.duration.slow * 2,
      easing: theme.easing.standard,
    });
  }, [clamped, animatedProgress, theme]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value / 100),
  }));

  return (
    <View
      style={[
        { width: size, height: size, alignItems: 'center', justifyContent: 'center' },
        style,
      ]}
    >
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Defs>
          <LinearGradient id="progressGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={theme.colors.secondary} />
            <Stop offset="1" stopColor={theme.colors.primary} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.colors.secondaryContainer}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text
          variant="displayLg"
          color="primary"
          accessibilityLabel={centerValue ?? `${Math.round(clamped)} percent`}
        >
          {centerValue ?? Math.round(clamped)}
        </Text>
        {(valueLabel ?? label) ? (
          <Text
            variant="labelMd"
            color="textSecondary"
            style={{ textTransform: 'uppercase' }}
          >
            {valueLabel ?? label}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
