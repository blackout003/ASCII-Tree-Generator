import { z } from 'zod';
import { defineBlock } from '../block-definition';
import { getDefaultText } from '../default-texts';
import { atxHeading, escapeMarkdownText, nonEmptyLines } from '../markdown-utils';

export const LICENSE_LIMITS = { heading: 200, license: 100, holder: 200, year: 20, credits: 3000 } as const;

const schema = z.object({
  heading: z.string().max(LICENSE_LIMITS.heading),
  license: z.string().max(LICENSE_LIMITS.license),
  holder: z.string().max(LICENSE_LIMITS.holder),
  year: z.string().max(LICENSE_LIMITS.year),
  credits: z.string().max(LICENSE_LIMITS.credits),
});

export type LicenseData = z.infer<typeof schema>;

export const licenseBlock = defineBlock<LicenseData>({
  type: 'license',
  modes: ['project'],
  singleton: true,
  defaultOnCreate: true,
  recommended: true,
  schema,
  createData: (meta) => ({
    heading: getDefaultText(meta.language, 'license'),
    license: meta.license,
    holder: meta.author,
    year: '',
    credits: '',
  }),
  toMarkdown: (data, ctx) => {
    const license = escapeMarkdownText(data.license);
    const sentence = license === '' ? '' : getDefaultText(ctx.meta.language, 'licenseSentence').replace('{license}', () => license);
    const owner = escapeMarkdownText([data.year, data.holder].filter((part) => part.trim() !== '').join(' '));
    const credits = nonEmptyLines(data.credits);
    if (sentence === '' && owner === '' && credits.length === 0) return '';

    const parts = [atxHeading(2, data.heading), sentence, owner === '' ? '' : `© ${owner}`];
    if (credits.length > 0) {
      parts.push(
        atxHeading(3, getDefaultText(ctx.meta.language, 'acknowledgements')),
        credits.map((credit) => `- ${escapeMarkdownText(credit)}`).join('\n')
      );
    }
    return parts.filter((part) => part !== '').join('\n\n');
  },
});
