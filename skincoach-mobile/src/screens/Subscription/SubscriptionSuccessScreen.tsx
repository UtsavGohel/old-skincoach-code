import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import { usePreferencesStore } from '@/store/preferences.store';
import type { RootStackParamList } from '@/navigation/types';

// Phase 12 — Subscription success (docs/10 Subscription Success). Calm premium checkmark
// reveal (Easing.out, no bounce — consistent with AnalysisComplete/docs/03), the welcome
// headline, and a "Start Today's Scan" CTA. Reached via replace() after the mock purchase.
export function SubscriptionSuccessScreen(): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const hasSeenScanGuidelines = usePreferencesStore((s) => s.hasSeenScanGuidelines);

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withTiming(1, {
      duration: theme.duration.slow,
      easing: theme.easing.enter,
    });
    opacity.value = withTiming(1, { duration: theme.duration.base });
  }, [scale, opacity, theme]);

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const contentStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const startScan = (): void => {
    navigation.reset({
      index: 0,
      routes: [
        { name: 'HomeTabs' },
        { name: hasSeenScanGuidelines ? 'Camera' : 'ScanGuidelines' },
      ],
    });
  };

  const goHome = (): void => {
    navigation.reset({ index: 0, routes: [{ name: 'HomeTabs' }] });
  };

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.background,
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 24,
        },
      ]}
    >
      <View style={styles.center}>
        <Animated.View
          style={[
            styles.checkCircle,
            checkStyle,
            { backgroundColor: theme.colors.primary },
          ]}
        >
          <Check size={56} color={theme.colors.onPrimary} strokeWidth={3} />
        </Animated.View>

        <Animated.View style={[styles.copy, contentStyle]}>
          <Text variant="headlineLg" color="textPrimary" style={styles.title}>
            Welcome to SkinCoach Pro!
          </Text>
          <Text variant="bodyLg" color="textSecondary" style={styles.message}>
            Unlimited skin tracking is now unlocked. Let&apos;s make today count.
          </Text>
        </Animated.View>
      </View>

      <View style={styles.actions}>
        <Button
          label="Start Today's Scan"
          fullWidth
          onPress={startScan}
          accessibilityLabel="Start today's scan"
        />
        <Button
          label="Go to Home"
          variant="text"
          fullWidth
          onPress={goHome}
          accessibilityLabel="Go to home"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  checkCircle: {
    width: 120,
    height: 120,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    alignItems: 'center',
    gap: 12,
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  actions: {
    gap: 4,
  },
});
