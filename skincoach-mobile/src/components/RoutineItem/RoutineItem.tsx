import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Check } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import type { IconComponent } from '@/types/icon';

export type RoutineItemProps = {
  productName: string;
  productIcon: IconComponent;
  reminderTime?: string;
  notes?: string;
  completed: boolean;
  onToggle: () => void;
};

// docs/03 Routine Item: checkbox, product icon/name, reminder time, optional notes,
// completed state = check animation + glow + strike-through. docs/19's audit found
// the mockup only implements a bare checkmark toggle — all three are built here.
export function RoutineItem({
  productName,
  productIcon: ProductIcon,
  reminderTime,
  notes,
  completed,
  onToggle,
}: RoutineItemProps): React.JSX.Element {
  const theme = useTheme();
  const glow = useSharedValue(0);
  const checkScale = useSharedValue(completed ? 1 : 0);

  useEffect(() => {
    if (completed) {
      checkScale.value = withSequence(
        withTiming(1.2, { duration: theme.duration.fast, easing: theme.easing.enter }),
        withTiming(1, { duration: theme.duration.fast, easing: theme.easing.standard }),
      );
      glow.value = withSequence(
        withTiming(1, { duration: theme.duration.base }),
        withTiming(0, { duration: theme.duration.slow }),
      );
    } else {
      checkScale.value = withTiming(0, { duration: theme.duration.fast });
    }
  }, [completed, checkScale, glow, theme]);

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value * 0.4,
  }));

  const handlePress = () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onToggle();
  };

  return (
    <View style={{ position: 'relative' }}>
      <Animated.View
        pointerEvents="none"
        style={[
          glowStyle,
          {
            position: 'absolute',
            inset: -4,
            backgroundColor: theme.colors.success,
            borderRadius: theme.radius.smallComponent,
          },
        ]}
      />
      <Pressable
        onPress={handlePress}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: completed }}
        accessibilityLabel={`${productName}${reminderTime ? `, ${reminderTime}` : ''}`}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          minHeight: 44,
        }}
      >
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: theme.radius.smallComponent / 2,
            borderWidth: 2,
            borderColor: completed ? theme.colors.primary : theme.colors.outlineVariant,
            backgroundColor: completed ? theme.colors.primaryFixed : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Animated.View style={checkStyle}>
            <Check size={16} color={theme.colors.onPrimaryFixedVariant} />
          </Animated.View>
        </View>
        <ProductIcon size={20} color={theme.colors.textSecondary} />
        <View style={{ flex: 1 }}>
          <Text
            variant="bodyMd"
            color={completed ? 'textSecondary' : 'textPrimary'}
            style={completed ? { textDecorationLine: 'line-through' } : undefined}
          >
            {productName}
          </Text>
          {notes ? (
            <Text variant="labelSm" color="textSecondary">
              {notes}
            </Text>
          ) : null}
        </View>
        {reminderTime ? (
          <Text variant="labelSm" color="textSecondary">
            {reminderTime}
          </Text>
        ) : null}
      </Pressable>
    </View>
  );
}
