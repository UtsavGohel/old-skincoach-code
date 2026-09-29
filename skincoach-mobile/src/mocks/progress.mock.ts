import type { ProgressData } from '@/features/progress/progress.types';

// Progress fixture (progress_trends mockup). Trend arrays trend gently upward to match
// the "+12 points this month / healthiest skin" narrative. Returned by getProgress()
// until the backend lands.
export const mockProgressData: ProgressData = {
  hasEnoughData: true,
  currentScore: 84,
  monthlyDelta: 12,
  highlight: 'Your healthiest skin this month.',
  trends: {
    '7D': [
      { label: 'Mon', value: 79 },
      { label: 'Tue', value: 80 },
      { label: 'Wed', value: 81 },
      { label: 'Thu', value: 80 },
      { label: 'Fri', value: 82 },
      { label: 'Sat', value: 83 },
      { label: 'Sun', value: 84 },
    ],
    '30D': [
      { label: 'Jun 01', value: 72 },
      { label: 'Jun 08', value: 75 },
      { label: 'Jun 15', value: 78 },
      { label: 'Jun 22', value: 81 },
      { label: 'Today', value: 84 },
    ],
    '90D': [
      { label: 'Apr', value: 65 },
      { label: 'May', value: 74 },
      { label: 'Jun', value: 84 },
    ],
    '1Y': [
      { label: 'Q1', value: 58 },
      { label: 'Q2', value: 70 },
      { label: 'Q3', value: 78 },
      { label: 'Q4', value: 84 },
    ],
  },
  metricTrends: [
    { key: 'acne', status: 'Improved', direction: 'down', positive: true },
    { key: 'hydration', status: 'Excellent', direction: 'up', positive: true },
    { key: 'redness', status: 'Better', direction: 'down', positive: true },
    { key: 'texture', status: 'Healthy', direction: 'up', positive: true },
  ],
  monthlyComparison: {
    previous: 78,
    current: 84,
    summary: 'Your consistency is paying off.',
  },
  beforeAfter: {
    before: { label: 'First Scan', date: 'May 12, 2026', score: 71 },
    after: { label: 'Latest Scan', date: 'Jul 4, 2026', score: 84 },
    summary:
      'Over 7 weeks your skin score climbed 13 points — hydration and redness improved the most.',
    metrics: [
      { key: 'hydration', before: 58, after: 74, positive: true },
      { key: 'redness', before: 44, after: 68, positive: true },
      { key: 'acne', before: 61, after: 79, positive: true },
      { key: 'texture', before: 66, after: 80, positive: true },
      { key: 'pores', before: 70, after: 72, positive: true },
    ],
  },
  milestones: [
    {
      id: 'start',
      date: 'June 1',
      title: 'Started Your Journey',
      description:
        'Your initial assessment established a solid baseline for your personalized routine.',
      icon: 'start',
    },
    {
      id: 'streak',
      date: 'June 12',
      title: '7-Day Streak',
      description:
        'Perfect application of AM/PM serums for a full week. Resilience is building.',
      icon: 'streak',
    },
    {
      id: 'acne-low',
      date: 'June 26',
      title: 'Lowest Acne Count',
      description:
        'Inflammation markers reached a 30-day low. Keep using the botanical serum.',
      icon: 'metric',
    },
    {
      id: 'latest',
      date: 'Today',
      title: 'Latest Scan',
      description: 'Skin barrier is currently at its strongest peak since starting.',
      icon: 'scan',
    },
  ],
  aiObservation:
    'Your biggest improvement this month was hydration — the analysis shows a 24% increase in moisture retention. Continue following your current routine, prioritizing the Hydrating Cream before bed.',
};
