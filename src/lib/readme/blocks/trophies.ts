import { z } from 'zod';
import { defineBlock } from '../block-definition';
import { cardWarnings, resolveCardService } from '../card-service';
import { getDefaultText } from '../default-texts';
import { atxHeading, escapeAlt, safeUrl } from '../markdown-utils';
import { param, themedPair } from '../services';

export const TROPHY_COLUMNS = [3, 4, 6, 8] as const;
export const TROPHY_ROWS = [1, 2, 3] as const;
export const TROPHIES_LIMITS = { heading: 200, username: 100, baseUrl: 300 } as const;

const oneOf = (list: readonly number[]) => (value: number) => list.includes(value);

const schema = z.object({
  heading: z.string().max(TROPHIES_LIMITS.heading),
  username: z.string().max(TROPHIES_LIMITS.username),
  baseUrl: z.string().max(TROPHIES_LIMITS.baseUrl),
  columns: z.number().refine(oneOf(TROPHY_COLUMNS)),
  rows: z.number().refine(oneOf(TROPHY_ROWS)),
});

export type TrophiesData = z.infer<typeof schema>;

const SERVICE = 'github-profile-trophy';

export const trophiesBlock = defineBlock<TrophiesData>({
  type: 'trophies',
  modes: ['profile'],
  singleton: false,
  defaultOnCreate: false,
  schema,
  createData: (meta) => ({
    heading: getDefaultText(meta.language, 'trophies'),
    username: meta.username,
    baseUrl: '',
    columns: 6,
    rows: 1,
  }),
  toMarkdown: (data, ctx) => {
    const { username, base } = resolveCardService(data.username, ctx.meta.username, data.baseUrl);
    if (username === '' || base.status !== 'ok') return '';
    const url = (theme: string) =>
      safeUrl(
        `${base.url}/?` +
          [param('username', username), param('theme', theme), param('column', data.columns), param('row', data.rows)].join('&')
      );
    const alt = escapeAlt(getDefaultText(ctx.meta.language, 'trophiesAlt').replace('{username}', () => username));
    return [atxHeading(2, data.heading), `<div align="center">\n\n${themedPair(alt, url('flat'), url('onedark'))}\n\n</div>`]
      .filter((part) => part !== '')
      .join('\n\n');
  },
  validate: (data, ctx) => cardWarnings(SERVICE, resolveCardService(data.username, ctx.meta.username, data.baseUrl)),
});
