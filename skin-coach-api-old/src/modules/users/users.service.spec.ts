import { NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import type { ClerkUserData } from '../auth/clerk-webhook.types';
import { UsersService } from './users.service';

// In-memory Prisma double — only the methods UsersService touches.
const createPrismaMock = () => ({
  user: {
    findFirst: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    upsert: jest.fn(),
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
    prisma = createPrismaMock();
    service = new UsersService(prisma as unknown as PrismaService);
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
      prisma.user.findFirst.mockResolvedValue(dbUser);

      const result = await service.getMe('clerk_1');

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { clerkId: 'clerk_1', deletedAt: null },
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

    it('throws NotFound when the mirror row is missing', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      await expect(service.getMe('clerk_missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('updateMe', () => {
    it('updates the user + upserts the profile, then returns the fresh record', async () => {
      prisma.user.findFirst
        .mockResolvedValueOnce({ id: 'local_1' }) // lookup for the id
        .mockResolvedValueOnce(dbUser); // getMe re-read
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

    it('throws NotFound for an unknown user', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      await expect(service.updateMe('nope', {})).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('syncFromClerkEvent', () => {
    it('upserts on user.created using the primary email and joined name', async () => {
      await service.syncFromClerkEvent({
        type: 'user.created',
        data: clerkUser(),
      });

      expect(prisma.user.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { clerkId: 'user_123' },
          create: expect.objectContaining({
            clerkId: 'user_123',
            email: 'primary@example.com',
            fullName: 'Utsav Gohel',
            profileImage: 'https://img.clerk/avatar.png',
          }),
          update: expect.objectContaining({
            email: 'primary@example.com',
            deletedAt: null,
          }),
        }),
      );
    });

    it('falls back to the first email when no primary is flagged', async () => {
      await service.syncFromClerkEvent({
        type: 'user.updated',
        data: clerkUser({ primary_email_address_id: null }),
      });

      expect(prisma.user.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({ email: 'primary@example.com' }),
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

      expect(prisma.user.upsert).not.toHaveBeenCalled();
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

      expect(prisma.user.upsert).not.toHaveBeenCalled();
      expect(prisma.user.updateMany).not.toHaveBeenCalled();
    });
  });
});
