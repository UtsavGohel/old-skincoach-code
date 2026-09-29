import { StyleSheet, View } from 'react-native';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react-native';

import { Card } from '@/components/Card';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import { METRIC_META } from '@/features/analysis/metrics';
import type { MetricTrend } from '@/features/progress/progress.types';

type MetricTrendCardProps = {
  trend: MetricTrend;
};

// Compact metric trend tile on Progress (progress_trends): icon + name, a status word, and
// a directional arrow coloured by whether the move is good (`positive`). No bounce
// animation on the arrow (docs/03 / docs/19 deviation).
export function MetricTrendCard({ trend }: MetricTrendCardProps): React.JSX.Element {
  const theme = useTheme();
  const { label, icon: Icon } = METRIC_META[trend.key];
  const ArrowIcon = trend.direction === 'up' ? ArrowUpRight : ArrowDownRight;
  const color = trend.positive ? theme.colors.success : theme.colors.warning;

  return (
    <Card style={styles.card}>
      <View style={styles.topRow}>
        <View
          style={[styles.iconTile, { backgroundColor: theme.colors.secondaryContainer }]}
        >
          <Icon size={16} color={theme.colors.primary} strokeWidth={1.75} />
        </View>
        <ArrowIcon size={16} color={color} />
      </View>
      {/* Name + status each get the card's full width, so they never truncate. */}
      <Text variant="labelMd" color="textSecondary" numberOfLines={1}>
        {label}
      </Text>
      <Text variant="bodyMd" color="textPrimary" numberOfLines={1} style={styles.status}>
        {trend.status}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  iconTile: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  status: {
    fontWeight: '600',
  },
});
