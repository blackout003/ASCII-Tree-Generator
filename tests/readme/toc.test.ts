import { describe, expect, it } from 'vitest';
import { EMPTY_META } from '@/lib/readme/defaults';
import { generateReadme } from '@/lib/readme/generate';
import { extractH2, githubSlug, githubSlugs } from '@/lib/readme/headings';
import { createBlock } from '@/lib/readme/state';
import { block, freeMarkdown, header, stateWith } from './helpers';

const toc = (heading = 'Table of contents') => block('t', 'tableOfContents', { heading });

describe('extractH2', () => {
  it('returns level-2 headings as written, ignoring other levels and code', () => {
    const md = '# T\n## A\n### B\n## C ##\n```\n## in code\n```\n#### D\n##NoSpace\n## ';
    expect(extractH2(md)).toEqual(['A', 'C']);
  });

  it('understands fences longer than three backticks', () => {
    expect(extractH2('````\n```\n## inner\n```\n````\n## outer')).toEqual(['outer']);
  });

  it('runs in linear time on hostile lines', () => {
    const hostile = ['## a' + ' '.repeat(50_000) + 'b', '## ' + '#'.repeat(50_000) + 'x', '##' + ' '.repeat(50_000)];
    for (const text of hostile) {
      const start = performance.now();
      extractH2(text);
      expect(performance.now() - start).toBeLessThan(200);
    }
  });
});

describe('githubSlug / githubSlugs', () => {
  it.each([
    ['Hello, World!', 'hello-world'],
    ['Créer & partager', 'créer--partager'],
    ['C++ / Rust', 'c--rust'],
    ['日本語 見出し', '日本語-見出し'],
    ['snake_case', 'snake_case'],
    ['1\\. Start', '1-start'],
    ['a\\_b', 'a_b'],
  ])('slug of %j is %j', (text, slug) => {
    expect(githubSlug(text)).toBe(slug);
  });

  it('numbers duplicates like GitHub does', () => {
    expect(githubSlugs(['Notes', 'Notes', 'Other', 'Notes'])).toEqual(['notes', 'notes-1', 'other', 'notes-2']);
  });
});

describe('table of contents block', () => {
  it('lists the level-2 headings of the other blocks, wherever the block is placed', () => {
    const state = stateWith([
      header('h', { title: 'Demo' }),
      toc(),
      block('i', 'installation', { heading: 'Installation', prerequisites: '', manager: 'none', packageName: '', commands: 'npm i' }),
      block('u', 'usage', { heading: '1. Start', description: 'Run', code: '', language: '' }),
      block('l', 'license', { heading: 'License', license: 'MIT', holder: '', year: '', credits: '' }),
    ]);
    const output = generateReadme(state);
    expect(output).toContain('## Table of contents\n\n- [Installation](#installation)\n- [1\\. Start](#1-start)\n- [License](#license)\n');
    expect(output).not.toContain('[Table of contents]');
  });

  it('numbers duplicate headings, handles non-ASCII text and ignores code and disabled blocks', () => {
    const state = stateWith([
      freeMarkdown('a', '## Notes\n\n```\n## not a heading\n```'),
      freeMarkdown('b', '## Notes\n\n## Créer & partager'),
      freeMarkdown('c', '## Hidden', false),
      toc(),
    ]);
    expect(generateReadme(state)).toContain(
      '## Table of contents\n\n- [Notes](#notes)\n- [Notes](#notes-1)\n- [Créer & partager](#créer--partager)\n'
    );
    expect(generateReadme(state)).not.toContain('Hidden](');
  });

  it('renders nothing when there is no heading to list', () => {
    expect(generateReadme(stateWith([header('h', { title: 'Demo' }), toc()]))).toBe('# Demo\n');
  });

  it('is created with a heading in the README language', () => {
    const created = createBlock('tableOfContents', { ...EMPTY_META, language: 'fr' });
    expect(created.data).toEqual({ heading: 'Table des matières' });
    const state = stateWith([freeMarkdown('a', '## A'), created]);
    expect(generateReadme(state)).toContain('## Table des matières\n\n- [A](#a)\n');
  });
});
