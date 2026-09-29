import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClerkClient, type ClerkClient } from '@clerk/backend';

import type { Env } from '../../config/env.schema';
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
  private readonly clerk: ClerkClient;

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService<Env, true>,
  ) {
    this.clerk = createClerkClient({
      secretKey: config.get('CLERK_SECRET_KEY', { infer: true }),
    });
  }

  // Resolves the local `users.id` from a verified Clerk id — the owner-scoping
  // primitive every feature module (scans, routines, …) uses. If the mirror row
  // isn't there yet (webhook not landed, or the clerkId churned), it's provisioned
  // just-in-time from Clerk, so the app never depends on webhook timing.
  async getLocalUserId(clerkId: string): Promise<string> {
    const user = await this.prisma.user.findFirst({
      where: { clerkId, deletedAt: null },
      select: { id: true },
    });
    if (user) {
      return user.id;
    }
    return this.provisionFromClerk(clerkId);
  }

  // GET /users/me — resolves (JIT-provisioning if needed) then returns the profile.
  async getMe(clerkId: string): Promise<UserResponse> {
    const id = await this.getLocalUserId(clerkId);
    const user = await this.prisma.user.findUnique({
      where: { id },
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
    const userId = await this.getLocalUserId(clerkId);

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
        where: { id: userId },
        data: { fullName: dto.fullName },
      }),
      this.prisma.userProfile.upsert({
        where: { userId },
        create: { userId, ...profileData },
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

  // JIT provisioning: the request has a verified Clerk JWT but no local row yet
  // (webhook not landed, or a churned clerkId). Fetch the user straight from Clerk and
  // mirror it, so /users/me and PATCH never fail on webhook timing.
  private async provisionFromClerk(clerkId: string): Promise<string> {
    let clerkUser;
    try {
      clerkUser = await this.clerk.users.getUser(clerkId);
    } catch (error) {
      this.logger.warn(
        `Could not fetch Clerk user ${clerkId}: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
      throw new NotFoundException('User not found');
    }
    const id = await this.upsertFromClerk({
      id: clerkUser.id,
      email_addresses: clerkUser.emailAddresses.map((e) => ({
        id: e.id,
        email_address: e.emailAddress,
      })),
      primary_email_address_id: clerkUser.primaryEmailAddressId,
      first_name: clerkUser.firstName,
      last_name: clerkUser.lastName,
      image_url: clerkUser.imageUrl,
    });
    if (!id) {
      throw new NotFoundException('User not found');
    }
    return id;
  }

  private async upsertFromClerk(data: ClerkUserData): Promise<string | null> {
    const email = this.primaryEmail(data);
    if (!email) {
      // Our schema requires a unique, non-null email; a Clerk user without one
      // can't be mirrored. Skip rather than crash the webhook (which would make
      // Clerk retry forever). Logged so it's visible if it ever happens.
      this.logger.warn(`Clerk user ${data.id} has no email; skipping sync`);
      return null;
    }

    const fullName = this.fullName(data);
    const profileImage = data.image_url;

    // Match on clerkId OR email so all these resolve to a single row without ever
    // tripping the unique-email constraint: a re-sync of the same user, a soft-deleted
    // row returning, and — crucially — the same person signing in under a NEW clerkId
    // with the same email (account-linking off / a fresh Clerk user). Email is treated
    // as the stable identity, so the existing row is re-pointed to the new clerkId.
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ clerkId: data.id }, { email }] },
      select: { id: true },
    });

    if (existing) {
      await this.prisma.user.update({
        where: { id: existing.id },
        data: {
          clerkId: data.id,
          email,
          fullName,
          profileImage,
          deletedAt: null,
        },
      });
      this.logger.log(`Synced Clerk user ${data.id}`);
      return existing.id;
    }

    const created = await this.prisma.user.create({
      data: { clerkId: data.id, email, fullName, profileImage },
      select: { id: true },
    });
    this.logger.log(`Synced Clerk user ${data.id}`);
    return created.id;
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
