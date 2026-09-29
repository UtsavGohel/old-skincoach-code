import { GoogleGenAI } from '@google/genai';
import type { Part, Schema } from '@google/genai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { Env } from '../config/env.schema';

export interface StructuredResult<T> {
  value: T;
  retries: number;
}

interface GenerateJsonOptions<T> {
  systemInstruction: string;
  parts: Part[];
  responseSchema: Schema;
  // Zod parse (or any validator) — throws on malformed/invalid output.
  validate: (raw: unknown) => T;
}

// Thin wrapper over the Gemini SDK, shared by the analysis pipeline (and later the AI
// coach). Every call requests structured JSON and re-validates it, retrying once on
// malformed/invalid output (docs/06 Step 6, docs/16).
@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly ai: GoogleGenAI;

  static readonly MODEL = 'gemini-2.5-flash';

  constructor(config: ConfigService<Env, true>) {
    this.ai = new GoogleGenAI({
      apiKey: config.get('GEMINI_API_KEY', { infer: true }),
    });
  }

  get model(): string {
    return GeminiService.MODEL;
  }

  async generateJson<T>(
    options: GenerateJsonOptions<T>,
  ): Promise<StructuredResult<T>> {
    let lastError: unknown;
    // One retry on malformed/invalid output (docs/16 "Retry once. Fail gracefully.").
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await this.ai.models.generateContent({
          model: GeminiService.MODEL,
          contents: options.parts,
          config: {
            systemInstruction: options.systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: options.responseSchema,
            temperature: 0.4,
          },
        });
        const raw: unknown = JSON.parse(response.text ?? '');
        return { value: options.validate(raw), retries: attempt };
      } catch (error) {
        lastError = error;
        this.logger.warn(
          `Gemini structured call failed (attempt ${attempt + 1}/2): ${
            error instanceof Error ? error.message : 'unknown error'
          }`,
        );
      }
    }
    throw lastError instanceof Error
      ? lastError
      : new Error('Gemini call failed');
  }
}
