import { ArrowDown, ArrowUp } from 'lucide-react-native';

import { Card } from '@/components/Card';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/theme';

export type MetricTrend = 'up' | 'down' | 'flat';

export type MetricCardProps = {
  label: string;
  value: string;
  trend?: MetricTrend;
  /** Whether an "up" trend is good news for this metric (e.g. Hydration) or bad
   * news (e.g. Acne) — determines whether the trend renders as success or warning. */
  upIsGood?: boolean;
};

// docs/03 Metric Card: small cards for per-metric values (Hydration, Acne, Texture,
// Redness, Pigmentation, etc. — all 9 required metrics per docs/06/docs/16).
export function MetricCard({
  label,
  value,
  trend = 'flat',
  upIsGood = true,
}: MetricCardProps): React.JSX.Element {
  const theme = useTheme();
  const trendColor = getTrendColor(theme.colors, trend, upIsGood);

  return (
    <Card style={{ flex: 1, alignItems: 'center', gap: 4 }}>
      <Text
        variant="labelSm"
        color="textSecondary"
        style={{ textTransform: 'uppercase' }}
        numberOfLines={1}
      >
        {label}
      </Text>
      <Text variant="headlineMd" color="textPrimary">
        {value}
      </Text>
      {trend !== 'flat' ? <TrendIcon trend={trend} color={trendColor} /> : null}
    </Card>
  );
}

function TrendIcon({
  trend,
  color,
}: {
  trend: MetricTrend;
  color: string;
}): React.JSX.Element {
  const Icon = trend === 'up' ? ArrowUp : ArrowDown;
  return <Icon size={16} color={color} />;
}

function getTrendColor(
  colors: ColorScheme,
  trend: MetricTrend,
  upIsGood: boolean,
): string {
  if (trend === 'flat') return colors.textSecondary;
  const isPositive = trend === 'up' ? upIsGood : !upIsGood;
  return isPositive ? colors.success : colors.warning;
}
