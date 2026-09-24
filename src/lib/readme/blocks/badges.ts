import { z } from 'zod';
import { defineBlock } from '../block-definition';
import { DEFAULT_THEME } from '../defaults';
import { escapeAlt, safeUrl, singleLine } from '../markdown-utils';
import { shieldsBadgeUrl } from '../shields';

export const BADGE_LIMITS = { label: 50, message: 100, link: 2000, maxItems: 20 } as const;

const itemSchema = z.object({
  label: z.string().max(BADGE_LIMITS.label),
  message: z.string().max(BADGE_LIMITS.message),
  /** Six hex digits, or '' to use the theme accent color. */
  color: z.string().regex(/^([0-9a-fA-F]{6})?$/),
  link: z.string().max(BADGE_LIMITS.link),
});

const schema = z.object({ items: z.array(itemSchema).max(BADGE_LIMITS.maxItems) });

export type BadgeItem = z.infer<typeof itemSchema>;
export type BadgesData = z.infer<typeof schema>;

/** More than this many badges hurts readability. */
const RECOMMENDED_MAX = 5;

/** The LICENSE file of a GitHub repository, or '' when the repository URL is anything else. */
function licenseLink(repoUrl: string): string {
  if (!/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repoUrl)) return '';
  const link = `${repoUrl}/blob/HEAD/LICENSE`;
  return link.length <= BADGE_LIMITS.link ? link : '';
}

export const badgesBlock = defineBlock<BadgesData>({
  type: 'badges',
  modes: ['project'],
  singleton: false,
  defaultOnCreate: false,
  recommended: true,
  schema,
  createData: (meta) => ({
    items: meta.license ? [{ label: 'license', message: meta.license, color: '', link: licenseLink(meta.repoUrl) }] : [],
  }),
  toMarkdown: (data, ctx) =>
    data.items
      .map((item) => {
        const label = singleLine(item.label);
        const message = singleLine(item.message);
        if (label === '' || message === '') return '';
        const color = item.color !== '' ? item.color : ctx.theme.accentColor || DEFAULT_THEME.accentColor;
        const image = `![${escapeAlt(`${label}: ${message}`)}](${safeUrl(shieldsBadgeUrl(label, message, color))})`;
        const link = safeUrl(item.link);
        return link === '' ? image : `[${image}](${link})`;
      })
      .filter((badge) => badge !== '')
      .join(' '),
  validate: (data) =>
    data.items.length > RECOMMENDED_MAX ? [{ code: 'tooManyBadges', params: { count: data.items.length } }] : [],
});
