import { describe, it, expect } from 'vitest';
import { encode } from 'uqr';
import jsQR from 'jsqr';

describe('uqr / jsqr contract', () => {
  it('encode() returns an object whose .data is a square boolean matrix', () => {
    const qr = encode('hello', { ecc: 'M', border: 0 });
    expect(qr.size).toBe(21);
    expect(qr.data).toHaveLength(21);
    expect(qr.data[0]).toHaveLength(21);
    expect(typeof qr.data[0][0]).toBe('boolean');
  });

  it('jsQR is callable and rejects a buffer of the wrong length', () => {
    expect(() => jsQR(new Uint8ClampedArray(3), 10, 10)).toThrow();
  });
});
