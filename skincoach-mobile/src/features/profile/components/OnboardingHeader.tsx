import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';

type OnboardingHeaderProps = {
  step: number;
  totalSteps: number;
  onBack: () => void;
};

// Shared onboarding app bar: back button on the left, centered "Step X of Y" label
// above a thin progress bar that animates to the current step's fill on mount
// (mockups' `progress-fill` / `step-progress-fill` transition).
export function OnboardingHeader({
  step,
  totalSteps,
  onBack,
}: OnboardingHeaderProps): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const progress = useSharedValue(Math.max((step - 1) / totalSteps, 0));

  useEffect(() => {
    progress.value = withTiming(step / totalSteps, {
      duration: theme.duration.slow,
      easing: theme.easing.standard,
    });
  }, [progress, step, totalSteps, theme]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={[styles.container, { paddingTop: insets.top + theme.spacing.sm }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={onBack}
        hitSlop={8}
        style={styles.backButton}
      >
        <ArrowLeft size={24} color={theme.colors.primary} />
      </Pressable>

      <View style={styles.progressBlock}>
        <Text
          variant="labelSm"
          color="textSecondary"
          style={styles.stepLabel}
        >{`Step ${step} of ${totalSteps}`}</Text>
        <View style={[styles.track, { backgroundColor: theme.colors.surfaceContainer }]}>
          <Animated.View
            style={[styles.fill, { backgroundColor: theme.colors.primary }, fillStyle]}
          />
        </View>
      </View>

      {/* Spacer mirroring the back button so the progress block stays centered. */}
      <View style={styles.backButton} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBlock: {
    flex: 1,
    maxWidth: 200,
    alignItems: 'center',
    gap: 8,
  },
  stepLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  track: {
    width: '100%',
    height: 3,
    borderRadius: 9999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 9999,
  },
});
