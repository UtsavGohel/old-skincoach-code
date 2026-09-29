import { Controller, Get, NotImplementedException } from '@nestjs/common';

@Controller('dashboard')
export class DashboardController {
  @Get()
  getDashboard(): never {
    throw new NotImplementedException(
      'Implemented in Phase 18 (Progress/Routine/Coach APIs)',
    );
  }
}
