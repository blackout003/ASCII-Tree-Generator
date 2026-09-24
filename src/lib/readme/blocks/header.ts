import { z } from 'zod';
import { defineBlock } from '../block-definition';
import { atxHeading, escapeAlt, escapeMarkdownText, safeUrl } from '../markdown-utils';

// title and tagline are seeded from `meta.name` / `meta.description`, so they
// must accept at least as much as META_LIMITS allows there.
export const HEADER_LIMITS = { title: 200, tagline: 1000, logoUrl: 2000, logoAlt: 200 } as const;

const schema = z.object({
  title: z.string().max(HEADER_LIMITS.title),
  tagline: z.string().max(HEADER_LIMITS.tagline),
  logoUrl: z.string().max(HEADER_LIMITS.logoUrl),
  logoAlt: z.string().max(HEADER_LIMITS.logoAlt),
});

export type HeaderData = z.infer<typeof schema>;

export const headerBlock = defineBlock<HeaderData>({
  type: 'header',
  modes: ['project'],
  singleton: true,
  defaultOnCreate: true,
  schema,
  createData: (meta) => ({ title: meta.name, tagline: meta.description, logoUrl: '', logoAlt: '' }),
  toMarkdown: (data) => {
    const logo = safeUrl(data.logoUrl);
    const lines: string[] = [];
    if (logo) lines.push(`![${escapeAlt(data.logoAlt) || escapeAlt(data.title) || 'Logo'}](${logo})`);
    lines.push(atxHeading(1, data.title), escapeMarkdownText(data.tagline));
    return lines.filter((line) => line !== '').join('\n\n');
  },
});
