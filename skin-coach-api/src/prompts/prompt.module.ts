import { Global, Module } from '@nestjs/common';

import { PromptService } from './prompt.service';

// Global so any AI-using module (analysis now, coach later) can inject PromptService.
@Global()
@Module({
  providers: [PromptService],
  exports: [PromptService],
})
export class PromptModule {}
