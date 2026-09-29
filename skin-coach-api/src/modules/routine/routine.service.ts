import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import { UsersService } from '../users/users.service';
import type { CompleteItemDto } from './dto/complete-item.dto';
import type { CreateRoutineDto } from './dto/create-routine.dto';
import type { UpdateRoutineDto } from './dto/update-routine.dto';

export interface RoutineItemResponse {
  id: string;
  productName: string;
  stepOrder: number;
  productType: string | null;
  instructions: string | null;
  reminderTime: string | null;
  completedToday: boolean;
}

export interface RoutineResponse {
  id: string;
  name: string;
  timeOfDay: string;
  isActive: boolean;
  items: RoutineItemResponse[];
}

export type WeekDayStatus = 'complete' | 'missed' | 'today' | 'upcoming';

export interface RoutineStats {
  currentStreak: number;
  weeklyConsistency: number;
  completedThisWeek: number;
  activeItems: number;
  // Mon→Sun of the current week, each day's real completion status (for the strip).
  weeklyDays: { label: string; status: WeekDayStatus }[];
}

// An item optionally carrying today's log (present when the query included it).
interface ItemWithLogs {
  id: string;
  productName: string;
  stepOrder: number;
  productType: string | null;
  instructions: string | null;
  reminderTime: string | null;
  routineLogs?: { completed: boolean }[];
}

@Injectable()
export class RoutineService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
  ) {}

  async getRoutines(clerkId: string): Promise<RoutineResponse[]> {
    const userId = await this.users.getLocalUserId(clerkId);
    const routines = await this.prisma.routine.findMany({
      where: { userId, deletedAt: null },
      orderBy: { timeOfDay: 'asc' },
      include: {
        items: {
          where: { deletedAt: null },
          orderBy: { stepOrder: 'asc' },
          include: { routineLogs: { where: { logDate: this.todayUtc() } } },
        },
      },
    });
    return routines.map((r) => this.toResponse(r, r.items));
  }

  async createRoutine(
    clerkId: string,
    dto: CreateRoutineDto,
  ): Promise<RoutineResponse> {
    const userId = await this.users.getLocalUserId(clerkId);
    const routine = await this.prisma.routine.create({
      data: {
        userId,
        name: dto.name,
        timeOfDay: dto.timeOfDay,
        items: {
          create: dto.items.map((i) => ({
            productName: i.productName,
            stepOrder: i.stepOrder,
            productType: i.productType,
            instructions: i.instructions,
            reminderTime: i.reminderTime,
          })),
        },
      },
      include: { items: { orderBy: { stepOrder: 'asc' } } },
    });
    return this.toResponse(routine, routine.items);
  }

  async updateRoutine(
    clerkId: string,
    id: string,
    dto: UpdateRoutineDto,
  ): Promise<RoutineResponse> {
    const userId = await this.users.getLocalUserId(clerkId);
    await this.assertOwned(userId, id);
    await this.prisma.routine.update({
      where: { id },
      data: { name: dto.name, isActive: dto.isActive },
    });
    // Re-read with today's completion so the response matches getRoutines' shape.
    return (await this.getRoutines(clerkId)).find((r) => r.id === id)!;
  }

  async deleteRoutine(clerkId: string, id: string): Promise<void> {
    const userId = await this.users.getLocalUserId(clerkId);
    await this.assertOwned(userId, id);
    await this.prisma.routine.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // Toggles today's completion for a single item, keyed by the unique
  // (routineItemId, logDate) constraint so a day can't be double-logged (docs/19).
  async completeItem(
    clerkId: string,
    itemId: string,
    dto: CompleteItemDto,
  ): Promise<{ itemId: string; completed: boolean; logDate: Date }> {
    const userId = await this.users.getLocalUserId(clerkId);
    const item = await this.prisma.routineItem.findFirst({
      where: {
        id: itemId,
        deletedAt: null,
        routine: { userId, deletedAt: null },
      },
      select: { id: true },
    });
    if (!item) {
      throw new NotFoundException('Routine item not found');
    }

    const completed = dto.completed ?? true;
    const logDate = this.todayUtc();
    const log = await this.prisma.routineLog.upsert({
      where: { routineItemId_logDate: { routineItemId: itemId, logDate } },
      create: {
        routineItemId: itemId,
        userId,
        logDate,
        completed,
        completedAt: completed ? new Date() : null,
      },
      update: { completed, completedAt: completed ? new Date() : null },
    });
    return { itemId, completed: log.completed, logDate };
  }

  async getStats(clerkId: string): Promise<RoutineStats> {
    const userId = await this.users.getLocalUserId(clerkId);
    const [activeItems, completedThisWeek, currentStreak, weekLogs] =
      await Promise.all([
        this.prisma.routineItem.count({
          where: {
            deletedAt: null,
            isActive: true,
            routine: { userId, deletedAt: null, isActive: true },
          },
        }),
        this.prisma.routineLog.count({
          where: { userId, completed: true, logDate: { gte: this.daysAgo(7) } },
        }),
        this.computeStreak(userId),
        this.prisma.routineLog.findMany({
          where: {
            userId,
            completed: true,
            logDate: { gte: this.startOfWeekUtc() },
          },
          select: { logDate: true },
        }),
      ]);

    const weeklyConsistency =
      activeItems > 0
        ? Math.min(
            Math.round((completedThisWeek / (activeItems * 7)) * 100),
            100,
          )
        : 0;

    const completedDays = new Set(weekLogs.map((l) => this.dayKey(l.logDate)));

    return {
      currentStreak,
      weeklyConsistency,
      completedThisWeek,
      activeItems,
      weeklyDays: this.buildWeekDays(completedDays),
    };
  }

  // Mon→Sun of the current (UTC) week with each day's real status: complete when a
  // routine was logged, today gets the dashed-ring state, past unlogged days are missed,
  // future days upcoming. Never fabricated — driven entirely by routine_logs.
  private buildWeekDays(
    completedDays: Set<string>,
  ): { label: string; status: WeekDayStatus }[] {
    const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const monday = this.startOfWeekUtc();
    const todayKey = this.dayKey(new Date());
    return labels.map((label, i) => {
      const d = new Date(monday);
      d.setUTCDate(monday.getUTCDate() + i);
      const key = this.dayKey(d);
      let status: WeekDayStatus;
      if (key > todayKey) status = 'upcoming';
      else if (key === todayKey)
        status = completedDays.has(key) ? 'complete' : 'today';
      else status = completedDays.has(key) ? 'complete' : 'missed';
      return { label, status };
    });
  }

  private startOfWeekUtc(): Date {
    const t = new Date(new Date().toISOString().slice(0, 10));
    const offset = (t.getUTCDay() + 6) % 7; // days since Monday (Mon=0)
    t.setUTCDate(t.getUTCDate() - offset);
    return t;
  }

  // Consecutive days (ending today, or yesterday as grace) with ≥1 completed item.
  // NOTE: uses UTC calendar days; per-user timezone is a later refinement.
  private async computeStreak(userId: string): Promise<number> {
    const logs = await this.prisma.routineLog.findMany({
      where: { userId, completed: true, logDate: { gte: this.daysAgo(120) } },
      select: { logDate: true },
    });
    const days = new Set(logs.map((l) => this.dayKey(l.logDate)));

    const cursor = this.todayUtc();
    if (!days.has(this.dayKey(cursor))) {
      cursor.setUTCDate(cursor.getUTCDate() - 1); // grace: today not logged yet
    }
    let streak = 0;
    while (days.has(this.dayKey(cursor))) {
      streak++;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
    return streak;
  }

  private async assertOwned(userId: string, id: string): Promise<void> {
    const routine = await this.prisma.routine.findFirst({
      where: { id, userId, deletedAt: null },
      select: { id: true },
    });
    if (!routine) {
      throw new NotFoundException('Routine not found');
    }
  }

  private toResponse(
    routine: { id: string; name: string; timeOfDay: string; isActive: boolean },
    items: ItemWithLogs[],
  ): RoutineResponse {
    return {
      id: routine.id,
      name: routine.name,
      timeOfDay: routine.timeOfDay,
      isActive: routine.isActive,
      items: items.map((it) => ({
        id: it.id,
        productName: it.productName,
        stepOrder: it.stepOrder,
        productType: it.productType,
        instructions: it.instructions,
        reminderTime: it.reminderTime,
        completedToday: it.routineLogs?.[0]?.completed ?? false,
      })),
    };
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
