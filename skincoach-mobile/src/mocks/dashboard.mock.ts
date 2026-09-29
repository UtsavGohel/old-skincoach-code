import type { DashboardResponse } from '@/features/dashboard/dashboard.types';

// Fixture for the home dashboard, values transcribed from the home_dashboard mockup
// (score 84 / +3, 18-day streak, 2-of-4 routine, hydration insight, Acne/Hydration/
// Redness snapshot, 82.4 weekly average). Returned by getDashboard() while
// EXPO_PUBLIC_USE_MOCK_API is on; swapped for the real API response later unchanged.
export const mockDashboardResponse: DashboardResponse = {
  hasScans: true,
  todayScore: 84,
  scoreDelta: 3,
  radianceLabel: 'Optimal Radiance',
  streak: 18,
  todayRoutine: {
    items: [
      { id: 'cleanser', name: 'Gentle Cleanser', completed: true },
      { id: 'serum', name: 'Vitamin C Serum', completed: true },
      { id: 'moisturizer', name: 'Ceramide Moisturizer', completed: false },
      { id: 'spf', name: 'Broad Spectrum SPF 50', completed: false },
    ],
  },
  latestInsight: {
    title: 'AI Insight',
    message:
      'Increasing your hydration by 500ml daily has reduced micro-inflammation around your cheeks. Pair with your moisturizer while skin is still damp!',
  },
  progressSnapshot: [
    { label: 'Acne', value: '12%', direction: 'down', upIsGood: false },
    { label: 'Hydration', value: '9%', direction: 'up', upIsGood: true },
    { label: 'Redness', value: '6%', direction: 'down', upIsGood: false },
  ],
  weeklyTrend: {
    averageScore: 82.4,
    points: [
      { label: 'Mon', value: 78 },
      { label: 'Tue', value: 80 },
      { label: 'Wed', value: 79 },
      { label: 'Thu', value: 83 },
      { label: 'Fri', value: 82 },
      { label: 'Sat', value: 85 },
      { label: 'Sun', value: 84 },
    ],
  },
  scanAvailable: true,
};
