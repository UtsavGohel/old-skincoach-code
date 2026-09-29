import { Controller, Get, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthContext } from '../../common/types/auth.types';
import { ClerkAuthGuard } from '../../guards/clerk-auth.guard';
import { DashboardResponse, DashboardService } from './dashboard.service';

// docs/05 GET /dashboard — the Home screen aggregate, owner-scoped to the caller.
@Controller('dashboard')
@UseGuards(ClerkAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getDashboard(@CurrentUser() auth: AuthContext): Promise<DashboardResponse> {
    return this.dashboardService.getDashboard(auth.clerkId);
  }
}
