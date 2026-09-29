import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import type { ComparisonRow } from '@/features/subscription/subscription.content';

type ComparisonTableProps = {
  rows: ComparisonRow[];
};

// Free vs Pro comparison (docs/10 Feature Access Matrix) — a three-column table with the
// Pro column emphasised in the sage palette.
export function ComparisonTable({ rows }: ComparisonTableProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <Card style={styles.card}>
      <View style={[styles.row, styles.headerRow]}>
        <Text variant="labelMd" color="textSecondary" style={styles.featureCol}>
          Feature
        </Text>
        <Text variant="labelMd" color="textSecondary" style={styles.valueCol}>
          Free
        </Text>
        <Text variant="labelMd" color="primary" style={styles.valueCol}>
          Pro
        </Text>
      </View>

      {rows.map((row, index) => (
        <View
          key={row.feature}
          style={[
            styles.row,
            index < rows.length - 1 && {
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.outlineVariant,
            },
          ]}
        >
          <Text variant="bodyMd" color="textPrimary" style={styles.featureCol}>
            {row.feature}
          </Text>
          <Text variant="labelMd" color="textSecondary" style={styles.valueCol}>
            {row.free}
          </Text>
          <Text
            variant="labelMd"
            color="primary"
            style={[styles.valueCol, styles.proValue]}
          >
            {row.pro}
          </Text>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  headerRow: {
    paddingBottom: 12,
  },
  featureCol: {
    flex: 1.4,
  },
  valueCol: {
    flex: 1,
    textAlign: 'center',
  },
  proValue: {
    fontWeight: '700',
  },
});
