import { describe, expect, it } from 'vitest';
import { EMPTY_META } from '@/lib/readme/defaults';
import { generateReadme } from '@/lib/readme/generate';
import { validateReadme } from '@/lib/readme/validate';
import { block, stateWith } from './helpers';

const profile = (blocks: Parameters<typeof stateWith>[0], meta: Partial<typeof EMPTY_META> = {}) => ({
  ...stateWith(blocks, 'profile'),
  meta: { ...EMPTY_META, ...meta },
});

const BASE = 'https://stats.example.com';

describe('stats block', () => {
  const data = (over: Record<string, unknown> = {}) => ({
    heading: 'GitHub stats',
    username: 'jane',
    baseUrl: BASE,
    showStats: true,
    showLanguages: true,
    layout: 'compact',
    hideBorder: true,
    ...over,
  });
  const common = 'title_color=0969da&amp;icon_color=0969da&amp;hide_border=true';
  const statsLight = `${BASE}/api?username=jane&amp;show_icons=true&amp;${common}`;
  const langsLight = `${BASE}/api/top-langs/?username=jane&amp;layout=compact&amp;${common}`;

  it('renders both cards, each in a light and a dark variant, from the given instance', () => {
    const image = (alt: string, url: string, mode: 'light' | 'dark') => `![${alt}](${url}#gh-${mode}-mode-only)`;
    expect(generateReadme(profile([block('s', 'stats', data())]))).toBe(
      '## GitHub stats\n\n<div align="center">\n\n' +
        [
          image("jane's GitHub stats", statsLight, 'light'),
          image("jane's GitHub stats", `${statsLight}&amp;theme=dark`, 'dark'),
          image('Most used languages of jane', langsLight, 'light'),
          image('Most used languages of jane', `${langsLight}&amp;theme=dark`, 'dark'),
        ].join(' ') +
        '\n\n</div>\n'
    );
  });

  it('renders only the requested cards and follows the border and layout choices', () => {
    const only = generateReadme(profile([block('s', 'stats', data({ showLanguages: false, hideBorder: false }))]));
    expect(only).toContain(`${BASE}/api?username=jane`);
    expect(only).not.toContain('top-langs');
    expect(only).not.toContain('hide_border');
    const donut = generateReadme(profile([block('s', 'stats', data({ showStats: false, layout: 'donut' }))]));
    expect(donut).toContain('layout=donut');
    expect(donut).not.toContain('show_icons');
  });

  it('falls back to the username of the README, and renders nothing when neither is valid', () => {
    expect(generateReadme(profile([block('s', 'stats', data({ username: '' }))], { username: 'octocat' }))).toContain(
      'username=octocat'
    );
    expect(generateReadme(profile([block('s', 'stats', data({ username: 'a b' }))], { username: 'x&y' }))).toBe('');
  });

  it('renders nothing without a base URL: no public instance is ever used by default', () => {
    for (const baseUrl of ['', '  ']) {
      expect(generateReadme(profile([block('s', 'stats', data({ baseUrl }))]))).toBe('');
    }
    expect(generateReadme(profile([block('s', 'stats', data({ baseUrl: 'https://github-readme-stats.vercel.app', username: '' }))]))).toBe('');
  });

  it('renders nothing for an invalid base URL', () => {
    for (const baseUrl of ['http://stats.example.com', `${BASE}?x=1`, `${BASE}/a b`]) {
      expect(generateReadme(profile([block('s', 'stats', data({ baseUrl }))]))).toBe('');
    }
  });

  it('tells the user why nothing is generated', () => {
    const codes = (over: Record<string, unknown>, meta: Partial<typeof EMPTY_META> = {}) =>
      validateReadme(profile([block('s', 'stats', data(over))], meta)).map((w) => w.code);
    expect(codes({})).toEqual([]);
    expect(codes({ baseUrl: '' })).toEqual(['missingBaseUrl']);
    expect(codes({ baseUrl: 'http://x.example.com' })).toEqual(['invalidBaseUrl']);
    expect(codes({ username: '' })).toEqual(['missingUsername']);
    expect(codes({ username: '', baseUrl: '' })).toEqual(['missingUsername', 'missingBaseUrl']);
    expect(codes({ baseUrl: '', showStats: false, showLanguages: false })).toEqual([]);
    expect(validateReadme(profile([block('s', 'stats', data({ baseUrl: '' }))]))[0]).toEqual({
      code: 'missingBaseUrl',
      params: { service: 'github-readme-stats' },
      blockId: 's',
    });
  });
});

describe('trophies block', () => {
  const data = (over: Record<string, unknown> = {}) => ({
    heading: 'Trophies',
    username: 'jane',
    baseUrl: BASE,
    columns: 6,
    rows: 1,
    ...over,
  });

  it('renders the trophies in a light and a dark variant', () => {
    const light = `${BASE}/?username=jane&amp;theme=flat&amp;column=6&amp;row=1`;
    const dark = `${BASE}/?username=jane&amp;theme=onedark&amp;column=6&amp;row=1`;
    expect(generateReadme(profile([block('t', 'trophies', data())]))).toBe(
      '## Trophies\n\n<div align="center">\n\n' +
        `![GitHub trophies of jane](${light}#gh-light-mode-only) ![GitHub trophies of jane](${dark}#gh-dark-mode-only)` +
        '\n\n</div>\n'
    );
  });

  it('renders nothing without a base URL or a valid username, and says why', () => {
    expect(generateReadme(profile([block('t', 'trophies', data({ baseUrl: '' }))]))).toBe('');
    expect(generateReadme(profile([block('t', 'trophies', data({ username: '' }))]))).toBe('');
    expect(validateReadme(profile([block('t', 'trophies', data({ baseUrl: '' }))]))).toEqual([
      { code: 'missingBaseUrl', params: { service: 'github-profile-trophy' }, blockId: 't' },
    ]);
  });
});
