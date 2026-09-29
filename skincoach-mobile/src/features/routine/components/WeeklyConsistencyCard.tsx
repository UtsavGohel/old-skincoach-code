import { StyleSheet, View } from 'react-native';
import { Check, X } from 'lucide-react-native';

import { Card } from '@/components/Card';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import type { WeeklyConsistencyDay } from '@/features/routine/routine.types';

type WeeklyConsistencyCardProps = {
  percent: number;
  days: WeeklyConsistencyDay[];
};

// Weekly Consistency card (my_routine_tracker) — a header with the week's percentage and
// a strip of day circles: completed days filled with a check, today a dashed ring, missed
// days marked, and upcoming days faint.
export function WeeklyConsistencyCard({
  percent,
  days,
}: WeeklyConsistencyCardProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <Card>
      <View style={styles.header}>
        <Text variant="labelMd" color="textSecondary">
          Weekly Consistency
        </Text>
        <Text variant="headlineMd" color="primary">
          {`${percent}%`}
        </Text>
      </View>
      <View style={styles.strip}>
        {days.map((day, index) => {
          const isToday = day.status === 'today';
          const isComplete = day.status === 'complete';
          const isMissed = day.status === 'missed';
          return (
            <View key={`${day.label}-${index}`} style={styles.dayColumn}>
              <Text
                variant="labelSm"
                color={isToday ? 'primary' : 'textSecondary'}
                style={isToday ? undefined : styles.dayLabelFaint}
              >
                {day.label}
              </Text>
              <View
                style={[
                  styles.circle,
                  isComplete && { backgroundColor: theme.colors.secondaryContainer },
                  isMissed && { backgroundColor: theme.colors.errorContainer },
                  isToday && {
                    borderWidth: 2,
                    borderColor: theme.colors.primary,
                    borderStyle: 'dashed',
                  },
                  day.status === 'upcoming' && {
                    backgroundColor: theme.colors.surfaceContainer,
                    opacity: 0.5,
                  },
                ]}
              >
                {isComplete ? (
                  <Check size={16} color={theme.colors.primary} strokeWidth={3} />
                ) : null}
                {isMissed ? (
                  <X size={16} color={theme.colors.error} strokeWidth={3} />
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  strip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: {
    alignItems: 'center',
    gap: 8,
  },
  dayLabelFaint: {
    opacity: 0.6,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
