import { z } from 'zod';
import { defineBlock } from '../block-definition';
import { getDefaultText } from '../default-texts';
import { atxHeading, codeFence, escapeMarkdownText, nonEmptyLines, singleLine } from '../markdown-utils';

export const INSTALL_MANAGERS = ['none', 'npm', 'yarn', 'pnpm', 'bun', 'pip', 'cargo', 'go', 'composer'] as const;
export type InstallManager = (typeof INSTALL_MANAGERS)[number];

const INSTALL_COMMANDS: Record<InstallManager, string> = {
  none: '',
  npm: 'npm install',
  yarn: 'yarn add',
  pnpm: 'pnpm add',
  bun: 'bun add',
  pip: 'pip install',
  cargo: 'cargo add',
  go: 'go get',
  composer: 'composer require',
};

export const INSTALL_LIMITS = { heading: 200, prerequisites: 2000, packageName: 200, commands: 5000 } as const;

const schema = z.object({
  heading: z.string().max(INSTALL_LIMITS.heading),
  prerequisites: z.string().max(INSTALL_LIMITS.prerequisites),
  manager: z.enum(INSTALL_MANAGERS),
  packageName: z.string().max(INSTALL_LIMITS.packageName),
  commands: z.string().max(INSTALL_LIMITS.commands),
});

export type InstallationData = z.infer<typeof schema>;

export const installationBlock = defineBlock<InstallationData>({
  type: 'installation',
  modes: ['project'],
  singleton: false,
  defaultOnCreate: true,
  recommended: true,
  schema,
  createData: (meta) => ({
    heading: getDefaultText(meta.language, 'installation'),
    prerequisites: '',
    manager: 'none',
    packageName: '',
    commands: meta.installCommand,
  }),
  toMarkdown: (data, ctx) => {
    const prerequisites = nonEmptyLines(data.prerequisites);
    const packageName = singleLine(data.packageName);
    const managerCommand =
      data.manager !== 'none' && packageName !== '' ? `${INSTALL_COMMANDS[data.manager]} ${packageName}` : '';
    const commands = [managerCommand, ...nonEmptyLines(data.commands)].filter((line) => line !== '');
    if (prerequisites.length === 0 && commands.length === 0) return '';

    const parts = [atxHeading(2, data.heading)];
    if (prerequisites.length > 0) {
      parts.push(
        atxHeading(3, getDefaultText(ctx.meta.language, 'prerequisites')),
        prerequisites.map((item) => `- ${escapeMarkdownText(item)}`).join('\n')
      );
    }
    if (commands.length > 0) parts.push(codeFence(commands.join('\n'), 'bash'));
    return parts.filter((part) => part !== '').join('\n\n');
  },
});
