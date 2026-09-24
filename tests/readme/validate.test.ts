import { describe, expect, it } from 'vitest';
import { validateReadme } from '@/lib/readme/validate';
import { freeMarkdown, header, stateWith } from './helpers';

describe('validateReadme', () => {
  it('returns no warning for a clean README', () => {
    const state = stateWith([header('h', { title: 'Demo' }), freeMarkdown('f', 'Some text')]);
    expect(validateReadme(state)).toEqual([]);
  });

  it('attaches each warning to the block that caused it', () => {
    const state = stateWith([freeMarkdown('a', 'ok'), freeMarkdown('b', '![](x.png)')]);
    expect(validateReadme(state)).toEqual([
      { code: 'imageMissingAlt', params: { count: 1 }, blockId: 'b' },
    ]);
  });

  it('ignores disabled blocks', () => {
    const state = stateWith([freeMarkdown('a', '![](x.png)', false)]);
    expect(validateReadme(state)).toEqual([]);
  });
});
