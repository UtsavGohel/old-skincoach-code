import type { CoachData } from '@/features/coach/coach.types';

const IMG = 'https://lh3.googleusercontent.com/aida-public/';

// Fixture for the AI Coach hub, transcribed from the ai_skin_coach mockup: the "Great
// progress today!" insight, the "improved by 6 points" weekly summary with Score/
// Hydration/Streak stats, the suggested questions (docs/07 example questions), the three
// recommended actions with impact tags, and the Learn articles (using the mockup's own
// hosted illustration URLs). Returned by getCoach() while EXPO_PUBLIC_USE_MOCK_API is on.
export const mockCoachData: CoachData = {
  subtitle: "Personalized insights based on today's scan and your progress.",
  insight: {
    title: '✨ Great progress today!',
    message:
      'Your skin appears calmer than last week. Hydration has improved and redness continues to decrease. Keep following your current routine.',
    ctaLabel: 'Learn why',
  },
  weeklySummary: {
    badge: 'Updated Today',
    message:
      'Your Skin Score improved by 6 points. Hydration increased significantly. Acne remained stable. Excellent consistency in your PM routine.',
    stats: [
      { label: 'Score', value: '82', tone: 'primary' },
      { label: 'Hydration', value: '75%', tone: 'secondary' },
      { label: 'Day Streak', value: '14', tone: 'neutral' },
    ],
  },
  suggestedQuestions: [
    'Can I use Retinol every day?',
    'Why is my skin dry?',
    'How do I reduce redness?',
    'Should I use Vitamin C in the morning?',
  ],
  recommendations: [
    {
      id: 'water',
      title: 'Drink more water today',
      description: 'Increase hydration from within for clearer skin texture.',
      icon: 'water',
      impact: 'high',
    },
    {
      id: 'spf',
      title: 'Apply sunscreen',
      description: 'UV levels are high this afternoon. Protect your progress.',
      icon: 'sun',
      impact: 'medium',
    },
    {
      id: 'sleep',
      title: 'Aim for 8 hours sleep',
      description: 'Skin repairs best during deep rest. Sleep is essential.',
      icon: 'sleep',
      impact: 'high',
    },
  ],
  articles: [
    {
      id: 'acne',
      title: 'Understanding Acne',
      readTime: '5 min read',
      imageUrl: `${IMG}AB6AXuACV-xWyeiVEafBuE7Ny8qc1Ygk5B2vaoraqfeTfy80Xyuf0CpK1cx8sy51rUTLfJa2tRGAyVTOEFR2T95kBxDmbYk9prS9VPPCGLM5xCfXQhZ2_viVYXuC8UkJjbIlgsTS8p14L1HImS1TZNq127uHOjo6G1lIiMzjkvMB4PJaRAUj7GxnsQ1STJm43seeX9gRGRT7C4rfU5tMua2GiDGg6Wl3eSwK-Ev_hmZZkx61F9EORJRo-2BbNw`,
    },
    {
      id: 'hydration',
      title: 'Hydration Tips',
      readTime: '3 min read',
      imageUrl: `${IMG}AB6AXuA4AOycELNdXAdWx08MyI_yyz551dKDm0xsvBzGOOKEGcnuPR8M1ObC_i5_rXKw2F-oTyYdCTQ0WWKQc87IJsG6XxQS5skgLhYpU71ILtp_Jb7iMBTYY9hsvMoGh6j0U8nub452ZypMEsA6O8QkQjwesrN_usOmxuxuTDLfcGZCCf-BAKEhgRpxvM5Hu9aO89ZAjkRRgQI4p1udUXRAPcjFjJZKzpDCt5_GMtLTAJ85y70gsT9RMhAfTw`,
    },
    {
      id: 'sun',
      title: 'Sun Protection',
      readTime: '4 min read',
      imageUrl: `${IMG}AB6AXuC0WJu89te696KI7uEzg2A0YgkZ7zlkLGXgfuVuUo0rPUFr-L2ARcBYQQyOkhAPAzbTBaA-hvZBekaCSfXnfU5UNZ1X_dqj2k9Vw_z3Ed3_8r5-rO4Y3HMzL49x7P6gI2msbT80CLubml1p-67RSSwtgiJZxrHlaVWgbSI76Wmk7Tbi9zlDG5_HodpxDf6sDLiOC2FDeEOeaVwhWYJfpFyt7Wlwzszm9DGvDCbyTUsZbgYBx1QtaCj6eQ`,
    },
  ],
  motivation:
    "🌿 You're building healthy skin habits. Consistency matters more than perfection.",
};
