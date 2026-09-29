import { StyleSheet, View } from 'react-native';
import { Moon, Sunrise } from 'lucide-react-native';

import { Card } from '@/components/Card';
import { RoutineItem } from '@/components/RoutineItem';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import { ROUTINE_ICON } from '@/features/routine/routine.meta';
import type { RoutineSectionData, RoutineStep } from '@/features/routine/routine.types';

type RoutineSectionProps = {
  section: RoutineSectionData;
  // Resolves each step's live completed state (query data + local check-off overrides).
  isCompleted: (step: RoutineStep) => boolean;
  onToggle: (id: string) => void;
};

const SECTION_META = {
  morning: { title: 'Morning Routine', icon: Sunrise },
  night: { title: 'Night Routine', icon: Moon },
} as const;

// A Morning/Night routine card (my_routine_tracker): header with a time-of-day icon,
// title, and an "N/M Done" pill, then the day's steps rendered with the shared
// RoutineItem (icon, reminder time, and the check-animation + glow + strike-through
// completed treatments per docs/03).
export function RoutineSection({
  section,
  isCompleted,
  onToggle,
}: RoutineSectionProps): React.JSX.Element {
  const theme = useTheme();
  const { title, icon: SectionIcon } = SECTION_META[section.timeOfDay];
  const doneCount = section.steps.filter((step) => isCompleted(step)).length;
  const total = section.steps.length;
  const allDone = doneCount === total;

  return (
    <Card>
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <SectionIcon size={22} color={theme.colors.primary} strokeWidth={1.75} />
          <Text variant="headlineMd" color="textPrimary">
            {title}
          </Text>
        </View>
        <View
          style={[
            styles.pill,
            {
              backgroundColor: allDone
                ? theme.colors.secondaryContainer
                : theme.colors.surfaceVariant,
            },
          ]}
        >
          <Text variant="labelSm" color={allDone ? 'primary' : 'textSecondary'}>
            {`${doneCount}/${total} Done`}
          </Text>
        </View>
      </View>

      <View style={styles.list}>
        {section.steps.map((step) => (
          <RoutineItem
            key={step.id}
            productName={step.productName}
            productIcon={ROUTINE_ICON[step.icon]}
            reminderTime={step.reminderTime}
            notes={step.productDetail}
            completed={isCompleted(step)}
            onToggle={() => onToggle(step.id)}
          />
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
    marginBottom: 8,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  list: {
    gap: 4,
  },
});
