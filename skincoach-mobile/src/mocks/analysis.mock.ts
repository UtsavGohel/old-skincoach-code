import type { AnalysisResult } from '@/features/analysis/analysis.types';

// Latest-scan analysis fixture. Scores match the docs/06 example Vision Response
// (overallScore 84, confidence 0.96, and the 9 metric scores); status/change per metric
// and the insight/recommendation are illustrative. All 9 metrics are present (the mockup
// only rendered 6 — docs/19). Returned by getLatestAnalysis() until the backend lands.
export const mockAnalysisResult: AnalysisResult = {
  date: new Date().toISOString(),
  overallScore: 84,
  confidence: 0.96,
  scoreDelta: 3,
  previousScore: 81,
  trendSummary: "You're moving in the right direction.",
  insight: {
    title: "Today's Insight",
    message:
      'Great progress today. Your skin appears calmer and more hydrated compared to your previous scan. Keep following your current routine.',
  },
  recommendation:
    'Continue using sunscreen and moisturizer. Your skin barrier is improving. Try to stay hydrated today by drinking at least 2 liters of water.',
  metrics: [
    {
      key: 'acne',
      score: 18,
      status: 'Low',
      changeLabel: 'Improved',
      changeDirection: 'down',
      positive: true,
    },
    {
      key: 'hydration',
      score: 82,
      status: 'Excellent',
      changeLabel: 'Better',
      changeDirection: 'up',
      positive: true,
    },
    {
      key: 'redness',
      score: 12,
      status: 'Mild',
      changeLabel: 'Improved',
      changeDirection: 'down',
      positive: true,
    },
    {
      key: 'pigmentation',
      score: 35,
      status: 'Stable',
      changeLabel: 'No Change',
      changeDirection: 'flat',
      positive: true,
    },
    {
      key: 'texture',
      score: 80,
      status: 'Healthy',
      changeLabel: 'Improved',
      changeDirection: 'up',
      positive: true,
    },
    {
      key: 'oiliness',
      score: 40,
      status: 'Balanced',
      changeLabel: 'No Change',
      changeDirection: 'flat',
      positive: true,
    },
    {
      key: 'pores',
      score: 30,
      status: 'Refined',
      changeLabel: 'Improved',
      changeDirection: 'down',
      positive: true,
    },
    {
      key: 'wrinkles',
      score: 10,
      status: 'Minimal',
      changeLabel: 'No Change',
      changeDirection: 'flat',
      positive: true,
    },
    {
      key: 'darkCircles',
      score: 24,
      status: 'Slight',
      changeLabel: 'Better',
      changeDirection: 'down',
      positive: true,
    },
  ],
};
