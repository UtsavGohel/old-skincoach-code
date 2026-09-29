import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import type {
  ClerkUserData,
  ClerkWebhookEvent,
} from '../auth/clerk-webhook.types';
import type { UpdateMeDto } from './dto/update-me.dto';

// Public-facing shape of a user (docs/05 GET /users/me). Deliberately omits
// clerkId and soft-delete internals — the client never needs them.
export interface UserResponse {
  id: string;
  email: string;
  fullName: string | null;
  profileImage: string | null;
  createdAt: Date;
  profile: {
    age: number | null;
    gender: string | null;
    skinType: string | null;
    primaryGoal: string | null;
    experienceLevel: string | null;
    timezone: string | null;
    country: string | null;
  } | null;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  // GET /users/me — resolves the local mirror from the verified Clerk id. The row
  // is created by the Clerk webhook (source of truth), so a miss here means the
  // webhook hasn't landed yet (or the account was deleted): a genuine 404.
  async getMe(clerkId: string): Promise<UserResponse> {
    const user = await this.prisma.user.findFirst({
      where: { clerkId, deletedAt: null },
      include: { profile: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.toResponse(user);
  }

  // PATCH /users/me — updates the user's name and upserts their skin profile.
  // Undefined DTO fields are skipped by Prisma, so this is a true partial update.
  async updateMe(clerkId: string, dto: UpdateMeDto): Promise<UserResponse> {
    const user = await this.prisma.user.findFirst({
      where: { clerkId, deletedAt: null },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const profileData = {
      age: dto.age,
      gender: dto.gender,
      skinType: dto.skinType,
      primaryGoal: dto.primaryGoal,
      experienceLevel: dto.experienceLevel,
      timezone: dto.timezone,
      country: dto.country,
    };

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { fullName: dto.fullName },
      }),
      this.prisma.userProfile.upsert({
        where: { userId: user.id },
        create: { userId: user.id, ...profileData },
        update: profileData,
      }),
    ]);

    // Re-read so the returned payload reflects the freshly upserted profile.
    return this.getMe(clerkId);
  }

  // Applies a verified Clerk webhook event to the users mirror (docs/19 Phase 15).
  // Only user.* events mutate state; anything else is acknowledged and ignored.
  async syncFromClerkEvent(event: ClerkWebhookEvent): Promise<void> {
    switch (event.type) {
      case 'user.created':
      case 'user.updated':
        await this.upsertFromClerk(event.data as ClerkUserData);
        break;
      case 'user.deleted':
        await this.softDeleteByClerkId((event.data as { id: string }).id);
        break;
      default:
        this.logger.debug(`Ignoring unhandled Clerk event: ${event.type}`);
    }
  }

  private async upsertFromClerk(data: ClerkUserData): Promise<void> {
    const email = this.primaryEmail(data);
    if (!email) {
      // Our schema requires a unique, non-null email; a Clerk user without one
      // can't be mirrored. Skip rather than crash the webhook (which would make
      // Clerk retry forever). Logged so it's visible if it ever happens.
      this.logger.warn(`Clerk user ${data.id} has no email; skipping sync`);
      return;
    }

    const fullName = this.fullName(data);
    await this.prisma.user.upsert({
      where: { clerkId: data.id },
      create: {
        clerkId: data.id,
        email,
        fullName,
        profileImage: data.image_url,
      },
      // Re-activate on update in case a previously soft-deleted clerkId returns.
      update: {
        email,
        fullName,
        profileImage: data.image_url,
        deletedAt: null,
      },
    });
    this.logger.log(`Synced Clerk user ${data.id}`);
  }

  private async softDeleteByClerkId(clerkId: string): Promise<void> {
    // updateMany (not update) so an unknown/already-deleted id is a no-op rather
    // than throwing — keeps the webhook idempotent.
    const { count } = await this.prisma.user.updateMany({
      where: { clerkId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    this.logger.log(`Soft-deleted Clerk user ${clerkId} (rows: ${count})`);
  }

  private primaryEmail(data: ClerkUserData): string | null {
    const primary = data.email_addresses.find(
      (e) => e.id === data.primary_email_address_id,
    );
    return (primary ?? data.email_addresses[0])?.email_address ?? null;
  }

  private fullName(data: ClerkUserData): string | null {
    const name = [data.first_name, data.last_name]
      .filter((part): part is string => Boolean(part))
      .join(' ')
      .trim();
    return name.length > 0 ? name : null;
  }

  private toResponse(user: {
    id: string;
    email: string;
    fullName: string | null;
    profileImage: string | null;
    createdAt: Date;
    profile: {
      age: number | null;
      gender: string | null;
      skinType: string | null;
      primaryGoal: string | null;
      experienceLevel: string | null;
      timezone: string | null;
      country: string | null;
    } | null;
  }): UserResponse {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
      profile: user.profile
        ? {
            age: user.profile.age,
            gender: user.profile.gender,
            skinType: user.profile.skinType,
            primaryGoal: user.profile.primaryGoal,
            experienceLevel: user.profile.experienceLevel,
            timezone: user.profile.timezone,
            country: user.profile.country,
          }
        : null,
    };
  }
}
