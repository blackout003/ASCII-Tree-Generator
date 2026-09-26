import { describe, it, expect } from 'vitest';
import { locales } from '@/i18n/locales';

const REQUIRED_KEYS = [
  'blocks.banner', 'blocks.bio', 'blocks.skills', 'blocks.stats', 'blocks.trophies', 'blocks.blog', 'blocks.contact',
  'fields.lines', 'fields.font', 'fields.size', 'fields.width', 'fields.align', 'fields.color', 'fields.intro',
  'fields.points', 'fields.iconTheme', 'fields.perLine', 'fields.skills', 'fields.username', 'fields.baseUrl',
  'fields.showStats', 'fields.showLanguages', 'fields.layout', 'fields.hideBorder', 'fields.columns', 'fields.rows',
  'fields.feedUrl', 'fields.maxPosts', 'fields.schedule', 'fields.network', 'fields.value', 'fields.addContact',
  'fields.removeContact',
  'options.auto', 'options.light', 'options.dark', 'options.left', 'options.center', 'options.daily', 'options.weekly',
  'skillGroups.languages', 'skillGroups.frontend', 'skillGroups.backend', 'skillGroups.data', 'skillGroups.cloud',
  'skillGroups.tools',
  'hints.lines', 'hints.points', 'hints.baseUrl', 'hints.feedUrl', 'hints.contactValue',
  'placeholders.baseUrl', 'placeholders.feedUrl', 'placeholders.username',
  'warnings.missingUsername', 'warnings.missingBaseUrl', 'warnings.invalidBaseUrl', 'warnings.invalidFeed',
  'meta.username',
  'workflow.title', 'workflow.intro', 'workflow.step1', 'workflow.step2', 'workflow.step3', 'workflow.note',
  'workflow.download', 'workflow.noFeed',
] as const;

const PLACEHOLDERS: Record<string, string[]> = {
  'warnings.missingBaseUrl': ['{service}'],
};

function getPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

describe('readme generator profile-mode translations', () => {
  it.each(locales)('%s has every key, non-empty', async (locale) => {
    const messages = (await import(`@/i18n/locales/${locale}.json`)).default;
    for (const key of REQUIRED_KEYS) {
      const value = getPath(messages.readmeGenerator, key);
      expect(typeof value, `${locale}:${key}`).toBe('string');
      expect((value as string).trim().length, `${locale}:${key}`).toBeGreaterThan(0);
    }
  });

  it.each(locales)('%s keeps the ICU placeholders', async (locale) => {
    const messages = (await import(`@/i18n/locales/${locale}.json`)).default;
    for (const [key, placeholders] of Object.entries(PLACEHOLDERS)) {
      for (const placeholder of placeholders) {
        expect(getPath(messages.readmeGenerator, key) as string, `${locale}:${key}`).toContain(placeholder);
      }
    }
  });
});
