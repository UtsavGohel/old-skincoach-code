import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthContext } from '../../common/types/auth.types';
import { ClerkAuthGuard } from '../../guards/clerk-auth.guard';
import { ProgressService } from './progress.service';
import type {
  ChartPoint,
  ProgressData,
  ProgressSummary,
  TimelineEntry,
  TrendRange,
} from './progress.service';

@Controller('progress')
@UseGuards(ClerkAuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  // The full progress_trends payload the mobile app renders (score trend, metric
  // trends, before/after, milestones). The narrower summary/timeline/chart routes
  // below remain for other consumers.
  @Get()
  getProgress(@CurrentUser() auth: AuthContext): Promise<ProgressData> {
    return this.progressService.getProgressData(auth.clerkId);
  }

  @Get('summary')
  getSummary(@CurrentUser() auth: AuthContext): Promise<ProgressSummary> {
    return this.progressService.getSummary(auth.clerkId);
  }

  @Get('timeline')
  getTimeline(@CurrentUser() auth: AuthContext): Promise<TimelineEntry[]> {
    return this.progressService.getTimeline(auth.clerkId);
  }

  @Get('chart')
  getChart(
    @CurrentUser() auth: AuthContext,
    @Query('range') range?: TrendRange,
  ): Promise<{ range: TrendRange; points: ChartPoint[] }> {
    return this.progressService.getChart(auth.clerkId, range);
  }
}
