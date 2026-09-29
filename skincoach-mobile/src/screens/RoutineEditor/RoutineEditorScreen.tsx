import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Clock, Moon, Plus, Sunrise, Trash2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { getRawRoutines, saveRoutine } from '@/api/routine.api';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Text } from '@/components/Text';
import { dashboardQueryKey } from '@/features/dashboard/useDashboard';
import { SelectChip } from '@/features/profile/components/SelectChip';
import { TimePickerModal } from '@/features/notifications/components/TimePickerModal';
import { routineQueryKey } from '@/features/routine/useRoutine';
import type { RoutineTimeOfDay } from '@/features/routine/routine.types';
import { useTheme } from '@/hooks/useTheme';
import { useToastStore } from '@/store/toast.store';
import type { RootStackParamList } from '@/navigation/types';

const TYPE_OPTIONS = [
  'Cleanser',
  'Serum',
  'Moisturizer',
  'Sunscreen',
  'Retinol',
  'Treatment',
  'Night Cream',
];

type EditStep = {
  key: string;
  productName: string;
  productType: string;
  reminderTime: string;
};

let stepCounter = 0;
const newStep = (): EditStep => ({
  key: `s${stepCounter++}`,
  productName: '',
  productType: '',
  reminderTime: '',
});

// Create/edit the user's morning & night routine. Pre-fills from the existing routine
// (delete-then-recreate on save, since the backend PATCH doesn't edit items). Reached
// from the Routine tab's empty state / edit button.
export function RoutineEditorScreen(): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const queryClient = useQueryClient();
  const showToast = useToastStore((s) => s.showToast);

  const [morning, setMorning] = useState<EditStep[]>([]);
  const [night, setNight] = useState<EditStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [picker, setPicker] = useState<{ section: RoutineTimeOfDay; key: string } | null>(
    null,
  );

  useEffect(() => {
    let active = true;
    void getRawRoutines()
      .then((routines) => {
        if (!active) return;
        const toEdit = (t: RoutineTimeOfDay): EditStep[] =>
          routines
            .filter((r) => r.timeOfDay === t)
            .flatMap((r) => r.steps)
            .map((s) => ({
              key: `s${stepCounter++}`,
              productName: s.productName,
              productType: s.productType ?? '',
              reminderTime: s.reminderTime ?? '',
            }));
        const m = toEdit('morning');
        const n = toEdit('night');
        setMorning(m.length ? m : [newStep()]);
        setNight(n);
      })
      .catch(() => {
        setMorning([newStep()]);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const setSteps = (section: RoutineTimeOfDay) =>
    section === 'morning' ? setMorning : setNight;

  const updateStep = (
    section: RoutineTimeOfDay,
    key: string,
    patch: Partial<EditStep>,
  ): void => {
    setSteps(section)((prev) =>
      prev.map((s) => (s.key === key ? { ...s, ...patch } : s)),
    );
  };

  const removeStep = (section: RoutineTimeOfDay, key: string): void => {
    setSteps(section)((prev) => prev.filter((s) => s.key !== key));
  };

  const addStep = (section: RoutineTimeOfDay): void => {
    setSteps(section)((prev) => [...prev, newStep()]);
  };

  const onSave = async (): Promise<void> => {
    const clean = (steps: EditStep[]) =>
      steps
        .filter((s) => s.productName.trim().length > 0)
        .map((s) => ({
          productName: s.productName.trim(),
          productType: s.productType || undefined,
          reminderTime: s.reminderTime || undefined,
        }));
    const m = clean(morning);
    const n = clean(night);
    if (m.length === 0 && n.length === 0) {
      showToast('Add at least one step to save your routine.', 'error');
      return;
    }
    setSaving(true);
    try {
      await saveRoutine(m, n);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: routineQueryKey }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKey }),
      ]);
      showToast('Routine saved ✨', 'success');
      navigation.goBack();
    } catch {
      showToast('Could not save your routine. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const renderSection = (
    section: RoutineTimeOfDay,
    steps: EditStep[],
  ): React.JSX.Element => {
    const Icon = section === 'morning' ? Sunrise : Moon;
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon size={20} color={theme.colors.primary} strokeWidth={1.75} />
          <Text variant="headlineMd" color="textPrimary">
            {section === 'morning' ? 'Morning' : 'Night'}
          </Text>
        </View>

        {steps.map((step, index) => (
          <Card key={step.key} style={styles.stepCard}>
            <View style={styles.stepTop}>
              <Text variant="labelMd" color="textSecondary">
                {`Step ${index + 1}`}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Remove step"
                onPress={() => removeStep(section, step.key)}
                hitSlop={8}
              >
                <Trash2 size={18} color={theme.colors.error} />
              </Pressable>
            </View>

            <Input
              label="Product name"
              value={step.productName}
              onChangeText={(t) => updateStep(section, step.key, { productName: t })}
              autoCapitalize="words"
            />

            <View style={styles.chipRow}>
              {TYPE_OPTIONS.map((type) => (
                <SelectChip
                  key={type}
                  label={type}
                  selected={step.productType === type}
                  onPress={() =>
                    updateStep(section, step.key, {
                      productType: step.productType === type ? '' : type,
                    })
                  }
                />
              ))}
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Set reminder time"
              onPress={() => setPicker({ section, key: step.key })}
              style={[styles.timeRow, { borderColor: theme.colors.outlineVariant }]}
            >
              <Clock size={16} color={theme.colors.primary} />
              <Text
                variant="bodyMd"
                color={step.reminderTime ? 'textPrimary' : 'textSecondary'}
              >
                {step.reminderTime
                  ? `Reminder ${step.reminderTime}`
                  : 'Add a reminder time (optional)'}
              </Text>
            </Pressable>
          </Card>
        ))}

        <Button
          label={`Add ${section === 'morning' ? 'morning' : 'night'} step`}
          variant="secondary"
          icon={Plus}
          onPress={() => addStep(section)}
        />
      </View>
    );
  };

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: theme.colors.background, paddingTop: insets.top },
      ]}
    >
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => navigation.goBack()}
          hitSlop={8}
          style={styles.iconButton}
        >
          <ArrowLeft size={24} color={theme.colors.primary} />
        </Pressable>
        <Text variant="headlineMd" color="primary">
          Your Routine
        </Text>
        <View style={styles.iconButton} />
      </View>

      {loading ? null : (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            {renderSection('morning', morning)}
            {renderSection('night', night)}
          </ScrollView>

          <View style={[styles.cta, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <Button
              label={saving ? 'Saving…' : 'Save routine'}
              fullWidth
              disabled={saving}
              onPress={() => void onSave()}
            />
          </View>
        </KeyboardAvoidingView>
      )}

      <TimePickerModal
        visible={picker !== null}
        title="Reminder time"
        value={
          (picker &&
            (picker.section === 'morning' ? morning : night).find(
              (s) => s.key === picker.key,
            )?.reminderTime) ||
          '08:00'
        }
        onSelect={(time) => {
          if (picker) updateStep(picker.section, picker.key, { reminderTime: time });
          setPicker(null);
        }}
        onClose={() => setPicker(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 28,
  },
  section: {
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepCard: {
    gap: 16,
  },
  stepTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  cta: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
});
