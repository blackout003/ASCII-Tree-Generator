import { describe, it, expect } from 'vitest';
import { generateASCIITree } from '@/lib/tree-generator';
import { parseAsciiTreeText, generateShellCommands } from '@/lib/tree-commands-generator';
import { defaultTreeOptions } from '@/lib/default-options';
import type { TreeNode } from '@/lib/types';

describe('tree-commands roundtrip with the site\'s own tree generator', () => {
  it('parses this site\'s default ASCII tree output (showFolderSlash on by default) into valid mkdir/touch commands with no trailing backslashes', () => {
    const tree: TreeNode[] = [
      {
        id: '1',
        name: 'src',
        type: 'folder',
        children: [
          {
            id: '2',
            name: 'lib',
            type: 'folder',
            children: [{ id: '3', name: 'utils.ts', type: 'file' }],
          },
        ],
      },
      { id: '4', name: 'README.md', type: 'file' },
    ];

    const asciiOutput = generateASCIITree(tree, {
      prefix: '', connector: '', lastConnector: '', indent: '',
      connectorStyle: 'unicode',
      showFolderSlash: defaultTreeOptions.showFolderSlash,
    });

    const { nodes, errors, warnings } = parseAsciiTreeText(asciiOutput);
    expect(errors).toEqual([]);
    expect(warnings).toEqual([]);

    const commands = generateShellCommands(nodes);
    expect(commands).not.toMatch(/\\\n/); // no bash line-continuation backslash before a newline
    expect(commands).not.toContain('\\');
    expect(commands.split('\n')).toEqual([
      'mkdir -p src',
      'mkdir -p src/lib',
      'touch src/lib/utils.ts',
      'touch README.md',
    ]);
  });
});
