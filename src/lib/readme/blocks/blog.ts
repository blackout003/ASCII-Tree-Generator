import { z } from 'zod';
import { defineBlock } from '../block-definition';
import { getDefaultText } from '../default-texts';
import { atxHeading } from '../markdown-utils';
import { safeFeedUrl } from '../services';

export const BLOG_TAG = 'BLOG-POST-LIST';
export const BLOG_START = `<!-- ${BLOG_TAG}:START -->`;
export const BLOG_END = `<!-- ${BLOG_TAG}:END -->`;
export const BLOG_MAX_POSTS = [3, 5, 8, 10] as const;
export const BLOG_LIMITS = { heading: 200, feedUrl: 500 } as const;

const schema = z.object({
  heading: z.string().max(BLOG_LIMITS.heading),
  feedUrl: z.string().max(BLOG_LIMITS.feedUrl),
  maxPosts: z.number().refine((value) => (BLOG_MAX_POSTS as readonly number[]).includes(value)),
  schedule: z.enum(['daily', 'weekly']),
});

export type BlogData = z.infer<typeof schema>;

export const blogBlock = defineBlock<BlogData>({
  type: 'blog',
  modes: ['profile'],
  // The anchor name is fixed, so one Blog block per README.
  singleton: true,
  defaultOnCreate: false,
  schema,
  createData: (meta) => ({ heading: getDefaultText(meta.language, 'blog'), feedUrl: '', maxPosts: 5, schedule: 'daily' }),
  // The posts between the anchors are written by the workflow, never by this tool.
  toMarkdown: (data) => [atxHeading(2, data.heading), `${BLOG_START}\n${BLOG_END}`].filter((part) => part !== '').join('\n\n'),
  validate: (data) => (safeFeedUrl(data.feedUrl) === '' ? [{ code: 'invalidFeed' }] : []),
});
