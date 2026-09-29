import {
  Body,
  Controller,
  Get,
  NotImplementedException,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthContext } from '../../common/types/auth.types';
import { ClerkAuthGuard } from '../../guards/clerk-auth.guard';
import { UpdateMeDto } from './dto/update-me.dto';
import { UsersService, UserResponse } from './users.service';

// All routes require a valid Clerk session JWT (docs/12). The verified identity is
// injected via @CurrentUser rather than trusting any client-supplied user id.
@Controller('users')
@UseGuards(ClerkAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() auth: AuthContext): Promise<UserResponse> {
    return this.usersService.getMe(auth.clerkId);
  }

  @Patch('me')
  updateMe(
    @CurrentUser() auth: AuthContext,
    @Body() dto: UpdateMeDto,
  ): Promise<UserResponse> {
    return this.usersService.updateMe(auth.clerkId, dto);
  }

  @Post('profile-image')
  uploadProfileImage(): never {
    // Deferred: the scan pipeline is the Phase 16 deliverable. Profile-image upload
    // reuses StorageService but also needs read-signing of `users.profileImage` in
    // getMe — folded into the mobile integration (Phase 21).
    throw new NotImplementedException('Profile-image upload lands in Phase 21');
  }
}
