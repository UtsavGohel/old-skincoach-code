import { GeminiService } from '../../ai/gemini.service';
import { PrismaService } from '../../database/prisma.service';
import { PromptService } from '../../prompts/prompt.service';
import { StorageService } from '../../storage/storage.service';
import { AnalysisService } from './analysis.service';
import { METRIC_KEYS, VisionResponse } from './analysis.schema';

const vision = (confidence = 0.95): VisionResponse => ({
  overallScore: 84,
  confidence,
  metrics: Object.fromEntries(
    METRIC_KEYS.map((k) => [k, { score: 50 }]),
  ) as VisionResponse['metrics'],
});

const insight = {
  summary: 's',
  positiveChange: 'p',
  attentionArea: 'a',
  recommendation: 'r',
  nextAction: 'n',
};

const createPrismaMock = () => ({
  skinScan: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  skinAnalysis: { create: jest.fn() },
  aiInsight: { create: jest.fn() },
  $transaction: jest.fn().mockResolvedValue([]),
});

const processingScan = {
  id: 'scan_1',
  userId: 'u1',
  status: 'processing',
  scanDate: new Date('2026-07-07'),
  imageUrl: 'scans/u1/abc.jpg',
  user: {
    profile: { age: 24, gender: 'male', skinType: 'oily', primaryGoal: 'acne' },
  },
};

describe('AnalysisService', () => {
  let service: AnalysisService;
  let prisma: ReturnType<typeof createPrismaMock>;
  let storage: { getObjectBuffer: jest.Mock };
  let gemini: { generateJson: jest.Mock; model: string };
  let prompts: { get: jest.Mock };

  beforeEach(() => {
    prisma = createPrismaMock();
    storage = {
      getObjectBuffer: jest.fn().mockResolvedValue(Buffer.from('img')),
    };
    gemini = { generateJson: jest.fn(), model: 'gemini-2.5-flash' };
    prompts = { get: jest.fn().mockReturnValue('prompt') };
    service = new AnalysisService(
      prisma as unknown as PrismaService,
      storage as unknown as StorageService,
      gemini as unknown as GeminiService,
      prompts as unknown as PromptService,
    );
  });

  it('runs vision + insight and stores a completed analysis (first scan)', async () => {
    prisma.skinScan.findUnique.mockResolvedValue(processingScan);
    prisma.skinScan.findFirst.mockResolvedValue(null); // no previous scan
    gemini.generateJson
      .mockResolvedValueOnce({ value: vision(), retries: 0 })
      .mockResolvedValueOnce({ value: insight, retries: 0 });

    await service.processScan('scan_1');

    expect(gemini.generateJson).toHaveBeenCalledTimes(2);
    expect(prisma.skinAnalysis.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          scanId: 'scan_1',
          overallScore: 84,
          confidenceScore: 0.95,
          visionModel: 'gemini-2.5-flash',
          visionPromptVersion: 'v1.0',
        }),
      }),
    );
    expect(prisma.aiInsight.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          scanId: 'scan_1',
          summary: 's',
          attentionNeeded: 'a',
          nextSteps: 'n',
        }),
      }),
    );
    expect(prisma.skinScan.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'scan_1' },
        data: expect.objectContaining({ status: 'completed' }),
      }),
    );
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it('rejects (marks failed) when confidence is below the 0.5 threshold', async () => {
    prisma.skinScan.findUnique.mockResolvedValue(processingScan);
    gemini.generateJson.mockResolvedValueOnce({
      value: vision(0.3),
      retries: 0,
    });

    await service.processScan('scan_1');

    expect(gemini.generateJson).toHaveBeenCalledTimes(1); // no insight call
    expect(prisma.skinAnalysis.create).not.toHaveBeenCalled();
    expect(prisma.skinScan.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'failed' }),
      }),
    );
  });

  it('marks the scan failed when Gemini throws', async () => {
    prisma.skinScan.findUnique.mockResolvedValue(processingScan);
    gemini.generateJson.mockRejectedValueOnce(new Error('gemini down'));

    await service.processScan('scan_1');

    expect(prisma.skinScan.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'failed' }),
      }),
    );
  });

  it('is idempotent — skips a scan that is not processing', async () => {
    prisma.skinScan.findUnique.mockResolvedValue({
      ...processingScan,
      status: 'completed',
    });

    await service.processScan('scan_1');

    expect(gemini.generateJson).not.toHaveBeenCalled();
    expect(prisma.skinScan.update).not.toHaveBeenCalled();
  });
});
