import { describe, expect, it } from 'vitest';
import {
  checkMarkdownFragment,
  countImagesMissingAlt,
  findUnclosedTags,
  hasLayoutTable,
} from '@/lib/readme/markdown-checks';

describe('countImagesMissingAlt', () => {
  it('counts Markdown images with empty alt text', () => {
    expect(countImagesMissingAlt('![](a.png) and ![ ](b.png) and ![ok](c.png)')).toBe(2);
  });

  it('counts <img> tags without a non-empty alt attribute', () => {
    const html = '<img src="a.png"> <img src="b.png" alt=""> <img src="c.png" alt="ok"> <img src="d.png" alt=\'ok\'>';
    expect(countImagesMissingAlt(html)).toBe(2);
  });

  it('ignores images inside code', () => {
    expect(countImagesMissingAlt('`![](a.png)`\n\n```md\n![](b.png)\n```')).toBe(0);
  });

  it('understands fences longer than three backticks', () => {
    const md = '````md\n```\n![](i1.png)\n![](i2.png)\n```\n````\n![](outer.png)';
    expect(countImagesMissingAlt(md)).toBe(1);
  });
});

describe('findUnclosedTags', () => {
  it('accepts balanced markup with void elements and self-closing tags', () => {
    expect(findUnclosedTags('<div align="center"><img src="x" alt="y"><br><hr/></div>')).toEqual([]);
  });

  it('reports a tag that is never closed', () => {
    expect(findUnclosedTags('<details><summary>More</summary>text')).toEqual(['details']);
  });

  it('reports a tag left open inside a closed parent', () => {
    expect(findUnclosedTags('<div><span>hi</div>')).toEqual(['span']);
  });

  it('reports a closing tag that was never opened', () => {
    expect(findUnclosedTags('text</div>')).toEqual(['div']);
  });

  it('ignores optional-closing tags, comments, autolinks and code', () => {
    const md = '<p>one\n<li>two\n<!-- <div> -->\n<https://x.io> and <me@x.io>\n`<b>`\n```\n<div>\n```';
    expect(findUnclosedTags(md)).toEqual([]);
  });

  it('is case-insensitive', () => {
    expect(findUnclosedTags('<DIV></div>')).toEqual([]);
  });
});

describe('hasLayoutTable', () => {
  it('flags a table whose header cells are all empty', () => {
    expect(hasLayoutTable('| | |\n|---|---|\n| a | b |')).toBe(true);
  });

  it('accepts a normal data table', () => {
    expect(hasLayoutTable('| a | b |\n|---|---|\n| 1 | 2 |')).toBe(false);
  });

  it('does not mistake a thematic break or code for a table', () => {
    expect(hasLayoutTable('text\n\n---\n\nmore')).toBe(false);
    expect(hasLayoutTable('```\n| |\n|-|\n```')).toBe(false);
  });
});

describe('checkMarkdownFragment', () => {
  it('returns no warning for clean Markdown', () => {
    expect(checkMarkdownFragment('# Title\n\n![logo](a.png)\n\ntext')).toEqual([]);
  });

  it('reports every kind of problem with parameters', () => {
    const md = '![](a.png)\n\n<div>\n\n| | |\n|-|-|\n| a | b |';
    expect(checkMarkdownFragment(md)).toEqual([
      { code: 'imageMissingAlt', params: { count: 1 } },
      { code: 'htmlTagMismatch', params: { tags: 'div' } },
      { code: 'layoutTable' },
    ]);
  });
});
