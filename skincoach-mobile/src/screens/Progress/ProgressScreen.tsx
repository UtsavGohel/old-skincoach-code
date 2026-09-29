import { Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BadgeCheck,
  Brain,
  CircleCheck,
  Flag,
  Flame,
  GitCompareArrows,
  ScanFace,
  Share2,
  Sparkles,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AIInsightCard } from '@/components/AIInsightCard';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { SkeletonCard } from '@/components/Loading';
import { Text } from '@/components/Text';
import { Timeline, type TimelineEntry } from '@/components/Timeline';
import { ScoreComparisonCard } from '@/features/analysis/components/ScoreComparisonCard';
import { MetricTrendCard } from '@/features/progress/components/MetricTrendCard';
import { TrendOverviewCard } from '@/features/progress/components/TrendOverviewCard';
import type { MilestoneIconKey } from '@/features/progress/progress.types';
import { useProgress } from '@/features/progress/useProgress';
import { useTheme } from '@/hooks/useTheme';
import { usePreferencesStore } from '@/store/preferences.store';
import type { IconComponent } from '@/types/icon';
import type { RootStackParamList } from '@/navigation/types';

const MILESTONE_ICON: Record<MilestoneIconKey, IconComponent> = {
  start: Flag,
  streak: Flame,
  metric: CircleCheck,
  scan: Sparkles,
};

// Phase 7 — Progress & Trends (design ref: progress_trends). A real bottom tab. Renders
// the journey hero, the range-tabbed trend chart, per-metric trends, the monthly score
// comparison, a milestones timeline, and an AI observation, plus a Scan CTA. No bounce on
// trend icons (docs/03 / docs/19). Loading/error/success handled.
export function ProgressScreen(): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const hasSeenScanGuidelines = usePreferencesStore((s) => s.hasSeenScanGuidelines);
  const { data, isLoading, isError, refetch } = useProgress();

  const onShare = async (): Promise<void> => {
    if (!data) return;
    try {
      await Share.share({
        message: `My SkinCoach score is up to ${data.currentScore} — +${data.monthlyDelta} points this month ✨`,
      });
    } catch {
      // dismissed — nothing to do.
    }
  };

  const startScan = (): void => {
    navigation.navigate(hasSeenScanGuidelines ? 'Camera' : 'ScanGuidelines');
  };

  const milestoneEntries: TimelineEntry[] =
    data?.milestones.map((m) => ({
      id: m.id,
      date: m.date,
      title: m.title,
      description: m.description,
      icon: MILESTONE_ICON[m.icon],
    })) ?? [];

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: theme.colors.background, paddingTop: insets.top },
      ]}
    >
      <View style={styles.header}>
        <Text variant="headlineMd" color="textPrimary">
          Skin Progress
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Share progress"
          onPress={() => void onShare()}
          hitSlop={8}
          style={styles.iconButton}
        >
          <Share2 size={22} color={theme.colors.onSurfaceVariant} />
        </Pressable>
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
            title="Couldn't load your progress"
            description="Please check your connection and try again."
            primaryCtaLabel="Try again"
            onPressPrimaryCta={() => void refetch()}
          />
        </View>
      ) : null}

      {data && data.milestones.length === 0 ? (
        <View style={styles.errorState}>
          <EmptyState
            icon={ScanFace}
            title="Your progress starts here"
            description="Take your first scan and your score trend, metrics, and milestones will build up from there."
            primaryCtaLabel="Take your first scan"
            onPressPrimaryCta={startScan}
          />
        </View>
      ) : null}

      {data && data.milestones.length > 0 ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <Card variant="hero">
            <View style={styles.journeyLabel}>
              <Sparkles size={18} color={theme.colors.primary} strokeWidth={1.75} />
              <Text variant="labelMd" color="primary">
                Your Skin Journey
              </Text>
            </View>
            <Text
              style={[theme.typography.displayLg, { color: theme.colors.textPrimary }]}
            >
              {data.currentScore}
            </Text>
            {data.hasEnoughData ? (
              <Text variant="labelMd" color="primary">
                {`+${data.monthlyDelta} points this month`}
              </Text>
            ) : null}
            <View
              style={[styles.badge, { backgroundColor: theme.colors.secondaryContainer }]}
            >
              <BadgeCheck size={16} color={theme.colors.primary} />
              <Text variant="labelSm" color="primary">
                {data.highlight}
              </Text>
            </View>
          </Card>

          {data.hasEnoughData ? (
            <>
              <TrendOverviewCard trends={data.trends} />

              <View style={styles.metricGrid}>
                {data.metricTrends.map((trend) => (
                  <View key={trend.key} style={styles.metricItem}>
                    <MetricTrendCard trend={trend} />
                  </View>
                ))}
              </View>

              <ScoreComparisonCard
                previousScore={data.monthlyComparison.previous}
                currentScore={data.monthlyComparison.current}
                summary={data.monthlyComparison.summary}
                previousLabel="Last"
                currentLabel="Curr"
              />

              <Button
                label="View Before & After"
                variant="secondary"
                icon={GitCompareArrows}
                onPress={() => navigation.navigate('BeforeAfter')}
              />
            </>
          ) : (
            <Card>
              <View style={styles.journeyLabel}>
                <Sparkles size={18} color={theme.colors.primary} strokeWidth={1.75} />
                <Text variant="labelMd" color="primary">
                  Trends unlock soon
                </Text>
              </View>
              <Text variant="bodyMd" color="textSecondary">
                Scan again over the next few days and your score trend, metric breakdown,
                and before/after comparison will appear here.
              </Text>
            </Card>
          )}

          <View>
            <Text variant="headlineMd" color="textPrimary" style={styles.sectionHeading}>
              Your Milestones
            </Text>
            <Timeline entries={milestoneEntries} />
          </View>

          <AIInsightCard
            icon={Brain}
            title="AI Observations"
            message={data.aiObservation}
          />

          <Button label="Scan Today" icon={ScanFace} onPress={startScan} />
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
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
  journeyLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    marginTop: 12,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 12,
    rowGap: 12,
  },
  metricItem: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  sectionHeading: {
    marginBottom: 16,
  },
});
