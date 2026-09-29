import { PrismaService } from '../../database/prisma.service';
import { UsersService } from '../users/users.service';
import { SettingsService } from './settings.service';

const createPrismaMock = () => ({
  userSettings: { findUnique: jest.fn(), upsert: jest.fn() },
});

describe('SettingsService', () => {
  let service: SettingsService;
  let prisma: ReturnType<typeof createPrismaMock>;
  const users = { getLocalUserId: jest.fn().mockResolvedValue('u1') };

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new SettingsService(
      prisma as unknown as PrismaService,
      users as unknown as UsersService,
    );
  });

  it('returns defaults when the user has no settings row', async () => {
    prisma.userSettings.findUnique.mockResolvedValue(null);
    const res = await service.getSettings('c1');
    expect(res).toMatchObject({
      dailyScanReminder: true,
      theme: 'system',
      language: 'en',
      timezone: null,
    });
  });

  it('returns saved settings when present', async () => {
    prisma.userSettings.findUnique.mockResolvedValue({
      dailyScanReminder: false,
      morningReminder: true,
      nightReminder: true,
      language: 'en',
      theme: 'dark',
      timezone: 'Asia/Kolkata',
    });
    const res = await service.getSettings('c1');
    expect(res.theme).toBe('dark');
    expect(res.dailyScanReminder).toBe(false);
  });

  it('upserts on update (owner-scoped)', async () => {
    prisma.userSettings.upsert.mockResolvedValue({
      dailyScanReminder: true,
      morningReminder: true,
      nightReminder: true,
      language: 'en',
      theme: 'light',
      timezone: null,
    });
    const res = await service.updateSettings('c1', { theme: 'light' });
    expect(res.theme).toBe('light');
    expect(prisma.userSettings.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'u1' } }),
    );
  });
});
