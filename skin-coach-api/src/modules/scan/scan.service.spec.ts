import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import { StorageService } from '../../storage/storage.service';
import { UsersService } from '../users/users.service';
import { ScanService } from './scan.service';

const createPrismaMock = () => ({
  skinScan: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
});

describe('ScanService', () => {
  let service: ScanService;
  let prisma: ReturnType<typeof createPrismaMock>;
  let storage: {
    createUploadUrl: jest.Mock;
    createDownloadUrl: jest.Mock;
    deleteObject: jest.Mock;
  };
  let users: { getLocalUserId: jest.Mock };
  let queue: { enqueueAnalysis: jest.Mock };

  beforeEach(() => {
    prisma = createPrismaMock();
    storage = {
      createUploadUrl: jest.fn(),
      createDownloadUrl: jest.fn(),
      deleteObject: jest.fn(),
    };
    users = { getLocalUserId: jest.fn().mockResolvedValue('u1') };
    queue = { enqueueAnalysis: jest.fn().mockResolvedValue(undefined) };
    service = new ScanService(
      prisma as unknown as PrismaService,
      storage as unknown as StorageService,
      users as unknown as UsersService,
      queue,
    );
  });

  describe('createUploadUrl', () => {
    it('generates a user-scoped key and presigns it', async () => {
      storage.createUploadUrl.mockResolvedValue('https://put');

      const res = await service.createUploadUrl('clerk_1', {
        contentType: 'image/jpeg',
      });

      expect(res.imageKey).toMatch(/^scans\/u1\/[0-9a-f-]{36}\.jpg$/);
      expect(res.uploadUrl).toBe('https://put');
      expect(storage.createUploadUrl).toHaveBeenCalledWith(
        res.imageKey,
        'image/jpeg',
      );
    });
  });

  describe('createScan', () => {
    it('creates a processing scan for an owned key', async () => {
      prisma.skinScan.create.mockResolvedValue({
        id: 'scan_1',
        status: 'processing',
      });

      const res = await service.createScan('clerk_1', {
        imageKey: 'scans/u1/abc.jpg',
        device: 'iPhone 15',
      });

      expect(res).toEqual({ scanId: 'scan_1', status: 'processing' });
      expect(prisma.skinScan.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'u1',
            imageUrl: 'scans/u1/abc.jpg',
            deviceModel: 'iPhone 15',
          }),
        }),
      );
      // analysis is kicked off out-of-band
      expect(queue.enqueueAnalysis).toHaveBeenCalledWith('scan_1');
    });

    it('rejects a key that belongs to another user', async () => {
      await expect(
        service.createScan('clerk_1', { imageKey: 'scans/u2/abc.jpg' }),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.skinScan.create).not.toHaveBeenCalled();
    });
  });

  describe('getScanHistory', () => {
    it('returns the user’s scans (newest first) with scores', async () => {
      prisma.skinScan.findMany.mockResolvedValue([
        {
          id: 's2',
          scanDate: new Date('2026-07-02'),
          status: 'completed',
          analysis: { overallScore: 85 },
        },
        {
          id: 's1',
          scanDate: new Date('2026-07-01'),
          status: 'processing',
          analysis: null,
        },
      ]);

      const res = await service.getScanHistory('clerk_1');

      expect(res).toEqual([
        {
          scanId: 's2',
          date: new Date('2026-07-02'),
          status: 'completed',
          score: 85,
        },
        {
          scanId: 's1',
          date: new Date('2026-07-01'),
          status: 'processing',
          score: null,
        },
      ]);
    });
  });

  describe('getScanResult', () => {
    const completedScan = {
      id: 'scan_2',
      status: 'completed',
      scanDate: new Date('2026-07-02'),
      imageUrl: 'scans/u1/today.jpg',
      analysis: {
        overallScore: 86,
        confidenceScore: 0.95,
        metricsDetail: { acne: { score: 80 } },
        acneScore: 80,
        hydrationScore: 82,
        rednessScore: 88,
        pigmentationScore: 70,
        textureScore: 80,
        oilinessScore: 60,
        poresScore: 70,
        wrinkleScore: 90,
        darkCircleScore: 76,
      },
      insight: {
        summary: 'Looking calmer today.',
        recommendation: 'Keep hydrating.',
        positiveChanges: 'Redness down.',
        attentionNeeded: null,
        nextSteps: 'See you tomorrow.',
      },
    };

    it('returns only the status while still processing', async () => {
      prisma.skinScan.findFirst.mockResolvedValue({
        status: 'processing',
        analysis: null,
        insight: null,
        scanDate: new Date('2026-07-02'),
        imageUrl: 'scans/u1/today.jpg',
      });

      const res = await service.getScanResult('clerk_1', 'scan_2');

      expect(res).toEqual({ status: 'processing' });
      expect(storage.createDownloadUrl).not.toHaveBeenCalled();
    });

    it('returns the result with backend-computed trend vs the previous scan', async () => {
      prisma.skinScan.findFirst
        .mockResolvedValueOnce(completedScan)
        .mockResolvedValueOnce({
          analysis: {
            overallScore: 80,
            acneScore: 70,
            hydrationScore: 80,
            rednessScore: 82,
            pigmentationScore: 70,
            textureScore: 78,
            oilinessScore: 60,
            poresScore: 68,
            wrinkleScore: 90,
            darkCircleScore: 70,
          },
        });
      storage.createDownloadUrl.mockResolvedValue('https://get');

      const res = await service.getScanResult('clerk_1', 'scan_2');

      expect(res.status).toBe('completed');
      expect(res.date).toEqual(new Date('2026-07-02'));
      expect(res.score).toBe(86);
      expect(res.confidence).toBe(0.95);
      expect(res.previousScore).toBe(80);
      expect(res.scoreDelta).toBe(6);
      // per-metric change = today's flat score − previous flat score
      expect(res.changes).toMatchObject({
        acne: 10,
        redness: 6,
        darkCircles: 6,
      });
      expect(res.imageUrl).toBe('https://get');
      expect(res.insight?.summary).toBe('Looking calmer today.');
    });

    it('returns a null previousScore and no changes on the first scan', async () => {
      prisma.skinScan.findFirst
        .mockResolvedValueOnce(completedScan)
        .mockResolvedValueOnce(null);
      storage.createDownloadUrl.mockResolvedValue('https://get');

      const res = await service.getScanResult('clerk_1', 'scan_2');

      expect(res.previousScore).toBeNull();
      expect(res.scoreDelta).toBe(0);
      expect(res.changes).toEqual({});
    });

    it('404s for a missing or foreign scan', async () => {
      prisma.skinScan.findFirst.mockResolvedValue(null);
      await expect(
        service.getScanResult('clerk_1', 'x'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('getScanStatus', () => {
    it('returns the status for an owned scan', async () => {
      prisma.skinScan.findFirst.mockResolvedValue({ status: 'processing' });

      const res = await service.getScanStatus('clerk_1', 'scan_1');

      expect(res).toEqual({ status: 'processing' });
      expect(prisma.skinScan.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'scan_1', userId: 'u1', deletedAt: null },
        }),
      );
    });

    it('404s for a missing or foreign scan', async () => {
      prisma.skinScan.findFirst.mockResolvedValue(null);
      await expect(
        service.getScanStatus('clerk_1', 'x'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('deleteScan', () => {
    it('soft-deletes the record and removes the object', async () => {
      prisma.skinScan.findFirst.mockResolvedValue({
        id: 'scan_1',
        imageUrl: 'scans/u1/abc.jpg',
      });
      prisma.skinScan.update.mockResolvedValue({});
      storage.deleteObject.mockResolvedValue(undefined);

      await service.deleteScan('clerk_1', 'scan_1');

      expect(prisma.skinScan.update).toHaveBeenCalledWith({
        where: { id: 'scan_1' },
        data: { deletedAt: expect.any(Date) },
      });
      expect(storage.deleteObject).toHaveBeenCalledWith('scans/u1/abc.jpg');
    });

    it('still succeeds when storage cleanup fails', async () => {
      prisma.skinScan.findFirst.mockResolvedValue({
        id: 'scan_1',
        imageUrl: 'scans/u1/abc.jpg',
      });
      prisma.skinScan.update.mockResolvedValue({});
      storage.deleteObject.mockRejectedValue(new Error('storage down'));

      await expect(
        service.deleteScan('clerk_1', 'scan_1'),
      ).resolves.toBeUndefined();
      expect(prisma.skinScan.update).toHaveBeenCalled();
    });

    it('404s for a missing scan', async () => {
      prisma.skinScan.findFirst.mockResolvedValue(null);
      await expect(service.deleteScan('clerk_1', 'x')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
