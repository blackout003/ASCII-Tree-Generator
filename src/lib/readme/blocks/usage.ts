import { z } from 'zod';
import { defineBlock } from '../block-definition';
import { getDefaultText } from '../default-texts';
import { atxHeading, codeFence, normalizeNewlines } from '../markdown-utils';

export const USAGE_LIMITS = { heading: 200, description: 2000, code: 20_000, language: 30 } as const;

const schema = z.object({
  heading: z.string().max(USAGE_LIMITS.heading),
  description: z.string().max(USAGE_LIMITS.description),
  code: z.string().max(USAGE_LIMITS.code),
  language: z.string().max(USAGE_LIMITS.language),
});

export type UsageData = z.infer<typeof schema>;

export const usageBlock = defineBlock<UsageData>({
  type: 'usage',
  modes: ['project'],
  singleton: false,
  defaultOnCreate: true,
  recommended: true,
  schema,
  createData: (meta) => ({ heading: getDefaultText(meta.language, 'usage'), description: '', code: '', language: '' }),
  toMarkdown: (data) => {
    const description = normalizeNewlines(data.description).trim();
    const hasCode = data.code.trim() !== '';
    if (description === '' && !hasCode) return '';
    return [atxHeading(2, data.heading), description, hasCode ? codeFence(data.code, data.language) : '']
      .filter((part) => part !== '')
      .join('\n\n');
  },
});
