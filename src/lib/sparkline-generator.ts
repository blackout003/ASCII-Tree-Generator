import { SparklineOptions } from './sparkline-types';

const SPARKLINE_CHARS = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

export interface ParseResult {
  values: number[];
  error: string | null;
}

export function parseInput(input: string): ParseResult {
  if (!input.trim()) return { values: [], error: null };

  const parts = input.split(/[\s,;]+/).filter((p) => p.trim() !== '');
  const values: number[] = [];

  for (const part of parts) {
    const n = parseFloat(part.trim());
    if (isNaN(n)) return { values: [], error: part.trim() };
    values.push(n);
  }

  return { values, error: null };
}

export function generateSparkline(values: number[]): string {
  if (!values.length) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  return values
    .map((v) => {
      if (range === 0) return SPARKLINE_CHARS[Math.floor(SPARKLINE_CHARS.length / 2)];
      const normalized = (v - min) / range;
      const index = Math.min(
        SPARKLINE_CHARS.length - 1,
        Math.round(normalized * (SPARKLINE_CHARS.length - 1))
      );
      return SPARKLINE_CHARS[index];
    })
    .join('');
}

export function generateBarChart(values: number[], options: SparklineOptions): string {
  if (!values.length) return '';

  const { barHeight: height, showValues, barSpacing, fillChar } = options;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const barHeights = values.map((v) => Math.round(((v - min) / range) * height));
  const colWidth = showValues
    ? Math.max(1, ...values.map((v) => String(v).length))
    : 1;
  const sep = barSpacing ? ' ' : '';

  const rows: string[] = [];

  if (showValues) {
    rows.push(values.map((v) => String(v).padStart(colWidth)).join(sep));
  }

  for (let r = 0; r < height; r++) {
    const threshold = height - r;
    const line = barHeights
      .map((bh) =>
        bh >= threshold ? fillChar.repeat(colWidth) : ' '.repeat(colWidth)
      )
      .join(sep)
      .trimEnd();
    rows.push(line);
  }

  return rows.join('\n');
}

export function generateChart(values: number[], options: SparklineOptions): string {
  if (!values.length) return '';
  if (options.chartType === 'sparkline') return generateSparkline(values);
  return generateBarChart(values, options);
}
