import { describe, it, expect } from 'vitest';
import { locales } from '@/i18n/locales';

const REQUIRED_KEYS = [
  'blocks.badges', 'blocks.visualProof', 'blocks.tableOfContents', 'blocks.installation', 'blocks.usage',
  'blocks.architecture', 'blocks.contributing', 'blocks.license', 'blocks.alert',
  'modes.projectDesc', 'modes.profileDesc', 'toolbar.wizard',
  'fields.heading', 'fields.prerequisites', 'fields.packageManager', 'fields.packageName', 'fields.commands',
  'fields.description', 'fields.code', 'fields.codeLanguage', 'fields.url', 'fields.alt', 'fields.caption',
  'fields.text', 'fields.linkUrl', 'fields.linkLabel', 'fields.license', 'fields.holder', 'fields.year',
  'fields.credits', 'fields.alertType', 'fields.badgeLabel', 'fields.badgeMessage', 'fields.badgeColor',
  'fields.badgeLink', 'fields.addBadge', 'fields.removeBadge', 'fields.architecture', 'fields.roadmap',
  'fields.roadmapHeading',
  'hints.prerequisites', 'hints.commands', 'hints.credits', 'hints.roadmap', 'hints.badgeColor',
  'placeholders.repoUrl', 'placeholders.packageName', 'warnings.tooManyBadges',
  'wizard.title', 'wizard.step', 'wizard.next', 'wizard.back', 'wizard.finish', 'wizard.skip',
  'wizard.stepMode', 'wizard.stepStart', 'wizard.stepInfos', 'wizard.stepSections', 'wizard.stepStyle',
  'wizard.modeHint', 'wizard.scratch', 'wizard.scratchDesc', 'wizard.prefill', 'wizard.prefillDesc',
  'wizard.infosHint', 'wizard.sectionsHint', 'wizard.styleHint', 'wizard.accent', 'wizard.accentCustom',
  'wizard.accentInvalid',
  'meta.name', 'meta.description', 'meta.author', 'meta.license', 'meta.repoUrl', 'meta.installCommand',
  'meta.language', 'meta.autoFilled',
  'extraction.file', 'extraction.url', 'extraction.fetch', 'extraction.choose', 'extraction.success',
  'extraction.nothing', 'extraction.privacy', 'extraction.unsupportedFile', 'extraction.invalidFile',
  'extraction.invalidUrl', 'extraction.rateLimit', 'extraction.notFound', 'extraction.network',
  'extraction.invalidResponse',
  'messages.wizardRemoved',
] as const;

const PLACEHOLDERS: Record<string, string[]> = {
  'warnings.tooManyBadges': ['{count}'],
  'wizard.step': ['{current}', '{total}'],
  'extraction.success': ['{fields}'],
  'messages.wizardRemoved': ['{count}'],
};

function getPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

describe('readme generator project-mode translations', () => {
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
