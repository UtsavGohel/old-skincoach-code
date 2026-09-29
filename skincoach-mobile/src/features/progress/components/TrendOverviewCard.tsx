import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { Chart } from '@/components/Chart';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import {
  TREND_RANGES,
  type ProgressData,
  type TrendRange,
} from '@/features/progress/progress.types';

type TrendOverviewCardProps = {
  trends: ProgressData['trends'];
};

// Trend Overview (progress_trends): a 7D/30D/90D/1Y range selector over the hand-rolled
// line Chart. Selecting a range just swaps the point array (docs/03: no heavy chart libs,
// no bounce).
export function TrendOverviewCard({ trends }: TrendOverviewCardProps): React.JSX.Element {
  const theme = useTheme();
  const [range, setRange] = useState<TrendRange>('30D');

  return (
    <Card>
      <View style={styles.header}>
        <Text variant="headlineMd" color="textPrimary">
          Trend Overview
        </Text>
        <View
          style={[styles.tabs, { backgroundColor: theme.colors.surfaceContainerHigh }]}
        >
          {TREND_RANGES.map((option) => {
            const active = option === range;
            return (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setRange(option)}
                style={[
                  styles.tab,
                  active && { backgroundColor: theme.colors.surfaceContainerLowest },
                ]}
              >
                <Text variant="labelSm" color={active ? 'primary' : 'textSecondary'}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Chart data={trends[range]} />
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 20,
    gap: 16,
  },
  tabs: {
    flexDirection: 'row',
    borderRadius: 9999,
    padding: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 9999,
  },
});
