export type BlockType = 'line' | 'badge' | 'comment';
export type BadgeStyle = 'brackets' | 'dashes' | 'block';
export type CommentLang = 'c' | 'hash';

export const LINE_CHARS = ['═', '─', '-', '=', '*', '#'] as const;
export const WIDTH_OPTIONS = [20, 30, 40, 50, 60, 80] as const;

export interface SeparatorOptions {
  blockType: BlockType;
  width: number;
  lineChar: string;
  badgeStyle: BadgeStyle;
  commentLang: CommentLang;
}
