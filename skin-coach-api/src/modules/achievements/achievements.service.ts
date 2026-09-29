import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import { UsersService } from '../users/users.service';

export interface AchievementResponse {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  requiredValue: number;
  earned: boolean;
  earnedAt: Date | null;
}

@Injectable()
export class AchievementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
  ) {}

  // docs/05 GET /achievements — the full catalog with the caller's earned status.
  // (Awarding logic is future work; this is read-only.)
  async getAchievements(clerkId: string): Promise<AchievementResponse[]> {
    const userId = await this.users.getLocalUserId(clerkId);
    const [achievements, earned] = await Promise.all([
      this.prisma.achievement.findMany({ orderBy: { requiredValue: 'asc' } }),
      this.prisma.userAchievement.findMany({ where: { userId } }),
    ]);
    const earnedAt = new Map(earned.map((e) => [e.achievementId, e.earnedAt]));
    return achievements.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      icon: a.icon,
      category: a.category,
      requiredValue: a.requiredValue,
      earned: earnedAt.has(a.id),
      earnedAt: earnedAt.get(a.id) ?? null,
    }));
  }
}
