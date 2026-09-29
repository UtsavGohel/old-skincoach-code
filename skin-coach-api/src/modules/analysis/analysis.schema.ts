import { Type } from '@google/genai';
import type { Schema } from '@google/genai';
import { z } from 'zod';

// docs/16 / docs/06: every Gemini response follows a strict schema; invalid output is
// rejected and retried once. We give Gemini a `responseSchema` (structured output)
// AND re-validate the parsed JSON with Zod — the Zod parse is the authoritative gate.

// ---- Vision analysis (Prompt 1) --------------------------------------------------

export const METRIC_KEYS = [
  'acne',
  'hydration',
  'redness',
  'pigmentation',
  'texture',
  'oiliness',
  'pores',
  'wrinkles',
  'darkCircles',
] as const;

const metricZod = z.object({
  score: z.number().min(0).max(100),
  severity: z.string().optional(),
  status: z.string().optional(),
});

export const visionResponseZod = z.object({
  overallScore: z.number().min(0).max(100),
  confidence: z.number().min(0).max(1),
  metrics: z.object({
    acne: metricZod,
    hydration: metricZod,
    redness: metricZod,
    pigmentation: metricZod,
    texture: metricZod,
    oiliness: metricZod,
    pores: metricZod,
    wrinkles: metricZod,
    darkCircles: metricZod,
  }),
});

export type VisionResponse = z.infer<typeof visionResponseZod>;

const metricGeminiSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.NUMBER },
    severity: { type: Type.STRING },
    status: { type: Type.STRING },
  },
  required: ['score'],
};

export const visionGeminiSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    overallScore: { type: Type.NUMBER },
    confidence: { type: Type.NUMBER },
    metrics: {
      type: Type.OBJECT,
      properties: Object.fromEntries(
        METRIC_KEYS.map((k) => [k, metricGeminiSchema]),
      ),
      required: [...METRIC_KEYS],
    },
  },
  required: ['overallScore', 'confidence', 'metrics'],
};

// ---- Daily insight (Prompt 3) ----------------------------------------------------

export const insightResponseZod = z.object({
  summary: z.string().min(1),
  positiveChange: z.string().min(1),
  attentionArea: z.string().min(1),
  recommendation: z.string().min(1),
  nextAction: z.string().min(1),
});

export type InsightResponse = z.infer<typeof insightResponseZod>;

export const insightGeminiSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    positiveChange: { type: Type.STRING },
    attentionArea: { type: Type.STRING },
    recommendation: { type: Type.STRING },
    nextAction: { type: Type.STRING },
  },
  required: [
    'summary',
    'positiveChange',
    'attentionArea',
    'recommendation',
    'nextAction',
  ],
};
