import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CloudOff, Lightbulb, ScanFace } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { completeRoutineItem } from '@/api/routine.api';
import { AIInsightCard } from '@/components/AIInsightCard';
import { EmptyState } from '@/components/EmptyState';
import { SkeletonCard } from '@/components/Loading';
import { MetricCard } from '@/components/MetricCard';
import { Text } from '@/components/Text';
import { DailyStreakCard } from '@/features/dashboard/components/DailyStreakCard';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { SkinScoreCard } from '@/features/dashboard/components/SkinScoreCard';
import { TodaysRoutineCard } from '@/features/dashboard/components/TodaysRoutineCard';
import { WeeklyTrendCard } from '@/features/dashboard/components/WeeklyTrendCard';
import type { DashboardRoutineItem } from '@/features/dashboard/dashboard.types';
import { dashboardQueryKey, useDashboard } from '@/features/dashboard/useDashboard';
import { routineQueryKey } from '@/features/routine/useRoutine';
import { useTheme } from '@/hooks/useTheme';
import { useToastStore } from '@/store/toast.store';
import { useUserStore } from '@/store/user.store';
import { useQueryClient } from '@tanstack/react-query';
import type { HomeTabParamList, RootStackParamList } from '@/navigation/types';

function greetingForNow(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

// Phase 4 — Home Dashboard (design ref: home_dashboard). Reads GET /dashboard via
// useDashboard() (mock fixture for now) and renders Skin Score, Today's Routine, AI
// Insight, Daily Streak, Progress Snapshot, and Weekly Trend. Loading/error/success are
// all handled (PROJECT_CONTEXT: every screen supports loading/empty/error/success).
export function HomeScreen(): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<BottomTabNavigationProp<HomeTabParamList>>();
  // Same navigator object, typed for the parent stack so we can push AICoach (a root
  // route, not a tab) — navigate() bubbles up when the route isn't a local tab.
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const name = useUserStore((state) => state.profileDraft.name);
  const showToast = useToastStore((state) => state.showToast);
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useDashboard();

  // Checkbox toggles are tracked as overrides layered on top of the fetched routine, so
  // we derive the displayed list instead of syncing server data into state via an effect
  // (which the lint rules flag for cascading renders). The dedicated Routine tab (Phase
  // 8) owns the real routine state; this is just the at-a-glance summary.
  const [completionOverrides, setCompletionOverrides] = useState<Record<string, boolean>>(
    {},
  );
  const routineItems: DashboardRoutineItem[] = (data?.todayRoutine.items ?? []).map(
    (item) => ({
      ...item,
      completed: completionOverrides[item.id] ?? item.completed,
    }),
  );

  // Optimistically flip the checkbox, persist it (POST /routines/items/:id/complete),
  // then refresh both the dashboard and the Routine tab so the change is reflected
  // everywhere — not just held in local state. Reverts on failure.
  const toggleRoutine = (id: string): void => {
    const next = !(routineItems.find((item) => item.id === id)?.completed ?? false);
    setCompletionOverrides((prev) => ({ ...prev, [id]: next }));
    void completeRoutineItem(id, next)
      .then(() =>
        Promise.all([
          queryClient.invalidateQueries({ queryKey: dashboardQueryKey }),
          queryClient.invalidateQueries({ queryKey: routineQueryKey }),
        ]),
      )
      .catch(() => {
        setCompletionOverrides((prev) => ({ ...prev, [id]: !next }));
        showToast('Could not save that. Please try again.', 'error');
      });
  };

  const goToProgress = (): void => navigation.navigate('Progress');

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: theme.colors.background, paddingTop: insets.top },
      ]}
    >
      <DashboardHeader
        name={name}
        onPressNotifications={() => showToast('Notifications are coming soon.', 'info')}
        onPressCoach={() => rootNavigation.navigate('AICoach')}
      />

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
            icon={CloudOff}
            title="Couldn't load your dashboard"
            description="Check your connection and try again."
            primaryCtaLabel="Try again"
            onPressPrimaryCta={() => void refetch()}
          />
        </View>
      ) : null}

      {data && !data.hasScans ? (
        <View style={styles.errorState}>
          <EmptyState
            icon={ScanFace}
            title="Start your skin journey"
            description="Take your first scan and your personalized score, insights, and trends will appear here."
            primaryCtaLabel="Take your first scan"
            onPressPrimaryCta={() => rootNavigation.navigate('ScanGuidelines')}
          />
        </View>
      ) : null}

      {data && data.hasScans ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.greeting}>
            <Text variant="headlineLgMobile" color="textPrimary">
              {`${greetingForNow()}, ${name?.trim() || 'there'} 👋`}
            </Text>
            <Text variant="bodyMd" color="textSecondary">
              Your skin is reflecting your consistency. Keep glowing today.
            </Text>
          </View>

          <SkinScoreCard
            score={data.todayScore}
            scoreDelta={data.scoreDelta}
            radianceLabel={data.radianceLabel}
            onPressHistory={goToProgress}
          />

          <TodaysRoutineCard
            items={routineItems}
            onToggle={toggleRoutine}
            onSetup={() => navigation.navigate('Routine')}
          />

          <AIInsightCard
            icon={Lightbulb}
            title={data.latestInsight.title}
            message={data.latestInsight.message}
            ctaLabel="Ask your Coach"
            onPressCta={() => rootNavigation.navigate('AICoach')}
          />

          <DailyStreakCard streak={data.streak} onPress={goToProgress} />

          <View>
            <Text variant="headlineMd" color="textPrimary" style={styles.sectionHeading}>
              Progress Snapshot
            </Text>
            <View style={styles.snapshotRow}>
              {data.progressSnapshot.map((metric) => (
                <MetricCard
                  key={metric.label}
                  label={metric.label}
                  value={metric.value}
                  trend={metric.direction}
                  upIsGood={metric.upIsGood}
                />
              ))}
            </View>
          </View>

          <WeeklyTrendCard trend={data.weeklyTrend} />
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 24,
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
  greeting: {
    gap: 4,
  },
  sectionHeading: {
    marginBottom: 16,
  },
  snapshotRow: {
    flexDirection: 'row',
    gap: 12,
  },
});
