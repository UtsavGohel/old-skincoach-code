import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { Injectable } from '@nestjs/common';

export type PromptName =
  'vision-analysis' | 'daily-insight' | 'historical-comparison' | 'coach';

// Loads the version-controlled prompt markdown files (docs/07: prompts are never
// hardcoded in application code). Read once and cached. nest-cli copies
// `src/prompts/*.md` → `dist/prompts` (see nest-cli.json assets), so `__dirname`
// resolves the files the same way in dev and in a compiled build.
@Injectable()
export class PromptService {
  private readonly cache = new Map<string, string>();

  get(name: PromptName): string {
    const cached = this.cache.get(name);
    if (cached !== undefined) {
      return cached;
    }
    const content = readFileSync(join(__dirname, `${name}.md`), 'utf8').trim();
    this.cache.set(name, content);
    return content;
  }
}
