// Shape of GET /api/v1/dashboard (docs/05). The doc's response is a minimal stub
// (todayScore/streak/todayRoutine/latestInsight/scanAvailable, with the nested objects
// left as `{}`); these are the concrete shapes the home_dashboard mockup needs, kept
// backwards-compatible with the doc's named fields. Mock-first: the real API returns
// this same shape once the backend lands (Phase 15+).
export type TrendDirection = 'up' | 'down';

export type DashboardRoutineItem = {
  id: string;
  name: string;
  completed: boolean;
};

export type DashboardSnapshotMetric = {
  label: string;
  value: string;
  direction: TrendDirection;
  // Whether an "up" move is good news for this metric (Hydration ↑ good) or bad
  // (Acne ↑ bad) — drives the success/warning colour, same convention as MetricCard.
  upIsGood: boolean;
};

export type DashboardResponse = {
  // False until the user has ≥1 completed scan — Home then shows a first-scan state
  // instead of a fabricated zero score (never mock data to a real user).
  hasScans: boolean;
  todayScore: number; // 0–100
  scoreDelta: number; // change vs. yesterday, e.g. +3
  radianceLabel: string; // qualitative label, e.g. "Optimal Radiance"
  streak: number; // consecutive days
  todayRoutine: { items: DashboardRoutineItem[] };
  latestInsight: { title: string; message: string };
  progressSnapshot: DashboardSnapshotMetric[];
  weeklyTrend: { averageScore: number; points: { label: string; value: number }[] };
  scanAvailable: boolean;
};
