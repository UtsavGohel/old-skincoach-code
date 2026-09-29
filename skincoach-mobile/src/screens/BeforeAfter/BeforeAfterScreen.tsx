import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  ArrowRight,
  ScanFace,
  Sparkles,
  TrendingUp,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { SkeletonCard } from '@/components/Loading';
import { Text } from '@/components/Text';
import { METRIC_META } from '@/features/analysis/metrics';
import type {
  ComparisonSnapshot,
  MetricComparison,
} from '@/features/progress/progress.types';
import { useProgress } from '@/features/progress/useProgress';
import { useTheme } from '@/hooks/useTheme';
import type { RootStackParamList } from '@/navigation/types';

// Phase 14 — Before/After Comparison (docs/19 Supporting States & Polish). Reached from
// Progress. Shows two scan snapshots (rendered as private-scan placeholders — docs/06),
// the overall score improvement, and each metric's before→after delta. Reads the shared
// useProgress cache. Loading/error/success handled.
export function BeforeAfterScreen(): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data, isLoading, isError, refetch } = useProgress();

  const comparison = data?.beforeAfter;
  const scoreDelta = comparison ? comparison.after.score - comparison.before.score : 0;

  const renderSnapshot = (snapshot: ComparisonSnapshot): React.JSX.Element => (
    <View style={styles.snapshot}>
      <View style={[styles.photo, { backgroundColor: theme.colors.secondaryContainer }]}>
        <ScanFace size={40} color={theme.colors.primary} strokeWidth={1.5} />
        <View style={[styles.scoreBadge, { backgroundColor: theme.colors.primary }]}>
          <Text variant="labelMd" color="onPrimary">
            {snapshot.score}
          </Text>
        </View>
      </View>
      <Text variant="bodyMd" color="textPrimary" style={styles.snapshotLabel}>
        {snapshot.label}
      </Text>
      <Text variant="labelSm" color="textSecondary">
        {snapshot.date}
      </Text>
    </View>
  );

  const renderMetric = (metric: MetricComparison): React.JSX.Element => {
    const meta = METRIC_META[metric.key];
    const MetricIcon = meta.icon;
    const delta = metric.after - metric.before;
    const improved = metric.positive ? delta >= 0 : delta <= 0;
    const deltaColor = improved ? theme.colors.success : theme.colors.error;
    return (
      <View key={metric.key} style={styles.metricRow}>
        <View style={styles.metricLabel}>
          <MetricIcon size={20} color={theme.colors.primary} strokeWidth={1.75} />
          <Text variant="bodyMd" color="textPrimary">
            {meta.label}
          </Text>
        </View>
        <View style={styles.metricValues}>
          <Text variant="labelMd" color="textSecondary">
            {metric.before}
          </Text>
          <ArrowRight size={14} color={theme.colors.outline} />
          <Text variant="labelMd" color="textPrimary">
            {metric.after}
          </Text>
          <Text variant="labelMd" style={{ color: deltaColor }}>
            {`${delta >= 0 ? '+' : ''}${delta}`}
          </Text>
        </View>
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
          Before &amp; After
        </Text>
        <View style={styles.iconButton} />
      </View>

      {isLoading ? (
        <View style={styles.stateContent}>
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : null}

      {isError ? (
        <View style={styles.errorState}>
          <EmptyState
            icon={Sparkles}
            title="Couldn't load your comparison"
            description="Please check your connection and try again."
            primaryCtaLabel="Try again"
            onPressPrimaryCta={() => void refetch()}
          />
        </View>
      ) : null}

      {comparison && comparison.metrics.length === 0 ? (
        <View style={styles.errorState}>
          <EmptyState
            icon={ScanFace}
            title="Not enough scans yet"
            description="Take at least two scans and you'll see a side-by-side before & after of how your skin has changed."
            primaryCtaLabel="Take a scan"
            onPressPrimaryCta={() => navigation.navigate('ScanGuidelines')}
          />
        </View>
      ) : null}

      {comparison && comparison.metrics.length > 0 ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <Card style={styles.snapshots}>
            {renderSnapshot(comparison.before)}
            <View style={styles.arrowBadge}>
              <ArrowRight size={20} color={theme.colors.primary} />
            </View>
            {renderSnapshot(comparison.after)}
          </Card>

          <View style={[styles.improvement, { backgroundColor: theme.colors.primary }]}>
            <View style={styles.improvementIcon}>
              <TrendingUp size={24} color={theme.colors.onPrimary} />
            </View>
            <View style={styles.improvementText}>
              <Text variant="headlineMd" color="onPrimary">
                {`+${scoreDelta} points`}
              </Text>
              <Text variant="bodyMd" color="onPrimary" style={styles.improvementSummary}>
                {comparison.summary}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text variant="headlineMd" color="textPrimary">
              Metric changes
            </Text>
            <Card style={styles.metricsCard}>{comparison.metrics.map(renderMetric)}</Card>
          </View>
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
    paddingBottom: 40,
    gap: 24,
  },
  snapshots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  snapshot: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  photo: {
    width: '100%',
    aspectRatio: 0.82,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  scoreBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    minWidth: 32,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    alignItems: 'center',
  },
  snapshotLabel: {
    fontWeight: '600',
  },
  arrowBadge: {
    paddingHorizontal: 2,
  },
  improvement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderRadius: 24,
    padding: 20,
  },
  improvementIcon: {
    width: 48,
    height: 48,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  improvementText: {
    flex: 1,
    gap: 4,
  },
  improvementSummary: {
    opacity: 0.9,
  },
  section: {
    gap: 16,
  },
  metricsCard: {
    gap: 18,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metricValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
