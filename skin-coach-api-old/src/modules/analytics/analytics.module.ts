import { Module } from '@nestjs/common';

import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

// Not listed in docs/08's module list, but docs/05 (POST /analytics/events) and
// docs/04 (analytics_events table) both require it — added for completeness.
@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
