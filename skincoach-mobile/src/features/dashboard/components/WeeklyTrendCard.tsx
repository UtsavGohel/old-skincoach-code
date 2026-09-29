import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { Chart } from '@/components/Chart';
import { Text } from '@/components/Text';
import type { DashboardResponse } from '@/features/dashboard/dashboard.types';

type WeeklyTrendCardProps = {
  trend: DashboardResponse['weeklyTrend'];
};

// Weekly Trend card (home_dashboard) — header with title/subtitle on the left and the
// average score on the right, over the hand-rolled SVG line Chart (docs/03: no heavy
// chart libs, no bounce).
export function WeeklyTrendCard({ trend }: WeeklyTrendCardProps): React.JSX.Element {
  return (
    <Card>
      <View style={styles.header}>
        <View style={styles.headingBlock}>
          <Text variant="headlineMd" color="textPrimary">
            Weekly Trend
          </Text>
          <Text variant="bodyMd" color="textSecondary">
            Your score over the last 7 days
          </Text>
        </View>
        <View style={styles.avgBlock}>
          <Text variant="headlineMd" color="primary">
            {trend.averageScore.toFixed(1)}
          </Text>
          <Text variant="labelSm" color="textSecondary">
            Avg. Score
          </Text>
        </View>
      </View>

      <Chart data={trend.points} />
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headingBlock: {
    flex: 1,
    gap: 2,
  },
  avgBlock: {
    alignItems: 'flex-end',
  },
});
