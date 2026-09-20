import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { locales } from '@/i18n/locales';
import { GITHUB_ISSUE_URLS } from '@/lib/github-links';

const KEYS = ['feedback', 'reportBug', 'requestFeature'] as const;

describe('feedback menu translations', () => {
  it.each(locales)('%s has non-empty nav feedback labels', async (locale) => {
    const messages = (await import(`@/i18n/locales/${locale}.json`)).default;
    for (const key of KEYS) {
      expect(typeof messages.nav[key]).toBe('string');
      expect(messages.nav[key].trim().length).toBeGreaterThan(0);
    }
  });
});

describe('GitHub issue links', () => {
  const prefix = 'https://github.com/blackout003/ASCII-Tree-Generator/';

  it('points to the bug report template', () => {
    expect(GITHUB_ISSUE_URLS.bug.startsWith(prefix)).toBe(true);
    expect(GITHUB_ISSUE_URLS.bug.endsWith('/issues/new?template=bug_report.md')).toBe(true);
  });

  it('points to the feature request template', () => {
    expect(GITHUB_ISSUE_URLS.feature.startsWith(prefix)).toBe(true);
    expect(GITHUB_ISSUE_URLS.feature.endsWith('/issues/new?template=feature_request.md')).toBe(true);
  });

  it.each(['bug_report.md', 'feature_request.md'])('template %s exists', (file) => {
    expect(existsSync(join(process.cwd(), '.github/ISSUE_TEMPLATE', file))).toBe(true);
  });
});
