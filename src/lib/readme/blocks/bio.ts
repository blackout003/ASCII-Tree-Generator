import { z } from 'zod';
import { defineBlock } from '../block-definition';
import { getDefaultText } from '../default-texts';
import { atxHeading, escapeMarkdownText, nonEmptyLines, normalizeNewlines } from '../markdown-utils';

export const BIO_LIMITS = { heading: 300, intro: 2000, points: 2000 } as const;

const schema = z.object({
  heading: z.string().max(BIO_LIMITS.heading),
  intro: z.string().max(BIO_LIMITS.intro),
  points: z.string().max(BIO_LIMITS.points),
});

export type BioData = z.infer<typeof schema>;

export const bioBlock = defineBlock<BioData>({
  type: 'bio',
  modes: ['profile'],
  singleton: false,
  defaultOnCreate: false,
  recommended: true,
  schema,
  createData: (meta) => ({
    heading: meta.name
      ? getDefaultText(meta.language, 'bio').replace('{name}', () => meta.name)
      : getDefaultText(meta.language, 'bioAnonymous'),
    intro: '',
    points: '',
  }),
  toMarkdown: (data) => {
    const intro = normalizeNewlines(data.intro).trim();
    const points = nonEmptyLines(data.points);
    if (intro === '' && points.length === 0) return '';
    return [
      atxHeading(2, data.heading),
      intro,
      points.map((point) => `- ${escapeMarkdownText(point)}`).join('\n'),
    ]
      .filter((part) => part !== '')
      .join('\n\n');
  },
});
