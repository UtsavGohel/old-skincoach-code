import { ScrollView, StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import type { CoachStatTone, CoachWeeklySummary } from '@/features/coach/coach.types';

type CoachSummaryCardProps = {
  summary: CoachWeeklySummary;
};

// Weekly Summary card (ai_skin_coach) — an "Updated Today" badge, a short recap, and a
// row of mini stat circles (Score / Hydration / Day Streak). The mockup uses a
// glassmorphism surface; on native we use the standard Card shell with the same content.
export function CoachSummaryCard({ summary }: CoachSummaryCardProps): React.JSX.Element {
  const theme = useTheme();

  const ringColor = (tone: CoachStatTone): string => {
    if (tone === 'primary') return theme.colors.primary;
    if (tone === 'secondary') return theme.colors.secondaryContainer;
    return theme.colors.primaryFixedDim;
  };

  return (
    <Card>
      <View style={styles.header}>
        <Text variant="headlineMd" color="primary">
          Weekly Summary
        </Text>
        <View
          style={[styles.badge, { backgroundColor: theme.colors.secondaryContainer }]}
        >
          <Text variant="labelSm" color="primary">
            {summary.badge}
          </Text>
        </View>
      </View>

      <Text variant="bodyMd" color="textSecondary" style={styles.recap}>
        {summary.message}
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.stats}
      >
        {summary.stats.map((stat) => (
          <View key={stat.label} style={styles.stat}>
            <View style={[styles.ring, { borderColor: ringColor(stat.tone) }]}>
              <Text variant="labelMd" color="textPrimary">
                {stat.value}
              </Text>
            </View>
            <Text variant="labelSm" color="textSecondary">
              {stat.label}
            </Text>
          </View>
        ))}
      </ScrollView>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  recap: {
    lineHeight: 24,
    marginBottom: 16,
  },
  stats: {
    gap: 20,
    paddingRight: 4,
  },
  stat: {
    alignItems: 'center',
    gap: 6,
  },
  ring: {
    width: 56,
    height: 56,
    borderRadius: 9999,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
