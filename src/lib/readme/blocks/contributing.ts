import { z } from 'zod';
import { defineBlock } from '../block-definition';
import { getDefaultText } from '../default-texts';
import { atxHeading, escapeMarkdownText, normalizeNewlines, safeUrl } from '../markdown-utils';

export const CONTRIBUTING_LIMITS = { heading: 200, text: 5000, linkUrl: 2000, linkLabel: 100 } as const;

const schema = z.object({
  heading: z.string().max(CONTRIBUTING_LIMITS.heading),
  text: z.string().max(CONTRIBUTING_LIMITS.text),
  linkUrl: z.string().max(CONTRIBUTING_LIMITS.linkUrl),
  linkLabel: z.string().max(CONTRIBUTING_LIMITS.linkLabel),
});

export type ContributingData = z.infer<typeof schema>;

export const contributingBlock = defineBlock<ContributingData>({
  type: 'contributing',
  modes: ['project'],
  singleton: false,
  defaultOnCreate: false,
  schema,
  createData: (meta) => ({
    heading: getDefaultText(meta.language, 'contributing'),
    text: '',
    linkUrl: '',
    linkLabel: 'CONTRIBUTING.md',
  }),
  toMarkdown: (data) => {
    const text = normalizeNewlines(data.text).trim();
    const url = safeUrl(data.linkUrl);
    const label = escapeMarkdownText(data.linkLabel) || escapeMarkdownText(data.linkUrl);
    const link = url !== '' && label !== '' ? `[${label}](${url})` : '';
    if (text === '' && link === '') return '';
    return [atxHeading(2, data.heading), text, link].filter((part) => part !== '').join('\n\n');
  },
});
