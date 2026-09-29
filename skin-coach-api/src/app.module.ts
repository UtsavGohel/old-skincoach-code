import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validateEnv } from './config/env.schema';
import { PrismaModule } from './database/prisma.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { AchievementsModule } from './modules/achievements/achievements.module';
import { AnalysisModule } from './modules/analysis/analysis.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AuthModule } from './modules/auth/auth.module';
import { CoachModule } from './modules/coach/coach.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ProgressModule } from './modules/progress/progress.module';
import { RoutineModule } from './modules/routine/routine.module';
import { ScanModule } from './modules/scan/scan.module';
import { SettingsModule } from './modules/settings/settings.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { UsersModule } from './modules/users/users.module';
import { AiModule } from './ai/ai.module';
import { PromptModule } from './prompts/prompt.module';
import { QueueModule } from './queue/queue.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    PrismaModule,
    AiModule,
    PromptModule,
    StorageModule,
    QueueModule,
    AuthModule,
    UsersModule,
    DashboardModule,
    ScanModule,
    AnalysisModule,
    ProgressModule,
    RoutineModule,
    CoachModule,
    SubscriptionModule,
    NotificationsModule,
    SettingsModule,
    AchievementsModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
