// Canned AI Coach chat responses (Phase 9 — mock; no real LLM until the backend lands).
// Written to docs/07 Prompt 4 rules: friendly / professional / positive, personalized to
// "your scan/progress", never diagnoses disease, never recommends prescription
// medication, and defers to a dermatologist when uncertain. When the real Gemini call is
// wired, replace getCoachReply() with the API round-trip; the message shape stays.

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

export const coachGreeting =
  "Hi! I'm your Skin Coach. Ask me anything about your routine, your latest scan, or a product — I'll keep it personalized to your progress.";

// Keyed by intent; matched loosely against the user's text so both the suggested-question
// chips and free typing land on the same answer.
type CannedAnswer = { keywords: string[]; reply: string };

const CANNED_ANSWERS: CannedAnswer[] = [
  {
    keywords: ['retinol', 'every day', 'daily'],
    reply:
      'Since your barrier has been improving, you likely don’t need retinol every night yet. Start 2–3 nights a week, always with moisturizer and morning SPF, and build up slowly as your skin tolerates it. If you notice lasting stinging or peeling, ease off and check with a dermatologist.',
  },
  {
    keywords: ['dry', 'dryness', 'flaky', 'tight'],
    reply:
      'Your recent scan showed hydration trending up, so you’re on the right track. Dryness often comes from over-cleansing or skipping moisturizer while skin is still damp. Try applying your moisturizer within a minute of washing, and add a hydrating serum on tight days.',
  },
  {
    keywords: ['redness', 'red', 'irritation', 'irritated'],
    reply:
      'Good news — redness has been decreasing in your progress. To keep it calm, avoid hot water and physical scrubs, and lean on gentle, fragrance-free products. Daily SPF helps too. If redness is persistent or painful, a dermatologist can help rule out underlying causes.',
  },
  {
    keywords: ['vitamin c', 'brightening'],
    reply:
      'Yes — Vitamin C works well in the morning. It pairs nicely with sunscreen to protect your progress against UV and helps with the brightening you’re aiming for. Apply it on clean skin before your moisturizer and SPF.',
  },
  {
    keywords: ['acne', 'breakout', 'pimple', 'increase'],
    reply:
      'Your acne readings have stayed stable recently. Small flare-ups can follow changes in sleep, stress, or a new product. Keep your routine consistent, avoid picking, and give actives a few weeks to work. If breakouts become painful or widespread, it’s worth seeing a dermatologist.',
  },
  {
    keywords: ['sunscreen', 'spf', 'sun'],
    reply:
      'Daily SPF is the single best thing for protecting your results — even on cloudy days. Aim for SPF 30+ every morning as the last step of your routine, and reapply if you’re outdoors for a while.',
  },
];

const FALLBACK_REPLY =
  'That’s a great question. Based on your recent scan and routine, consistency is what’s moving your skin in the right direction — keep cleansing gently, moisturizing, and wearing daily SPF. For anything specific to a medical concern, a dermatologist is the best next step.';

// Resolves a canned reply for a user message. Pure and synchronous so the chat screen can
// simulate a short "typing" delay itself.
export function getCoachReply(question: string): string {
  const normalized = question.toLowerCase();
  const match = CANNED_ANSWERS.find((answer) =>
    answer.keywords.some((keyword) => normalized.includes(keyword)),
  );
  return match?.reply ?? FALLBACK_REPLY;
}
