import { randomUUID } from 'node:crypto';

import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import { METRIC_KEYS } from '../analysis/analysis.schema';
import { ScanQueue } from '../../queue/scan-queue';
import { StorageService } from '../../storage/storage.service';
import { UsersService } from '../users/users.service';
import type { CreateScanDto } from './dto/create-scan.dto';
import type { CreateUploadUrlDto } from './dto/create-upload-url.dto';

// Maps a metric key → its flat score column on skin_analysis (mirrors the map in
// AnalysisService — kept local so the read path doesn't depend on the pipeline). Used
// to compute the per-metric change vs. the previous scan on read (docs/06 Step 7).
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

export interface UploadUrlResponse {
  uploadUrl: string;
  imageKey: string;
}

export interface CreateScanResponse {
  scanId: string;
  status: string;
}

export interface ScanStatusResponse {
  status: string;
}

export interface ScanHistoryEntry {
  scanId: string;
  date: Date;
  status: string;
  score: number | null;
}

export interface ScanResultResponse {
  status: string;
  date?: Date;
  score?: number;
  confidence?: number;
  // Trend vs. the previous completed scan (docs/06 Step 7 — computed by the backend,
  // not Gemini). previousScore is null on the user's first scan; changes is per-metric
  // (current score − previous score), empty on the first scan.
  previousScore?: number | null;
  scoreDelta?: number;
  changes?: Record<string, number>;
  metrics?: unknown; // full metricsDetail JSON (docs/16 shape)
  insight?: {
    summary: string;
    recommendation: string;
    positiveChanges: string | null;
    attentionNeeded: string | null;
    nextSteps: string | null;
  };
  imageUrl?: string;
}

interface ScanComparison {
  previousScore: number | null;
  scoreDelta: number;
  changes: Record<string, number>;
}

@Injectable()
export class ScanService {
  private readonly logger = new Logger(ScanService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly users: UsersService,
    private readonly queue: ScanQueue,
  ) {}

  // Step 3 (docs/06): hand back a presigned URL so the client uploads the selfie
  // straight to private storage. The key is namespaced by the local user id so a
  // caller can only ever write under their own prefix (re-checked in createScan).
  async createUploadUrl(
    clerkId: string,
    dto: CreateUploadUrlDto,
  ): Promise<UploadUrlResponse> {
    const userId = await this.users.getLocalUserId(clerkId);
    const imageKey = `scans/${userId}/${randomUUID()}.jpg`;
    const uploadUrl = await this.storage.createUploadUrl(
      imageKey,
      dto.contentType,
    );
    return { uploadUrl, imageKey };
  }

  // Creates the scan record (status `processing`) after the image is uploaded.
  // TODO(Phase 17): enqueue the SQS analysis job here so the worker Lambda runs
  // the Gemini pipeline asynchronously.
  async createScan(
    clerkId: string,
    dto: CreateScanDto,
  ): Promise<CreateScanResponse> {
    const userId = await this.users.getLocalUserId(clerkId);
    this.assertOwnedKey(dto.imageKey, userId);

    const scan = await this.prisma.skinScan.create({
      data: {
        userId,
        scanDate: new Date(),
        imageUrl: dto.imageKey, // store the key; sign a GET URL on read
        deviceModel: dto.device,
        // status defaults to `processing` in the schema
      },
      select: { id: true, status: true },
    });

    // Kick off analysis out-of-band (in-process now, SQS worker later). Not awaited
    // by the queue itself, so this returns immediately with status `processing`.
    await this.queue.enqueueAnalysis(scan.id);

    return { scanId: scan.id, status: scan.status };
  }

  // docs/05 Get Scan Result. Returns the analysis + insight once completed; while
  // still `processing` (or `failed`) it returns just the status so the client polls.
  async getScanResult(
    clerkId: string,
    scanId: string,
  ): Promise<ScanResultResponse> {
    const userId = await this.users.getLocalUserId(clerkId);
    const scan = await this.prisma.skinScan.findFirst({
      where: { id: scanId, userId, deletedAt: null },
      include: { analysis: true, insight: true },
    });
    if (!scan) {
      throw new NotFoundException('Scan not found');
    }
    if (scan.status !== 'completed' || !scan.analysis || !scan.insight) {
      return { status: scan.status };
    }

    const [imageUrl, comparison] = await Promise.all([
      this.storage.createDownloadUrl(scan.imageUrl),
      this.computeComparison(userId, scan.scanDate, scan.analysis),
    ]);
    return {
      status: scan.status,
      date: scan.scanDate,
      score: scan.analysis.overallScore,
      confidence: scan.analysis.confidenceScore,
      previousScore: comparison.previousScore,
      scoreDelta: comparison.scoreDelta,
      changes: comparison.changes,
      metrics: scan.analysis.metricsDetail,
      insight: {
        summary: scan.insight.summary,
        recommendation: scan.insight.recommendation,
        positiveChanges: scan.insight.positiveChanges,
        attentionNeeded: scan.insight.attentionNeeded,
        nextSteps: scan.insight.nextSteps,
      },
      imageUrl,
    };
  }

  // docs/05 Scan History — the caller's scans (newest first) with their score.
  async getScanHistory(clerkId: string): Promise<ScanHistoryEntry[]> {
    const userId = await this.users.getLocalUserId(clerkId);
    const scans = await this.prisma.skinScan.findMany({
      where: { userId, deletedAt: null },
      orderBy: { scanDate: 'desc' },
      take: 100,
      include: { analysis: { select: { overallScore: true } } },
    });
    return scans.map((s) => ({
      scanId: s.id,
      date: s.scanDate,
      status: s.status,
      score: s.analysis?.overallScore ?? null,
    }));
  }

  async getScanStatus(
    clerkId: string,
    scanId: string,
  ): Promise<ScanStatusResponse> {
    const userId = await this.users.getLocalUserId(clerkId);
    const scan = await this.prisma.skinScan.findFirst({
      where: { id: scanId, userId, deletedAt: null },
      select: { status: true },
    });
    if (!scan) {
      throw new NotFoundException('Scan not found');
    }
    return { status: scan.status };
  }

  // Soft-deletes the scan (docs/12: users can delete their own scans) and best-effort
  // removes the object from storage. Storage cleanup failure doesn't fail the request
  // — the record is already gone; an orphaned object is swept by retention.
  async deleteScan(clerkId: string, scanId: string): Promise<void> {
    const userId = await this.users.getLocalUserId(clerkId);
    const scan = await this.prisma.skinScan.findFirst({
      where: { id: scanId, userId, deletedAt: null },
      select: { id: true, imageUrl: true },
    });
    if (!scan) {
      throw new NotFoundException('Scan not found');
    }

    await this.prisma.skinScan.update({
      where: { id: scan.id },
      data: { deletedAt: new Date() },
    });

    try {
      await this.storage.deleteObject(scan.imageUrl);
    } catch (error) {
      this.logger.warn(
        `Failed to delete storage object ${scan.imageUrl}: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
    }
  }

  // docs/06 Step 7: the trend math is the backend's job (not Gemini). Compares this
  // scan's analysis against the most recent earlier completed scan and returns the
  // overall delta + per-metric change the Results screen renders. First scan → no
  // previous, so previousScore is null and there are no per-metric changes.
  private async computeComparison(
    userId: string,
    scanDate: Date,
    current: Record<string, unknown>,
  ): Promise<ScanComparison> {
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
      return { previousScore: null, scoreDelta: 0, changes: {} };
    }

    const prev = previous.analysis as unknown as Record<string, number>;
    const changes: Record<string, number> = {};
    for (const key of METRIC_KEYS) {
      const column = METRIC_COLUMN[key];
      changes[key] = (current[column] as number) - prev[column];
    }

    return {
      previousScore: prev.overallScore,
      scoreDelta: (current.overallScore as number) - prev.overallScore,
      changes,
    };
  }

  // Defends against a caller passing someone else's (or a crafted) key into
  // createScan — the key must sit under this user's own scans/ prefix.
  private assertOwnedKey(imageKey: string, userId: string): void {
    if (!imageKey.startsWith(`scans/${userId}/`)) {
      throw new ForbiddenException('imageKey does not belong to this user');
    }
  }
}
