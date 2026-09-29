import { BadRequestException } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import { UsersService } from '../users/users.service';
import { ProgressService } from './progress.service';

const createPrismaMock = () => ({
  skinScan: { findMany: jest.fn() },
  skinAnalysis: { aggregate: jest.fn() },
});

describe('ProgressService', () => {
  let service: ProgressService;
  let prisma: ReturnType<typeof createPrismaMock>;
  const users = { getLocalUserId: jest.fn().mockResolvedValue('u1') };

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new ProgressService(
      prisma as unknown as PrismaService,
      users as unknown as UsersService,
    );
  });

  it('getSummary computes overall/weekly/monthly from completed scans', async () => {
    prisma.skinScan.findMany
      .mockResolvedValueOnce([
        { analysis: { overallScore: 84 } },
        { analysis: { overallScore: 80 } },
      ]) // latest two (desc)
      .mockResolvedValueOnce([
        { analysis: { overallScore: 78 } },
        { analysis: { overallScore: 84 } },
      ]); // month scans (asc)
    prisma.skinAnalysis.aggregate
      .mockResolvedValueOnce({
        _avg: { overallScore: 81.4 },
        _max: { overallScore: 90 },
        _count: { _all: 10 },
      }) // overall
      .mockResolvedValueOnce({
        _avg: { overallScore: 82 },
        _count: { _all: 3 },
      }); // week

    const res = await service.getSummary('clerk_1');

    expect(res.overall).toEqual({
      latestScore: 84,
      averageScore: 81, // rounded
      bestScore: 90,
      totalScans: 10,
      scoreChange: 4, // 84 - 80
    });
    expect(res.weekly).toEqual({ averageScore: 82, scans: 3 });
    expect(res.monthly).toEqual({ averageScore: 81, scans: 2, improvement: 6 }); // 84-78
  });

  it('getChart rejects an invalid range', async () => {
    await expect(
      service.getChart('clerk_1', 'bogus' as never),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('getChart maps analyses to points for a valid range', async () => {
    prisma.skinScan.findMany.mockResolvedValue([
      {
        id: 's1',
        scanDate: new Date('2026-07-01'),
        analysis: {
          overallScore: 80,
          acneScore: 70,
          hydrationScore: 82,
          rednessScore: 85,
          pigmentationScore: 65,
          textureScore: 78,
          oilinessScore: 60,
          poresScore: 72,
          wrinkleScore: 88,
          darkCircleScore: 76,
        },
      },
    ]);

    const res = await service.getChart('clerk_1', '30d');

    expect(res.range).toBe('30d');
    expect(res.points).toHaveLength(1);
    expect(res.points[0]).toMatchObject({
      overallScore: 80,
      acne: 70,
      hydration: 82,
    });
  });

  it('getTimeline returns scans with a score, newest first', async () => {
    prisma.skinScan.findMany.mockResolvedValue([
      {
        id: 's2',
        scanDate: new Date('2026-07-02'),
        analysis: { overallScore: 85 },
      },
      { id: 's1', scanDate: new Date('2026-07-01'), analysis: null },
    ]);

    const res = await service.getTimeline('clerk_1');

    expect(res).toEqual([
      { scanId: 's2', date: new Date('2026-07-02'), score: 85 },
    ]);
  });
});
