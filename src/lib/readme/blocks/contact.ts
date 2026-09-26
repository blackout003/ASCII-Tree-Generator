import { z } from 'zod';
import { defineBlock } from '../block-definition';
import { getDefaultText } from '../default-texts';
import { atxHeading, escapeAlt, safeUrl } from '../markdown-utils';
import { safeEmail, safeWebUrl } from '../services';
import { shieldsText } from '../shields';

/** `logo` is a Simple Icons slug (checked to exist); `kind` says how the address is validated. */
export const CONTACT_NETWORKS = {
  linkedin: { label: 'LinkedIn', logo: 'linkedin', kind: 'url' },
  x: { label: 'X', logo: 'x', kind: 'url' },
  bluesky: { label: 'Bluesky', logo: 'bluesky', kind: 'url' },
  mastodon: { label: 'Mastodon', logo: 'mastodon', kind: 'url' },
  youtube: { label: 'YouTube', logo: 'youtube', kind: 'url' },
  devto: { label: 'DEV', logo: 'devdotto', kind: 'url' },
  medium: { label: 'Medium', logo: 'medium', kind: 'url' },
  instagram: { label: 'Instagram', logo: 'instagram', kind: 'url' },
  twitch: { label: 'Twitch', logo: 'twitch', kind: 'url' },
  stackoverflow: { label: 'Stack Overflow', logo: 'stackoverflow', kind: 'url' },
  website: { label: 'Website', logo: '', kind: 'url' },
  email: { label: 'Email', logo: '', kind: 'email' },
} as const;

export type ContactNetwork = keyof typeof CONTACT_NETWORKS;
export const CONTACT_NETWORK_KEYS = Object.keys(CONTACT_NETWORKS) as [ContactNetwork, ...ContactNetwork[]];
export const CONTACT_LIMITS = { heading: 200, value: 300, maxItems: 12 } as const;

const itemSchema = z.object({
  network: z.enum(CONTACT_NETWORK_KEYS),
  value: z.string().max(CONTACT_LIMITS.value),
});

const schema = z.object({
  heading: z.string().max(CONTACT_LIMITS.heading),
  items: z.array(itemSchema).max(CONTACT_LIMITS.maxItems),
});

export type ContactItem = z.infer<typeof itemSchema>;
export type ContactData = z.infer<typeof schema>;

export const contactBlock = defineBlock<ContactData>({
  type: 'contact',
  modes: ['profile'],
  singleton: false,
  defaultOnCreate: false,
  recommended: true,
  schema,
  createData: (meta) => ({ heading: getDefaultText(meta.language, 'contact'), items: [] }),
  toMarkdown: (data, ctx) => {
    const badges = data.items
      .map((item) => {
        const network = CONTACT_NETWORKS[item.network];
        const address = network.kind === 'email' ? safeEmail(item.value) : safeWebUrl(item.value);
        if (address === '') return '';
        const target = network.kind === 'email' ? `mailto:${address}` : address;
        const query = network.logo ? 'style=for-the-badge&logo=' + network.logo + '&logoColor=white' : 'style=for-the-badge';
        const image = `![${escapeAlt(network.label)}](${safeUrl(
          `https://img.shields.io/badge/${shieldsText(network.label)}-${ctx.theme.accentColor}?${query}`
        )})`;
        return `[${image}](${target})`;
      })
      .filter((badge) => badge !== '');
    if (badges.length === 0) return '';
    return [atxHeading(2, data.heading), badges.join(' ')].filter((part) => part !== '').join('\n\n');
  },
});
