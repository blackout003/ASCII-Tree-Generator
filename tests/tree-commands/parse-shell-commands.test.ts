import { describe, it, expect } from 'vitest';
import { parseShellCommands } from '@/lib/tree-commands-generator';

describe('parseShellCommands', () => {
  it('builds a folder from a single mkdir -p', () => {
    const { nodes, errors, warnings } = parseShellCommands('mkdir -p src');
    expect(errors).toEqual([]);
    expect(warnings).toEqual([]);
    expect(nodes).toEqual([expect.objectContaining({ name: 'src', type: 'folder' })]);
  });

  it('builds a file from a single touch', () => {
    const { nodes } = parseShellCommands('touch README.md');
    expect(nodes).toEqual([expect.objectContaining({ name: 'README.md', type: 'file' })]);
  });

  it('nests intermediate segments as folders for a multi-segment touch', () => {
    const { nodes } = parseShellCommands('touch src/lib/utils.ts');
    expect(nodes[0]).toMatchObject({
      name: 'src',
      type: 'folder',
      children: [
        {
          name: 'lib',
          type: 'folder',
          children: [{ name: 'utils.ts', type: 'file' }],
        },
      ],
    });
  });

  it('merges mkdir -p and touch lines that share a parent folder', () => {
    const text = ['mkdir -p src', 'touch src/index.ts'].join('\n');
    const { nodes } = parseShellCommands(text);
    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toMatchObject({
      name: 'src',
      type: 'folder',
      children: [{ name: 'index.ts', type: 'file' }],
    });
  });

  it('collects lines that are neither mkdir -p nor touch into errors', () => {
    const text = ['mkdir -p src', 'rm -rf /', 'touch src/index.ts'].join('\n');
    const { nodes, errors } = parseShellCommands(text);
    expect(errors).toEqual(['rm -rf /']);
    expect(nodes[0].children).toHaveLength(1);
  });

  it('warns on an absolute path and on a ".." segment', () => {
    const text = ['mkdir -p /etc/app', 'touch ../secret.env'].join('\n');
    const { warnings } = parseShellCommands(text);
    expect(warnings).toEqual(['/etc/app', '../secret.env']);
  });

  it('returns empty results for empty input', () => {
    expect(parseShellCommands('')).toEqual({ nodes: [], errors: [], warnings: [] });
  });
});
