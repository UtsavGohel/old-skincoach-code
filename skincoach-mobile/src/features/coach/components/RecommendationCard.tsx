import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import { RECOMMENDATION_ICON } from '@/features/coach/coach.meta';
import type {
  CoachRecommendation,
  RecommendationImpact,
} from '@/features/coach/coach.types';

type RecommendationCardProps = {
  recommendation: CoachRecommendation;
};

const IMPACT_LABEL: Record<RecommendationImpact, string> = {
  high: 'High Impact',
  medium: 'Medium Impact',
  low: 'Low Impact',
};

// A Recommended Action card (ai_skin_coach) — an icon tile, the action title with an
// impact tag, and a short "why". High-impact items get an emphasis (error-container)
// badge; medium/low are neutral, matching the mockup.
export function RecommendationCard({
  recommendation,
}: RecommendationCardProps): React.JSX.Element {
  const theme = useTheme();
  const Icon = RECOMMENDATION_ICON[recommendation.icon];
  const isHigh = recommendation.impact === 'high';

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View
          style={[styles.iconTile, { backgroundColor: theme.colors.secondaryContainer }]}
        >
          <Icon size={22} color={theme.colors.primary} strokeWidth={1.75} />
        </View>
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text variant="bodyMd" color="primary" style={styles.title}>
              {recommendation.title}
            </Text>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: isHigh
                    ? theme.colors.errorContainer
                    : theme.colors.surfaceContainerHigh,
                },
              ]}
            >
              <Text variant="labelSm" color={isHigh ? 'error' : 'textSecondary'}>
                {IMPACT_LABEL[recommendation.impact]}
              </Text>
            </View>
          </View>
          <Text variant="labelMd" color="textSecondary">
            {recommendation.description}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  iconTile: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  title: {
    fontWeight: '600',
    flexShrink: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
});
