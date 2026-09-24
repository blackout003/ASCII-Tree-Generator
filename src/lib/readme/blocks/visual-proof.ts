import { z } from 'zod';
import { defineBlock } from '../block-definition';
import { getDefaultText } from '../default-texts';
import { escapeAlt, escapeMarkdownText, safeUrl, singleLine } from '../markdown-utils';

export const VISUAL_PROOF_LIMITS = { url: 2000, alt: 200, caption: 500 } as const;

const schema = z.object({
  url: z.string().max(VISUAL_PROOF_LIMITS.url),
  alt: z.string().max(VISUAL_PROOF_LIMITS.alt),
  caption: z.string().max(VISUAL_PROOF_LIMITS.caption),
});

export type VisualProofData = z.infer<typeof schema>;

export const visualProofBlock = defineBlock<VisualProofData>({
  type: 'visualProof',
  modes: ['project'],
  singleton: false,
  defaultOnCreate: false,
  recommended: true,
  schema,
  createData: () => ({ url: '', alt: '', caption: '' }),
  toMarkdown: (data, ctx) => {
    const url = safeUrl(data.url);
    if (url === '') return '';
    const alt =
      escapeAlt(data.alt) || escapeAlt(data.caption) || escapeAlt(getDefaultText(ctx.meta.language, 'screenshot'));
    const caption = escapeMarkdownText(data.caption);
    return [`![${alt}](${url})`, caption === '' ? '' : `*${caption}*`].filter((part) => part !== '').join('\n\n');
  },
  validate: (data) =>
    safeUrl(data.url) !== '' && singleLine(data.alt) === '' ? [{ code: 'imageMissingAlt', params: { count: 1 } }] : [],
});
