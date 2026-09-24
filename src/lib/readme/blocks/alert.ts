import { z } from 'zod';
import { defineBlock } from '../block-definition';
import { normalizeNewlines } from '../markdown-utils';

export const ALERT_KINDS = ['NOTE', 'TIP', 'IMPORTANT', 'WARNING', 'CAUTION'] as const;
export const ALERT_TEXT_MAX = 2000;

const schema = z.object({
  kind: z.enum(ALERT_KINDS),
  text: z.string().max(ALERT_TEXT_MAX),
});

export type AlertData = z.infer<typeof schema>;

export const alertBlock = defineBlock<AlertData>({
  type: 'alert',
  modes: ['project'],
  singleton: false,
  defaultOnCreate: false,
  schema,
  createData: () => ({ kind: 'NOTE', text: '' }),
  toMarkdown: (data) => {
    const body = normalizeNewlines(data.text).trim();
    if (body === '') return '';
    const quoted = body.split('\n').map((line) => (line.trim() === '' ? '>' : `> ${line}`));
    return [`> [!${data.kind}]`, ...quoted].join('\n');
  },
});
