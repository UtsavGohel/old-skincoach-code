import { Module } from '@nestjs/common';

import { ClerkAuthGuard } from '../../guards/clerk-auth.guard';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  // ClerkAuthGuard is provided here so Nest can resolve it (with ConfigService)
  // for the @UseGuards decorator on the controller.
  providers: [UsersService, ClerkAuthGuard],
  // Exported so AuthModule's Clerk webhook can sync the users mirror.
  exports: [UsersService],
})
export class UsersModule {}
