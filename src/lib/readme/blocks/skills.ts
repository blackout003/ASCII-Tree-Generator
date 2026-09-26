import { z } from 'zod';
import { defineBlock } from '../block-definition';
import { getDefaultText } from '../default-texts';
import { atxHeading, escapeAlt, safeUrl } from '../markdown-utils';
import { themedPair } from '../services';
import { isSkillId, skillLabel } from '../skill-catalog';

export const SKILLS_LIMITS = { heading: 200, maxIcons: 80 } as const;
export const SKILL_PER_LINE = [5, 8, 10, 12, 15] as const;

const schema = z.object({
  heading: z.string().max(SKILLS_LIMITS.heading),
  // Ids are checked when the Markdown is generated, so a stale or edited id in an
  // imported file is ignored instead of making the whole block invalid.
  icons: z.array(z.string().max(40)).max(SKILLS_LIMITS.maxIcons),
  theme: z.enum(['auto', 'light', 'dark']),
  perLine: z.number().refine((value) => (SKILL_PER_LINE as readonly number[]).includes(value)),
});

export type SkillsData = z.infer<typeof schema>;

export const skillsBlock = defineBlock<SkillsData>({
  type: 'skills',
  modes: ['profile'],
  singleton: false,
  defaultOnCreate: false,
  recommended: true,
  schema,
  createData: (meta) => ({ heading: getDefaultText(meta.language, 'skills'), icons: [], theme: 'auto', perLine: 10 }),
  toMarkdown: (data) => {
    const ids = [...new Set(data.icons.filter(isSkillId))];
    if (ids.length === 0) return '';
    const alt = escapeAlt(ids.map(skillLabel).join(', '));
    const url = (theme: string) => safeUrl(`https://skillicons.dev/icons?i=${ids.join(',')}&perline=${data.perLine}&theme=${theme}`);
    const image =
      data.theme === 'auto'
        ? themedPair(alt, url('light'), url('dark'))
        : `![${alt}](${url(data.theme)})`;
    return [atxHeading(2, data.heading), image].filter((part) => part !== '').join('\n\n');
  },
});
