import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { CheckCircle2, Pencil, Sparkles } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { completeRoutineItem, createStarterRoutine } from '@/api/routine.api';
import { AIInsightCard } from '@/components/AIInsightCard';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { SkeletonCard } from '@/components/Loading';
import { Text } from '@/components/Text';
import { dashboardQueryKey } from '@/features/dashboard/useDashboard';
import { RoutineProgressCard } from '@/features/routine/components/RoutineProgressCard';
import { RoutineSection } from '@/features/routine/components/RoutineSection';
import { RoutineStreakCard } from '@/features/routine/components/RoutineStreakCard';
import { WeeklyConsistencyCard } from '@/features/routine/components/WeeklyConsistencyCard';
import type { RoutineStep } from '@/features/routine/routine.types';
import { routineQueryKey, useRoutine } from '@/features/routine/useRoutine';
import { useTheme } from '@/hooks/useTheme';
import { useToastStore } from '@/store/toast.store';
import type { RootStackParamList } from '@/navigation/types';

// Phase 8 — Routine Tracker (design ref: my_routine_tracker; docs/02 Routine Flow,
// docs/03 Routine Item). A real bottom tab: header title + subtitle (no back), a
// completion ring, streak + weekly-consistency cards, today's AI tip, and the Morning/
// Night sections whose steps check off with the shared RoutineItem's check/glow/strike
// treatments. Check-off is optimistic — a derived override map layered over the query
// data (never a data→state sync effect, lint: no cascading renders) — and persisted to
// the backend (POST /routines/items/:id/complete), reverting on failure.
export function RoutineScreen(): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const queryClient = useQueryClient();
  const showToast = useToastStore((s) => s.showToast);
  const { data, isLoading, isError, refetch } = useRoutine();
  const [creatingStarter, setCreatingStarter] = useState(false);
  const [starterFailed, setStarterFailed] = useState(false);
  const autoAttemptedRef = useRef(false);

  const applyStarterRoutine = async (): Promise<void> => {
    setCreatingStarter(true);
    setStarterFailed(false);
    try {
      await createStarterRoutine();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: routineQueryKey }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKey }),
      ]);
    } catch {
      setStarterFailed(true);
    } finally {
      setCreatingStarter(false);
    }
  };

  // No routine yet → auto-create a starter one (once) rather than showing a blank
  // screen. The user can then edit or replace it. Guarded so it never loops.
  useEffect(() => {
    if (!data || data.sections.length > 0 || autoAttemptedRef.current) return;
    autoAttemptedRef.current = true;
    void applyStarterRoutine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // Local check-off overrides keyed by step id. Absent → fall back to the fixture value.
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  const baseCompleted = useMemo(() => {
    const map: Record<string, boolean> = {};
    data?.sections.forEach((section) => {
      section.steps.forEach((step) => {
        map[step.id] = step.completed;
      });
    });
    return map;
  }, [data]);

  const isCompleted = (step: RoutineStep): boolean =>
    overrides[step.id] ?? step.completed;

  // Optimistic check-off: flip the override immediately for instant feedback, then
  // persist to the backend; on failure revert and tell the user (no silent data loss).
  const toggle = (id: string): void => {
    const next = !(overrides[id] ?? baseCompleted[id] ?? false);
    setOverrides((prev) => ({ ...prev, [id]: next }));
    void completeRoutineItem(id, next)
      .then(() => queryClient.invalidateQueries({ queryKey: dashboardQueryKey }))
      .catch(() => {
        setOverrides((prev) => ({ ...prev, [id]: !next }));
        showToast('Could not save that. Please try again.', 'error');
      });
  };

  const allSteps = data?.sections.flatMap((section) => section.steps) ?? [];
  const completedCount = allSteps.filter((step) => isCompleted(step)).length;
  const totalCount = allSteps.length;
  const allDone = totalCount > 0 && completedCount === totalCount;

  const completeAll = (): void => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const incomplete = allSteps.filter((step) => !isCompleted(step));
    setOverrides(() => {
      const next: Record<string, boolean> = {};
      allSteps.forEach((step) => {
        next[step.id] = true;
      });
      return next;
    });
    showToast('Routine complete for today ✨', 'success');
    void Promise.all(incomplete.map((step) => completeRoutineItem(step.id, true)))
      .then(() => queryClient.invalidateQueries({ queryKey: dashboardQueryKey }))
      .catch(() => showToast('Some steps didn’t save. Please try again.', 'error'));
  };

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: theme.colors.background, paddingTop: insets.top },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text variant="headlineMd" color="textPrimary">
            Today&apos;s Routine
          </Text>
          {data && data.sections.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit routine"
              onPress={() => navigation.navigate('RoutineEditor')}
              hitSlop={8}
              style={styles.editButton}
            >
              <Pencil size={18} color={theme.colors.primary} />
              <Text variant="labelMd" color="primary">
                Edit
              </Text>
            </Pressable>
          ) : null}
        </View>
        <Text variant="bodyMd" color="textSecondary" style={styles.subtitle}>
          Small habits create healthier skin.
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.stateContent}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : null}

      {isError ? (
        <View style={styles.errorState}>
          <EmptyState
            icon={Sparkles}
            title="Couldn't load your routine"
            description="Please check your connection and try again."
            primaryCtaLabel="Try again"
            onPressPrimaryCta={() => void refetch()}
          />
        </View>
      ) : null}

      {data && data.sections.length === 0 && !starterFailed ? (
        <View style={styles.stateContent}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : null}

      {data && data.sections.length === 0 && starterFailed ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: theme.colors.primary }]}>
            <Sparkles size={28} color={theme.colors.onPrimary} strokeWidth={1.75} />
          </View>
          <Text variant="headlineLgMobile" color="textPrimary" style={styles.emptyTitle}>
            Let&apos;s set up your routine
          </Text>
          <Text variant="bodyMd" color="textSecondary" style={styles.emptyDesc}>
            We couldn&apos;t create your starter routine. Try again, or build your own.
          </Text>
          <View style={styles.emptyActions}>
            <Button
              label={creatingStarter ? 'Adding…' : 'Try again'}
              disabled={creatingStarter}
              onPress={() => void applyStarterRoutine()}
            />
            <Button
              label="Build my own"
              variant="secondary"
              onPress={() => navigation.navigate('RoutineEditor')}
            />
          </View>
        </View>
      ) : null}

      {data && data.sections.length > 0 ? (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <RoutineProgressCard completed={completedCount} total={totalCount} />

            <RoutineStreakCard streakDays={data.streakDays} />

            <WeeklyConsistencyCard
              percent={data.weeklyConsistencyPct}
              days={data.weeklyDays}
            />

            <AIInsightCard
              title={data.tip.title}
              message={data.tip.message}
              icon={Sparkles}
            />

            {data.sections.map((section) => (
              <RoutineSection
                key={section.timeOfDay}
                section={section}
                isCompleted={isCompleted}
                onToggle={toggle}
              />
            ))}
          </ScrollView>

          <View
            style={[
              styles.cta,
              {
                paddingBottom: Math.max(insets.bottom, 16),
                backgroundColor: theme.colors.background,
                borderTopColor: theme.colors.outlineVariant,
              },
            ]}
          >
            <Button
              label={allDone ? 'Routine Complete' : "Complete Today's Routine"}
              icon={CheckCircle2}
              fullWidth
              disabled={allDone}
              onPress={completeAll}
              accessibilityLabel="Complete today's routine"
            />
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subtitle: {
    marginTop: 2,
    opacity: 0.8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    textAlign: 'center',
  },
  emptyDesc: {
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyActions: {
    alignSelf: 'stretch',
    gap: 12,
  },
  stateContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 132,
    gap: 24,
  },
  cta: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
});
