import type { BlogData } from './blocks/blog';
import { getBlockDefinition } from './registry';
import { safeFeedUrl } from './services';
import type { ReadmeState } from './types';

export const WORKFLOW_FILE_NAME = 'blog-post-workflow.yml';
export const WORKFLOW_PATH = `.github/workflows/${WORKFLOW_FILE_NAME}`;

// Pinned to full commit SHAs, because a tag can be moved to different code; the
// version stays in a comment for humans. To upgrade, resolve the new tag with
// `git ls-remote <repository> refs/tags/<tag>` and update both the SHA and the comment.
const CHECKOUT_ACTION = 'actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1';
const BLOG_ACTION = 'gautamkrishnar/blog-post-workflow@f177491c77670f150ab4e9b9890254d8eba4164b # 1.9.7';
const CRON = { daily: '0 0 * * *', weekly: '0 0 * * 0' } as const;

/**
 * The GitHub Actions workflow that refreshes the blog posts between the README's
 * anchors, or null when there is no active Blog block with a usable feed. The feed
 * address was validated to contain nothing that could break out of the YAML string.
 */
export function generateWorkflow(state: ReadmeState): string | null {
  const blogBlock = state.blocks.find((block) => block.enabled && block.type === 'blog');
  if (!blogBlock) return null;
  const parsed = getBlockDefinition('blog').parseData(blogBlock.data);
  if (!parsed.success) return null;
  const data = parsed.data as BlogData;
  const feed = safeFeedUrl(data.feedUrl);
  if (feed === '') return null;
  return (
    [
      'name: Latest blog posts',
      'on:',
      '  schedule:',
      `    - cron: '${CRON[data.schedule]}'`,
      '  workflow_dispatch:',
      'permissions:',
      '  contents: write',
      'jobs:',
      '  update-readme-with-blog:',
      '    name: Update this README with the latest blog posts',
      '    runs-on: ubuntu-latest',
      '    steps:',
      '      - name: Checkout',
      `        uses: ${CHECKOUT_ACTION}`,
      '      - name: Pull in blog posts',
      `        uses: ${BLOG_ACTION}`,
      '        with:',
      `          feed_list: "${feed}"`,
      `          max_post_count: ${data.maxPosts}`,
    ].join('\n') + '\n'
  );
}
