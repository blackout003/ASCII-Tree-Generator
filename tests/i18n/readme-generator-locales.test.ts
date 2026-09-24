import { describe, it, expect } from 'vitest';
import { locales } from '@/i18n/locales';

const REQUIRED_KEYS = [
  'modes.project',
  'modes.profile',
  'toolbar.mode',
  'toolbar.copy',
  'toolbar.download',
  'toolbar.exportJson',
  'toolbar.importJson',
  'toolbar.reset',
  'blocks.title',
  'blocks.add',
  'blocks.empty',
  'blocks.enabled',
  'blocks.moveUp',
  'blocks.moveDown',
  'blocks.remove',
  'blocks.drag',
  'blocks.header',
  'blocks.freeMarkdown',
  'fields.title',
  'fields.tagline',
  'fields.logoUrl',
  'fields.logoAlt',
  'fields.content',
  'placeholders.title',
  'placeholders.tagline',
  'placeholders.logoUrl',
  'placeholders.logoAlt',
  'placeholders.content',
  'preview.title',
  'preview.light',
  'preview.dark',
  'preview.empty',
  'warnings.title',
  'warnings.none',
  'warnings.imageMissingAlt',
  'warnings.htmlTagMismatch',
  'warnings.layoutTable',
  'messages.copySuccess',
  'messages.copyError',
  'messages.downloadError',
  'messages.importSuccess',
  'messages.importError',
  'messages.importDropped',
  'messages.modeSwitchDropped',
  'messages.resetDone',
  'messages.storageUnavailable',
  'messages.undo',
] as const;

const PLACEHOLDERS: Record<string, string> = {
  'warnings.imageMissingAlt': '{count}',
  'warnings.htmlTagMismatch': '{tags}',
  'messages.importDropped': '{count}',
  'messages.modeSwitchDropped': '{count}',
};

function getPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

describe('readme generator translations', () => {
  it.each(locales)('%s has non-empty nav and home labels', async (locale) => {
    const messages = (await import(`@/i18n/locales/${locale}.json`)).default;
    expect(typeof messages.nav.readmeGenerator).toBe('string');
    expect(messages.nav.readmeGenerator.trim().length).toBeGreaterThan(0);
    expect(typeof messages.home.tools.readmeGenerator.desc).toBe('string');
    expect(messages.home.tools.readmeGenerator.desc.trim().length).toBeGreaterThan(0);
  });

  it.each(locales)('%s has every readmeGenerator key, non-empty', async (locale) => {
    const messages = (await import(`@/i18n/locales/${locale}.json`)).default;
    for (const key of REQUIRED_KEYS) {
      const value = getPath(messages.readmeGenerator, key);
      expect(typeof value, `${locale}:${key}`).toBe('string');
      expect((value as string).trim().length, `${locale}:${key}`).toBeGreaterThan(0);
    }
  });

  it.each(locales)('%s keeps the ICU placeholders of parameterized messages', async (locale) => {
    const messages = (await import(`@/i18n/locales/${locale}.json`)).default;
    for (const [key, placeholder] of Object.entries(PLACEHOLDERS)) {
      expect(getPath(messages.readmeGenerator, key) as string, `${locale}:${key}`).toContain(placeholder);
    }
  });
});
