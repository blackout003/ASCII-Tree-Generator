import { describe, it, expect } from 'vitest';
import { locales } from '@/i18n/locales';
import { getToolMetadata } from '@/lib/seo-config';
import { getToolContent } from '@/lib/tool-seo-content';

const SLUG = 'separators' as const;

describe('Separators tool SEO', () => {
  it.each([...locales])('%s has its own title, description and copy', (locale) => {
    const meta = getToolMetadata(SLUG, locale);
    expect(meta.path).toBe(`/${locale}/tools/separators`);
    expect(meta.title.length).toBeGreaterThan(10);
    expect(meta.title.length).toBeLessThanOrEqual(80);
    expect(meta.description.length).toBeGreaterThan(50);
    expect(meta.description.length).toBeLessThanOrEqual(180);

    const content = getToolContent(SLUG, locale);
    expect(content.heading).not.toBe('');
    expect(content.intro.length).toBeGreaterThan(80);
    expect(content.faq).toHaveLength(3);
    for (const { q, a } of content.faq) {
      expect(q).not.toBe('');
      expect(a).not.toBe('');
    }
  });

  it.each([...locales].filter((l) => l !== 'en'))('%s is not the English fallback', (locale) => {
    expect(getToolMetadata(SLUG, locale).title).not.toBe(getToolMetadata(SLUG, 'en').title);
    expect(getToolContent(SLUG, locale)).not.toBe(getToolContent(SLUG, 'en'));
  });
});
