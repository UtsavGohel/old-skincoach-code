import { Pressable, StyleSheet, View } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';

import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import type { IconComponent } from '@/types/icon';

type SelectionCardProps = {
  label: string;
  icon: IconComponent;
  selected: boolean;
  onPress: () => void;
};

// Icon + label card used for the skin-type grid (Step 2). Selected state swaps to a
// soft mint fill, a sage border, and a filled check badge in the top-right corner
// (mockup's `group-[.selected]` treatment). White card + ambient shadow otherwise,
// per DESIGN.md's floating-card spec.
export function SelectionCard({
  label,
  icon: Icon,
  selected,
  onPress,
}: SelectionCardProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.card,
        theme.shadow.card,
        {
          backgroundColor: selected
            ? theme.colors.secondaryContainer
            : theme.colors.surfaceContainerLowest,
          borderColor: selected ? theme.colors.primary : 'transparent',
        },
      ]}
    >
      {selected ? (
        <View style={styles.checkBadge}>
          <CheckCircle2
            size={20}
            color={theme.colors.primary}
            fill={theme.colors.primaryFixed}
          />
        </View>
      ) : null}
      <Icon size={32} color={theme.colors.primary} strokeWidth={1.75} />
      <Text variant="labelMd" color="textPrimary" style={styles.label}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 2,
    gap: 12,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  label: {
    textAlign: 'center',
  },
});
