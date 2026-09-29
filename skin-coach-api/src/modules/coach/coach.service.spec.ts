import { GeminiService } from '../../ai/gemini.service';
import { PrismaService } from '../../database/prisma.service';
import { PromptService } from '../../prompts/prompt.service';
import { UsersService } from '../users/users.service';
import { CoachService } from './coach.service';

const createPrismaMock = () => ({
  skinScan: { findFirst: jest.fn() },
  user: { findUnique: jest.fn() },
  aiConversation: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  aiMessage: { createMany: jest.fn(), findMany: jest.fn() },
});

describe('CoachService', () => {
  let service: CoachService;
  let prisma: ReturnType<typeof createPrismaMock>;
  let gemini: { generateJson: jest.Mock };
  const prompts = { get: jest.fn().mockReturnValue('coach-prompt') };
  const users = { getLocalUserId: jest.fn().mockResolvedValue('u1') };

  beforeEach(() => {
    prisma = createPrismaMock();
    gemini = { generateJson: jest.fn() };
    service = new CoachService(
      prisma as unknown as PrismaService,
      gemini as unknown as GeminiService,
      prompts as unknown as PromptService,
      users as unknown as UsersService,
    );
  });

  describe('getToday', () => {
    it('returns the latest completed scan’s insight', async () => {
      prisma.skinScan.findFirst.mockResolvedValue({
        analysis: { overallScore: 84 },
        insight: {
          summary: 's',
          recommendation: 'r',
          positiveChanges: 'p',
          attentionNeeded: 'a',
          nextSteps: 'n',
        },
      });

      const res = await service.getToday('clerk_1');

      expect(res.hasInsight).toBe(true);
      expect(res.latestScore).toBe(84);
      expect(res.insight?.summary).toBe('s');
    });

    it('returns hasInsight=false when there is no completed scan', async () => {
      prisma.skinScan.findFirst.mockResolvedValue(null);
      const res = await service.getToday('clerk_1');
      expect(res).toEqual({ hasInsight: false });
    });
  });

  describe('chat', () => {
    it('calls Gemini and persists both turns', async () => {
      prisma.skinScan.findFirst.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue({ profile: null });
      prisma.aiConversation.findFirst.mockResolvedValue({ id: 'conv1' });
      gemini.generateJson.mockResolvedValue({
        value: {
          answer: 'Drink water and keep moisturizing.',
          followUpQuestions: ['How often should I exfoliate?'],
          disclaimer: 'General guidance, not medical advice.',
        },
        retries: 0,
      });

      const res = await service.chat('clerk_1', 'Why is my skin dry?');

      expect(res.reply).toContain('moisturizing');
      expect(res.followUpQuestions).toHaveLength(1);
      expect(prisma.aiMessage.createMany).toHaveBeenCalledWith({
        data: [
          {
            conversationId: 'conv1',
            role: 'user',
            message: 'Why is my skin dry?',
          },
          {
            conversationId: 'conv1',
            role: 'assistant',
            message: 'Drink water and keep moisturizing.',
          },
        ],
      });
      expect(prisma.aiConversation.update).toHaveBeenCalled();
    });

    it('creates a conversation when the user has none', async () => {
      prisma.skinScan.findFirst.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue({ profile: null });
      prisma.aiConversation.findFirst.mockResolvedValue(null);
      prisma.aiConversation.create.mockResolvedValue({ id: 'newconv' });
      gemini.generateJson.mockResolvedValue({
        value: { answer: 'a', followUpQuestions: [], disclaimer: 'd' },
        retries: 0,
      });

      await service.chat('clerk_1', 'hi');

      expect(prisma.aiConversation.create).toHaveBeenCalled();
    });
  });

  describe('getHistory', () => {
    it('returns [] when there is no conversation', async () => {
      prisma.aiConversation.findFirst.mockResolvedValue(null);
      expect(await service.getHistory('clerk_1')).toEqual([]);
    });

    it('maps stored messages chronologically', async () => {
      prisma.aiConversation.findFirst.mockResolvedValue({ id: 'conv1' });
      prisma.aiMessage.findMany.mockResolvedValue([
        { role: 'user', message: 'q', createdAt: new Date('2026-07-07') },
        { role: 'assistant', message: 'a', createdAt: new Date('2026-07-07') },
      ]);

      const res = await service.getHistory('clerk_1');

      expect(res).toHaveLength(2);
      expect(res[0]).toMatchObject({ role: 'user', message: 'q' });
    });
  });
});
