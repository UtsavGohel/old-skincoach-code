import { BadRequestException, Injectable } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import { METRIC_KEYS } from '../analysis/analysis.schema';
import { UsersService } from '../users/users.service';

export type TrendRange = '7d' | '30d' | '90d' | '1y';
const RANGE_DAYS: Record<TrendRange, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '1y': 365,
};

// Flat score column per metric on skin_analysis (mirrors AnalysisService's map).
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

const MONTH = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ---- Full Progress screen payload (mobile ProgressData) --------------------------
// Everything the progress_trends screen renders, assembled from the caller's real
// scans (docs/06 Step 7: trend math is backend-side). Empty/degraded gracefully when
// there aren't enough scans yet — the client shows an empty state, never fake numbers.
type UiTrendRange = '7D' | '30D' | '90D' | '1Y';

interface TrendPoint {
  label: string;
  value: number;
}

interface MetricTrend {
  key: string;
  status: string;
  direction: 'up' | 'down';
  positive: boolean;
}

interface Milestone {
  id: string;
  date: string;
  title: string;
  description: string;
  icon: 'start' | 'streak' | 'metric' | 'scan';
}

interface ComparisonSnapshot {
  label: string;
  date: string;
  score: number;
}

interface MetricComparison {
  key: string;
  before: number;
  after: number;
  positive: boolean;
}

interface BeforeAfterComparison {
  before: ComparisonSnapshot;
  after: ComparisonSnapshot;
  summary: string;
  metrics: MetricComparison[];
}

export interface ProgressData {
  hasEnoughData: boolean;
  currentScore: number;
  monthlyDelta: number;
  highlight: string;
  trends: Record<UiTrendRange, TrendPoint[]>;
  metricTrends: MetricTrend[];
  monthlyComparison: { previous: number; current: number; summary: string };
  beforeAfter: BeforeAfterComparison;
  milestones: Milestone[];
  aiObservation: string;
}

type AnalysisRow = { overallScore: number } & Record<string, number>;
interface ScanRow {
  id: string;
  scanDate: Date;
  analysis: AnalysisRow | null;
}

export interface ProgressSummary {
  overall: {
    latestScore: number | null;
    averageScore: number | null;
    bestScore: number | null;
    totalScans: number;
    scoreChange: number;
  };
  weekly: { averageScore: number | null; scans: number };
  monthly: { averageScore: number | null; scans: number; improvement: number };
}

export interface TimelineEntry {
  scanId: string;
  date: Date;
  score: number;
}

export interface ChartPoint {
  date: Date;
  overallScore: number;
  acne: number;
  hydration: number;
  redness: number;
  pigmentation: number;
  texture: number;
  oiliness: number;
  pores: number;
  wrinkles: number;
  darkCircles: number;
}

// Minimal shapes of the query results assembleSummary consumes.
interface ScanScore {
  analysis: { overallScore: number } | null;
}
interface OverallAgg {
  _avg: { overallScore: number | null };
  _max: { overallScore: number | null };
  _count: { _all: number };
}
interface WeekAgg {
  _avg: { overallScore: number | null };
  _count: { _all: number };
}

@Injectable()
export class ProgressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
  ) {}

  // docs/05 Progress Summary → Weekly / Monthly / Overall. docs/06 Step 7: trend math
  // is backend-computed. All aggregates are owner-scoped to the caller's completed scans.
  async getSummary(clerkId: string): Promise<ProgressSummary> {
    const userId = await this.users.getLocalUserId(clerkId);
    const completed = { userId, status: 'completed' as const, deletedAt: null };

    const [latestTwo, overallAgg, weekAgg, monthScans] = await Promise.all([
      this.prisma.skinScan.findMany({
        where: completed,
        orderBy: { scanDate: 'desc' },
        take: 2,
        include: { analysis: true },
      }),
      this.prisma.skinAnalysis.aggregate({
        where: { scan: completed },
        _avg: { overallScore: true },
        _max: { overallScore: true },
        _count: { _all: true },
      }),
      this.prisma.skinAnalysis.aggregate({
        where: { scan: { ...completed, scanDate: { gte: this.daysAgo(7) } } },
        _avg: { overallScore: true },
        _count: { _all: true },
      }),
      this.prisma.skinScan.findMany({
        where: { ...completed, scanDate: { gte: this.daysAgo(30) } },
        orderBy: { scanDate: 'asc' },
        include: { analysis: true },
      }),
    ]);

    return this.assembleSummary(latestTwo, overallAgg, weekAgg, monthScans);
  }

  private assembleSummary(
    latestTwo: ScanScore[],
    overallAgg: OverallAgg,
    weekAgg: WeekAgg,
    monthScans: ScanScore[],
  ): ProgressSummary {
    const latest = latestTwo[0]?.analysis?.overallScore ?? null;
    const previous = latestTwo[1]?.analysis?.overallScore ?? null;
    const monthScores = monthScans
      .map((m) => m.analysis?.overallScore)
      .filter((v): v is number => v !== undefined);

    return {
      overall: {
        latestScore: latest,
        averageScore: this.round(overallAgg._avg.overallScore),
        bestScore: overallAgg._max.overallScore ?? null,
        totalScans: overallAgg._count._all,
        scoreChange:
          latest !== null && previous !== null ? latest - previous : 0,
      },
      weekly: {
        averageScore: this.round(weekAgg._avg.overallScore),
        scans: weekAgg._count._all,
      },
      monthly: {
        averageScore: monthScores.length
          ? this.round(
              monthScores.reduce((s, v) => s + v, 0) / monthScores.length,
            )
          : null,
        scans: monthScans.length,
        improvement: monthScores.length
          ? monthScores[monthScores.length - 1] - monthScores[0]
          : 0,
      },
    };
  }

  async getTimeline(clerkId: string): Promise<TimelineEntry[]> {
    const userId = await this.users.getLocalUserId(clerkId);
    const scans = await this.prisma.skinScan.findMany({
      where: { userId, status: 'completed', deletedAt: null },
      orderBy: { scanDate: 'desc' },
      include: { analysis: { select: { overallScore: true } } },
    });
    return scans
      .filter((s) => s.analysis)
      .map((s) => ({
        scanId: s.id,
        date: s.scanDate,
        score: s.analysis!.overallScore,
      }));
  }

  async getChart(
    clerkId: string,
    range: TrendRange = '30d',
  ): Promise<{ range: TrendRange; points: ChartPoint[] }> {
    if (!(range in RANGE_DAYS)) {
      throw new BadRequestException('Invalid range (use 7d, 30d, 90d, 1y)');
    }
    const userId = await this.users.getLocalUserId(clerkId);
    const scans = await this.prisma.skinScan.findMany({
      where: {
        userId,
        status: 'completed',
        deletedAt: null,
        scanDate: { gte: this.daysAgo(RANGE_DAYS[range]) },
      },
      orderBy: { scanDate: 'asc' },
      include: { analysis: true },
    });

    const points: ChartPoint[] = scans
      .filter((s) => s.analysis)
      .map((s) => {
        const a = s.analysis!;
        return {
          date: s.scanDate,
          overallScore: a.overallScore,
          acne: a.acneScore,
          hydration: a.hydrationScore,
          redness: a.rednessScore,
          pigmentation: a.pigmentationScore,
          texture: a.textureScore,
          oiliness: a.oilinessScore,
          pores: a.poresScore,
          wrinkles: a.wrinkleScore,
          darkCircles: a.darkCircleScore,
        };
      });
    return { range, points };
  }

  // The full progress_trends payload, assembled from real scans. Powers the mobile
  // GET /progress. When there are <2 scans the trend/comparison sections come back
  // empty (hasEnoughData=false) so the client renders an empty state, not fake data.
  async getProgressData(clerkId: string): Promise<ProgressData> {
    const userId = await this.users.getLocalUserId(clerkId);
    const completed = { userId, status: 'completed' as const, deletedAt: null };

    const [scans, latestWithInsight] = await Promise.all([
      this.prisma.skinScan.findMany({
        where: completed,
        orderBy: { scanDate: 'asc' },
        take: 366,
        include: { analysis: true },
      }) as unknown as Promise<ScanRow[]>,
      this.prisma.skinScan.findFirst({
        where: completed,
        orderBy: { scanDate: 'desc' },
        include: { insight: true },
      }),
    ]);

    const scored = scans.filter((s): s is ScanRow & { analysis: AnalysisRow } =>
      Boolean(s.analysis),
    );
    const latest = scored[scored.length - 1];
    const first = scored[0];
    const previous = scored[scored.length - 2];
    const currentScore = latest?.analysis.overallScore ?? 0;
    const hasEnoughData = scored.length >= 2;

    const monthScores = scored
      .filter((s) => s.scanDate >= this.daysAgo(30))
      .map((s) => s.analysis.overallScore);
    const monthlyDelta = monthScores.length
      ? monthScores[monthScores.length - 1] - monthScores[0]
      : 0;

    const insight = latestWithInsight?.insight;

    return {
      hasEnoughData,
      currentScore,
      monthlyDelta,
      highlight: this.highlight(scored, currentScore, monthlyDelta),
      trends: {
        '7D': this.pointsPerDay(scored, 7),
        '30D': this.pointsPerDayDated(scored, 30),
        '90D': this.pointsByMonth(scored, 90),
        '1Y': this.pointsByQuarter(scored, 365),
      },
      metricTrends: this.metricTrends(latest?.analysis, previous?.analysis),
      monthlyComparison: {
        previous: monthScores[0] ?? currentScore,
        current: currentScore,
        summary: hasEnoughData
          ? 'Your consistency is paying off.'
          : 'Keep scanning to build your trend.',
      },
      beforeAfter: this.beforeAfter(first, latest),
      milestones: this.milestones(scored),
      aiObservation:
        insight?.summary ??
        "Complete a few scans and I'll start spotting trends in your skin.",
    };
  }

  private highlight(
    scored: { analysis: AnalysisRow }[],
    currentScore: number,
    monthlyDelta: number,
  ): string {
    if (!scored.length)
      return 'Take your first scan to start tracking progress.';
    const best = Math.max(...scored.map((s) => s.analysis.overallScore));
    if (currentScore >= best) return 'Your healthiest skin yet.';
    if (monthlyDelta > 0) return "You're trending upward this month.";
    return 'Stay consistent — small daily habits add up.';
  }

  private metricTrends(
    latest: AnalysisRow | undefined,
    previous: AnalysisRow | undefined,
  ): MetricTrend[] {
    if (!latest || !previous) return [];
    return METRIC_KEYS.map((key) => {
      const delta = latest[METRIC_COLUMN[key]] - previous[METRIC_COLUMN[key]];
      return { key, delta };
    })
      .filter((m) => m.delta !== 0)
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
      .slice(0, 4)
      .map((m) => ({
        key: m.key,
        status: this.band(latest[METRIC_COLUMN[m.key]]),
        direction: m.delta > 0 ? ('up' as const) : ('down' as const),
        positive: m.delta > 0,
      }));
  }

  private beforeAfter(
    first: (ScanRow & { analysis: AnalysisRow }) | undefined,
    latest: (ScanRow & { analysis: AnalysisRow }) | undefined,
  ): BeforeAfterComparison {
    if (!first || !latest || first.id === latest.id) {
      const only = latest ?? first;
      const snap: ComparisonSnapshot = {
        label: only ? 'First Scan' : '—',
        date: only ? this.formatShort(only.scanDate) : '—',
        score: only?.analysis.overallScore ?? 0,
      };
      return {
        before: snap,
        after: snap,
        summary: 'Take another scan to unlock your before & after comparison.',
        metrics: [],
      };
    }
    const delta = latest.analysis.overallScore - first.analysis.overallScore;
    return {
      before: {
        label: 'First Scan',
        date: this.formatShort(first.scanDate),
        score: first.analysis.overallScore,
      },
      after: {
        label: 'Latest Scan',
        date: this.formatShort(latest.scanDate),
        score: latest.analysis.overallScore,
      },
      summary:
        delta >= 0
          ? `Your skin score has climbed ${delta} point${delta === 1 ? '' : 's'} since your first scan.`
          : `Your skin score has shifted ${delta} points — keep at your routine.`,
      metrics: METRIC_KEYS.map((key) => {
        const before = first.analysis[METRIC_COLUMN[key]];
        const after = latest.analysis[METRIC_COLUMN[key]];
        return { key, before, after, positive: after >= before };
      }),
    };
  }

  private milestones(
    scored: (ScanRow & { analysis: AnalysisRow })[],
  ): Milestone[] {
    if (!scored.length) return [];
    const out: Milestone[] = [];
    const first = scored[0];
    out.push({
      id: 'start',
      date: this.formatShort(first.scanDate),
      title: 'Started Your Journey',
      description: 'Your first scan set the baseline for tracking your skin.',
      icon: 'start',
    });

    const streak = this.scanStreak(scored.map((s) => s.scanDate));
    if (streak >= 3) {
      out.push({
        id: 'streak',
        date: `${streak}-day streak`,
        title: `${streak}-Day Streak`,
        description: `You've scanned ${streak} days in a row — consistency is building.`,
        icon: 'streak',
      });
    }

    if (scored.length >= 2) {
      const best = scored.reduce((a, b) =>
        b.analysis.overallScore >= a.analysis.overallScore ? b : a,
      );
      out.push({
        id: 'best',
        date: this.formatShort(best.scanDate),
        title: 'Highest Score Yet',
        description: `Your skin reached its best score of ${best.analysis.overallScore}.`,
        icon: 'metric',
      });
    }

    const latest = scored[scored.length - 1];
    out.push({
      id: 'latest',
      date: this.isToday(latest.scanDate)
        ? 'Today'
        : this.formatShort(latest.scanDate),
      title: 'Latest Scan',
      description: `Your most recent reading came in at ${latest.analysis.overallScore}.`,
      icon: 'scan',
    });
    return out;
  }

  private pointsPerDay(scored: ScanRow[], days: number): TrendPoint[] {
    const since = this.daysAgo(days);
    const byDay = new Map<string, TrendPoint>();
    for (const s of scored) {
      if (s.scanDate < since || !s.analysis) continue;
      byDay.set(this.dayKey(s.scanDate), {
        label: WEEKDAY[s.scanDate.getUTCDay()],
        value: s.analysis.overallScore,
      });
    }
    return [...byDay.values()];
  }

  // One point per day (latest scan wins) with a dated label — so multiple scans on the
  // same day collapse to a single point instead of repeating "Today". today → "Today".
  private pointsPerDayDated(scored: ScanRow[], days: number): TrendPoint[] {
    const since = this.daysAgo(days);
    const byDay = new Map<string, TrendPoint>();
    for (const s of scored) {
      if (s.scanDate < since || !s.analysis) continue;
      byDay.set(this.dayKey(s.scanDate), {
        label: this.isToday(s.scanDate) ? 'Today' : this.formatShort(s.scanDate),
        value: s.analysis.overallScore,
      });
    }
    return [...byDay.values()];
  }

  private pointsByMonth(scored: ScanRow[], days: number): TrendPoint[] {
    return this.bucketAverage(
      scored,
      days,
      (d) => `${d.getUTCFullYear()}-${d.getUTCMonth()}`,
      (d) => MONTH[d.getUTCMonth()],
    );
  }

  private pointsByQuarter(scored: ScanRow[], days: number): TrendPoint[] {
    return this.bucketAverage(
      scored,
      days,
      (d) => `${d.getUTCFullYear()}-Q${Math.floor(d.getUTCMonth() / 3)}`,
      (d) => `Q${Math.floor(d.getUTCMonth() / 3) + 1}`,
    );
  }

  // Buckets scans within the window by a key, averaging each bucket's overall score.
  private bucketAverage(
    scored: ScanRow[],
    days: number,
    keyOf: (d: Date) => string,
    labelOf: (d: Date) => string,
  ): TrendPoint[] {
    const since = this.daysAgo(days);
    const buckets = new Map<
      string,
      { label: string; sum: number; n: number }
    >();
    for (const s of scored) {
      if (s.scanDate < since || !s.analysis) continue;
      const key = keyOf(s.scanDate);
      const b = buckets.get(key) ?? {
        label: labelOf(s.scanDate),
        sum: 0,
        n: 0,
      };
      b.sum += s.analysis.overallScore;
      b.n += 1;
      buckets.set(key, b);
    }
    return [...buckets.values()].map((b) => ({
      label: b.label,
      value: Math.round(b.sum / b.n),
    }));
  }

  private scanStreak(dates: Date[]): number {
    const days = new Set(dates.map((d) => this.dayKey(d)));
    const cursor = new Date(new Date().toISOString().slice(0, 10));
    if (!days.has(this.dayKey(cursor))) {
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
    let streak = 0;
    while (days.has(this.dayKey(cursor))) {
      streak++;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
    return streak;
  }

  private band(score: number): string {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Healthy';
    if (score >= 50) return 'Fair';
    if (score >= 30) return 'Needs Care';
    return 'Low';
  }

  private formatShort(date: Date): string {
    return `${MONTH[date.getUTCMonth()]} ${date.getUTCDate()}`;
  }

  private isToday(date: Date): boolean {
    return this.dayKey(date) === new Date().toISOString().slice(0, 10);
  }

  private dayKey(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private daysAgo(n: number): Date {
    return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
  }

  private round(value: number | null): number | null {
    return value === null ? null : Math.round(value);
  }
}
