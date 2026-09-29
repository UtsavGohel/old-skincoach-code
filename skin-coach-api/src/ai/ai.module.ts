import { Global, Module } from '@nestjs/common';

import { GeminiService } from './gemini.service';

// Global so the analysis pipeline (and later the AI coach) share one Gemini client.
@Global()
@Module({
  providers: [GeminiService],
  exports: [GeminiService],
})
export class AiModule {}
