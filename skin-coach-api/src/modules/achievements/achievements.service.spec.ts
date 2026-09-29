import { PrismaService } from '../../database/prisma.service';
import { UsersService } from '../users/users.service';
import { AchievementsService } from './achievements.service';

const createPrismaMock = () => ({
  achievement: { findMany: jest.fn() },
  userAchievement: { findMany: jest.fn() },
});

describe('AchievementsService', () => {
  let service: AchievementsService;
  let prisma: ReturnType<typeof createPrismaMock>;
  const users = { getLocalUserId: jest.fn().mockResolvedValue('u1') };

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new AchievementsService(
      prisma as unknown as PrismaService,
      users as unknown as UsersService,
    );
  });

  it('returns the catalog with the user’s earned status', async () => {
    prisma.achievement.findMany.mockResolvedValue([
      {
        id: 'a1',
        title: 'First Scan',
        description: 'd',
        icon: 'i',
        category: 'c',
        requiredValue: 1,
      },
      {
        id: 'a2',
        title: '7-Day Streak',
        description: 'd',
        icon: 'i',
        category: 'c',
        requiredValue: 7,
      },
    ]);
    prisma.userAchievement.findMany.mockResolvedValue([
      { achievementId: 'a1', earnedAt: new Date('2026-07-01') },
    ]);

    const res = await service.getAchievements('c1');

    expect(res[0]).toMatchObject({ id: 'a1', earned: true });
    expect(res[1]).toMatchObject({ id: 'a2', earned: false, earnedAt: null });
  });
});
