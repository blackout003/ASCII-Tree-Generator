import { describe, it, expect } from 'vitest';
import { generateMatrix, toInkGrid, renderQr, toMarkdown } from '@/lib/qr-generator';
import { QR_QUIET_ZONE, type QrEcc, type QrStyle } from '@/lib/qr-types';
import { parseRendered, decodeInk } from './helpers';

const STYLES: QrStyle[] = ['half', 'blocks', 'ascii'];
const ECCS: QrEcc[] = ['L', 'M', 'Q', 'H'];
const PAYLOADS: Record<string, string> = {
  url: 'https://asciitree.fr',
  unicode: 'héllo 😀 日本語',
  wifi: 'WIFI:T:WPA;S:My\\;Net;P:p\\:a\\"ss;;',
  max300: 'é'.repeat(300),
};

describe('generateMatrix', () => {
  it('returns [] for empty text', () => {
    expect(generateMatrix('', 'M')).toEqual([]);
  });

  it('returns a square matrix of module booleans', () => {
    const m = generateMatrix('hello', 'M');
    expect(m).toHaveLength(21);
    expect(m.every((row) => row.length === 21)).toBe(true);
  });

  it('a higher error-correction level needs a bigger code for the same text', () => {
    const text = 'x'.repeat(100);
    expect(generateMatrix(text, 'H').length).toBeGreaterThan(generateMatrix(text, 'L').length);
  });

  it('never overflows at the 300-character limit, even with 4-byte characters at level H', () => {
    const text = '😀'.repeat(300);
    const m = generateMatrix(text, 'H');
    expect(decodeInk(toInkGrid(m, false), false)).toBe(text);
  });
});

describe('toInkGrid', () => {
  const m = generateMatrix('hello', 'M');

  it('adds a 4-module quiet zone of light modules', () => {
    const grid = toInkGrid(m, false);
    expect(grid).toHaveLength(m.length + 2 * QR_QUIET_ZONE);
    expect(grid[0].every((v) => v === false)).toBe(true);
    expect(grid[QR_QUIET_ZONE + 3][QR_QUIET_ZONE + 3]).toBe(m[3][3]);
  });

  it('with invert, the ink is the light modules (quiet zone included)', () => {
    const grid = toInkGrid(m, true);
    expect(grid[0].every((v) => v === true)).toBe(true);
    expect(grid[QR_QUIET_ZONE + 3][QR_QUIET_ZONE + 3]).toBe(!m[3][3]);
  });
});

describe('renderQr shape', () => {
  const m = generateMatrix('hello', 'M');
  const size = m.length + 2 * QR_QUIET_ZONE; // 29

  it('returns "" for an empty matrix', () => {
    expect(renderQr([], 'half', false)).toBe('');
  });

  it('blocks: one line per module row, two characters per module', () => {
    const lines = renderQr(m, 'blocks', false).split('\n');
    expect(lines).toHaveLength(size);
    expect(lines.every((l) => l.length === size * 2)).toBe(true);
  });

  it('ascii: only 7-bit characters, two per module', () => {
    const out = renderQr(m, 'ascii', false);
    expect(out).toMatch(/^[ #\n]+$/);
    expect(out.split('\n').every((l) => l.length === size * 2)).toBe(true);
  });

  it('half: two module rows per line, only " ▀▄█"', () => {
    const out = renderQr(m, 'half', false);
    expect(out).toMatch(/^[ ▀▄█\n]+$/);
    const lines = out.split('\n');
    expect(lines).toHaveLength(Math.ceil(size / 2));
    expect(lines.every((l) => l.length === size)).toBe(true);
  });

  it.each([false, true])('half: the padding row of an odd size is background (invert=%s)', (invert) => {
    const rows = parseRendered(renderQr(m, 'half', invert), 'half');
    expect(rows).toHaveLength(size + 1);
    expect(rows[size].every((v) => v === invert)).toBe(true);
  });
});

describe('scan round-trip: rendered text decodes to the original payload', () => {
  const cases = STYLES.flatMap((style) =>
    [false, true].flatMap((invert) =>
      ECCS.flatMap((ecc) =>
        Object.entries(PAYLOADS).map(([name, payload]) => ({ style, invert, ecc, name, payload }))
      )
    )
  );

  it.each(cases)('$style invert=$invert ecc=$ecc $name', ({ style, invert, ecc, payload }) => {
    const text = renderQr(generateMatrix(payload, ecc), style, invert);
    expect(decodeInk(parseRendered(text, style), invert)).toBe(payload);
  });
});

describe('toMarkdown', () => {
  it('wraps the text in a fenced code block', () => {
    expect(toMarkdown('▀▄')).toBe('```text\n▀▄\n```');
  });
});
