import type { MetricKey } from '@/features/analysis/analysis.types';

// Progress & Trends data (progress_trends screen). Trends are keyed by time range so the
// chart tabs (7D/30D/90D/1Y) just swap the point array. Milestones feed the shared
// Timeline component. Mock-first: same shape the real GET /progress returns later.
export type TrendRange = '7D' | '30D' | '90D' | '1Y';

export const TREND_RANGES: TrendRange[] = ['7D', '30D', '90D', '1Y'];

export type TrendPoint = { label: string; value: number };

export type MetricTrend = {
  key: MetricKey;
  status: string; // "Improved", "Excellent", ...
  direction: 'up' | 'down';
  positive: boolean; // whether that direction is good news (drives colour)
};

export type MilestoneIconKey = 'start' | 'streak' | 'metric' | 'scan';

export type Milestone = {
  id: string;
  date: string;
  title: string;
  description: string;
  icon: MilestoneIconKey;
};

export type ProgressData = {
  // False with <2 scans — the screen hides trend/comparison/before-after sections
  // (which need history) and shows an encouraging state instead of fabricated data.
  hasEnoughData: boolean;
  currentScore: number;
  monthlyDelta: number; // e.g. +12
  highlight: string; // "Your healthiest skin this month."
  trends: Record<TrendRange, TrendPoint[]>;
  metricTrends: MetricTrend[];
  monthlyComparison: { previous: number; current: number; summary: string };
  beforeAfter: BeforeAfterComparison;
  milestones: Milestone[];
  aiObservation: string;
};

// Before/After comparison (Phase 14). A snapshot renders as a private-scan placeholder
// tile (docs/06: scan photos are private) with its date + overall score; each metric
// pairs a before/after value so the screen can show the delta.
export type ComparisonSnapshot = {
  label: string;
  date: string;
  score: number;
};

export type MetricComparison = {
  key: MetricKey;
  before: number;
  after: number;
  positive: boolean; // whether after > before is good news for this metric (drives colour)
};

export type BeforeAfterComparison = {
  before: ComparisonSnapshot;
  after: ComparisonSnapshot;
  summary: string;
  metrics: MetricComparison[];
};
