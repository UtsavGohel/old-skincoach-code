import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import {
  Camera as CameraIcon,
  HelpCircle,
  Images,
  Lightbulb,
  SwitchCamera,
  X,
} from 'lucide-react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { FaceGuideOverlay } from '@/features/scan/components/FaceGuideOverlay';
import { useTheme } from '@/hooks/useTheme';
import { useScanStore } from '@/store/scan.store';
import { useToastStore } from '@/store/toast.store';
import type { RootStackParamList } from '@/navigation/types';

const TIPS = [
  'Natural daylight gives the best results.',
  'Keep a neutral expression and look straight ahead.',
  'Fit your whole face inside the oval guide.',
];

const QUALITY = [
  { label: 'Lighting', value: 'Good' },
  { label: 'Position', value: 'Perfect' },
  { label: 'Distance', value: 'Ideal' },
];

// Phase 5 — Camera capture (design ref: ai_skin_scan_1/2, unified to one guide style).
// Front camera with the oval face guide; capturing stores the photo and moves to the
// Analyzing screen. Quality indicators are static (real face/lighting validation is a
// backend concern, docs/06 Step 2).
export function CameraScreen(): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const startScan = useScanStore((state) => state.startScan);
  const showToast = useToastStore((state) => state.showToast);

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('front');
  const [tipIndex, setTipIndex] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const flash = useSharedValue(0);

  useEffect(() => {
    const timer = setInterval(() => setTipIndex((i) => (i + 1) % TIPS.length), 3500);
    return () => clearInterval(timer);
  }, []);

  const flashStyle = useAnimatedStyle(() => ({ opacity: flash.value }));

  const handleCapture = async (): Promise<void> => {
    if (isCapturing) return;
    setIsCapturing(true);
    // Quick white shutter flash — a sequence (not a nested withTiming callback, which
    // recurses/stack-overflows in this Reanimated version).
    flash.value = withSequence(
      withTiming(1, { duration: 60 }),
      withTiming(0, { duration: 200 }),
    );
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.8 });
      if (photo?.uri) {
        startScan(photo.uri);
        navigation.replace('Analyzing');
      }
    } catch {
      showToast('Could not capture photo. Please try again.', 'error');
    } finally {
      setIsCapturing(false);
    }
  };

  if (!permission) {
    return <View style={[styles.root, { backgroundColor: theme.colors.background }]} />;
  }

  if (!permission.granted) {
    return (
      <View
        style={[
          styles.root,
          styles.permission,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <View
          style={[
            styles.permissionIcon,
            { backgroundColor: theme.colors.secondaryContainer },
          ]}
        >
          <CameraIcon size={32} color={theme.colors.primary} strokeWidth={1.75} />
        </View>
        <Text variant="headlineMd" color="textPrimary" style={styles.permissionTitle}>
          Camera access needed
        </Text>
        <Text variant="bodyMd" color="textSecondary" style={styles.permissionText}>
          SkinCoach uses your front camera to scan your skin. Your photos stay private.
        </Text>
        <Button
          label="Enable Camera"
          onPress={() => void requestPermission()}
          fullWidth={false}
        />
        <Button label="Not now" variant="text" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} />
      <FaceGuideOverlay />

      {/* Header */}
      <View style={[styles.header, { top: insets.top + 8 }]}>
        <GlassButton label="Close" icon={X} onPress={() => navigation.goBack()} />
        <Text variant="headlineMd" style={styles.headerTitle}>
          Daily Skin Scan
        </Text>
        <GlassButton
          label="Help"
          icon={HelpCircle}
          onPress={() => navigation.navigate('ScanGuidelines')}
        />
      </View>

      {/* Quality indicators */}
      <View style={[styles.qualityBar, { top: insets.top + 68 }]}>
        {QUALITY.map((q, i) => (
          <View key={q.label} style={styles.qualityRow}>
            {i > 0 ? <View style={styles.qualityDivider} /> : null}
            <View
              style={[styles.qualityDot, { backgroundColor: theme.colors.primaryFixed }]}
            />
            <View>
              <Text style={styles.qualityLabel}>{q.label.toUpperCase()}</Text>
              <Text variant="labelMd" style={styles.qualityValue}>
                {q.value}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Footer controls */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <Animated.View
          key={tipIndex}
          entering={FadeIn.duration(400)}
          style={styles.tipPill}
        >
          <Lightbulb size={16} color={theme.colors.primaryFixed} />
          <Text variant="labelMd" style={styles.tipText}>
            {TIPS[tipIndex]}
          </Text>
        </Animated.View>

        <View style={styles.captureRow}>
          <GlassButton
            label="Choose from gallery"
            icon={Images}
            large
            onPress={() => showToast('Gallery upload is coming soon.', 'info')}
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Capture photo"
            onPress={() => void handleCapture()}
            disabled={isCapturing}
            style={styles.shutterOuter}
          >
            <View
              style={[
                styles.shutterInner,
                { backgroundColor: theme.colors.primaryFixed },
              ]}
            />
          </Pressable>

          <GlassButton
            label="Flip camera"
            icon={SwitchCamera}
            large
            onPress={() => setFacing((f) => (f === 'front' ? 'back' : 'front'))}
          />
        </View>
      </View>

      <Animated.View pointerEvents="none" style={[styles.flash, flashStyle]} />
    </View>
  );
}

function GlassButton({
  label,
  icon: Icon,
  large,
  onPress,
}: {
  label: string;
  icon: typeof X;
  large?: boolean;
  onPress: () => void;
}): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.glass, large ? styles.glassLarge : styles.glassSmall]}
    >
      <Icon size={large ? 24 : 22} color="#ffffff" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  permission: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  permissionIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  permissionTitle: {
    textAlign: 'center',
  },
  permissionText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  header: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#ffffff',
  },
  glass: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  glassSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  glassLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  qualityBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  qualityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  qualityDivider: {
    width: StyleSheet.hairlineWidth,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginRight: 8,
  },
  qualityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  qualityLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  qualityValue: {
    color: '#ffffff',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  tipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 9999,
    marginBottom: 28,
  },
  tipText: {
    color: '#ffffff',
  },
  captureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  shutterOuter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 4,
    borderColor: '#ffffff',
    padding: 4,
  },
  shutterInner: {
    flex: 1,
    borderRadius: 40,
  },
  flash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
  },
});
