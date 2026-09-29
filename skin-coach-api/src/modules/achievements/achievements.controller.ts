import { Controller, Get, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthContext } from '../../common/types/auth.types';
import { ClerkAuthGuard } from '../../guards/clerk-auth.guard';
import {
  AchievementResponse,
  AchievementsService,
} from './achievements.service';

@Controller('achievements')
@UseGuards(ClerkAuthGuard)
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get()
  getAchievements(
    @CurrentUser() auth: AuthContext,
  ): Promise<AchievementResponse[]> {
    return this.achievementsService.getAchievements(auth.clerkId);
  }
}
