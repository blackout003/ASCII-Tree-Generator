import { describe, expect, it } from 'vitest';
import { generateReadme } from '@/lib/readme/generate';
import { canAddBlock } from '@/lib/readme/state';
import { validateReadme } from '@/lib/readme/validate';
import { WORKFLOW_FILE_NAME, WORKFLOW_PATH, generateWorkflow } from '@/lib/readme/workflow';
import { block, stateWith } from './helpers';

const profile = (blocks: Parameters<typeof stateWith>[0]) => stateWith(blocks, 'profile');

const blog = (over: Record<string, unknown> = {}) => ({
  heading: 'Latest blog posts',
  feedUrl: 'https://blog.example.com/feed.xml',
  maxPosts: 5,
  schedule: 'daily',
  ...over,
});

describe('blog block', () => {
  it('renders the heading and the anchors the workflow fills', () => {
    expect(generateReadme(profile([block('b', 'blog', blog())]))).toBe(
      '## Latest blog posts\n\n<!-- BLOG-POST-LIST:START -->\n<!-- BLOG-POST-LIST:END -->\n'
    );
  });

  it('keeps the anchors even without a heading or a feed', () => {
    expect(generateReadme(profile([block('b', 'blog', blog({ heading: '', feedUrl: '' }))]))).toBe(
      '<!-- BLOG-POST-LIST:START -->\n<!-- BLOG-POST-LIST:END -->\n'
    );
  });

  it('warns about a missing or unusable feed address', () => {
    expect(validateReadme(profile([block('b', 'blog', blog())]))).toEqual([]);
    for (const feedUrl of ['', 'ftp://x.example.com/feed', 'https://x.example.com/a,b']) {
      expect(validateReadme(profile([block('b', 'blog', blog({ feedUrl }))]))).toEqual([
        { code: 'invalidFeed', blockId: 'b' },
      ]);
    }
  });

  it('allows a single Blog block per README', () => {
    expect(canAddBlock(profile([block('b', 'blog', blog())]), 'blog')).toBe(false);
    expect(canAddBlock(profile([]), 'blog')).toBe(true);
  });
});

describe('generateWorkflow', () => {
  const YAML = [
    'name: Latest blog posts',
    'on:',
    '  schedule:',
    "    - cron: '0 0 * * *'",
    '  workflow_dispatch:',
    'permissions:',
    '  contents: write',
    'jobs:',
    '  update-readme-with-blog:',
    '    name: Update this README with the latest blog posts',
    '    runs-on: ubuntu-latest',
    '    steps:',
    '      - name: Checkout',
    '        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1',
    '      - name: Pull in blog posts',
    '        uses: gautamkrishnar/blog-post-workflow@f177491c77670f150ab4e9b9890254d8eba4164b # 1.9.7',
    '        with:',
    '          feed_list: "https://blog.example.com/feed.xml"',
    '          max_post_count: 5',
    '',
  ].join('\n');

  it('generates the workflow for an active Blog block with a valid feed', () => {
    expect(generateWorkflow(profile([block('b', 'blog', blog())]))).toBe(YAML);
  });

  it('follows the schedule and the number of posts', () => {
    const weekly = generateWorkflow(profile([block('b', 'blog', blog({ schedule: 'weekly', maxPosts: 10 }))]));
    expect(weekly).toContain("- cron: '0 0 * * 0'");
    expect(weekly).toContain('max_post_count: 10');
  });

  it('pins every action to a full commit SHA, never to a moving tag', () => {
    const uses = generateWorkflow(profile([block('b', 'blog', blog())]))!
      .split('\n')
      .filter((line) => line.includes('uses:'));
    expect(uses).toHaveLength(2);
    for (const line of uses) expect(line).toMatch(/@[0-9a-f]{40} # \S+$/);
  });

  it('generates nothing without an active Blog block or with an unusable feed', () => {
    expect(generateWorkflow(profile([]))).toBeNull();
    expect(generateWorkflow(profile([block('b', 'blog', blog(), false)]))).toBeNull();
    for (const feedUrl of ['', 'ftp://x.example.com/feed', 'https://x.example.com/a"b', 'https://x.example.com/a\nb']) {
      expect(generateWorkflow(profile([block('b', 'blog', blog({ feedUrl }))])), feedUrl).toBeNull();
    }
    expect(generateWorkflow(profile([block('b', 'blog', { heading: 'x' })]))).toBeNull();
  });

  it('names the file where GitHub expects it', () => {
    expect(WORKFLOW_FILE_NAME).toBe('blog-post-workflow.yml');
    expect(WORKFLOW_PATH).toBe('.github/workflows/blog-post-workflow.yml');
  });
});
