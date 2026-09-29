import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { runOnJS } from 'react-native-reanimated';

import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';

export type ChartPoint = { label: string; value: number };

export type ChartProps = {
  data: ChartPoint[];
  height?: number;
};

const PADDING_Y = 12;

// docs/03 Line Chart: smooth curves, gradient fill, minimal labels, touch + tooltip.
// docs/19/docs/03: avoid pie/bar charts and heavy chart libraries — hand-rolled SVG.
export function Chart({ data, height = 160 }: ChartProps): React.JSX.Element {
  const theme = useTheme();
  const [width, setWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const onLayout = useCallback((e: { nativeEvent: { layout: { width: number } } }) => {
    setWidth(e.nativeEvent.layout.width);
  }, []);

  const values = data.map((d) => d.value);
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 0;
  // A single point (or all-equal values) has no vertical range — draw a centered flat
  // line instead of an invisible dot, so the chart never looks blank/broken.
  const flat = max === min;
  const range = max - min || 1;
  const yFor = (v: number): number =>
    flat ? height / 2 : PADDING_Y + (1 - (v - min) / range) * (height - PADDING_Y * 2);

  // With <2 points, span a flat line across the full width so there's always a visible
  // trend line (a lone dot draws nothing). ≥2 points render the real curve.
  const points =
    data.length >= 2
      ? data.map((d, i) => ({ x: (i / (data.length - 1)) * width, y: yFor(d.value) }))
      : [
          { x: 0, y: yFor(values[0] ?? 0) },
          { x: width, y: yFor(values[0] ?? 0) },
        ];

  const linePath = smoothPath(points);
  const areaPath = `${linePath} L${points[points.length - 1]?.x ?? 0},${height} L${points[0]?.x ?? 0},${height} Z`;

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (width === 0 || data.length < 2) return;
      const ratio = Math.min(1, Math.max(0, e.x / width));
      const index = Math.round(ratio * (data.length - 1));
      runOnJS(setActiveIndex)(index);
    })
    .onEnd(() => {
      runOnJS(setActiveIndex)(null);
    });

  const active =
    activeIndex !== null ? { point: points[activeIndex], data: data[activeIndex] } : null;

  return (
    <View onLayout={onLayout}>
      <GestureDetector gesture={pan}>
        <View style={{ height }}>
          {width > 0 ? (
            <Svg width={width} height={height}>
              <Defs>
                <LinearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={theme.colors.primary} stopOpacity={0.2} />
                  <Stop offset="1" stopColor={theme.colors.primary} stopOpacity={0} />
                </LinearGradient>
              </Defs>
              <Path d={areaPath} fill="url(#chartFill)" />
              <Path
                d={linePath}
                stroke={theme.colors.primary}
                strokeWidth={3}
                strokeLinecap="round"
                fill="none"
              />
              {active ? (
                <Circle
                  cx={active.point?.x}
                  cy={active.point?.y}
                  r={6}
                  fill={theme.colors.primary}
                />
              ) : null}
            </Svg>
          ) : null}
          {active?.data ? (
            <View
              style={[styles.tooltip, { backgroundColor: theme.colors.inverseSurface }]}
              pointerEvents="none"
            >
              <Text variant="labelSm" color="inverseOnSurface">
                {active.data.label}: {active.data.value}
              </Text>
            </View>
          ) : null}
        </View>
      </GestureDetector>
      <View style={styles.labelsRow}>
        {data.map((d, i) => (
          <Text
            key={`${d.label}-${i}`}
            variant="labelSm"
            color="textSecondary"
            style={styles.axisLabel}
          >
            {shouldShowLabel(i, data.length) ? d.label : ''}
          </Text>
        ))}
      </View>
    </View>
  );
}

function shouldShowLabel(index: number, total: number): boolean {
  if (total <= 7) return true;
  const step = Math.ceil(total / 7);
  return index % step === 0;
}

// Catmull-Rom-ish smoothing via quadratic midpoints — calm curves, no external dep.
function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) {
    const p = points[0];
    return p ? `M${p.x},${p.y}` : '';
  }
  const first = points[0];
  if (!first) return '';
  let d = `M${first.x},${first.y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    if (!curr || !next) continue;
    const midX = (curr.x + next.x) / 2;
    const midY = (curr.y + next.y) / 2;
    d += ` Q${curr.x},${curr.y} ${midX},${midY}`;
  }
  const last = points[points.length - 1];
  if (last) {
    d += ` T${last.x},${last.y}`;
  }
  return d;
}

const styles = StyleSheet.create({
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  axisLabel: {
    flex: 1,
    textAlign: 'center',
  },
  tooltip: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
});
