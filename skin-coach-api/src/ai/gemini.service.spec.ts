import { ConfigService } from '@nestjs/config';
import type { Schema } from '@google/genai';
import { z } from 'zod';

import type { Env } from '../config/env.schema';
import { GeminiService } from './gemini.service';

const generateContent = jest.fn();
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest
    .fn()
    .mockImplementation(() => ({ models: { generateContent } })),
  Type: { OBJECT: 'OBJECT', NUMBER: 'NUMBER', STRING: 'STRING' },
}));

describe('GeminiService', () => {
  let service: GeminiService;
  const config = {
    get: jest.fn(() => 'test-key'),
  } as unknown as ConfigService<Env, true>;
  const zodSchema = z.object({ n: z.number() });

  const opts = () => ({
    systemInstruction: 'sys',
    parts: [{ text: 'hi' }],
    responseSchema: {} as Schema,
    validate: (raw: unknown) => zodSchema.parse(raw),
  });

  beforeEach(() => {
    jest.clearAllMocks();
    service = new GeminiService(config);
  });

  it('returns the validated value on first success (retries 0)', async () => {
    generateContent.mockResolvedValue({ text: '{"n":5}' });

    const res = await service.generateJson(opts());

    expect(res).toEqual({ value: { n: 5 }, retries: 0 });
    expect(generateContent).toHaveBeenCalledTimes(1);
  });

  it('retries once on malformed output, then succeeds (retries 1)', async () => {
    generateContent
      .mockResolvedValueOnce({ text: 'not json' })
      .mockResolvedValueOnce({ text: '{"n":7}' });

    const res = await service.generateJson(opts());

    expect(res).toEqual({ value: { n: 7 }, retries: 1 });
    expect(generateContent).toHaveBeenCalledTimes(2);
  });

  it('throws after two invalid attempts', async () => {
    generateContent.mockResolvedValue({ text: '{"n":"not-a-number"}' });

    await expect(service.generateJson(opts())).rejects.toBeDefined();
    expect(generateContent).toHaveBeenCalledTimes(2);
  });
});
