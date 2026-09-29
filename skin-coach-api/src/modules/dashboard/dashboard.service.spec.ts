import { PrismaService } from '../../database/prisma.service';
import { RoutineService } from '../routine/routine.service';
import { UsersService } from '../users/users.service';
import { DashboardService } from './dashboard.service';

const createPrismaMock = () => ({
  skinScan: {
    findMany: jest.fn(),
    count: jest.fn(),
  },
});

const analysis = (overall: number, overrides: Record<string, number> = {}) => ({
  overallScore: overall,
  acneScore: 80,
  hydrationScore: 80,
  rednessScore: 80,
  pigmentationScore: 80,
  textureScore: 80,
  oilinessScore: 80,
  poresScore: 80,
  wrinkleScore: 80,
  darkCircleScore: 80,
  ...overrides,
});

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: ReturnType<typeof createPrismaMock>;
  let users: { getLocalUserId: jest.Mock };
  let routines: { getRoutines: jest.Mock };

  beforeEach(() => {
    prisma = createPrismaMock();
    users = { getLocalUserId: jest.fn().mockResolvedValue('u1') };
    routines = { getRoutines: jest.fn().mockResolvedValue([]) };
    service = new DashboardService(
      prisma as unknown as PrismaService,
      users as unknown as UsersService,
      routines as unknown as RoutineService,
    );
  });

  it('derives score, delta, snapshot and weekly trend from real scans', async () => {
    const today = new Date();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    prisma.skinScan.findMany
      // latestTwo (desc)
      .mockResolvedValueOnce([
        {
          scanDate: today,
          analysis: analysis(79, { acneScore: 95, hydrationScore: 70 }),
          insight: { summary: 'Looking great today.' },
        },
        {
          scanDate: yesterday,
          analysis: analysis(76, { acneScore: 85 }),
          insight: null,
        },
      ])
      // weekScans (asc)
      .mockResolvedValueOnce([
        { scanDate: yesterday, analysis: { overallScore: 76 } },
        { scanDate: today, analysis: { overallScore: 79 } },
      ])
      // scanDays
      .mockResolvedValueOnce([{ scanDate: today }, { scanDate: yesterday }]);
    prisma.skinScan.count.mockResolvedValue(1); // already scanned today

    const res = await service.getDashboard('clerk_1');

    expect(res.hasScans).toBe(true);
    expect(res.todayScore).toBe(79);
    expect(res.scoreDelta).toBe(3);
    expect(res.radianceLabel).toBe('Healthy Glow');
    expect(res.latestInsight).toEqual({
      title: 'AI Insight',
      message: 'Looking great today.',
    });
    // acne moved +10 (biggest change) → up/good
    expect(res.progressSnapshot[0]).toEqual({
      label: 'Acne',
      value: '10',
      direction: 'up',
      upIsGood: true,
    });
    expect(res.weeklyTrend.points).toHaveLength(2);
    expect(res.weeklyTrend.averageScore).toBe(77.5);
    expect(res.scanAvailable).toBe(false); // scanned today already
  });

  it('returns a first-scan state with no fabricated data when there are no scans', async () => {
    prisma.skinScan.findMany
      .mockResolvedValueOnce([]) // latestTwo
      .mockResolvedValueOnce([]) // weekScans
      .mockResolvedValueOnce([]); // scanDays
    prisma.skinScan.count.mockResolvedValue(0);

    const res = await service.getDashboard('clerk_1');

    expect(res.hasScans).toBe(false);
    expect(res.todayScore).toBe(0);
    expect(res.scoreDelta).toBe(0);
    expect(res.radianceLabel).toBe('Ready when you are');
    expect(res.progressSnapshot).toEqual([]);
    expect(res.weeklyTrend).toEqual({ averageScore: 0, points: [] });
    expect(res.latestInsight.title).toBe('Welcome to SkinCoach');
    expect(res.scanAvailable).toBe(true);
    expect(res.streak).toBe(0);
  });
});
