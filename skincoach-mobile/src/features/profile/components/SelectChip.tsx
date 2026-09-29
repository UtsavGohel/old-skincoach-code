import { Pressable, StyleSheet } from 'react-native';

import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';

type SelectChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

// Pill-shaped selectable chip used for gender (Step 1) and primary goal (Step 2).
// Selected = filled sage; unselected = white with a soft outline (mockup's chip
// states). Matches DESIGN.md's "small, pill-shaped tags" chip spec.
export function SelectChip({
  label,
  selected,
  onPress,
}: SelectChipProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected
            ? theme.colors.primary
            : theme.colors.surfaceContainerLowest,
          borderColor: selected ? theme.colors.primary : theme.colors.outlineVariant,
        },
      ]}
    >
      <Text variant="labelMd" color={selected ? 'onPrimary' : 'textSecondary'}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 9999,
    borderWidth: 1,
  },
});
