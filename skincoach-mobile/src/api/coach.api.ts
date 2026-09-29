import type { CoachData, CoachRecommendation } from '@/features/coach/coach.types';
import { getCoachReply } from '@/features/coach/coachChat';
import { mockCoachData } from '@/mocks/coach.mock';

import { isMockApiEnabled, mockRequest, request } from './client';

// The AI Coach hub (docs/05 Coach APIs). Consumed via useCoach(). Wired (Slice 4): the
// dynamic parts (today's insight, weekly stats, recommendations) are composed from real
// endpoints — /coach/today, /progress/summary, /routines/stats. The suggested questions
// and Learn articles are curated *editorial* content (not fabricated user data), so they
// stay static; chat itself is already live (sendCoachMessage).
const WIRED_TO_BACKEND = true;

interface RawToday {
  hasInsight: boolean;
  latestScore?: number | null;
  insight?: {
    summary: string;
    recommendation: string;
    positiveChanges: string | null;
    attentionNeeded: string | null;
    nextSteps: string | null;
  };
}
interface RawSummary {
  overall: { totalScans: number; scoreChange: number };
}
interface RawRoutineStats {
  currentStreak: number;
}

export async function getCoach(): Promise<CoachData> {
  if (isMockApiEnabled || !WIRED_TO_BACKEND) {
    return mockRequest(mockCoachData);
  }
  const [today, summary, stats] = await Promise.all([
    request<RawToday>('/coach/today'),
    request<RawSummary>('/progress/summary'),
    request<RawRoutineStats>('/routines/stats'),
  ]);
  return mapCoach(today, summary, stats);
}

function recommendationsFrom(insight: RawToday['insight']): CoachRecommendation[] {
  if (!insight) return [];
  const recs: CoachRecommendation[] = [
    {
      id: 'focus',
      title: "Today's focus",
      description: insight.recommendation,
      icon: 'routine',
      impact: 'high',
    },
  ];
  if (insight.nextSteps) {
    recs.push({
      id: 'next',
      title: 'Keep it up',
      description: insight.nextSteps,
      icon: 'water',
      impact: 'medium',
    });
  }
  if (insight.attentionNeeded) {
    recs.push({
      id: 'attention',
      title: 'Worth a little attention',
      description: insight.attentionNeeded,
      icon: 'sun',
      impact: 'medium',
    });
  }
  return recs;
}

function mapCoach(
  today: RawToday,
  summary: RawSummary,
  stats: RawRoutineStats,
): CoachData {
  const hasInsight = today.hasInsight && !!today.insight;
  return {
    // Curated editorial content (not user data) — kept static.
    subtitle: mockCoachData.subtitle,
    suggestedQuestions: mockCoachData.suggestedQuestions,
    articles: mockCoachData.articles,
    insight: hasInsight
      ? {
          title: "✨ Today's Insight",
          message: today.insight!.summary,
          ctaLabel: 'Ask your Coach',
        }
      : {
          title: 'Meet your AI Coach',
          message:
            "Take your first scan and I'll share personalized insights. You can still ask me anything below.",
          ctaLabel: 'Ask a question',
        },
    weeklySummary: {
      badge: hasInsight ? 'Updated Today' : 'Getting started',
      message: hasInsight
        ? (today.insight!.positiveChanges ?? today.insight!.summary)
        : 'Your weekly summary builds as you scan and keep up your routine.',
      stats: [
        { label: 'Score', value: String(today.latestScore ?? 0), tone: 'primary' },
        { label: 'Day Streak', value: String(stats.currentStreak), tone: 'neutral' },
        {
          label: 'Total Scans',
          value: String(summary.overall.totalScans),
          tone: 'secondary',
        },
      ],
    },
    recommendations: recommendationsFrom(today.insight),
    motivation: today.insight?.nextSteps ?? mockCoachData.motivation,
  };
}

// POST /api/v1/coach/chat (docs/05 Ask AI, docs/07 Prompt 4). Wired to the real Gemini
// coach; falls back to the canned reply in mock-data mode.
export interface CoachChatReply {
  reply: string;
  followUpQuestions: string[];
  disclaimer: string;
}

export async function sendCoachMessage(message: string): Promise<CoachChatReply> {
  if (isMockApiEnabled) {
    return mockRequest(
      { reply: getCoachReply(message), followUpQuestions: [], disclaimer: '' },
      { delayMs: 600 },
    );
  }
  return request<CoachChatReply>('/coach/chat', {
    method: 'POST',
    body: { message },
  });
}
