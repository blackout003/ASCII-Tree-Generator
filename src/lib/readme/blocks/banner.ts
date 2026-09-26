import { z } from 'zod';
import { defineBlock } from '../block-definition';
import { getDefaultText } from '../default-texts';
import { escapeAlt, nonEmptyLines, safeUrl, toWellFormed } from '../markdown-utils';
import { param, parseBaseUrl } from '../services';

export const BANNER_FONTS = ['monospace', 'Fira Code', 'JetBrains Mono', 'Roboto', 'Poppins', 'Space Mono'] as const;
export const BANNER_SIZES = [16, 20, 24, 28, 32] as const;
export const BANNER_WIDTHS = [400, 500, 600, 800] as const;
export const BANNER_LIMITS = { lines: 1500, baseUrl: 300 } as const;
export const DEFAULT_TYPING_BASE = 'https://readme-typing-svg.demolab.com';

const MAX_LINES = 5;
const MAX_LINE_LENGTH = 100;

const oneOf = (list: readonly number[]) => (value: number) => list.includes(value);

const schema = z.object({
  lines: z.string().max(BANNER_LIMITS.lines),
  font: z.enum(BANNER_FONTS),
  size: z.number().refine(oneOf(BANNER_SIZES)),
  width: z.number().refine(oneOf(BANNER_WIDTHS)),
  align: z.enum(['left', 'center']),
  /** Six hex digits, or '' to use the theme accent color. */
  color: z.string().regex(/^([0-9a-fA-F]{6})?$/),
  baseUrl: z.string().max(BANNER_LIMITS.baseUrl),
});

export type BannerData = z.infer<typeof schema>;

export const bannerBlock = defineBlock<BannerData>({
  type: 'banner',
  modes: ['profile'],
  singleton: false,
  defaultOnCreate: false,
  recommended: true,
  schema,
  createData: (meta) => ({
    lines: [meta.name ? getDefaultText(meta.language, 'greeting').replace('{name}', () => meta.name) : '', meta.description]
      .filter((line) => line !== '')
      .join('\n'),
    font: 'Fira Code',
    size: 24,
    width: 500,
    align: 'center',
    color: '',
    baseUrl: '',
  }),
  toMarkdown: (data, ctx) => {
    // `;` separates the lines in the service's URL, so it cannot appear in a line.
    const lines = nonEmptyLines(data.lines)
      .slice(0, MAX_LINES)
      .map((line) => Array.from(toWellFormed(line)).slice(0, MAX_LINE_LENGTH).join('').replace(/;/g, ','));
    if (lines.length === 0) return '';
    const base = parseBaseUrl(data.baseUrl);
    if (base.status === 'invalid') return '';
    const root = base.status === 'ok' ? base.url : DEFAULT_TYPING_BASE;
    const query = [
      param('font', data.font),
      param('size', data.size),
      param('width', data.width),
      param('height', data.size + 30),
      param('color', data.color || ctx.theme.accentColor),
      param('center', data.align === 'center'),
      'vCenter=true',
      `lines=${lines.map((line) => encodeURIComponent(line).replace(/%20/g, '+')).join(';')}`,
    ].join('&');
    const image = `![${escapeAlt(lines[0])}](${safeUrl(`${root}/?${query}`)})`;
    return data.align === 'center' ? `<div align="center">\n\n${image}\n\n</div>` : image;
  },
});
