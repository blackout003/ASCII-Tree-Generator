import { describe, it, expect } from 'vitest';
import { locales } from '@/i18n/locales';

const NAV_KEY = 'treeToCommands';
const REQUIRED_KEYS = [
  'modes.treeToCommands',
  'modes.commandsToTree',
  'input.title',
  'input.clear',
  'input.placeholderTree',
  'input.placeholderCommands',
  'preview.title',
  'preview.copy',
  'preview.download',
  'preview.placeholder',
  'preview.securityNotice',
  'warnings.dangerousPath',
  'errors.unrecognizedLine',
  'errors.copySuccess',
  'errors.copyError',
  'errors.downloadError',
  'options.title',
  'options.connectorStyle',
  'options.styleUnicode',
  'options.styleAscii',
] as const;

function getPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

describe('tree-commands generator translations', () => {
  it.each(locales)('%s has a non-empty nav.treeToCommands label', async (locale) => {
    const messages = (await import(`@/i18n/locales/${locale}.json`)).default;
    expect(typeof messages.nav[NAV_KEY]).toBe('string');
    expect(messages.nav[NAV_KEY].trim().length).toBeGreaterThan(0);
  });

  it.each(locales)('%s has every treeCommandsGenerator key, non-empty', async (locale) => {
    const messages = (await import(`@/i18n/locales/${locale}.json`)).default;
    for (const key of REQUIRED_KEYS) {
      const value = getPath(messages.treeCommandsGenerator, key);
      expect(typeof value).toBe('string');
      expect((value as string).trim().length).toBeGreaterThan(0);
    }
  });
});
