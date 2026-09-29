import { Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Lightbulb, Share2, Sparkles, TrendingUp } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AIInsightCard } from '@/components/AIInsightCard';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { SkeletonCard } from '@/components/Loading';
import { ProgressRing } from '@/components/ProgressRing';
import { Text } from '@/components/Text';
import { ConfidenceBanner } from '@/features/analysis/components/ConfidenceBanner';
import { MetricResultCard } from '@/features/analysis/components/MetricResultCard';
import { ScoreComparisonCard } from '@/features/analysis/components/ScoreComparisonCard';
import { useAnalysis } from '@/features/analysis/useAnalysis';
import { useTheme } from '@/hooks/useTheme';
import { useScanStore } from '@/store/scan.store';
import { useToastStore } from '@/store/toast.store';
import type { RootStackParamList } from '@/navigation/types';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

// Phase 6 — Results (design ref: ai_skin_analysis_results). Renders the latest analysis:
// overall score, confidence tier (docs/06 — mockup omits it), insight, yesterday→today
// comparison, all 9 metrics (mockup shows 6 — docs/06/16), and a recommendation. It's a
// task-focused pushed screen (from the scan flow / history), so it uses a back header +
// action CTAs rather than the persistent tab bar (consistent with the scan screens).
export function ResultsScreen(): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const showToast = useToastStore((state) => state.showToast);
  const scanId = useScanStore((state) => state.scanId);
  const { data, isLoading, isError, refetch } = useAnalysis(scanId);

  const onShare = async (): Promise<void> => {
    if (!data) return;
    try {
      await Share.share({
        message: `My SkinCoach skin score today is ${data.overallScore} ✨ (+${data.scoreDelta} since yesterday)`,
      });
    } catch {
      // user dismissed the share sheet — nothing to do.
    }
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
          SkinCoach
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
            title="Couldn't load your analysis"
            description="Please check your connection and try again."
            primaryCtaLabel="Try again"
            onPressPrimaryCta={() => void refetch()}
          />
        </View>
      ) : null}

      {data ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.titleBlock}>
            <Text variant="headlineLgMobile" color="textPrimary">
              Today&apos;s Analysis
            </Text>
            <Text variant="bodyMd" color="textSecondary">
              {formatDate(data.date)}
            </Text>
          </View>

          <Card variant="hero">
            <ProgressRing
              progress={data.overallScore}
              valueLabel={String(data.overallScore)}
              label="SKIN SCORE"
            />
            <View
              style={[
                styles.deltaChip,
                { backgroundColor: theme.colors.secondaryContainer },
              ]}
            >
              <TrendingUp size={14} color={theme.colors.primary} />
              <Text variant="labelSm" color="primary">
                {`+${data.scoreDelta} since yesterday`}
              </Text>
            </View>
          </Card>

          <ConfidenceBanner
            confidence={data.confidence}
            onRetake={() => navigation.navigate('Camera')}
          />

          <AIInsightCard
            icon={Sparkles}
            title={data.insight.title}
            message={data.insight.message}
          />

          <ScoreComparisonCard
            previousScore={data.previousScore}
            currentScore={data.overallScore}
            summary={data.trendSummary}
          />

          <View>
            <Text variant="headlineMd" color="textPrimary" style={styles.sectionHeading}>
              Detailed Metrics
            </Text>
            <View style={styles.grid}>
              {data.metrics.map((detail) => (
                <View key={detail.key} style={styles.gridItem}>
                  <MetricResultCard detail={detail} />
                </View>
              ))}
            </View>
          </View>

          <View
            style={[
              styles.recommendation,
              { backgroundColor: `${theme.colors.primary}0D` },
            ]}
          >
            <View style={[styles.recIcon, { backgroundColor: theme.colors.primary }]}>
              <Lightbulb size={20} color={theme.colors.onPrimary} />
            </View>
            <View style={styles.recText}>
              <Text variant="labelMd" color="primary" style={styles.recLabel}>
                Today&apos;s Recommendation
              </Text>
              <Text variant="bodyMd" color="textSecondary">
                {data.recommendation}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <Button
              label="Save Analysis"
              onPress={() => showToast('Analysis saved to your timeline.', 'success')}
            />
            <Button
              label="Share Progress"
              variant="secondary"
              onPress={() => void onShare()}
            />
            <Button
              label="View Full Progress"
              variant="text"
              onPress={() => navigation.navigate('HomeTabs', { screen: 'Progress' })}
            />
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
    paddingBottom: 8,
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
    paddingBottom: 40,
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
  titleBlock: {
    gap: 4,
  },
  deltaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    marginTop: 16,
  },
  sectionHeading: {
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 12,
    rowGap: 12,
  },
  gridItem: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  recommendation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    padding: 24,
    borderRadius: 24,
  },
  recIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recText: {
    flex: 1,
    gap: 4,
  },
  recLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  actions: {
    gap: 8,
  },
});
