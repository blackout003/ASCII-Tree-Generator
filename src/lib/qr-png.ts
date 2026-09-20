import { QR_QUIET_ZONE } from './qr-types';

/** Target edge of the exported PNG, in pixels. The real size is snapped to a whole number of modules. */
export const PNG_TARGET_SIZE = 1024;

export function computePngLayout(matrixSize: number): { moduleSize: number; modules: number; size: number } {
  const modules = matrixSize + 2 * QR_QUIET_ZONE;
  const moduleSize = Math.max(1, Math.floor(PNG_TARGET_SIZE / modules));
  return { moduleSize, modules, size: modules * moduleSize };
}

/** Rasterizes the module matrix: black modules on an opaque white background, quiet zone included. */
export function matrixToRgba(matrix: boolean[][]): {
  data: Uint8ClampedArray<ArrayBuffer>;
  width: number;
  height: number;
} {
  const { moduleSize, size } = computePngLayout(matrix.length);
  const data = new Uint8ClampedArray(size * size * 4).fill(255);

  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix.length; c++) {
      if (!matrix[r][c]) continue;
      const x0 = (c + QR_QUIET_ZONE) * moduleSize;
      const y0 = (r + QR_QUIET_ZONE) * moduleSize;
      for (let y = 0; y < moduleSize; y++) {
        for (let x = 0; x < moduleSize; x++) {
          const i = ((y0 + y) * size + (x0 + x)) * 4;
          data[i] = 0;
          data[i + 1] = 0;
          data[i + 2] = 0;
        }
      }
    }
  }

  return { data, width: size, height: size };
}

/** Browser only. Encodes the raster as a PNG blob through a canvas. */
export function renderPngBlob(matrix: boolean[][]): Promise<Blob> {
  const { data, width, height } = matrixToRgba(matrix);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.reject(new Error('Canvas 2D context unavailable'));
  ctx.putImageData(new ImageData(data, width, height), 0, 0);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('PNG encoding failed'))), 'image/png');
  });
}
