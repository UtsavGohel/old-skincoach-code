import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import type { PlanContent } from '@/features/subscription/subscription.content';

type PricingCardProps = {
  plan: PlanContent;
  selected: boolean;
  onSelect: () => void;
};

// A selectable pricing option (docs/10 Pricing Cards) — the yearly plan is highlighted
// with a "Save 33%" badge and sage border (docs/10: "Yearly plan should always be
// highlighted"). A radio dot shows the current selection.
export function PricingCard({
  plan,
  selected,
  onSelect,
}: PricingCardProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${plan.label} plan, ${plan.price} ${plan.cadence}`}
      onPress={onSelect}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surfaceContainerLowest,
          borderColor: selected ? theme.colors.primary : theme.colors.outlineVariant,
          borderWidth: selected ? 2 : 1,
        },
      ]}
    >
      {plan.savingsBadge ? (
        <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
          <Text variant="labelSm" color="onPrimary">
            {plan.savingsBadge}
          </Text>
        </View>
      ) : null}

      <View style={styles.left}>
        <View
          style={[
            styles.radio,
            {
              borderColor: selected ? theme.colors.primary : theme.colors.outlineVariant,
            },
          ]}
        >
          {selected ? (
            <View style={[styles.radioDot, { backgroundColor: theme.colors.primary }]} />
          ) : null}
        </View>
        <View style={styles.labelGroup}>
          <Text variant="bodyMd" color="textPrimary" style={styles.label}>
            {plan.label}
          </Text>
          {plan.subtext ? (
            <Text variant="labelSm" color="textSecondary">
              {plan.subtext}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.priceGroup}>
        <Text variant="headlineMd" color="primary">
          {plan.price}
        </Text>
        <Text variant="labelSm" color="textSecondary">
          {plan.cadence}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 20,
    padding: 20,
  },
  badge: {
    position: 'absolute',
    top: -10,
    right: 16,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 9999,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 9999,
  },
  labelGroup: {
    gap: 2,
    flexShrink: 1,
  },
  label: {
    fontWeight: '600',
  },
  priceGroup: {
    alignItems: 'flex-end',
  },
});
