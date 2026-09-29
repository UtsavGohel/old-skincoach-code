import { Controller, Get, NotImplementedException } from '@nestjs/common';

@Controller('achievements')
export class AchievementsController {
  @Get()
  getAchievements(): never {
    throw new NotImplementedException(
      'Implemented in Phase 18 (Progress/Routine/Coach APIs)',
    );
  }
}
