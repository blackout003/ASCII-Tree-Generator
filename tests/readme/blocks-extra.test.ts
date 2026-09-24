import { describe, expect, it } from 'vitest';
import { EMPTY_META } from '@/lib/readme/defaults';
import { generateReadme } from '@/lib/readme/generate';
import { shieldsBadgeUrl, shieldsText } from '@/lib/readme/shields';
import { createBlock } from '@/lib/readme/state';
import type { Block, ReadmeLanguage } from '@/lib/readme/types';
import { validateReadme } from '@/lib/readme/validate';
import { block, stateWith } from './helpers';

function inLanguage(language: ReadmeLanguage, blocks: Block[]) {
  return { ...stateWith(blocks), meta: { ...EMPTY_META, language } };
}

describe('shields helpers', () => {
  it('escapes dashes, underscores and spaces the way Shields expects', () => {
    expect(shieldsText('my-label_x y')).toBe('my--label__x_y');
    expect(shieldsText('a/b?c')).toBe('a%2Fb%3Fc');
  });

  it('builds a static badge URL', () => {
    expect(shieldsBadgeUrl('license', 'MIT', '0969da')).toBe('https://img.shields.io/badge/license-MIT-0969da');
  });
});

describe('badges block', () => {
  const item = (over: Partial<Record<'label' | 'message' | 'color' | 'link', string>> = {}) => ({
    label: 'license',
    message: 'MIT',
    color: '',
    link: '',
    ...over,
  });

  it('uses the theme accent color when the badge has none', () => {
    const state = stateWith([block('b', 'badges', { items: [item()] })]);
    expect(generateReadme(state)).toBe('![license: MIT](https://img.shields.io/badge/license-MIT-0969da)\n');
    const themed = { ...state, theme: { accentColor: 'ff0000' } };
    expect(generateReadme(themed)).toBe('![license: MIT](https://img.shields.io/badge/license-MIT-ff0000)\n');
  });

  it('puts badges on one line and links the ones that have a link', () => {
    const items = [item({ label: 'build', message: 'passing', color: '44cc11', link: 'https://ci.example.com/run' }), item()];
    expect(generateReadme(stateWith([block('b', 'badges', { items })]))).toBe(
      '[![build: passing](https://img.shields.io/badge/build-passing-44cc11)](https://ci.example.com/run) ' +
        '![license: MIT](https://img.shields.io/badge/license-MIT-0969da)\n'
    );
  });

  it('skips badges without a label or a value, and a dangerous link', () => {
    const items = [item({ label: '' }), item({ message: ' ' }), item({ link: 'javascript:alert(1)' })];
    expect(generateReadme(stateWith([block('b', 'badges', { items })]))).toBe(
      '![license: MIT](https://img.shields.io/badge/license-MIT-0969da)\n'
    );
  });

  it('seeds a license badge from the meta, and none without a license', () => {
    const seeded = createBlock('badges', { ...EMPTY_META, license: 'Apache-2.0' });
    expect((seeded.data as { items: unknown[] }).items).toEqual([
      { label: 'license', message: 'Apache-2.0', color: '', link: '' },
    ]);
    expect((createBlock('badges', EMPTY_META).data as { items: unknown[] }).items).toEqual([]);
  });

  it('links the seeded license badge to the LICENSE file of a GitHub repository', () => {
    const link = (repoUrl: string) =>
      (createBlock('badges', { ...EMPTY_META, license: 'MIT', repoUrl }).data as { items: { link: string }[] }).items[0]
        .link;
    expect(link('https://github.com/o/r')).toBe('https://github.com/o/r/blob/HEAD/LICENSE');
    expect(link('https://gitlab.com/o/r')).toBe('');
    expect(link('https://github.com/o/r/tree/main')).toBe('');
    expect(link(`https://github.com/o/${'r'.repeat(1990)}`)).toBe('');
  });

  it('warns above five badges', () => {
    const five = { items: Array.from({ length: 5 }, () => item()) };
    const six = { items: Array.from({ length: 6 }, () => item()) };
    expect(validateReadme(stateWith([block('b', 'badges', five)]))).toEqual([]);
    expect(validateReadme(stateWith([block('b', 'badges', six)]))).toEqual([
      { code: 'tooManyBadges', params: { count: 6 }, blockId: 'b' },
    ]);
  });
});

describe('architecture block', () => {
  const data = { heading: 'Architecture', content: 'Two modules.', roadmapHeading: 'Roadmap', roadmap: 'Ship v1\n- Fast' };

  it('renders the description and the roadmap as an unchecked list', () => {
    expect(generateReadme(stateWith([block('a', 'architecture', data)]))).toBe(
      '## Architecture\n\nTwo modules.\n\n## Roadmap\n\n- [ ] Ship v1\n- [ ] \\- Fast\n'
    );
  });

  it('renders only the section that has content', () => {
    expect(generateReadme(stateWith([block('a', 'architecture', { ...data, roadmap: '' })]))).toBe(
      '## Architecture\n\nTwo modules.\n'
    );
    expect(generateReadme(stateWith([block('a', 'architecture', { ...data, content: '' })]))).toBe(
      '## Roadmap\n\n- [ ] Ship v1\n- [ ] \\- Fast\n'
    );
    expect(generateReadme(stateWith([block('a', 'architecture', { ...data, content: '', roadmap: '' })]))).toBe('');
  });
});

describe('contributing block', () => {
  const data = { heading: 'Contributing', text: 'PRs welcome.', linkUrl: 'https://x.io/CONTRIBUTING.md', linkLabel: 'CONTRIBUTING.md' };

  it('renders the text and a link', () => {
    expect(generateReadme(stateWith([block('c', 'contributing', data)]))).toBe(
      '## Contributing\n\nPRs welcome.\n\n[CONTRIBUTING.md](https://x.io/CONTRIBUTING.md)\n'
    );
  });

  it('uses the URL as link text when there is no label, and drops a dangerous link', () => {
    const noLabel = { ...data, text: '', linkLabel: '' };
    expect(generateReadme(stateWith([block('c', 'contributing', noLabel)]))).toContain('[https://x.io/CONTRIBUTING.md](');
    const bad = { ...data, text: '', linkUrl: 'javascript:alert(1)' };
    expect(generateReadme(stateWith([block('c', 'contributing', bad)]))).toBe('');
  });
});

describe('license block', () => {
  const data = { heading: 'License', license: 'MIT', holder: 'Jane Doe', year: '2026', credits: 'Contributors\nThe community' };

  it('renders the sentence, the copyright line and the acknowledgements', () => {
    expect(generateReadme(stateWith([block('l', 'license', data)]))).toBe(
      '## License\n\nDistributed under the MIT license. See [LICENSE](LICENSE) for more information.\n\n' +
        '© 2026 Jane Doe\n\n### Acknowledgements\n\n- Contributors\n- The community\n'
    );
  });

  it('follows the README language', () => {
    expect(generateReadme(inLanguage('fr', [block('l', 'license', { ...data, holder: '', year: '', credits: '' })]))).toBe(
      "## License\n\nDistribué sous licence MIT. Voir [LICENSE](LICENSE) pour plus d'informations.\n"
    );
  });

  it('does not let a license name inject Markdown or replacement patterns', () => {
    const tricky = { ...data, license: '$& <b>x</b>', holder: '', year: '', credits: '' };
    expect(generateReadme(stateWith([block('l', 'license', tricky)]))).toContain('the $& \\<b\\>x\\</b\\> license.');
  });

  it('renders nothing when every field is empty', () => {
    const empty = { heading: 'License', license: '', holder: '', year: '', credits: '' };
    expect(generateReadme(stateWith([block('l', 'license', empty)]))).toBe('');
  });
});
