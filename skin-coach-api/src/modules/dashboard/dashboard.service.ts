import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import { METRIC_KEYS } from '../analysis/analysis.schema';
import { RoutineService } from '../routine/routine.service';
import { UsersService } from '../users/users.service';

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

const METRIC_LABEL: Record<(typeof METRIC_KEYS)[number], string> = {
  acne: 'Acne',
  hydration: 'Hydration',
  redness: 'Redness',
  pigmentation: 'Pigmentation',
  texture: 'Texture',
  oiliness: 'Oiliness',
  pores: 'Pores',
  wrinkles: 'Wrinkles',
  darkCircles: 'Dark Circles',
};

const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface DashboardRoutineItem {
  id: string;
  name: string;
  completed: boolean;
}

interface DashboardSnapshotMetric {
  label: string;
  value: string;
  direction: 'up' | 'down';
  upIsGood: boolean;
}

export interface DashboardResponse {
  // True once the user has at least one completed scan — lets the client show a
  // first-scan onboarding state instead of a fabricated zero score.
  hasScans: boolean;
  todayScore: number;
  scoreDelta: number;
  radianceLabel: string;
  streak: number;
  todayRoutine: { items: DashboardRoutineItem[] };
  latestInsight: { title: string; message: string };
  progressSnapshot: DashboardSnapshotMetric[];
  weeklyTrend: {
    averageScore: number;
    points: { label: string; value: number }[];
  };
  scanAvailable: boolean;
}

interface AnalysisRow {
  overallScore: number;
  [column: string]: number;
}

// Home dashboard aggregate (docs/05 GET /dashboard). Every field is derived from the
// caller's real scans/routine — no fabricated data. When the user has no completed
// scans, hasScans is false and the score-derived fields sit at neutral zeros so the
// client can render a first-scan state rather than a fake reading.
@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
    private readonly routines: RoutineService,
  ) {}

  async getDashboard(clerkId: string): Promise<DashboardResponse> {
    const userId = await this.users.getLocalUserId(clerkId);
    const completed = { userId, status: 'completed' as const, deletedAt: null };

    const [latestTwo, weekScans, todayCount, routines, scanDays] =
      await Promise.all([
        this.prisma.skinScan.findMany({
          where: completed,
          orderBy: { scanDate: 'desc' },
          take: 2,
          include: { analysis: true, insight: true },
        }),
        this.prisma.skinScan.findMany({
          where: { ...completed, scanDate: { gte: this.daysAgo(7) } },
          orderBy: { scanDate: 'asc' },
          include: { analysis: { select: { overallScore: true } } },
        }),
        this.prisma.skinScan.count({
          where: { ...completed, scanDate: { gte: this.todayUtc() } },
        }),
        this.routines.getRoutines(clerkId),
        this.prisma.skinScan.findMany({
          where: completed,
          orderBy: { scanDate: 'desc' },
          take: 180,
          select: { scanDate: true },
        }),
      ]);

    const latest = latestTwo[0];
    const latestA = latest?.analysis as AnalysisRow | null | undefined;
    const prevA = latestTwo[1]?.analysis as AnalysisRow | null | undefined;
    const hasScans = !!latestA;
    const todayScore = latestA?.overallScore ?? 0;

    return {
      hasScans,
      todayScore,
      scoreDelta:
        latestA && prevA ? latestA.overallScore - prevA.overallScore : 0,
      radianceLabel: this.radiance(hasScans ? todayScore : null),
      streak: this.scanStreak(scanDays.map((s) => s.scanDate)),
      todayRoutine: {
        items: routines.flatMap((r) =>
          r.items.map((it) => ({
            id: it.id,
            name: it.productName,
            completed: it.completedToday,
          })),
        ),
      },
      latestInsight: latest?.insight
        ? { title: 'AI Insight', message: latest.insight.summary }
        : {
            title: 'Welcome to SkinCoach',
            message: 'Take your first scan to unlock personalized insights.',
          },
      progressSnapshot: this.snapshot(latestA, prevA),
      weeklyTrend: this.weekly(weekScans),
      // Free tier: one scan per day (PROJECT_CONTEXT). Available when none logged today.
      scanAvailable: todayCount === 0,
    };
  }

  // Top 3 metrics by absolute change vs. the previous scan. Higher score = better for
  // every metric (vision prompt), so upIsGood is always true; a downward move renders
  // as a warning on the client. Empty until there's a previous scan to compare against.
  private snapshot(
    latestA: AnalysisRow | null | undefined,
    prevA: AnalysisRow | null | undefined,
  ): DashboardSnapshotMetric[] {
    if (!latestA || !prevA) {
      return [];
    }
    return METRIC_KEYS.map((key) => ({
      key,
      delta: latestA[METRIC_COLUMN[key]] - prevA[METRIC_COLUMN[key]],
    }))
      .filter((m) => m.delta !== 0)
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
      .slice(0, 3)
      .map((m) => ({
        label: METRIC_LABEL[m.key],
        value: String(Math.abs(m.delta)),
        direction: m.delta > 0 ? ('up' as const) : ('down' as const),
        upIsGood: true,
      }));
  }

  // One point per day over the last 7 days (latest scan wins if multiple that day).
  private weekly(
    scans: { scanDate: Date; analysis: { overallScore: number } | null }[],
  ): { averageScore: number; points: { label: string; value: number }[] } {
    const byDay = new Map<string, { label: string; value: number }>();
    for (const s of scans) {
      if (!s.analysis) continue;
      byDay.set(this.dayKey(s.scanDate), {
        label: WEEKDAY[s.scanDate.getUTCDay()],
        value: s.analysis.overallScore,
      });
    }
    const points = [...byDay.values()];
    const averageScore = points.length
      ? Math.round(
          (points.reduce((sum, p) => sum + p.value, 0) / points.length) * 10,
        ) / 10
      : 0;
    return { averageScore, points };
  }

  // Consecutive UTC days (ending today, or yesterday as grace) with ≥1 completed scan.
  private scanStreak(dates: Date[]): number {
    const days = new Set(dates.map((d) => this.dayKey(d)));
    const cursor = this.todayUtc();
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

  private radiance(score: number | null): string {
    if (score === null) return 'Ready when you are';
    if (score >= 85) return 'Optimal Radiance';
    if (score >= 70) return 'Healthy Glow';
    if (score >= 50) return 'Balanced';
    if (score >= 30) return 'Needs Care';
    return "Let's Improve Together";
  }

  private todayUtc(): Date {
    return new Date(new Date().toISOString().slice(0, 10));
  }

  private daysAgo(n: number): Date {
    return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
  }

  private dayKey(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
