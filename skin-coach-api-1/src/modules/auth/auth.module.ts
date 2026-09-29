import { Module } from '@nestjs/common';

import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

// Scoped to Clerk integration only (webhook receiver + verification) — Clerk owns
// register/login/refresh, so those routes don't exist here (docs/19).
@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
