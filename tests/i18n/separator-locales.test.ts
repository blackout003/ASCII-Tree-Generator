import { describe, it, expect } from 'vitest';
import { locales } from '@/i18n/locales';

const NAV_KEY = 'separators';
const REQUIRED_KEYS = [
  'input.title',
  'input.placeholder',
  'input.lineHint',
  'input.clear',
  'preview.title',
  'preview.copy',
  'preview.download',
  'preview.placeholder',
  'options.title',
  'options.blockType',
  'options.typeLine',
  'options.typeBadge',
  'options.typeComment',
  'options.lineChar',
  'options.width',
  'options.badgeStyle',
  'options.badgeBrackets',
  'options.badgeDashes',
  'options.badgeBlock',
  'options.commentLang',
  'options.commentC',
  'options.commentHash',
  'errors.copySuccess',
  'errors.copyError',
  'errors.downloadError',
] as const;

function getPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

describe('separator generator translations', () => {
  it.each(locales)('%s has a non-empty nav.separators label', async (locale) => {
    const messages = (await import(`@/i18n/locales/${locale}.json`)).default;
    expect(typeof messages.nav[NAV_KEY]).toBe('string');
    expect(messages.nav[NAV_KEY].trim().length).toBeGreaterThan(0);
  });

  it.each(locales)('%s has every separatorGenerator key, non-empty', async (locale) => {
    const messages = (await import(`@/i18n/locales/${locale}.json`)).default;
    for (const key of REQUIRED_KEYS) {
      const value = getPath(messages.separatorGenerator, key);
      expect(typeof value).toBe('string');
      expect((value as string).trim().length).toBeGreaterThan(0);
    }
  });
});
