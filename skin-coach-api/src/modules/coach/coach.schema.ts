import { Type } from '@google/genai';
import type { Schema } from '@google/genai';
import { z } from 'zod';

// docs/16 AI Coach response schema. Validated with Zod (retry once on invalid).
export const coachReplyZod = z.object({
  answer: z.string().min(1),
  followUpQuestions: z.array(z.string()),
  disclaimer: z.string().min(1),
});

export type CoachReply = z.infer<typeof coachReplyZod>;

export const coachReplyGeminiSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    answer: { type: Type.STRING },
    followUpQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
    disclaimer: { type: Type.STRING },
  },
  required: ['answer', 'followUpQuestions', 'disclaimer'],
};
