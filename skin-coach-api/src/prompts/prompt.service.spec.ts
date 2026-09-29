import { PromptService } from './prompt.service';

describe('PromptService', () => {
  it('loads a prompt file and caches it', () => {
    const service = new PromptService();

    const prompt = service.get('vision-analysis');

    expect(prompt.length).toBeGreaterThan(0);
    expect(prompt.toLowerCase()).toContain('skin');
    // second read returns the cached content
    expect(service.get('vision-analysis')).toBe(prompt);
  });
});
