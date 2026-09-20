import { describe, it, expect } from 'vitest';
import jsQR from 'jsqr';
import { generateMatrix } from '@/lib/qr-generator';
import { computePngLayout, matrixToRgba, PNG_TARGET_SIZE } from '@/lib/qr-png';

describe('computePngLayout', () => {
  it('snaps the size down to an integer multiple of the module count', () => {
    expect(computePngLayout(21)).toEqual({ moduleSize: 35, modules: 29, size: 1015 });
    expect(computePngLayout(125)).toEqual({ moduleSize: 7, modules: 133, size: 931 });
  });

  it('never exceeds the target and is always a whole number of modules, for every QR version', () => {
    for (let version = 1; version <= 40; version++) {
      const { moduleSize, modules, size } = computePngLayout(17 + 4 * version);
      expect(size).toBeLessThanOrEqual(PNG_TARGET_SIZE);
      expect(size % modules).toBe(0);
      expect(moduleSize).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('matrixToRgba', () => {
  it('draws an opaque white quiet zone', () => {
    const { data } = matrixToRgba(generateMatrix('hello', 'M'));
    expect(Array.from(data.slice(0, 4))).toEqual([255, 255, 255, 255]);
  });

  it.each(['https://asciitree.fr', 'héllo 😀 日本語', 'é'.repeat(300)])('decodes back to %#', (payload) => {
    const { data, width, height } = matrixToRgba(generateMatrix(payload, 'M'));
    expect(jsQR(data, width, height, { inversionAttempts: 'dontInvert' })?.data).toBe(payload);
  });
});
