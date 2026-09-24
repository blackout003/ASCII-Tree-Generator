import { z } from 'zod';
import { defineBlock } from '../block-definition';
import { checkMarkdownFragment } from '../markdown-checks';
import { normalizeNewlines } from '../markdown-utils';

export const FREE_MARKDOWN_MAX_LENGTH = 100_000;

const schema = z.object({ content: z.string().max(FREE_MARKDOWN_MAX_LENGTH) });

export type FreeMarkdownData = z.infer<typeof schema>;

export const freeMarkdownBlock = defineBlock<FreeMarkdownData>({
  type: 'freeMarkdown',
  modes: ['project', 'profile'],
  singleton: false,
  defaultOnCreate: false,
  schema,
  createData: () => ({ content: '' }),
  toMarkdown: (data) => normalizeNewlines(data.content).trim(),
  validate: (data) => checkMarkdownFragment(data.content),
});
