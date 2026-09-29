import { memo, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';

type AgeWheelPickerProps = {
  value: number;
  min: number;
  max: number;
  onChange: (age: number) => void;
};

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const PADDING = (CONTAINER_HEIGHT - ITEM_HEIGHT) / 2;

// Vertical snap wheel for age (Step 1). The centered value scales up and turns sage;
// neighbours fade and shrink, with a soft top/bottom mask — the mockup's masked
// `wheel-picker`. Perf: each row's scale/opacity is a cheap transform worklet driven off
// the shared scroll offset; the centre colour is switched via a memoized active-index
// reaction rather than a per-frame interpolateColor on every row (which caused jank).
export function AgeWheelPicker({
  value,
  min,
  max,
  onChange,
}: AgeWheelPickerProps): React.JSX.Element {
  const theme = useTheme();
  const scrollRef = useRef<Animated.ScrollView>(null);
  const scrollY = useSharedValue((value - min) * ITEM_HEIGHT);
  const ages = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const [activeIndex, setActiveIndex] = useState(value - min);

  // Land the current value in the centre on mount without animating.
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: (value - min) * ITEM_HEIGHT, animated: false });
    // Only on mount — subsequent value changes come from the user's own scrolling.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  // Only fires when the centred row actually changes (a handful of times per scroll),
  // so recolouring costs two memoized re-renders, not 78 every frame.
  useAnimatedReaction(
    () => Math.round(scrollY.value / ITEM_HEIGHT),
    (index, previous) => {
      if (index !== previous) runOnJS(setActiveIndex)(index);
    },
  );

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
    const index = Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    const nextAge = Math.min(Math.max(min + index, min), max);
    if (nextAge !== value) onChange(nextAge);
  };

  return (
    <View style={styles.wrapper}>
      <Animated.ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        onMomentumScrollEnd={handleMomentumEnd}
        contentContainerStyle={{ paddingVertical: PADDING }}
      >
        {ages.map((age, index) => (
          <AgeRow
            key={age}
            age={age}
            index={index}
            scrollY={scrollY}
            active={index === activeIndex}
          />
        ))}
      </Animated.ScrollView>

      {/* Centre indicator lines. */}
      <View
        pointerEvents="none"
        style={[styles.indicator, { borderColor: theme.colors.primaryFixedDim }]}
      />

      {/* Top/bottom fade mask over the background. */}
      <LinearGradient
        pointerEvents="none"
        colors={[theme.colors.background, `${theme.colors.background}00`]}
        style={[styles.mask, styles.maskTop]}
      />
      <LinearGradient
        pointerEvents="none"
        colors={[`${theme.colors.background}00`, theme.colors.background]}
        style={[styles.mask, styles.maskBottom]}
      />
    </View>
  );
}

type AgeRowProps = {
  age: number;
  index: number;
  scrollY: SharedValue<number>;
  active: boolean;
};

// Memoized so an active-index change only re-renders the two rows whose `active` flipped,
// not the whole list.
const AgeRow = memo(function AgeRow({
  age,
  index,
  scrollY,
  active,
}: AgeRowProps): React.JSX.Element {
  const theme = useTheme();
  const center = index * ITEM_HEIGHT;

  const animatedStyle = useAnimatedStyle(() => {
    const distance = Math.abs(scrollY.value - center);
    const scale = interpolate(
      distance,
      [0, ITEM_HEIGHT, ITEM_HEIGHT * 2],
      [1.25, 1, 0.85],
      Extrapolation.CLAMP,
    );
    const opacity = interpolate(
      distance,
      [0, ITEM_HEIGHT, ITEM_HEIGHT * 2],
      [1, 0.5, 0.2],
      Extrapolation.CLAMP,
    );
    return { opacity, transform: [{ scale }] };
  });

  return (
    <View style={styles.row}>
      <Animated.Text
        style={[
          theme.typography.headlineMd,
          { color: active ? theme.colors.primary : theme.colors.onSurfaceVariant },
          animatedStyle,
        ]}
      >
        {age}
      </Animated.Text>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    height: CONTAINER_HEIGHT,
    width: '100%',
    overflow: 'hidden',
  },
  row: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: PADDING,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  mask: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: PADDING,
  },
  maskTop: {
    top: 0,
  },
  maskBottom: {
    bottom: 0,
  },
});
