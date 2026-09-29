// Phase 9 — AI Coach (design ref: ai_skin_coach; docs/02 AI Coach Flow, docs/07 Prompt 4).
// API-shaped types consumed via useCoach(). Icon keys are strings (a real API returns
// keys, not components), mapped to lucide icons in coach.meta.ts.

export type CoachInsight = {
  title: string;
  message: string;
  ctaLabel: string;
};

// A mini stat in the Weekly Summary strip. `tone` picks the ring/emphasis colour.
export type CoachStatTone = 'primary' | 'secondary' | 'neutral';

export type CoachStat = {
  label: string;
  value: string;
  tone: CoachStatTone;
};

export type CoachWeeklySummary = {
  badge: string;
  message: string;
  stats: CoachStat[];
};

export type RecommendationImpact = 'high' | 'medium' | 'low';

// Keys map to lucide icons in coach.meta.ts (RECOMMENDATION_ICON).
export type RecommendationIconKey = 'water' | 'sun' | 'sleep' | 'routine';

export type CoachRecommendation = {
  id: string;
  title: string;
  description: string;
  icon: RecommendationIconKey;
  impact: RecommendationImpact;
};

export type CoachArticle = {
  id: string;
  title: string;
  readTime: string;
  // The mockup's own hosted illustration URL — the accurate placeholder until a real
  // asset pipeline exists (same convention as the other marketing imagery, docs/19).
  imageUrl: string;
};

export type CoachData = {
  subtitle: string;
  insight: CoachInsight;
  weeklySummary: CoachWeeklySummary;
  suggestedQuestions: string[];
  recommendations: CoachRecommendation[];
  articles: CoachArticle[];
  motivation: string;
};
