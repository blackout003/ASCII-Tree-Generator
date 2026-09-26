import { z } from 'zod';
import { defineBlock } from '../block-definition';
import { cardWarnings, resolveCardService } from '../card-service';
import { getDefaultText } from '../default-texts';
import { atxHeading, escapeAlt, safeUrl } from '../markdown-utils';
import { param, themedPair } from '../services';

export const STATS_LAYOUTS = ['compact', 'normal', 'donut', 'donut-vertical', 'pie'] as const;
export const STATS_LIMITS = { heading: 200, username: 100, baseUrl: 300 } as const;

const schema = z.object({
  heading: z.string().max(STATS_LIMITS.heading),
  username: z.string().max(STATS_LIMITS.username),
  baseUrl: z.string().max(STATS_LIMITS.baseUrl),
  showStats: z.boolean(),
  showLanguages: z.boolean(),
  layout: z.enum(STATS_LAYOUTS),
  hideBorder: z.boolean(),
});

export type StatsData = z.infer<typeof schema>;

const SERVICE = 'github-readme-stats';

export const statsBlock = defineBlock<StatsData>({
  type: 'stats',
  modes: ['profile'],
  singleton: false,
  defaultOnCreate: false,
  recommended: true,
  schema,
  createData: (meta) => ({
    heading: getDefaultText(meta.language, 'stats'),
    username: meta.username,
    baseUrl: '',
    showStats: true,
    showLanguages: true,
    layout: 'compact',
    hideBorder: true,
  }),
  toMarkdown: (data, ctx) => {
    const { username, base } = resolveCardService(data.username, ctx.meta.username, data.baseUrl);
    if (username === '' || base.status !== 'ok' || (!data.showStats && !data.showLanguages)) return '';
    const accent = ctx.theme.accentColor;
    const card = (path: string, extra: string[], dark: boolean) =>
      safeUrl(
        `${base.url}${path}?` +
          [
            param('username', username),
            ...extra,
            param('title_color', accent),
            param('icon_color', accent),
            ...(data.hideBorder ? ['hide_border=true'] : []),
            ...(dark ? ['theme=dark'] : []),
          ].join('&')
      );
    const images: string[] = [];
    if (data.showStats) {
      const alt = escapeAlt(getDefaultText(ctx.meta.language, 'statsAlt').replace('{username}', () => username));
      images.push(themedPair(alt, card('/api', ['show_icons=true'], false), card('/api', ['show_icons=true'], true)));
    }
    if (data.showLanguages) {
      const alt = escapeAlt(getDefaultText(ctx.meta.language, 'languagesAlt').replace('{username}', () => username));
      const extra = [param('layout', data.layout)];
      images.push(themedPair(alt, card('/api/top-langs/', extra, false), card('/api/top-langs/', extra, true)));
    }
    return [atxHeading(2, data.heading), `<div align="center">\n\n${images.join(' ')}\n\n</div>`]
      .filter((part) => part !== '')
      .join('\n\n');
  },
  validate: (data, ctx) =>
    data.showStats || data.showLanguages
      ? cardWarnings(SERVICE, resolveCardService(data.username, ctx.meta.username, data.baseUrl))
      : [],
});
