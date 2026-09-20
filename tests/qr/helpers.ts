import jsQR from 'jsqr';
import type { QrStyle } from '@/lib/qr-types';

const GLYPH: Record<'blocks' | 'ascii', string> = { blocks: '██', ascii: '##' };

/** Reads rendered text back into an "ink" grid (true = a glyph is printed). Returns every row. */
export function parseRendered(text: string, style: QrStyle): boolean[][] {
  const lines = text.split('\n');

  if (style === 'half') {
    const rows: boolean[][] = [];
    for (const line of lines) {
      const top: boolean[] = [];
      const bottom: boolean[] = [];
      for (const ch of line) {
        if (!' ▀▄█'.includes(ch)) throw new Error(`Unexpected character "${ch}" in half-block output`);
        top.push(ch === '█' || ch === '▀');
        bottom.push(ch === '█' || ch === '▄');
      }
      rows.push(top, bottom);
    }
    return rows;
  }

  const glyph = GLYPH[style];
  return lines.map((line) => {
    const row: boolean[] = [];
    for (let i = 0; i < line.length; i += 2) {
      const cell = line.slice(i, i + 2);
      if (cell !== '  ' && cell !== glyph) throw new Error(`Unexpected cell "${cell}" in ${style} output`);
      row.push(cell !== '  ');
    }
    return row;
  });
}

/**
 * Turns an ink grid into pixels the way a phone would see it (dark modules black on light),
 * then decodes it with jsQR. `invert` says whether ink means "light module".
 * The grid must include the quiet zone. Only the first `width` rows are used (half-block
 * output can carry one extra padding row).
 */
export function decodeInk(ink: boolean[][], invert: boolean, scale = 4): string | null {
  const size = ink[0].length;
  const grid = ink.slice(0, size);
  const width = size * scale;
  const data = new Uint8ClampedArray(width * width * 4).fill(255);

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const dark = invert ? !grid[r][c] : grid[r][c];
      if (!dark) continue;
      for (let y = 0; y < scale; y++) {
        for (let x = 0; x < scale; x++) {
          const i = ((r * scale + y) * width + (c * scale + x)) * 4;
          data[i] = 0;
          data[i + 1] = 0;
          data[i + 2] = 0;
        }
      }
    }
  }

  const result = jsQR(data, width, width, { inversionAttempts: 'dontInvert' });
  return result ? result.data : null;
}
