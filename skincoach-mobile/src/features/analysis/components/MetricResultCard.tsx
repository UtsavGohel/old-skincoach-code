import { StyleSheet, View } from 'react-native';
import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react-native';

import { Card } from '@/components/Card';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import { METRIC_META } from '@/features/analysis/metrics';
import type { MetricDetail } from '@/features/analysis/analysis.types';

type MetricResultCardProps = {
  detail: MetricDetail;
};

const CHANGE_ICON = {
  up: ArrowUp,
  down: ArrowDown,
  flat: ArrowRight,
} as const;

// One metric tile on the Results screen (ai_skin_analysis_results): icon + name, the
// qualitative status, and the change vs. the previous scan (arrow reflects score
// direction; colour reflects whether that change is good — `positive`).
export function MetricResultCard({ detail }: MetricResultCardProps): React.JSX.Element {
  const theme = useTheme();
  const { label, icon: Icon } = METRIC_META[detail.key];
  const ChangeIcon = CHANGE_ICON[detail.changeDirection];
  const changeColor =
    detail.changeDirection === 'flat'
      ? theme.colors.textSecondary
      : detail.positive
        ? theme.colors.success
        : theme.colors.warning;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View
          style={[styles.iconTile, { backgroundColor: theme.colors.secondaryContainer }]}
        >
          <Icon size={18} color={theme.colors.primary} strokeWidth={1.75} />
        </View>
        <Text
          variant="labelMd"
          color="textSecondary"
          numberOfLines={1}
          style={styles.label}
        >
          {label}
        </Text>
      </View>

      <Text variant="headlineMd" color="textPrimary" style={styles.status}>
        {detail.status}
      </Text>

      <View style={styles.change}>
        <ChangeIcon size={14} color={changeColor} />
        <Text variant="labelSm" style={{ color: changeColor }}>
          {detail.changeLabel}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconTile: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
  },
  status: {
    fontSize: 20,
  },
  change: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
