import { useEffect } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Defs, Ellipse, Mask, Rect } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';

const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);

const RX = 140;
const RY = 190;

// Face-capture guide (ai_skin_scan mockup): dims the frame everywhere except an
// oval "hole" the user aligns their face into, with a calmly pulsing sage ring. One
// consistent guide style (docs/19: the two scan mockups drift; this is the single
// canonical treatment). Calm ease-in-out pulse, never bounce (docs/03).
export function FaceGuideOverlay(): React.JSX.Element {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const cx = width / 2;
  const cy = height * 0.42;

  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
      -1,
      false,
    );
  }, [pulse]);

  const glowProps = useAnimatedProps(() => ({
    rx: RX + pulse.value * 14,
    ry: RY + pulse.value * 14,
    strokeOpacity: 0.6 * (1 - pulse.value),
  }));

  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <Mask id="faceHole">
          <Rect x={0} y={0} width={width} height={height} fill="#fff" />
          <Ellipse cx={cx} cy={cy} rx={RX} ry={RY} fill="#000" />
        </Mask>
      </Defs>

      {/* Dim everything outside the oval. */}
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="#000000"
        opacity={0.5}
        mask="url(#faceHole)"
      />

      {/* Expanding glow ring. */}
      <AnimatedEllipse
        cx={cx}
        cy={cy}
        fill="none"
        stroke={theme.colors.primaryFixedDim}
        strokeWidth={3}
        animatedProps={glowProps}
      />

      {/* Steady guide ring. */}
      <Ellipse
        cx={cx}
        cy={cy}
        rx={RX}
        ry={RY}
        fill="none"
        stroke={theme.colors.primaryFixed}
        strokeWidth={2}
      />
    </Svg>
  );
}
