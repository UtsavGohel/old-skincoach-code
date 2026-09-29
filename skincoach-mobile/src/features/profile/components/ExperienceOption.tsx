import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import type { IconComponent } from '@/types/icon';

type ExperienceOptionProps = {
  label: string;
  description: string;
  icon: IconComponent;
  selected: boolean;
  onPress: () => void;
};

// Full-width level row (Step 2 experience): rounded icon tile, title + description, and
// a trailing radio dot that fills when selected (mockup's `level-card`). Selected row
// gets a mint fill + sage border like the other selectable surfaces.
export function ExperienceOption({
  label,
  description,
  icon: Icon,
  selected,
  onPress,
}: ExperienceOptionProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.row,
        theme.shadow.card,
        {
          backgroundColor: selected
            ? theme.colors.secondaryContainer
            : theme.colors.surfaceContainerLowest,
          borderColor: selected ? theme.colors.primary : 'transparent',
        },
      ]}
    >
      <View
        style={[styles.iconTile, { backgroundColor: theme.colors.secondaryContainer }]}
      >
        <Icon size={24} color={theme.colors.primary} strokeWidth={1.75} />
      </View>

      <View style={styles.textBlock}>
        <Text variant="labelMd" color="textPrimary">
          {label}
        </Text>
        <Text variant="bodyMd" color="textSecondary">
          {description}
        </Text>
      </View>

      <View
        style={[
          styles.radioOuter,
          {
            borderColor: selected ? theme.colors.primary : theme.colors.outlineVariant,
            backgroundColor: selected ? theme.colors.primary : 'transparent',
          },
        ]}
      >
        {selected ? (
          <View
            style={[styles.radioInner, { backgroundColor: theme.colors.onPrimary }]}
          />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    gap: 20,
  },
  iconTile: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
