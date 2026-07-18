export type ChartType = 'sparkline' | 'barChart';
export type FillChar = '█' | '#' | '|' | '▓';

export interface SparklineOptions {
  chartType: ChartType;
  barHeight: number;
  showValues: boolean;
  barSpacing: boolean;
  fillChar: FillChar;
}
