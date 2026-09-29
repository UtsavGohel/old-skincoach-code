import { ArrowDown, ArrowUp } from 'lucide-react-native';
import { View } from 'react-native';

import { Card } from '@/components/Card';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import type { IconComponent } from '@/types/icon';

export type StatisticCardProps = {
  icon: IconComponent;
  metric: string;
  value: string;
  trendDirection?: 'up' | 'down';
  trendLabel?: string; // e.g. "Better", "Excellent"
  trendIsPositive?: boolean;
};

// docs/03 Statistic Card: icon + metric + value + trend (e.g. "Acne ↓ Better",
// "Hydration ↑ Excellent") — distinct from MetricCard's compact grid tile.
export function StatisticCard({
  icon: Icon,
  metric,
  value,
  trendDirection,
  trendLabel,
  trendIsPositive = true,
}: StatisticCardProps): React.JSX.Element {
  const theme = useTheme();
  const TrendIcon = trendDirection === 'down' ? ArrowDown : ArrowUp;
  const trendColor = trendIsPositive ? theme.colors.success : theme.colors.warning;

  return (
    <Card style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: theme.radius.smallComponent,
          backgroundColor: theme.colors.secondaryContainer,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={20} color={theme.colors.onSecondaryContainer} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="labelMd" color="textSecondary">
          {metric}
        </Text>
        <Text variant="headlineMd" color="textPrimary">
          {value}
        </Text>
      </View>
      {trendDirection ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <TrendIcon size={16} color={trendColor} />
          {trendLabel ? (
            <Text variant="labelMd" style={{ color: trendColor }}>
              {trendLabel}
            </Text>
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}
