import { encode } from 'uqr';
import { QR_QUIET_ZONE, type QrEcc, type QrStyle } from './qr-types';

/**
 * Encodes `text` and returns the raw module matrix (true = dark), without any border.
 * The caller must keep `text` within QR_MAX_LENGTH characters; that bound guarantees the
 * data fits in a version-40 code at every error-correction level.
 */
export function generateMatrix(text: string, ecc: QrEcc): boolean[][] {
  if (!text) return [];
  return encode(text, { ecc, border: 0 }).data;
}

/**
 * Adds the quiet zone and converts modules into "ink" (true = a glyph is printed).
 * Normally ink = dark module. With `invert` (dark terminals print light text on a dark
 * background) ink = light module, quiet zone included, so the result keeps the right polarity.
 */
export function toInkGrid(matrix: boolean[][], invert: boolean): boolean[][] {
  const size = matrix.length + 2 * QR_QUIET_ZONE;
  const grid = Array.from({ length: size }, () => new Array<boolean>(size).fill(invert));
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix.length; c++) {
      grid[r + QR_QUIET_ZONE][c + QR_QUIET_ZONE] = invert ? !matrix[r][c] : matrix[r][c];
    }
  }
  return grid;
}

/** Renders the matrix as text. `half` packs two module rows per line; the others use two characters per module. */
export function renderQr(matrix: boolean[][], style: QrStyle, invert: boolean): string {
  if (!matrix.length) return '';
  const grid = toInkGrid(matrix, invert);
  const size = grid.length;
  const lines: string[] = [];

  if (style === 'half') {
    for (let r = 0; r < size; r += 2) {
      let line = '';
      for (let c = 0; c < size; c++) {
        const top = grid[r][c];
        // Odd size: the last line has no bottom row; pad it with a background (light) module.
        const bottom = r + 1 < size ? grid[r + 1][c] : invert;
        line += top ? (bottom ? '█' : '▀') : bottom ? '▄' : ' ';
      }
      lines.push(line);
    }
  } else {
    const ink = style === 'ascii' ? '##' : '██';
    for (const row of grid) lines.push(row.map((v) => (v ? ink : '  ')).join(''));
  }

  return lines.join('\n');
}

export function toMarkdown(text: string): string {
  return `\`\`\`text\n${text}\n\`\`\``;
}
