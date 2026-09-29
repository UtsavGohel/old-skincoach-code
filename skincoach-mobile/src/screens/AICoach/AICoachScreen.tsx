import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Bot, History, Sparkles } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AIInsightCard } from '@/components/AIInsightCard';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { SkeletonCard } from '@/components/Loading';
import { Text } from '@/components/Text';
import { ArticleCard } from '@/features/coach/components/ArticleCard';
import { CoachSummaryCard } from '@/features/coach/components/CoachSummaryCard';
import { RecommendationCard } from '@/features/coach/components/RecommendationCard';
import { useCoach } from '@/features/coach/useCoach';
import { useTheme } from '@/hooks/useTheme';
import { useToastStore } from '@/store/toast.store';
import type { RootStackParamList } from '@/navigation/types';

// Phase 9 — AI Coach hub (design ref: ai_skin_coach; docs/02 AI Coach Flow). A pushed
// screen reached from Home's AI insight. Sections: today's insight, weekly summary, an
// Ask entry (input + suggested chips → chat), recommended actions, Learn articles, and a
// motivation line, with a fixed "Update My Routine" CTA. Chat responses are canned per
// docs/07 (see coachChat.ts). Loading/error/success handled.
export function AICoachScreen(): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const showToast = useToastStore((s) => s.showToast);
  const { data, isLoading, isError, refetch } = useCoach();

  const openChat = (initialQuestion?: string): void => {
    navigation.navigate('AICoachChat', initialQuestion ? { initialQuestion } : undefined);
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
          AI Skin Coach
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Chat history"
          onPress={() => openChat()}
          hitSlop={8}
          style={styles.iconButton}
        >
          <History size={22} color={theme.colors.primary} />
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
            title="Couldn't load your coach"
            description="Please check your connection and try again."
            primaryCtaLabel="Try again"
            onPressPrimaryCta={() => void refetch()}
          />
        </View>
      ) : null}

      {data ? (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <Text variant="bodyLg" color="textSecondary">
              {data.subtitle}
            </Text>

            <AIInsightCard
              icon={Sparkles}
              title={data.insight.title}
              message={data.insight.message}
              ctaLabel={data.insight.ctaLabel}
              onPressCta={() => showToast('Detailed explanation coming soon', 'info')}
            />

            <CoachSummaryCard summary={data.weeklySummary} />

            {/* Ask AI — a faux input that opens the chat (real keyboard lives there). */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ask your Skin Coach"
              onPress={() => openChat()}
              style={[
                styles.askField,
                {
                  backgroundColor: theme.colors.surfaceContainerLowest,
                  borderColor: theme.colors.outlineVariant,
                },
              ]}
            >
              <Bot size={22} color={theme.colors.primary} />
              <Text variant="bodyMd" color="textSecondary">
                Ask your Skin Coach...
              </Text>
            </Pressable>

            <View style={styles.chips}>
              {data.suggestedQuestions.map((question) => (
                <Pressable
                  key={question}
                  accessibilityRole="button"
                  accessibilityLabel={question}
                  onPress={() => openChat(question)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: theme.colors.surfaceContainerHigh,
                      borderColor: theme.colors.outlineVariant,
                    },
                  ]}
                >
                  <Text variant="labelMd" color="textSecondary">
                    {question}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.section}>
              <Text variant="headlineMd" color="primary">
                Recommended Actions
              </Text>
              <View style={styles.recommendations}>
                {data.recommendations.map((recommendation) => (
                  <RecommendationCard
                    key={recommendation.id}
                    recommendation={recommendation}
                  />
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text variant="headlineMd" color="primary">
                Learn
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.articles}
              >
                {data.articles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onPress={() => showToast('Articles are coming soon', 'info')}
                  />
                ))}
              </ScrollView>
            </View>

            <View
              style={[
                styles.motivation,
                { backgroundColor: theme.colors.secondaryContainer },
              ]}
            >
              <Text variant="labelMd" color="primary" style={styles.motivationText}>
                {data.motivation}
              </Text>
            </View>
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
              label="Update My Routine"
              fullWidth
              onPress={() => navigation.navigate('HomeTabs', { screen: 'Routine' })}
              accessibilityLabel="Update my routine"
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
    paddingBottom: 132,
    gap: 24,
  },
  askField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 56,
    paddingHorizontal: 20,
    borderRadius: 9999,
    borderWidth: 1,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: -12,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
  },
  section: {
    gap: 16,
  },
  recommendations: {
    gap: 12,
  },
  articles: {
    gap: 16,
    paddingRight: 4,
  },
  motivation: {
    borderRadius: 24,
    padding: 16,
  },
  motivationText: {
    textAlign: 'center',
    fontStyle: 'italic',
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
