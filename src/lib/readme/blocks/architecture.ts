import { z } from 'zod';
import { defineBlock } from '../block-definition';
import { getDefaultText } from '../default-texts';
import { atxHeading, escapeMarkdownText, nonEmptyLines, normalizeNewlines } from '../markdown-utils';

export const ARCHITECTURE_LIMITS = { heading: 200, content: 20_000, roadmapHeading: 200, roadmap: 5000 } as const;

const schema = z.object({
  heading: z.string().max(ARCHITECTURE_LIMITS.heading),
  content: z.string().max(ARCHITECTURE_LIMITS.content),
  roadmapHeading: z.string().max(ARCHITECTURE_LIMITS.roadmapHeading),
  roadmap: z.string().max(ARCHITECTURE_LIMITS.roadmap),
});

export type ArchitectureData = z.infer<typeof schema>;

export const architectureBlock = defineBlock<ArchitectureData>({
  type: 'architecture',
  modes: ['project'],
  singleton: false,
  defaultOnCreate: false,
  schema,
  createData: (meta) => ({
    heading: getDefaultText(meta.language, 'architecture'),
    content: '',
    roadmapHeading: getDefaultText(meta.language, 'roadmap'),
    roadmap: '',
  }),
  toMarkdown: (data) => {
    const content = normalizeNewlines(data.content).trim();
    const steps = nonEmptyLines(data.roadmap);
    const sections: string[] = [];
    if (content !== '') sections.push([atxHeading(2, data.heading), content].filter((p) => p !== '').join('\n\n'));
    if (steps.length > 0) {
      const list = steps.map((step) => `- [ ] ${escapeMarkdownText(step)}`).join('\n');
      sections.push([atxHeading(2, data.roadmapHeading), list].filter((p) => p !== '').join('\n\n'));
    }
    return sections.join('\n\n');
  },
});
