import { useEffect, useRef, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, Lock, ScanFace, X } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { isMockApiEnabled } from '@/api/client';
import { createScan, createUploadUrl, getScanStatus, uploadImage } from '@/api/scan.api';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import { useScanStore } from '@/store/scan.store';
import { useToastStore } from '@/store/toast.store';
import type { RootStackParamList } from '@/navigation/types';

const STEPS = [
  'Detecting face',
  'Evaluating skin texture',
  'Measuring hydration',
  'Identifying redness',
  'Checking pores',
  'Comparing with previous scan',
  'Preparing personalized insights',
];

const DURATION_MS = 5000; // mock-mode fake pipeline duration
const TICK_MS = 80;
// Real pipeline: Gemini takes ~15-18s. Tuned so the bar eases to ~80-85% by then (not
// ~50%), so real completion only has a small gap to fill — no big jump. It still never
// hits 100% on its own; polling completion finishes it.
const EXPECTED_MS = 9000;
const POLL_MS = 2000;
const MAX_WAIT_MS = 90000; // give up politely if the backend never finishes

// Analyzing (design ref: ai_skin_analysis_in_progress). A calm progress bar + step
// checklist over the captured photo — no spinner (docs/03). In mock mode a fake timer
// hands off to the celebration screen. Wired (Slice 3): uploads the photo, creates the
// scan, and polls status until the real Gemini analysis (docs/06 / Phase 17) completes.
export function AnalyzingScreen(): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const photoUri = useScanStore((state) => state.photoUri);
  const setStatus = useScanStore((state) => state.setStatus);
  const setScanId = useScanStore((state) => state.setScanId);
  const showToast = useToastStore((state) => state.showToast);

  const [progress, setProgress] = useState(0);
  const navigatedRef = useRef(false);
  const pipelineStartedRef = useRef(false);

  const ring = useSharedValue(0);
  useEffect(() => {
    ring.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      -1,
      false,
    );
  }, [ring]);

  // Visual progress bar. Mock mode drives it to 100% then navigates; wired mode eases it
  // toward ~95% and stops — navigation is owned by the pipeline effect below.
  useEffect(() => {
    const started = Date.now();
    const timer = setInterval(() => {
      // Once completion has been triggered, stop driving progress so the 100% fill sticks.
      if (navigatedRef.current) return;
      const elapsed = Date.now() - started;
      if (isMockApiEnabled) {
        const pct = Math.min((elapsed / DURATION_MS) * 100, 100);
        setProgress(pct);
        if (pct >= 100 && !navigatedRef.current) {
          navigatedRef.current = true;
          clearInterval(timer);
          setStatus('complete');
          navigation.replace('AnalysisComplete');
        }
      } else {
        // Asymptotic ease toward 95% — moves quickly then slows, so the bar keeps
        // creeping during the real wait without ever falsely reaching 100%.
        const pct = 95 * (1 - Math.exp(-elapsed / EXPECTED_MS));
        setProgress(Math.min(pct, 97));
      }
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [navigation, setStatus]);

  // Wired pipeline (Slice 3): upload → create scan → poll status. Runs once; owns
  // navigation to the celebration screen (on completion) or back on failure.
  useEffect(() => {
    if (isMockApiEnabled || pipelineStartedRef.current) {
      return;
    }
    pipelineStartedRef.current = true;
    let cancelled = false;
    let pollTimer: ReturnType<typeof setTimeout>;

    const fail = (message: string, retake: boolean): void => {
      if (cancelled || navigatedRef.current) return;
      navigatedRef.current = true;
      setStatus('failed');
      showToast(message, 'error');
      if (retake) {
        navigation.replace('Camera');
      } else {
        navigation.goBack();
      }
    };

    const poll = async (scanId: string, startedAt: number): Promise<void> => {
      if (cancelled) return;
      try {
        const { status } = await getScanStatus(scanId);
        if (status === 'completed') {
          if (cancelled || navigatedRef.current) return;
          navigatedRef.current = true;
          setStatus('complete');
          // Fill the bar to 100% and let the final steps tick over, then navigate — so it
          // reads as "finished", not a jump straight from ~80% to the result.
          setProgress(100);
          setTimeout(() => {
            if (!cancelled) navigation.replace('AnalysisComplete');
          }, 500);
          return;
        }
        if (status === 'failed') {
          fail(
            "We couldn't analyze that photo clearly. Please retake it in good lighting.",
            true,
          );
          return;
        }
        if (Date.now() - startedAt > MAX_WAIT_MS) {
          fail('Analysis is taking longer than usual. Please try again.', false);
          return;
        }
        pollTimer = setTimeout(() => void poll(scanId, startedAt), POLL_MS);
      } catch {
        fail('We lost connection while analyzing. Please try again.', false);
      }
    };

    const run = async (): Promise<void> => {
      try {
        if (!photoUri) throw new Error('No captured photo to analyze.');
        const { uploadUrl, imageKey } = await createUploadUrl();
        await uploadImage(uploadUrl, photoUri);
        const { scanId } = await createScan(imageKey, Platform.OS);
        if (cancelled) return;
        setScanId(scanId);
        void poll(scanId, Date.now());
      } catch {
        fail("We couldn't upload your photo. Please try again.", false);
      }
    };

    void run();
    return () => {
      cancelled = true;
      clearTimeout(pollTimer);
    };
  }, [navigation, photoUri, setScanId, setStatus, showToast]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.5 * (1 - ring.value),
    transform: [{ scale: 1 + ring.value * 0.15 }],
  }));

  const currentStep = Math.min(
    Math.floor((progress / 100) * STEPS.length),
    STEPS.length - 1,
  );

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text variant="headlineMd" color="primary">
          SkinCoach
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cancel scan"
          onPress={() => navigation.navigate('HomeTabs')}
          hitSlop={8}
          style={styles.close}
        >
          <X size={24} color={theme.colors.onSurfaceVariant} />
        </Pressable>
      </View>

      <View style={styles.body}>
        <View style={styles.avatarWrap}>
          <Animated.View
            style={[
              styles.avatarRing,
              { borderColor: theme.colors.primaryFixed },
              ringStyle,
            ]}
          />
          <View
            style={[styles.avatar, { backgroundColor: theme.colors.secondaryContainer }]}
          >
            {photoUri ? (
              <Image
                source={{ uri: photoUri }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <ScanFace size={48} color={theme.colors.primary} strokeWidth={1.5} />
            )}
          </View>
        </View>

        <Text variant="headlineLgMobile" color="textPrimary" style={styles.title}>
          Analyzing Your Skin
        </Text>
        <Text variant="bodyMd" color="textSecondary" style={styles.subtitle}>
          Please wait while our AI evaluates today&apos;s skin condition.
        </Text>

        <View style={styles.progressHeader}>
          <Text variant="labelMd" color="textSecondary">
            Analysis Progress
          </Text>
          <Text variant="labelMd" color="primary">
            {`${Math.floor(progress)}%`}
          </Text>
        </View>
        <View
          style={[
            styles.progressTrack,
            { backgroundColor: theme.colors.surfaceContainerHigh },
          ]}
        >
          <View
            style={[
              styles.progressFill,
              { backgroundColor: theme.colors.primary, width: `${progress}%` },
            ]}
          />
        </View>

        <View style={styles.steps}>
          {STEPS.map((label, i) => {
            const done = i < currentStep;
            const active = i === currentStep;
            return (
              <View key={label} style={styles.stepRow}>
                <View
                  style={[
                    styles.stepMarker,
                    {
                      backgroundColor: done ? theme.colors.primary : 'transparent',
                      borderColor:
                        done || active
                          ? theme.colors.primary
                          : theme.colors.outlineVariant,
                    },
                  ]}
                >
                  {done ? (
                    <Check size={12} color={theme.colors.onPrimary} strokeWidth={3} />
                  ) : null}
                  {active ? (
                    <View
                      style={[
                        styles.activeDot,
                        { backgroundColor: theme.colors.primary },
                      ]}
                    />
                  ) : null}
                </View>
                <Text
                  variant="bodyMd"
                  color={done || active ? 'textPrimary' : 'textSecondary'}
                  style={!done && !active ? styles.pendingLabel : undefined}
                >
                  {label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Lock size={14} color={theme.colors.textSecondary} />
        <Text variant="labelSm" color="textSecondary">
          Your photo is securely processed and protected.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  close: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  avatarWrap: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  avatarRing: {
    position: 'absolute',
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 2,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 32,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  steps: {
    gap: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepMarker: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pendingLabel: {
    opacity: 0.6,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
});
