import { StyleSheet } from 'react-native';

import { Card } from '@/components/Card';
import { ProgressRing } from '@/components/ProgressRing';
import { Text } from '@/components/Text';

type RoutineProgressCardProps = {
  completed: number;
  total: number;
};

// Hero card on the Routine tab (my_routine_tracker) — a completion ring showing the
// "X / Y COMPLETED" fraction with an encouragement line beneath. The ring reuses the
// shared ProgressRing (centerValue override shows the fraction, not the percent).
export function RoutineProgressCard({
  completed,
  total,
}: RoutineProgressCardProps): React.JSX.Element {
  const progress = total > 0 ? (completed / total) * 100 : 0;
  const allDone = completed >= total && total > 0;
  const message = allDone
    ? 'All done for today.\nYour skin thanks you.'
    : "You're almost there!\nFinish your remaining steps.";

  return (
    <Card variant="hero" style={styles.card}>
      <ProgressRing
        progress={progress}
        centerValue={`${completed} / ${total}`}
        label="Completed"
      />
      <Text variant="bodyMd" color="textPrimary" style={styles.message}>
        {message}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
  },
  message: {
    marginTop: 24,
    textAlign: 'center',
  },
});
