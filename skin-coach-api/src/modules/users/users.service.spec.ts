import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { Env } from '../../config/env.schema';
import { PrismaService } from '../../database/prisma.service';
import type { ClerkUserData } from '../auth/clerk-webhook.types';
import { UsersService } from './users.service';

// Clerk client used for JIT provisioning — factory-mocked so no real client loads.
const getUser = jest.fn();
jest.mock('@clerk/backend', () => ({
  createClerkClient: () => ({ users: { getUser } }),
}));

const config = {
  get: jest.fn(() => 'sk_test'),
} as unknown as ConfigService<Env, true>;

// In-memory Prisma double — only the methods UsersService touches.
const createPrismaMock = () => ({
  user: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
  userProfile: {
    upsert: jest.fn(),
  },
  $transaction: jest.fn(),
});

type PrismaMock = ReturnType<typeof createPrismaMock>;

const clerkUser = (over: Partial<ClerkUserData> = {}): ClerkUserData => ({
  id: 'user_123',
  email_addresses: [
    { id: 'idn_primary', email_address: 'primary@example.com' },
    { id: 'idn_other', email_address: 'other@example.com' },
  ],
  primary_email_address_id: 'idn_primary',
  first_name: 'Utsav',
  last_name: 'Gohel',
  image_url: 'https://img.clerk/avatar.png',
  ...over,
});

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaMock;

  beforeEach(() => {
    getUser.mockReset();
    prisma = createPrismaMock();
    service = new UsersService(prisma as unknown as PrismaService, config);
  });

  const dbUser = {
    id: 'local_1',
    email: 'primary@example.com',
    fullName: 'Utsav Gohel',
    profileImage: null,
    createdAt: new Date('2026-01-01'),
    profile: {
      age: 24,
      gender: 'male',
      skinType: 'combination',
      primaryGoal: 'acne',
      experienceLevel: 'beginner',
      timezone: 'Asia/Kolkata',
      country: 'IN',
    },
  };

  describe('getMe', () => {
    it('returns the mapped user, excluding clerkId/soft-delete internals', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'local_1' }); // getLocalUserId
      prisma.user.findUnique.mockResolvedValue(dbUser);

      const result = await service.getMe('clerk_1');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'local_1' },
        include: { profile: true },
      });
      expect(result).toEqual({
        id: 'local_1',
        email: 'primary@example.com',
        fullName: 'Utsav Gohel',
        profileImage: null,
        createdAt: dbUser.createdAt,
        profile: dbUser.profile,
      });
      expect(result).not.toHaveProperty('clerkId');
    });

    it('JIT-provisions from Clerk when the row is missing', async () => {
      prisma.user.findFirst.mockResolvedValue(null); // no row yet
      getUser.mockResolvedValue({
        id: 'clerk_1',
        emailAddresses: [{ id: 'e1', emailAddress: 'primary@example.com' }],
        primaryEmailAddressId: 'e1',
        firstName: 'Utsav',
        lastName: 'Gohel',
        imageUrl: null,
      });
      prisma.user.create.mockResolvedValue({ id: 'local_1' });
      prisma.user.findUnique.mockResolvedValue(dbUser);

      const result = await service.getMe('clerk_1');

      expect(getUser).toHaveBeenCalledWith('clerk_1');
      expect(prisma.user.create).toHaveBeenCalled();
      expect(result.id).toBe('local_1');
    });

    it('throws NotFound when Clerk has no such user either', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      getUser.mockRejectedValue(new Error('not found'));
      await expect(service.getMe('clerk_missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('updateMe', () => {
    it('updates the user + upserts the profile, then returns the fresh record', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'local_1' });
      prisma.user.findUnique.mockResolvedValue(dbUser);
      prisma.$transaction.mockResolvedValue([]);

      const result = await service.updateMe('clerk_1', {
        fullName: 'New Name',
        skinType: 'oily',
      });

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'local_1' },
        data: { fullName: 'New Name' },
      });
      expect(prisma.userProfile.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'local_1' },
          create: expect.objectContaining({
            userId: 'local_1',
            skinType: 'oily',
          }),
          update: expect.objectContaining({ skinType: 'oily' }),
        }),
      );
      expect(result.email).toBe('primary@example.com');
    });

    it('throws NotFound when neither the DB nor Clerk has the user', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      getUser.mockRejectedValue(new Error('not found'));
      await expect(service.updateMe('nope', {})).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('syncFromClerkEvent', () => {
    it('creates a new user (no existing clerkId/email) with the primary email + joined name', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({ id: 'local_new' });

      await service.syncFromClerkEvent({
        type: 'user.created',
        data: clerkUser(),
      });

      expect(prisma.user.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [{ clerkId: 'user_123' }, { email: 'primary@example.com' }],
          },
        }),
      );
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            clerkId: 'user_123',
            email: 'primary@example.com',
            fullName: 'Utsav Gohel',
            profileImage: 'https://img.clerk/avatar.png',
          }),
        }),
      );
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('re-points an existing row (same email, new clerkId) instead of creating a duplicate', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'local_1' });

      await service.syncFromClerkEvent({
        type: 'user.created',
        data: clerkUser({ id: 'user_new' }),
      });

      expect(prisma.user.create).not.toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'local_1' },
          data: expect.objectContaining({
            clerkId: 'user_new',
            email: 'primary@example.com',
            deletedAt: null,
          }),
        }),
      );
    });

    it('falls back to the first email when no primary is flagged', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({ id: 'local_new' });

      await service.syncFromClerkEvent({
        type: 'user.updated',
        data: clerkUser({ primary_email_address_id: null }),
      });

      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ email: 'primary@example.com' }),
        }),
      );
    });

    it('skips a Clerk user with no email address', async () => {
      await service.syncFromClerkEvent({
        type: 'user.created',
        data: clerkUser({
          email_addresses: [],
          primary_email_address_id: null,
        }),
      });

      expect(prisma.user.findFirst).not.toHaveBeenCalled();
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('soft-deletes on user.deleted (idempotent via updateMany)', async () => {
      prisma.user.updateMany.mockResolvedValue({ count: 1 });

      await service.syncFromClerkEvent({
        type: 'user.deleted',
        data: { id: 'user_123', deleted: true },
      });

      expect(prisma.user.updateMany).toHaveBeenCalledWith({
        where: { clerkId: 'user_123', deletedAt: null },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('ignores unhandled event types', async () => {
      await service.syncFromClerkEvent({
        type: 'session.created',
        data: { id: 'sess_1' },
      });

      expect(prisma.user.create).not.toHaveBeenCalled();
      expect(prisma.user.updateMany).not.toHaveBeenCalled();
    });
  });
});
