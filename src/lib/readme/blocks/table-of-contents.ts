import { z } from 'zod';
import { defineBlock } from '../block-definition';
import { getDefaultText } from '../default-texts';
import { githubSlugs } from '../headings';
import { atxHeading } from '../markdown-utils';

export const TOC_HEADING_MAX = 200;

const schema = z.object({ heading: z.string().max(TOC_HEADING_MAX) });

export type TocData = z.infer<typeof schema>;

export const tableOfContentsBlock = defineBlock<TocData>({
  type: 'tableOfContents',
  modes: ['project'],
  singleton: true,
  defaultOnCreate: false,
  usesHeadings: true,
  schema,
  createData: (meta) => ({ heading: getDefaultText(meta.language, 'toc') }),
  toMarkdown: (data, ctx) => {
    const headings = ctx.headings ?? [];
    if (headings.length === 0) return '';
    const anchors = githubSlugs(headings);
    const list = headings.map((text, index) => `- [${text}](#${anchors[index]})`).join('\n');
    return [atxHeading(2, data.heading), list].filter((part) => part !== '').join('\n\n');
  },
});
