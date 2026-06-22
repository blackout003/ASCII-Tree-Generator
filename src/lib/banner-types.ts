export type FontName =
  | 'standard' | 'small' | 'slant' | 'block' | 'shadow'
  | 'big' | 'lean' | 'digital' | 'doom' | 'mini';
export type BannerAlign = 'left' | 'center' | 'right';

export interface BannerOptions {
  font: FontName;
  align: BannerAlign;
  spacing: number; // 0 | 1 | 2
}
