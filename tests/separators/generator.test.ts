import { describe, it, expect } from 'vitest';
import { generateLine, generateBadge, generateCommentBlock, generateBlock } from '@/lib/separator-generator';
import type { SeparatorOptions } from '@/lib/separator-types';

describe('generateLine', () => {
  it('repeats the character to the given width', () => {
    expect(generateLine('=', 5)).toBe('=====');
  });

  it('returns an empty string for a zero or negative width', () => {
    expect(generateLine('=', 0)).toBe('');
    expect(generateLine('=', -3)).toBe('');
  });

  it('returns an empty string for an empty character', () => {
    expect(generateLine('', 10)).toBe('');
  });
});

describe('generateBadge', () => {
  it('wraps the label in brackets', () => {
    expect(generateBadge('STATUS: ACTIVE', 'brackets')).toBe('[ STATUS: ACTIVE ]');
  });

  it('wraps the label in dashes', () => {
    expect(generateBadge('v2.1.0', 'dashes')).toBe('-- v2.1.0 --');
  });

  it('wraps the label in solid blocks', () => {
    expect(generateBadge('DONE', 'block')).toBe('█ DONE █');
  });

  it('trims the label before wrapping', () => {
    expect(generateBadge('  DONE  ', 'brackets')).toBe('[ DONE ]');
  });

  it('returns an empty string for blank input', () => {
    expect(generateBadge('   ', 'brackets')).toBe('');
  });
});

describe('generateCommentBlock', () => {
  it('produces a C/JS-style boxed header', () => {
    const result = generateCommentBlock('AUTH CONTROLLER', 'c', 20);
    const lines = result.split('\n');
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe(lines[2]);
    expect(lines[0].startsWith('/* -')).toBe(true);
    expect(lines[0].endsWith('- */')).toBe(true);
    expect(lines[1]).toContain('AUTH CONTROLLER');
  });

  it('produces a hash-style boxed header for Python/Bash', () => {
    const result = generateCommentBlock('config', 'hash', 10);
    const lines = result.split('\n');
    expect(lines).toHaveLength(3);
    expect(lines[0].startsWith('# -')).toBe(true);
    expect(lines[1]).toContain('CONFIG');
  });

  it('widens the rule to fit a title longer than the requested width', () => {
    const result = generateCommentBlock('A VERY LONG SECTION TITLE', 'hash', 5);
    const lines = result.split('\n');
    expect(lines[0].length).toBeGreaterThanOrEqual('A VERY LONG SECTION TITLE'.length);
  });

  it('returns an empty string for blank input', () => {
    expect(generateCommentBlock('   ', 'c', 20)).toBe('');
  });
});

describe('generateBlock', () => {
  const base: SeparatorOptions = {
    blockType: 'line',
    width: 10,
    lineChar: '-',
    badgeStyle: 'brackets',
    commentLang: 'c',
  };

  it('dispatches to generateLine for the line type', () => {
    expect(generateBlock('ignored', base)).toBe('----------');
  });

  it('dispatches to generateBadge for the badge type', () => {
    expect(generateBlock('READY', { ...base, blockType: 'badge' })).toBe('[ READY ]');
  });

  it('dispatches to generateCommentBlock for the comment type', () => {
    const result = generateBlock('SETUP', { ...base, blockType: 'comment' });
    expect(result.split('\n')).toHaveLength(3);
  });
});
