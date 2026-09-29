import { Pressable, StyleSheet, View } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';

import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';

type ProUpsellCardProps = {
  onPressUpgrade: () => void;
};

// The four real Pro features from PROJECT_CONTEXT.md — docs/19's audit flagged the mockup
// for inventing "Advanced Ingredient Insights", which isn't on the actual Pro list.
const PRO_FEATURES = [
  'Unlimited AI Skin Scans',
  'Advanced AI',
  'Weekly Reports',
  'Priority Processing',
];

// SkinCoach Pro upsell (profile_achievements) — a premium filled card with the real Pro
// feature list and an upgrade CTA. The subscription/paywall flow itself lands in a later
// phase; this just presents the offer.
export function ProUpsellCard({ onPressUpgrade }: ProUpsellCardProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <View
      style={[styles.card, theme.shadow.card, { backgroundColor: theme.colors.primary }]}
    >
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text variant="headlineMd" color="onPrimary">
            SkinCoach Pro
          </Text>
          <Text variant="bodyMd" color="onPrimary" style={styles.subtitle}>
            Unlock your skin&apos;s full potential.
          </Text>
        </View>
        <View
          style={[styles.premiumBadge, { backgroundColor: theme.colors.primaryFixed }]}
        >
          <Text variant="labelSm" color="onPrimaryFixedVariant">
            PREMIUM
          </Text>
        </View>
      </View>

      <View style={styles.features}>
        {PRO_FEATURES.map((feature) => (
          <View key={feature} style={styles.feature}>
            <CheckCircle2 size={18} color={theme.colors.primaryFixedDim} />
            <Text variant="bodyMd" color="onPrimary">
              {feature}
            </Text>
          </View>
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Upgrade to SkinCoach Pro"
        onPress={onPressUpgrade}
        style={[styles.cta, { backgroundColor: theme.colors.onPrimary }]}
      >
        <Text variant="labelMd" color="primary">
          Upgrade to Pro
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 24,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  subtitle: {
    opacity: 0.9,
  },
  premiumBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  features: {
    gap: 12,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cta: {
    height: 48,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
