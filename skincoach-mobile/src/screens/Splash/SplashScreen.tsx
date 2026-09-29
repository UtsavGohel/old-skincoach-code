import { useEffect } from 'react';
import { Image, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Leaf } from 'lucide-react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/Text';
import { env } from '@/constants/env';
import { routeAfterAuth } from '@/features/auth/routeAfterAuth';
import { useTheme } from '@/hooks/useTheme';
import type { RootStackParamList } from '@/navigation/types';

const NO_CLERK_SPLASH_DELAY_MS = 1200;
// Mockup's own CSS cap (`max-w-[320px]`) — only reached on tall enough screens;
// see heroHeight/heroWidth below for how this is kept from overflowing short ones.
const HERO_MAX_WIDTH = 320;
const HERO_MIN_HEIGHT = 160;
// Everything else on screen (logo+title+tagline block, footer loading bar+label,
// container padding, the gap between blocks) — measured, not guessed, so the hero
// card gets exactly whatever's left rather than a fixed size that can overflow.
const RESERVED_VERTICAL_SPACE = 180 + 96 + 64 + 24;

// Same asset URLs skincoach_design/splash_screen/code.html itself uses — no real
// asset pipeline/CDN exists yet (docs/06 is about user scan photos, not marketing
// imagery), so pulling the mockup's own hosted images is the most accurate option
// until real brand assets are supplied.
const LOGO_URI =
  'https://lh3.googleusercontent.com/aida/AP1WRLu0y7RZTM3b3JXhDqLLP-rCSWysTkk7k6sr1YgyuzuvCDuL-YJVUuWzSPE3SJKfBjWjn1cGRAjrBVc-o5TuUKTgrWvU5Q62AbWJechCFfbNNxecWimaP30_qwUDkXs4t0CqCFowibzcY1-6sgnZ3k52YnuA0adQgBntY3e9ySl00XwlclunjeIQIMnM5ke11qNzpuvgNvpHeu3uphBowmIov6MWPuEa8Ozt7dASuQ_i1z1vMn63Ko7KSBmD';
const HERO_URI =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBQqBLxsmTElXebdTRbbuNlkzHkKn4XUkZJOmVfxWR_uI_hNShIGLdSFz4kJMJLCQPkqZp6W87rcLvXI7uMG3_PkONj-QF6-mGsBpA5n2QW9huW-5NmewhCcPoYEa8F8F7KTrPXBSeA7IByyEkqw_cq5ypuYQe7PcClMiLMK7FcnhNZtMNT16tEIPeLkrh3pf2FGONv-fOKqmBvBsgd3fxggNhOrEuVJThkPWZU0Zt6kuauULMkfUsiZQ';

// Design ref: splash_screen/. Logo circle is 96pt (mockup's `w-24 h-24`, verified
// against screenshot pixel scale). The hero card's size is computed from actual
// window height (see heroHeight below) instead of a fixed aspect-ratio box — a fixed
// box sized to the mockup's literal proportions overflowed short/typical Android
// screens with no way to scroll to the rest, which is what made the footer
// disappear. A ScrollView remains as a safety net for anything still too tall.
export function SplashScreen(): React.JSX.Element {
  const theme = useTheme();
  const { height: windowHeight } = useWindowDimensions();

  const heroHeight = Math.min(
    Math.max(windowHeight - RESERVED_VERTICAL_SPACE, HERO_MIN_HEIGHT),
    HERO_MAX_WIDTH * 1.25,
  );
  const heroWidth = Math.min(heroHeight * 0.8, HERO_MAX_WIDTH);

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { minHeight: windowHeight, backgroundColor: theme.colors.background },
      ]}
      bounces={false}
    >
      <View style={styles.content}>
        <View style={styles.brandBlock}>
          <View
            style={[
              styles.logoCircle,
              { backgroundColor: theme.colors.surfaceContainerLowest },
              theme.shadow.card,
            ]}
          >
            <Image
              source={{ uri: LOGO_URI }}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text variant="displayLg" color="primary">
            AI Skin Coach
          </Text>
          <Text variant="bodyMd" color="textSecondary" style={styles.tagline}>
            Your ritual, refined by science.
          </Text>
        </View>

        <View
          style={[
            styles.heroCard,
            { width: heroWidth, height: heroHeight },
            theme.shadow.card,
          ]}
        >
          <Image source={{ uri: HERO_URI }} style={styles.heroImage} resizeMode="cover" />
          <LinearGradient
            colors={[`${theme.colors.primary}1A`, `${theme.colors.primary}00`]}
            style={StyleSheet.absoluteFill}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <LoadingLine />
        <View style={styles.footerLabelRow}>
          <Leaf size={14} color={theme.colors.textSecondary} strokeWidth={1.5} />
          <Text variant="labelSm" color="textSecondary" style={styles.footerLabel}>
            Personalizing your experience
          </Text>
        </View>
      </View>

      {env.isClerkConfigured ? <AuthRouter /> : <UnconfiguredRouter />}
    </ScrollView>
  );
}

// Mockup's keyframes: fill width grows 0% -> 100% while opacity pulses 0.5 -> 1 ->
// 0.5, looping — a filling bar, not a sliding segment.
function LoadingLine(): React.JSX.Element {
  const theme = useTheme();
  const width = useSharedValue(0);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    const duration = theme.duration.slow * 4;
    width.value = withRepeat(
      withTiming(100, { duration, easing: theme.easing.standard }),
      -1,
      false,
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: duration / 2 }),
        withTiming(0.5, { duration: duration / 2 }),
      ),
      -1,
      false,
    );
  }, [width, opacity, theme]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.loadingTrack, { backgroundColor: theme.colors.outlineVariant }]}>
      <Animated.View
        style={[
          styles.loadingFill,
          { backgroundColor: theme.colors.primary },
          animatedStyle,
        ]}
      />
    </View>
  );
}

// Split out so useAuth() is only ever called with a ClerkProvider ancestor mounted.
function AuthRouter(): null {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) {
      // Signed in → decide HomeTabs vs Onboarding from the server profile.
      void routeAfterAuth(navigation);
    } else {
      navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
    }
  }, [isLoaded, isSignedIn, navigation]);

  return null;
}

// No Clerk configured (placeholder key) — can't check real auth state, so just show
// the brand moment briefly and land on Welcome.
function UnconfiguredRouter(): null {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
    }, NO_CLERK_SPLASH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [navigation]);

  return null;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 32,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    width: '100%',
  },
  brandBlock: {
    alignItems: 'center',
    gap: 8,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: 64,
    height: 64,
  },
  tagline: {
    opacity: 0.8,
  },
  heroCard: {
    borderRadius: 32,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  footer: {
    width: '100%',
    paddingHorizontal: 48,
    alignItems: 'center',
    gap: 16,
  },
  loadingTrack: {
    width: '100%',
    height: 2,
    borderRadius: 1,
    overflow: 'hidden',
  },
  loadingFill: {
    height: '100%',
    borderRadius: 1,
  },
  footerLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
