import { File } from 'expo-file-system';
import { fetch as expoFetch } from 'expo/fetch';

import {
  METRIC_KEYS,
  type AnalysisResult,
  type ChangeDirection,
  type MetricDetail,
  type MetricKey,
} from '@/features/analysis/analysis.types';
import { mockAnalysisResult } from '@/mocks/analysis.mock';

import { isMockApiEnabled, mockRequest, request } from './client';

// Slice 3 (docs/19 Phase 21): the scan → analysis → results pipeline is wired to the
// real backend. Capture → presigned PUT upload → POST /scans → poll status → GET result.
// Flip to false to fall back to the mock analysis fixture without touching screens.
const WIRED_TO_BACKEND = true;

// ---- Wire shapes (skin-coach-api ScanService responses) --------------------------

export interface UploadUrlResponse {
  uploadUrl: string;
  imageKey: string;
}

export interface CreateScanResponse {
  scanId: string;
  status: string;
}

export type ScanStatusValue = 'processing' | 'completed' | 'failed';

export interface ScanStatusResponse {
  status: ScanStatusValue;
}

// GET /scans/:id once completed. `metrics` is the metricsDetail JSON keyed by metric;
// `changes` is the backend-computed per-metric delta vs. the previous scan (docs/06
// Step 7). Both absent while processing / on the first scan (empty changes).
interface RawScanResult {
  status: ScanStatusValue;
  date?: string;
  score?: number;
  confidence?: number;
  previousScore?: number | null;
  scoreDelta?: number;
  changes?: Partial<Record<MetricKey, number>>;
  metrics?: Partial<
    Record<MetricKey, { score: number; severity?: string; status?: string }>
  >;
  insight?: {
    summary: string;
    recommendation: string;
    positiveChanges: string | null;
    attentionNeeded: string | null;
    nextSteps: string | null;
  };
  imageUrl?: string;
}

// ---- Pipeline steps --------------------------------------------------------------

// Step 3 (docs/06): ask the API for a presigned PUT so the client uploads straight to
// private storage. fileSize (optional) lets the backend reject an oversized image early.
export async function createUploadUrl(fileSize?: number): Promise<UploadUrlResponse> {
  return request<UploadUrlResponse>('/scans/upload-url', {
    method: 'POST',
    body: { contentType: 'image/jpeg', fileSize },
  });
}

// Uploads the captured JPEG bytes directly to the presigned URL. Bypasses request()
// (no auth header — the signature IS the auth) and must send Content-Type: image/jpeg
// to match the type bound into the signature, or storage rejects it.
export async function uploadImage(uploadUrl: string, fileUri: string): Promise<void> {
  // SDK 57 File + expo/fetch stream the file as raw binary. RN's global fetch can't
  // build a Blob from a file:// URI here ("Creating blobs from ArrayBuffer … not
  // supported"), so we must use expo/fetch with a File body, not fetch(uri).blob().
  const file = new File(fileUri);
  const res = await expoFetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'image/jpeg' },
    body: file,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Image upload failed (${res.status}) ${body.slice(0, 200)}`);
  }
}

// POST /scans — records the scan (status `processing`) and kicks off analysis. Returns
// the scanId the client then polls.
export async function createScan(
  imageKey: string,
  device?: string,
): Promise<CreateScanResponse> {
  return request<CreateScanResponse>('/scans', {
    method: 'POST',
    body: { imageKey, device },
  });
}

// Lightweight poll target while the Gemini pipeline runs (~15s). Returns just the status.
export async function getScanStatus(scanId: string): Promise<ScanStatusResponse> {
  return request<ScanStatusResponse>(`/scans/${scanId}/status`);
}

// GET /scans/:id — the completed analysis, mapped to the UI's AnalysisResult. In mock
// mode (or with the backend flag off) it returns the fixture, ignoring scanId, so the
// Results screen stays walkable without a real scan.
export async function getScanResult(scanId: string): Promise<AnalysisResult> {
  if (isMockApiEnabled || !WIRED_TO_BACKEND) {
    return mockRequest(mockAnalysisResult);
  }
  const raw = await request<RawScanResult>(`/scans/${scanId}`);
  return mapScanResult(raw);
}

// ---- Backend → UI mapping --------------------------------------------------------

// All 9 metrics are scored 0–100 where higher = better (vision-analysis prompt), so an
// increase is always the good direction. Qualitative status falls back to a score band
// when Gemini didn't supply one (only acne/redness/hydration are asked for it).
function bandLabel(score: number): string {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Fair';
  if (score >= 30) return 'Low';
  return 'Needs care';
}

function changeLabel(delta: number): string {
  if (delta > 0) return 'Improved';
  if (delta < 0) return 'Slipped';
  return 'No Change';
}

function directionOf(delta: number): ChangeDirection {
  if (delta > 0) return 'up';
  if (delta < 0) return 'down';
  return 'flat';
}

function toMetricDetail(
  key: MetricKey,
  metric: { score: number; severity?: string; status?: string } | undefined,
  delta: number,
): MetricDetail {
  const score = Math.round(metric?.score ?? 0);
  return {
    key,
    score,
    status: metric?.status ?? metric?.severity ?? bandLabel(score),
    changeLabel: changeLabel(delta),
    changeDirection: directionOf(delta),
    positive: delta > 0,
  };
}

function trendSummary(delta: number): string {
  if (delta > 0) return "You're moving in the right direction.";
  if (delta < 0) return 'A small dip today — stay consistent.';
  return 'Holding steady since your last scan.';
}

function mapScanResult(raw: RawScanResult): AnalysisResult {
  const overallScore = Math.round(raw.score ?? 0);
  const scoreDelta = raw.scoreDelta ?? 0;
  return {
    date: raw.date ?? new Date().toISOString(),
    overallScore,
    confidence: raw.confidence ?? 0,
    scoreDelta,
    previousScore: raw.previousScore ?? overallScore,
    trendSummary: trendSummary(scoreDelta),
    insight: { title: "Today's Insight", message: raw.insight?.summary ?? '' },
    recommendation: raw.insight?.recommendation ?? '',
    metrics: METRIC_KEYS.map((key) =>
      toMetricDetail(key, raw.metrics?.[key], raw.changes?.[key] ?? 0),
    ),
  };
}
