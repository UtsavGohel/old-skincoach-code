import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Flame } from 'lucide-react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';

type RoutineStreakCardProps = {
  streakDays: number;
};

// Filled primary streak card (my_routine_tracker) — day count + encouragement in white,
// with a flame badge that breathes gently (calm scale loop, no bounce per docs/03).
export function RoutineStreakCard({
  streakDays,
}: RoutineStreakCardProps): React.JSX.Element {
  const theme = useTheme();
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [pulse]);

  const flameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <View
      style={[styles.card, theme.shadow.card, { backgroundColor: theme.colors.primary }]}
    >
      <View style={styles.text}>
        <Text variant="headlineMd" color="onPrimary">
          {`${streakDays} Day Routine Streak`}
        </Text>
        <Text variant="bodyMd" color="onPrimary" style={styles.subtitle}>
          Consistency is improving your skin.
        </Text>
      </View>
      <Animated.View style={[styles.flameBadge, flameStyle]}>
        <Flame size={28} color={theme.colors.onPrimary} fill={theme.colors.onPrimary} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    padding: 24,
    borderRadius: 24,
  },
  text: {
    flex: 1,
    gap: 4,
  },
  subtitle: {
    opacity: 0.9,
  },
  flameBadge: {
    width: 64,
    height: 64,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
