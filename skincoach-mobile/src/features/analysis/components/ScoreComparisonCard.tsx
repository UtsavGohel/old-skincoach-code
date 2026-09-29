import { StyleSheet, View } from 'react-native';
import { TrendingUp } from 'lucide-react-native';

import { Card } from '@/components/Card';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';

type ScoreComparisonCardProps = {
  previousScore: number;
  currentScore: number;
  summary: string;
  previousLabel?: string;
  currentLabel?: string;
};

// Two-score comparison with a trend arrow between them and an encouraging summary line.
// Used for Yesterday→Today (Results) and Last→Curr month (Progress) — labels are
// overridable.
export function ScoreComparisonCard({
  previousScore,
  currentScore,
  summary,
  previousLabel = 'Yesterday',
  currentLabel = 'Today',
}: ScoreComparisonCardProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={styles.column}>
          <Text variant="labelSm" color="textSecondary" style={styles.columnLabel}>
            {previousLabel}
          </Text>
          <Text variant="headlineLgMobile" color="textSecondary">
            {previousScore}
          </Text>
        </View>

        <View
          style={[styles.arrow, { backgroundColor: theme.colors.secondaryContainer }]}
        >
          <TrendingUp size={20} color={theme.colors.primary} />
        </View>

        <View style={styles.column}>
          <Text variant="labelSm" color="textSecondary" style={styles.columnLabel}>
            {currentLabel}
          </Text>
          <Text variant="headlineLgMobile" color="primary">
            {currentScore}
          </Text>
        </View>
      </View>

      <Text variant="bodyMd" color="textSecondary" style={styles.summary}>
        {summary}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  column: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  columnLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  arrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: {
    textAlign: 'center',
  },
});
