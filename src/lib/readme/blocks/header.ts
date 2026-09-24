import { z } from 'zod';
import { defineBlock } from '../block-definition';
import { escapeAlt, safeUrl, singleLine } from '../markdown-utils';

export const HEADER_LIMITS = { title: 200, tagline: 500, logoUrl: 2000, logoAlt: 200 } as const;

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
    const title = singleLine(data.title);
    const tagline = singleLine(data.tagline);
    const logo = safeUrl(data.logoUrl);
    const lines: string[] = [];
    if (logo) lines.push(`![${escapeAlt(data.logoAlt) || escapeAlt(title) || 'Logo'}](${logo})`);
    if (title) lines.push(`# ${title}`);
    if (tagline) lines.push(tagline);
    return lines.join('\n\n');
  },
});
