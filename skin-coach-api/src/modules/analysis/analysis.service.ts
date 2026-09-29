import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import { GeminiService } from '../../ai/gemini.service';
import { PromptService } from '../../prompts/prompt.service';
import { StorageService } from '../../storage/storage.service';
import {
  InsightResponse,
  METRIC_KEYS,
  VisionResponse,
  insightGeminiSchema,
  insightResponseZod,
  visionGeminiSchema,
  visionResponseZod,
} from './analysis.schema';

interface ScanProfile {
  age: number | null;
  gender: string | null;
  skinType: string | null;
  primaryGoal: string | null;
}

interface Comparison {
  isFirst: boolean;
  previousScore: number | null;
  scoreChange: number;
  metricChanges: Record<string, number>;
}

// Maps a vision metric key → the flat score column on skin_analysis (docs/19 keeps
// both the flat columns for fast chart queries and metricsDetail for the full JSON).
const METRIC_COLUMN: Record<(typeof METRIC_KEYS)[number], string> = {
  acne: 'acneScore',
  hydration: 'hydrationScore',
  redness: 'rednessScore',
  pigmentation: 'pigmentationScore',
  texture: 'textureScore',
  oiliness: 'oilinessScore',
  pores: 'poresScore',
  wrinkles: 'wrinkleScore',
  darkCircles: 'darkCircleScore',
};

// The AI analysis pipeline (docs/06 Steps 4–9): Vision → validate (Zod, retry once) →
// confidence gate → backend historical comparison → insight generation → store.
// Invoked out-of-band by the ScanQueue (in-process in dev, SQS worker in prod) so it
// never blocks the request.
@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);

  static readonly VISION_PROMPT_VERSION = 'v1.0';
  static readonly INSIGHT_PROMPT_VERSION = 'v1.0';
  static readonly ANALYSIS_VERSION = 'v1.0';
  // docs/06 Confidence Rules: below 50% → reject the analysis outright.
  static readonly MIN_CONFIDENCE = 0.5;

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly gemini: GeminiService,
    private readonly prompts: PromptService,
  ) {}

  async processScan(scanId: string): Promise<void> {
    const startedAt = Date.now();
    const scan = await this.prisma.skinScan.findUnique({
      where: { id: scanId },
      include: { user: { include: { profile: true } } },
    });
    // Idempotent: only act on a scan that's still awaiting analysis.
    if (!scan || scan.status !== 'processing') {
      return;
    }

    try {
      const image = await this.storage.getObjectBuffer(scan.imageUrl);
      const vision = await this.runVision(image, scan.user.profile);

      if (vision.confidence < AnalysisService.MIN_CONFIDENCE) {
        this.logger.warn(
          `Scan ${scanId} rejected: low confidence ${vision.confidence}`,
        );
        await this.markFailed(scanId, startedAt);
        return;
      }

      const comparison = await this.computeComparison(
        scan.userId,
        scan.scanDate,
        vision.overallScore,
      );
      const insight = await this.runInsight(
        vision,
        comparison,
        scan.user.profile,
      );
      await this.storeResults(scanId, vision, insight, startedAt);
      this.logger.log(
        `Scan ${scanId} completed in ${Date.now() - startedAt}ms`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error';
      this.logger.error(`Analysis failed for scan ${scanId}: ${message}`);
      await this.markFailed(scanId, startedAt);
    }
  }

  private async runVision(
    image: Buffer,
    profile: ScanProfile | null,
  ): Promise<VisionResponse> {
    const result = await this.gemini.generateJson({
      systemInstruction: this.prompts.get('vision-analysis'),
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: image.toString('base64'),
          },
        },
        { text: `Skin profile: ${this.profileText(profile)}.` },
      ],
      responseSchema: visionGeminiSchema,
      validate: (raw) => visionResponseZod.parse(raw),
    });
    return result.value;
  }

  private async runInsight(
    vision: VisionResponse,
    comparison: Comparison,
    profile: ScanProfile | null,
  ): Promise<InsightResponse> {
    const metrics = this.flatScores(vision);
    const comparisonText = comparison.isFirst
      ? "This is the user's first scan — there is no history to compare against yet."
      : `Since the previous scan: overall score change ${this.signed(
          comparison.scoreChange,
        )}. Per-metric change: ${JSON.stringify(comparison.metricChanges)}.`;

    const result = await this.gemini.generateJson({
      systemInstruction: this.prompts.get('daily-insight'),
      parts: [
        {
          text: [
            `Today's metrics (0-100, higher is better): ${JSON.stringify(metrics)}.`,
            `Overall score: ${Math.round(vision.overallScore)}.`,
            comparisonText,
            `Skin profile: ${this.profileText(profile)}.`,
          ].join('\n'),
        },
      ],
      responseSchema: insightGeminiSchema,
      validate: (raw) => insightResponseZod.parse(raw),
    });
    return result.value;
  }

  // docs/06 Step 7: the trend math is done by the backend, NOT Gemini.
  private async computeComparison(
    userId: string,
    scanDate: Date,
    overallScore: number,
  ): Promise<Comparison> {
    const previous = await this.prisma.skinScan.findFirst({
      where: {
        userId,
        status: 'completed',
        deletedAt: null,
        scanDate: { lt: scanDate },
      },
      orderBy: { scanDate: 'desc' },
      include: { analysis: true },
    });

    if (!previous?.analysis) {
      return {
        isFirst: true,
        previousScore: null,
        scoreChange: 0,
        metricChanges: {},
      };
    }

    const prev = previous.analysis;
    const metricChanges: Record<string, number> = {};
    for (const key of METRIC_KEYS) {
      const column = METRIC_COLUMN[key] as keyof typeof prev;
      metricChanges[key] = Math.round(overallScore) - (prev[column] as number);
    }

    return {
      isFirst: false,
      previousScore: prev.overallScore,
      scoreChange: Math.round(overallScore) - prev.overallScore,
      metricChanges,
    };
  }

  private async storeResults(
    scanId: string,
    vision: VisionResponse,
    insight: InsightResponse,
    startedAt: number,
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.skinAnalysis.create({
        data: this.analysisData(scanId, vision),
      }),
      this.prisma.aiInsight.create({
        data: {
          scanId,
          summary: insight.summary,
          recommendation: insight.recommendation,
          positiveChanges: insight.positiveChange,
          attentionNeeded: insight.attentionArea,
          nextSteps: insight.nextAction,
          insightPromptVersion: AnalysisService.INSIGHT_PROMPT_VERSION,
        },
      }),
      this.prisma.skinScan.update({
        where: { id: scanId },
        data: { status: 'completed', processingTimeMs: Date.now() - startedAt },
      }),
    ]);
  }

  private analysisData(scanId: string, vision: VisionResponse) {
    const s = this.flatScores(vision);
    // Round-trip strips undefined optionals so it's clean JSON for the Json column.
    const metricsDetail: unknown = JSON.parse(JSON.stringify(vision.metrics));
    return {
      scanId,
      overallScore: Math.round(vision.overallScore),
      acneScore: s.acne,
      hydrationScore: s.hydration,
      rednessScore: s.redness,
      textureScore: s.texture,
      pigmentationScore: s.pigmentation,
      oilinessScore: s.oiliness,
      poresScore: s.pores,
      wrinkleScore: s.wrinkles,
      darkCircleScore: s.darkCircles,
      confidenceScore: vision.confidence,
      metricsDetail: metricsDetail as never,
      analysisVersion: AnalysisService.ANALYSIS_VERSION,
      visionModel: this.gemini.model,
      visionPromptVersion: AnalysisService.VISION_PROMPT_VERSION,
    };
  }

  private async markFailed(scanId: string, startedAt: number): Promise<void> {
    await this.prisma.skinScan.update({
      where: { id: scanId },
      data: { status: 'failed', processingTimeMs: Date.now() - startedAt },
    });
  }

  private flatScores(
    vision: VisionResponse,
  ): Record<(typeof METRIC_KEYS)[number], number> {
    return Object.fromEntries(
      METRIC_KEYS.map((k) => [k, Math.round(vision.metrics[k].score)]),
    ) as Record<(typeof METRIC_KEYS)[number], number>;
  }

  private profileText(profile: ScanProfile | null): string {
    if (!profile) {
      return 'not provided';
    }
    return [
      `age ${profile.age ?? 'unknown'}`,
      `gender ${profile.gender ?? 'unspecified'}`,
      `skin type ${profile.skinType ?? 'unknown'}`,
      `primary goal ${profile.primaryGoal ?? 'general skin health'}`,
    ].join(', ');
  }

  private signed(n: number): string {
    return n >= 0 ? `+${n}` : `${n}`;
  }
}
