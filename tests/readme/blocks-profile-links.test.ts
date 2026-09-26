import { describe, expect, it } from 'vitest';
import { generateReadme } from '@/lib/readme/generate';
import { block, stateWith } from './helpers';

const profile = (blocks: Parameters<typeof stateWith>[0]) => stateWith(blocks, 'profile');

describe('skills block', () => {
  const data = (over: Record<string, unknown> = {}) => ({
    heading: 'Skills',
    icons: ['js', 'ts'],
    theme: 'auto',
    perLine: 10,
    ...over,
  });
  const url = (theme: string) => `https://skillicons.dev/icons?i=js,ts&amp;perline=10&amp;theme=${theme}`;

  it('renders one image per GitHub theme, with the skill names as alt text', () => {
    expect(generateReadme(profile([block('s', 'skills', data())]))).toBe(
      `## Skills\n\n![JavaScript, TypeScript](${url('light')}#gh-light-mode-only) ![JavaScript, TypeScript](${url('dark')}#gh-dark-mode-only)\n`
    );
  });

  it('renders a single image for a fixed theme', () => {
    expect(generateReadme(profile([block('s', 'skills', data({ theme: 'dark' }))]))).toBe(
      `## Skills\n\n![JavaScript, TypeScript](${url('dark')})\n`
    );
  });

  it('ignores unknown ids and duplicates, and never lets an id add a query parameter', () => {
    const output = generateReadme(
      profile([block('s', 'skills', data({ icons: ['py', 'python', 'js&x=1', 'py', 'JS', 'js,ts', 'ts'], theme: 'dark' }))])
    );
    expect(output).toContain('icons?i=py,ts&amp;perline=10');
    expect(output).toContain('![Python, TypeScript]');
  });

  it('renders nothing without a valid icon', () => {
    expect(generateReadme(profile([block('s', 'skills', data({ icons: [] }))]))).toBe('');
    expect(generateReadme(profile([block('s', 'skills', data({ icons: ['nope'] }))]))).toBe('');
  });
});

describe('contact block', () => {
  const data = (items: { network: string; value: string }[]) => ({ heading: 'Get in touch', items });

  it('renders each contact as a badge in the accent color, linked to its address', () => {
    const state = profile([
      block('c', 'contact', data([{ network: 'linkedin', value: 'https://linkedin.com/in/jane' }])),
    ]);
    expect(generateReadme(state)).toBe(
      '## Get in touch\n\n[![LinkedIn](https://img.shields.io/badge/LinkedIn-0969da?style=for-the-badge&amp;logo=linkedin&amp;logoColor=white)](https://linkedin.com/in/jane)\n'
    );
    expect(generateReadme({ ...state, theme: { accentColor: 'ff0000' } })).toContain('LinkedIn-ff0000');
  });

  it('links an email with mailto: and puts several badges on one line', () => {
    const state = profile([
      block(
        'c',
        'contact',
        data([
          { network: 'email', value: 'jane@example.com' },
          { network: 'stackoverflow', value: 'https://stackoverflow.com/users/1' },
        ])
      ),
    ]);
    expect(generateReadme(state)).toBe(
      '## Get in touch\n\n' +
        '[![Email](https://img.shields.io/badge/Email-0969da?style=for-the-badge)](mailto:jane@example.com) ' +
        '[![Stack Overflow](https://img.shields.io/badge/Stack_Overflow-0969da?style=for-the-badge&amp;logo=stackoverflow&amp;logoColor=white)](https://stackoverflow.com/users/1)\n'
    );
  });

  it('drops contacts whose address is unusable: dangerous links and malformed emails', () => {
    const state = profile([
      block(
        'c',
        'contact',
        data([
          { network: 'website', value: 'javascript:alert(1)' },
          { network: 'website', value: './relative' },
          { network: 'email', value: 'jane@' },
          { network: 'email', value: 'a@x.io?subject=hi' },
          { network: 'linkedin', value: '' },
        ])
      ),
    ]);
    expect(generateReadme(state)).toBe('');
  });
});
