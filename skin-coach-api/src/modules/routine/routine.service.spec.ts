import { NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import { UsersService } from '../users/users.service';
import { RoutineService } from './routine.service';

const createPrismaMock = () => ({
  routine: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  routineItem: { findFirst: jest.fn(), count: jest.fn() },
  routineLog: { upsert: jest.fn(), count: jest.fn(), findMany: jest.fn() },
});

describe('RoutineService', () => {
  let service: RoutineService;
  let prisma: ReturnType<typeof createPrismaMock>;
  const users = { getLocalUserId: jest.fn().mockResolvedValue('u1') };

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new RoutineService(
      prisma as unknown as PrismaService,
      users as unknown as UsersService,
    );
  });

  it('getRoutines maps today’s completion onto items', async () => {
    prisma.routine.findMany.mockResolvedValue([
      {
        id: 'r1',
        name: 'Morning',
        timeOfDay: 'morning',
        isActive: true,
        items: [
          {
            id: 'i1',
            productName: 'Cleanser',
            stepOrder: 1,
            productType: null,
            instructions: null,
            reminderTime: '08:00',
            routineLogs: [{ completed: true }],
          },
          {
            id: 'i2',
            productName: 'SPF',
            stepOrder: 2,
            productType: null,
            instructions: null,
            reminderTime: null,
            routineLogs: [],
          },
        ],
      },
    ]);

    const res = await service.getRoutines('clerk_1');

    expect(res[0].items[0].completedToday).toBe(true);
    expect(res[0].items[1].completedToday).toBe(false);
  });

  it('completeItem upserts today’s log for an owned item', async () => {
    prisma.routineItem.findFirst.mockResolvedValue({ id: 'i1' });
    prisma.routineLog.upsert.mockResolvedValue({ completed: true });

    const res = await service.completeItem('clerk_1', 'i1', {});

    expect(res.completed).toBe(true);
    expect(prisma.routineLog.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          routineItemId_logDate: {
            routineItemId: 'i1',
            logDate: expect.any(Date),
          },
        },
      }),
    );
  });

  it('completeItem 404s for an item not owned by the user', async () => {
    prisma.routineItem.findFirst.mockResolvedValue(null);
    await expect(
      service.completeItem('clerk_1', 'iX', {}),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.routineLog.upsert).not.toHaveBeenCalled();
  });

  it('deleteRoutine 404s for a routine not owned by the user', async () => {
    prisma.routine.findFirst.mockResolvedValue(null);
    await expect(service.deleteRoutine('clerk_1', 'rX')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(prisma.routine.update).not.toHaveBeenCalled();
  });

  it('getStats computes a consecutive-day streak and weekly consistency', async () => {
    const day = (offset: number) =>
      new Date(Date.now() - offset * 86400000).toISOString().slice(0, 10);
    prisma.routineItem.count.mockResolvedValue(4);
    prisma.routineLog.count.mockResolvedValue(20);
    // completed today, yesterday, 2 days ago → streak 3 (then a gap)
    prisma.routineLog.findMany.mockResolvedValue([
      { logDate: new Date(day(0)) },
      { logDate: new Date(day(1)) },
      { logDate: new Date(day(2)) },
      { logDate: new Date(day(5)) },
    ]);

    const res = await service.getStats('clerk_1');

    expect(res.currentStreak).toBe(3);
    expect(res.activeItems).toBe(4);
    // 20 completions / (4 items * 7 days) = 71%
    expect(res.weeklyConsistency).toBe(71);
  });
});
