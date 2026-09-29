import { Controller, NotImplementedException, Post } from '@nestjs/common';

@Controller('analytics')
export class AnalyticsController {
  @Post('events')
  trackEvent(): never {
    throw new NotImplementedException(
      'Implemented in Phase 24 (Observability & Analytics)',
    );
  }
}
