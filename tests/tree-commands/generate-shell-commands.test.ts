import { describe, it, expect } from 'vitest';
import { generateShellCommands } from '@/lib/tree-commands-generator';
import type { TreeNode } from '@/lib/types';

describe('generateShellCommands', () => {
  it('emits touch for a single root file', () => {
    const nodes: TreeNode[] = [{ id: '1', name: 'README.md', type: 'file' }];
    expect(generateShellCommands(nodes)).toBe('touch README.md');
  });

  it('emits mkdir -p for an empty folder', () => {
    const nodes: TreeNode[] = [{ id: '1', name: 'empty', type: 'folder', children: [] }];
    expect(generateShellCommands(nodes)).toBe('mkdir -p empty');
  });

  it('emits mkdir -p then touch for a folder with a file child, joined with /', () => {
    const nodes: TreeNode[] = [
      {
        id: '1',
        name: 'src',
        type: 'folder',
        children: [{ id: '2', name: 'index.ts', type: 'file' }],
      },
    ];
    expect(generateShellCommands(nodes)).toBe('mkdir -p src\ntouch src/index.ts');
  });

  it('walks nested folders depth-first, building the full path at each level', () => {
    const nodes: TreeNode[] = [
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
    expect(generateShellCommands(nodes)).toBe(
      'mkdir -p src\nmkdir -p src/lib\ntouch src/lib/utils.ts\ntouch README.md'
    );
  });

  it('returns an empty string for no nodes', () => {
    expect(generateShellCommands([])).toBe('');
  });
});
