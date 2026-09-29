// Analysis result shape. The core (overallScore, confidence, per-metric scores) matches
// the docs/16 Vision Response schema; the per-metric status/change detail is the
// `metricsDetail` layer from docs/19's Prisma refinement (severity/status the flat
// scores lose), and `comparison` + `insight` fold in docs/16's Historical Comparison
// and Daily Insight schemas — everything the ai_skin_analysis_results screen renders.
export type MetricKey =
  | 'acne'
  | 'hydration'
  | 'redness'
  | 'pigmentation'
  | 'texture'
  | 'oiliness'
  | 'pores'
  | 'wrinkles'
  | 'darkCircles';

// All 9 metrics required by docs/06 + docs/16 (the mockup shows only 6 — docs/19).
export const METRIC_KEYS: MetricKey[] = [
  'acne',
  'hydration',
  'redness',
  'pigmentation',
  'texture',
  'oiliness',
  'pores',
  'wrinkles',
  'darkCircles',
];

export type ChangeDirection = 'up' | 'down' | 'flat';

export type MetricDetail = {
  key: MetricKey;
  score: number; // 0–100 (docs/16)
  status: string; // qualitative label, e.g. "Low", "Excellent", "Mild"
  changeLabel: string; // e.g. "Improved", "Better", "No Change"
  changeDirection: ChangeDirection; // which way the raw score moved vs. last scan
  positive: boolean; // whether that movement is good news (drives colour)
};

export type AnalysisResult = {
  date: string; // ISO date of the scan
  overallScore: number; // 0–100
  confidence: number; // 0–1 (docs/06 confidence rules)
  scoreDelta: number; // change vs. yesterday, e.g. +3
  previousScore: number; // yesterday's overall score
  trendSummary: string; // e.g. "You're moving in the right direction."
  insight: { title: string; message: string };
  recommendation: string;
  metrics: MetricDetail[];
};
