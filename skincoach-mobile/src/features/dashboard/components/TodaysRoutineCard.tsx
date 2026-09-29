import { Pressable, StyleSheet, View } from 'react-native';
import { Check, ChevronRight } from 'lucide-react-native';

import { Card } from '@/components/Card';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import type { DashboardRoutineItem } from '@/features/dashboard/dashboard.types';

type TodaysRoutineCardProps = {
  items: DashboardRoutineItem[];
  onToggle: (id: string) => void;
  // Opens the Routine tab so the user can set one up (shown in the empty state).
  onSetup?: () => void;
};

// Compact routine summary on Home (home_dashboard) — a header with an "N of M done"
// pill and a tappable checkbox per step (completed rows strike through). The full
// RoutineItem (icons, reminder times, glow) lives on the dedicated Routine tab; this is
// the at-a-glance version. With no routine yet, it shows a prompt instead of a bare
// "0 of 0 done" — never an empty/broken-looking card.
export function TodaysRoutineCard({
  items,
  onToggle,
  onSetup,
}: TodaysRoutineCardProps): React.JSX.Element {
  const theme = useTheme();
  const doneCount = items.filter((item) => item.completed).length;

  if (items.length === 0) {
    return (
      <Card>
        <Text variant="headlineMd" color="textPrimary" style={styles.emptyTitle}>
          Today&apos;s Routine
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Set up your routine"
          onPress={onSetup}
          disabled={!onSetup}
          style={styles.emptyRow}
        >
          <Text variant="bodyMd" color="textSecondary" style={styles.emptyText}>
            You haven&apos;t set up a routine yet. Add your morning and night steps to
            track them here.
          </Text>
          {onSetup ? <ChevronRight size={20} color={theme.colors.primary} /> : null}
        </Pressable>
      </Card>
    );
  }

  return (
    <Card>
      <View style={styles.header}>
        <Text variant="headlineMd" color="textPrimary">
          Today&apos;s Routine
        </Text>
        <View style={[styles.pill, { backgroundColor: theme.colors.secondaryContainer }]}>
          <Text variant="labelSm" color="primary">
            {`${doneCount} of ${items.length} done`}
          </Text>
        </View>
      </View>

      <View style={styles.list}>
        {items.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: item.completed }}
            accessibilityLabel={item.name}
            onPress={() => onToggle(item.id)}
            style={styles.row}
          >
            <View
              style={[
                styles.checkbox,
                item.completed
                  ? {
                      backgroundColor: theme.colors.primaryFixed,
                      borderColor: theme.colors.primaryFixed,
                    }
                  : { borderColor: theme.colors.outlineVariant },
              ]}
            >
              {item.completed ? (
                <Check size={14} color={theme.colors.primary} strokeWidth={3} />
              ) : null}
            </View>
            <Text
              variant="bodyMd"
              color={item.completed ? 'textSecondary' : 'textPrimary'}
              style={item.completed ? styles.doneLabel : undefined}
            >
              {item.name}
            </Text>
          </Pressable>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    marginBottom: 12,
  },
  emptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    flex: 1,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  list: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneLabel: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
});
