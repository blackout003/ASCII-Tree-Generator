import { describe, expect, it } from 'vitest';
import { EMPTY_META } from '@/lib/readme/defaults';
import { generateReadme } from '@/lib/readme/generate';
import type { Block, ReadmeLanguage } from '@/lib/readme/types';
import { validateReadme } from '@/lib/readme/validate';
import { block, stateWith } from './helpers';

function inLanguage(language: ReadmeLanguage, blocks: Block[]) {
  return { ...stateWith(blocks), meta: { ...EMPTY_META, language } };
}

describe('alert block', () => {
  it('renders a GitHub alert and keeps blank lines inside the quote', () => {
    const state = stateWith([block('a', 'alert', { kind: 'WARNING', text: 'Careful\n\nSecond line' })]);
    expect(generateReadme(state)).toBe('> [!WARNING]\n> Careful\n>\n> Second line\n');
  });

  it('renders nothing without text', () => {
    expect(generateReadme(stateWith([block('a', 'alert', { kind: 'NOTE', text: '  \n ' })]))).toBe('');
  });
});

describe('usage block', () => {
  it('renders heading, description and a fenced example', () => {
    const state = stateWith([
      block('u', 'usage', { heading: 'Usage', description: 'Run it.', code: 'npm start', language: 'bash' }),
    ]);
    expect(generateReadme(state)).toBe('## Usage\n\nRun it.\n\n```bash\nnpm start\n```\n');
  });

  it('renders nothing when only the heading is filled', () => {
    const state = stateWith([block('u', 'usage', { heading: 'Usage', description: '', code: '', language: '' })]);
    expect(generateReadme(state)).toBe('');
  });

  it('lengthens the fence when the example contains one', () => {
    const state = stateWith([block('u', 'usage', { heading: 'U', description: '', code: 'a\n```\nb', language: '' })]);
    expect(generateReadme(state)).toBe('## U\n\n````\na\n```\nb\n````\n');
  });

  it('keeps only safe characters of the language and escapes the heading', () => {
    const state = stateWith([block('u', 'usage', { heading: '1. Start', description: '', code: 'x', language: 'js x\n' })]);
    expect(generateReadme(state)).toBe('## 1\\. Start\n\n```jsx\nx\n```\n');
  });
});

describe('installation block', () => {
  const full = {
    heading: 'Installation',
    prerequisites: 'Node 20\n\nGit',
    manager: 'npm',
    packageName: 'left-pad',
    commands: 'npm run build',
  };

  it('renders prerequisites and the install commands', () => {
    expect(generateReadme(stateWith([block('i', 'installation', full)]))).toBe(
      '## Installation\n\n### Prerequisites\n\n- Node 20\n- Git\n\n```bash\nnpm install left-pad\nnpm run build\n```\n'
    );
  });

  it('follows the README language for the prerequisites heading', () => {
    const state = inLanguage('fr', [block('i', 'installation', { ...full, manager: 'none', commands: '' })]);
    expect(generateReadme(state)).toBe('## Installation\n\n### Prérequis\n\n- Node 20\n- Git\n');
  });

  it('ignores the package name when no package manager is chosen', () => {
    const data = { ...full, prerequisites: '', manager: 'none', commands: '' };
    expect(generateReadme(stateWith([block('i', 'installation', data)]))).toBe('');
  });

  it('escapes prerequisites as plain text', () => {
    const data = { ...full, prerequisites: '- first\n<b>x</b>', manager: 'none', commands: '' };
    expect(generateReadme(stateWith([block('i', 'installation', data)]))).toContain('- \\- first\n- \\<b\\>x\\</b\\>');
  });
});

describe('visual proof block', () => {
  const image = { url: 'https://x.io/a.png', alt: 'Demo screen', caption: 'A *caption*' };

  it('renders the image and its caption', () => {
    expect(generateReadme(stateWith([block('v', 'visualProof', image)]))).toBe(
      '![Demo screen](https://x.io/a.png)\n\n*A \\*caption\\**\n'
    );
  });

  it('falls back to the caption, then to a localized word, for the alt text', () => {
    const noAlt = { ...image, alt: '', caption: 'Hello' };
    expect(generateReadme(stateWith([block('v', 'visualProof', noAlt)]))).toBe('![Hello](https://x.io/a.png)\n\n*Hello*\n');
    const bare = { ...image, alt: '', caption: '' };
    expect(generateReadme(stateWith([block('v', 'visualProof', bare)]))).toBe('![Screenshot](https://x.io/a.png)\n');
    expect(generateReadme(inLanguage('fr', [block('v', 'visualProof', bare)]))).toBe(
      "![Capture d'écran](https://x.io/a.png)\n"
    );
  });

  it('renders nothing for a missing or dangerous URL', () => {
    expect(generateReadme(stateWith([block('v', 'visualProof', { ...image, url: '' })]))).toBe('');
    expect(generateReadme(stateWith([block('v', 'visualProof', { ...image, url: 'javascript:alert(1)' })]))).toBe('');
  });

  it('warns when the image has no alt text', () => {
    const state = stateWith([block('v', 'visualProof', { ...image, alt: ' ' })]);
    expect(validateReadme(state)).toEqual([{ code: 'imageMissingAlt', params: { count: 1 }, blockId: 'v' }]);
    expect(validateReadme(stateWith([block('v', 'visualProof', image)]))).toEqual([]);
  });
});
