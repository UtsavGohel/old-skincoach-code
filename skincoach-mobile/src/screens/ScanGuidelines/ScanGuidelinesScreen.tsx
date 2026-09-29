import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Focus,
  Glasses,
  ImageOff,
  Lightbulb,
  Meh,
  Sun,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { GuidelineCard } from '@/features/scan/components/GuidelineCard';
import { useTheme } from '@/hooks/useTheme';
import { usePreferencesStore } from '@/store/preferences.store';
import type { IconComponent } from '@/types/icon';
import type { RootStackParamList } from '@/navigation/types';

// Same asset URL scan_guidelines/code.html itself uses (no real asset pipeline yet).
const HERO_URI =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBbnbrYfFz1pXeXiXi8E7Su0BNLtXJxzAFfKjLsoQ6gBox2HU0x0A3P99GsYccpgBIUrVrYFUKvHApWvwpDP7J83pWrfvRbwQcDz9zqTsVMQSr_f0VuWEEoZ4YnG6MyKaO49yhaEPEJFGZKlTwiBI7gnNhEPxR21eivswpmoxHaGri2PJm1qwTkTXBC85c3M3f4WiENSGiZRSkaI9N2LamgmEye_PfK6JxVTaIgBQx2A2Ze0cIfk_FOFQ';

// Remove Glasses is required by docs/06 Step 1 ("No sunglasses") + docs/02 but is
// missing from the mockup (docs/19 Known Mockup Deviations) — added here.
const GUIDELINES: { icon: IconComponent; title: string; description: string }[] = [
  {
    icon: Sun,
    title: 'Good Lighting',
    description:
      'Use natural daylight whenever possible. Avoid harsh shadows or dark rooms.',
  },
  {
    icon: Meh,
    title: 'Neutral Expression',
    description:
      'Relax your face and look directly at the camera. Avoid squinting or smiling wide.',
  },
  {
    icon: ImageOff,
    title: 'No Filters',
    description:
      "Disable beauty mode and camera filters. We need to see your skin's natural texture.",
  },
  {
    icon: Glasses,
    title: 'Remove Glasses',
    description: 'Take off glasses and sunglasses so nothing covers your eyes or skin.',
  },
  {
    icon: Focus,
    title: 'Keep Your Face Centered',
    description: 'Fit your whole face inside the guide. Keep the camera at eye level.',
  },
];

// Phase 5 — Scan Guidelines (design ref: scan_guidelines). Capture tips before opening
// the camera; "Open Camera" pushes the Camera screen, "Skip for now" backs out.
export function ScanGuidelinesScreen(): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const markScanGuidelinesSeen = usePreferencesStore((s) => s.markScanGuidelinesSeen);

  const openCamera = (): void => {
    // Remember they've seen the tips so future scans skip straight to the camera.
    markScanGuidelinesSeen();
    navigation.navigate('Camera');
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + theme.spacing.sm }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => navigation.goBack()}
          hitSlop={8}
          style={styles.iconButton}
        >
          <ArrowLeft size={24} color={theme.colors.primary} />
        </Pressable>
        <Text variant="headlineMd" color="primary">
          AI Skin Scan
        </Text>
        <View style={styles.iconButton} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text variant="bodyLg" color="textSecondary" style={styles.subtitle}>
          Follow these simple tips for the most accurate results.
        </Text>

        <View style={[styles.hero, theme.shadow.card]}>
          <Image source={{ uri: HERO_URI }} style={styles.heroImage} resizeMode="cover" />
          <LinearGradient
            colors={[`${theme.colors.primary}00`, `${theme.colors.primary}33`]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroPillWrap}>
            <View
              style={[
                styles.heroPill,
                { backgroundColor: `${theme.colors.surfaceContainerLowest}E6` },
              ]}
            >
              <CheckCircle2 size={18} color={theme.colors.primary} />
              <Text variant="labelMd" color="primary">
                Proper alignment example
              </Text>
            </View>
          </View>
        </View>

        <Text variant="headlineMd" color="textPrimary" style={styles.sectionHeading}>
          Scan Guidelines
        </Text>
        <View style={styles.grid}>
          {GUIDELINES.map((item) => (
            <GuidelineCard
              key={item.title}
              icon={item.icon}
              title={item.title}
              description={item.description}
            />
          ))}
        </View>

        <View style={[styles.tip, { backgroundColor: `${theme.colors.primary}0D` }]}>
          <View style={[styles.tipIcon, { backgroundColor: theme.colors.primary }]}>
            <Lightbulb size={20} color={theme.colors.onPrimary} />
          </View>
          <View style={styles.tipText}>
            <Text variant="labelMd" color="primary" style={styles.tipLabel}>
              Best Results
            </Text>
            <Text variant="bodyMd" color="textSecondary">
              Take your daily scan at the same time each day using similar lighting
              conditions to ensure accurate tracking of your skin&apos;s progress.
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Button label="Open Camera" icon={Camera} onPress={openCamera} />
          <Button
            label="Skip for now"
            variant="text"
            onPress={() => navigation.goBack()}
          />
        </View>
      </ScrollView>
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
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  hero: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 32,
    overflow: 'hidden',
    marginBottom: 40,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPillWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 24,
    alignItems: 'center',
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 9999,
  },
  sectionHeading: {
    marginBottom: 20,
  },
  grid: {
    gap: 16,
    marginBottom: 40,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    padding: 24,
    borderRadius: 24,
    marginBottom: 32,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipText: {
    flex: 1,
    gap: 4,
  },
  tipLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  actions: {
    gap: 8,
  },
});
