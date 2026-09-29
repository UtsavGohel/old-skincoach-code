import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowDown, ArrowUp, Check } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Text } from '@/components/Text';
import { useAnalysis } from '@/features/analysis/useAnalysis';
import { useTheme } from '@/hooks/useTheme';
import { useScanStore } from '@/store/scan.store';
import type { RootStackParamList } from '@/navigation/types';

const COUNT_MS = 1500;

// Phase 5 — Analysis Complete celebration (design ref: analysis_complete_celebration).
// Calm check reveal (Easing.out, NO bounce/overshoot — docs/03/docs/19) and an ease-out
// score count-up, then into Results. (docs/02 calls for a shared-element transition into
// Results; deferred — plain navigation for now.)
export function AnalysisCompleteScreen(): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const scanId = useScanStore((state) => state.scanId);
  // The just-completed scan's result (cached, so Results opens instantly afterwards).
  const { data } = useAnalysis(scanId);
  const targetScore = data?.overallScore ?? 0;
  const delta = data?.scoreDelta ?? 0;

  const [score, setScore] = useState(0);
  const checkScale = useSharedValue(0);
  const ringScale = useSharedValue(0);

  // Celebration reveal — runs once on mount, independent of when the result arrives.
  useEffect(() => {
    checkScale.value = withDelay(
      150,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }),
    );
    ringScale.value = withDelay(
      150,
      withTiming(1, { duration: 900, easing: Easing.out(Easing.quad) }),
    );
  }, [checkScale, ringScale]);

  // Ease-out count-up to the real score once it's loaded (re-runs if it lands late).
  useEffect(() => {
    const started = Date.now();
    const timer = setInterval(() => {
      const p = Math.min((Date.now() - started) / COUNT_MS, 1);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      setScore(Math.round(eased * targetScore));
      if (p >= 1) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [targetScore]);

  const checkStyle = useAnimatedStyle(() => ({
    opacity: checkScale.value,
    transform: [{ scale: checkScale.value }],
  }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.4 * (1 - ringScale.value),
    transform: [{ scale: 0.8 + ringScale.value * 0.8 }],
  }));

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: theme.colors.background, paddingTop: insets.top },
      ]}
    >
      <View style={styles.body}>
        <View style={styles.checkWrap}>
          <Animated.View
            style={[
              styles.checkRing,
              { backgroundColor: theme.colors.primaryFixed },
              ringStyle,
            ]}
          />
          <Animated.View
            style={[
              styles.checkCircle,
              { backgroundColor: theme.colors.primary },
              checkStyle,
            ]}
          >
            <Check size={44} color={theme.colors.onPrimary} strokeWidth={3} />
          </Animated.View>
        </View>

        <Text variant="headlineLgMobile" color="textPrimary" style={styles.title}>
          Analysis Complete
        </Text>
        <Text variant="bodyMd" color="textSecondary" style={styles.subtitle}>
          Your skin report is ready.
        </Text>

        <Card variant="hero" style={styles.scoreCard}>
          <Text style={[theme.typography.displayLg, { color: theme.colors.primary }]}>
            {score}
          </Text>
          <Text variant="labelMd" color="textSecondary" style={styles.scoreLabel}>
            Today&apos;s Skin Score
          </Text>
          {delta !== 0 ? (
            <View
              style={[
                styles.deltaChip,
                { backgroundColor: theme.colors.secondaryContainer },
              ]}
            >
              {delta > 0 ? (
                <ArrowUp size={14} color={theme.colors.primary} />
              ) : (
                <ArrowDown size={14} color={theme.colors.primary} />
              )}
              <Text variant="labelSm" color="primary">
                {`${delta > 0 ? '+' : ''}${delta} since yesterday`}
              </Text>
            </View>
          ) : null}
          <Text variant="bodyMd" color="textSecondary" style={styles.encouragement}>
            ✨ Your consistency is paying off.
          </Text>
        </Card>
      </View>

      <View style={[styles.actions, { paddingBottom: insets.bottom + 16 }]}>
        <Button label="View My Results" onPress={() => navigation.navigate('Results')} />
        <Button
          label="Back to Home"
          variant="text"
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'HomeTabs' }] })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  checkWrap: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  checkRing: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  checkCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 40,
  },
  scoreCard: {
    width: '100%',
    gap: 6,
  },
  scoreLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  deltaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    marginTop: 8,
  },
  encouragement: {
    textAlign: 'center',
    marginTop: 12,
  },
  actions: {
    paddingHorizontal: 20,
    gap: 8,
  },
});
