import { describe, it, expect } from 'vitest';
import { parseAsciiTreeText } from '@/lib/tree-commands-generator';

describe('parseAsciiTreeText', () => {
  it('parses a simple unicode tree into a nested structure', () => {
    const text = ['├── src', '│   └── index.ts', '└── README.md'].join('\n');
    const { nodes, errors, warnings } = parseAsciiTreeText(text);

    expect(errors).toEqual([]);
    expect(warnings).toEqual([]);
    expect(nodes).toHaveLength(2);
    expect(nodes[0]).toMatchObject({
      name: 'src',
      type: 'folder',
      children: [{ name: 'index.ts', type: 'file' }],
    });
    expect(nodes[1]).toMatchObject({ name: 'README.md', type: 'file' });
  });

  it('parses the equivalent ascii-style tree the same way', () => {
    const text = ['|-- src', '|   `-- index.ts', '`-- README.md'].join('\n');
    const { nodes, errors } = parseAsciiTreeText(text);

    expect(errors).toEqual([]);
    expect(nodes).toHaveLength(2);
    expect(nodes[0]).toMatchObject({
      name: 'src',
      type: 'folder',
      children: [{ name: 'index.ts', type: 'file' }],
    });
  });

  it('accepts unicode and ascii connectors mixed in the same paste', () => {
    const text = ['├── src', '|   `-- index.ts'].join('\n');
    const { nodes, errors } = parseAsciiTreeText(text);

    expect(errors).toEqual([]);
    expect(nodes[0]).toMatchObject({
      name: 'src',
      children: [{ name: 'index.ts', type: 'file' }],
    });
  });

  it('treats a leaf with no extension as an empty folder', () => {
    const { nodes } = parseAsciiTreeText('└── bin');
    expect(nodes[0]).toMatchObject({ name: 'bin', type: 'folder', children: undefined });
  });

  it('treats a dotfile leaf as a file', () => {
    const { nodes } = parseAsciiTreeText('└── .gitignore');
    expect(nodes[0]).toMatchObject({ name: '.gitignore', type: 'file' });
  });

  it('treats a leaf ending in / or \\\\ as an explicit empty folder and strips the marker', () => {
    const text = ['├── dist/', '└── build\\'].join('\n');
    const { nodes } = parseAsciiTreeText(text);
    expect(nodes[0]).toMatchObject({ name: 'dist', type: 'folder' });
    expect(nodes[1]).toMatchObject({ name: 'build', type: 'folder' });
  });

  it('is tolerant of a depth jump of more than one level, attaching to the deepest available parent', () => {
    // Malformed: index.ts should be depth 1 under src, but paste has depth 2.
    const text = ['├── src', '│       └── index.ts'].join('\n');
    const { nodes } = parseAsciiTreeText(text);
    expect(nodes[0]).toMatchObject({
      name: 'src',
      children: [{ name: 'index.ts', type: 'file' }],
    });
  });

  it('collects unrecognized lines into errors without stopping the parse', () => {
    const text = ['├── src', 'not a tree line', '└── README.md'].join('\n');
    const { nodes, errors } = parseAsciiTreeText(text);
    expect(errors).toEqual(['not a tree line']);
    expect(nodes.map((n) => n.name)).toEqual(['src', 'README.md']);
  });

  it('warns on a ".." segment and on a name starting with "/"', () => {
    const text = ['├── ..', '└── /etc'].join('\n');
    const { warnings } = parseAsciiTreeText(text);
    expect(warnings).toEqual(['..', '/etc']);
  });

  it('ignores blank lines and returns empty results for empty input', () => {
    expect(parseAsciiTreeText('')).toEqual({ nodes: [], errors: [], warnings: [] });
    expect(parseAsciiTreeText('\n\n')).toEqual({ nodes: [], errors: [], warnings: [] });
  });

  it('strips a trailing folder-slash marker from a non-leaf node (showFolderSlash output)', () => {
    // 'src\' has children, so it is NOT a leaf — the marker must still be stripped.
    const text = ['├── src\\', '│   └── index.ts'].join('\n');
    const { nodes, errors, warnings } = parseAsciiTreeText(text);

    expect(errors).toEqual([]);
    expect(warnings).toEqual([]);
    expect(nodes[0]).toMatchObject({
      name: 'src',
      type: 'folder',
      children: [{ name: 'index.ts', type: 'file' }],
    });
  });

  it('warns on a name containing a "../" segment, not just an exact ".." name', () => {
    const { warnings } = parseAsciiTreeText('├── ../secrets.env');
    expect(warnings).toEqual(['../secrets.env']);
  });

  it('classifies a lone ".." leaf node as a folder, not a file', () => {
    const { nodes } = parseAsciiTreeText('└── ..');
    expect(nodes[0]).toMatchObject({ name: '..', type: 'folder' });
  });

  it('silently drops the Unix `tree` CLI root marker line without an error', () => {
    const text = ['.', '├── src', '└── README.md'].join('\n');
    const { nodes, errors, warnings } = parseAsciiTreeText(text);

    expect(errors).toEqual([]);
    expect(warnings).toEqual([]);
    expect(nodes.map((n) => n.name)).toEqual(['src', 'README.md']);
  });

  it('silently drops the Unix `tree` CLI summary line without an error', () => {
    const text = ['├── src', '└── README.md', '', '1 directory, 1 file'].join('\n');
    const { nodes, errors, warnings } = parseAsciiTreeText(text);

    expect(errors).toEqual([]);
    expect(warnings).toEqual([]);
    expect(nodes.map((n) => n.name)).toEqual(['src', 'README.md']);
  });

  it('still reports an actually-unrecognized line as an error', () => {
    const text = ['├── src', 'garbage input', '└── README.md'].join('\n');
    const { errors } = parseAsciiTreeText(text);
    expect(errors).toEqual(['garbage input']);
  });
});
