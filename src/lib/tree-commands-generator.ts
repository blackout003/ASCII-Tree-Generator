import type { TreeNode } from './types';
import type { ParseResult } from './tree-commands-types';

export function generateShellCommands(nodes: TreeNode[]): string {
  const lines: string[] = [];

  function walk(node: TreeNode, parentPath: string) {
    const path = parentPath ? `${parentPath}/${node.name}` : node.name;
    if (node.type === 'folder') {
      lines.push(`mkdir -p ${path}`);
      (node.children ?? []).forEach((child) => walk(child, path));
    } else {
      lines.push(`touch ${path}`);
    }
  }

  nodes.forEach((node) => walk(node, ''));
  return lines.join('\n');
}

const UNICODE_PIPE = '│   '; // '│   '
const ASCII_PIPE = '|   ';
const BLANK_INDENT = '    ';
const UNICODE_BRANCH = '├── '; // '├── '
const UNICODE_LAST = '└── '; // '└── '
const ASCII_BRANCH = '|-- ';
const ASCII_LAST = '`-- ';

function stripConnector(line: string): { depth: number; name: string } | null {
  let rest = line;
  let depth = 0;

  while (
    rest.startsWith(UNICODE_PIPE) ||
    rest.startsWith(ASCII_PIPE) ||
    rest.startsWith(BLANK_INDENT)
  ) {
    rest = rest.slice(4);
    depth += 1;
  }

  if (
    rest.startsWith(UNICODE_BRANCH) ||
    rest.startsWith(UNICODE_LAST) ||
    rest.startsWith(ASCII_BRANCH) ||
    rest.startsWith(ASCII_LAST)
  ) {
    return { depth, name: rest.slice(4).trim() };
  }

  return null;
}

function looksLikeFile(name: string): boolean {
  if (name.startsWith('.')) return true; // dotfiles: .gitignore, .env
  return /\.[^./\\]+$/.test(name); // has a trailing extension segment
}

function applyFileFolderHeuristic(nodes: TreeNode[]): void {
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      node.type = 'folder';
      applyFileFolderHeuristic(node.children);
      continue;
    }
    node.children = undefined;
    if (node.name.endsWith('/') || node.name.endsWith('\\')) {
      node.name = node.name.slice(0, -1);
      node.type = 'folder';
      continue;
    }
    node.type = looksLikeFile(node.name) ? 'file' : 'folder';
  }
}

export function parseAsciiTreeText(text: string): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const root: TreeNode[] = [];
  const stack: { depth: number; node: TreeNode }[] = [];

  for (const rawLine of text.split('\n')) {
    const line = rawLine.replace(/\r$/, '');
    if (line.trim() === '') continue;

    const parsed = stripConnector(line);
    if (!parsed) {
      errors.push(line);
      continue;
    }

    const parentDepth = stack.length > 0 ? stack[stack.length - 1].depth : -1;
    const depth = parsed.depth > parentDepth + 1 ? parentDepth + 1 : parsed.depth;

    while (stack.length > 0 && stack[stack.length - 1].depth >= depth) {
      stack.pop();
    }

    const name = parsed.name;
    if (name === '..' || name.startsWith('/')) {
      warnings.push(name);
    }

    const node: TreeNode = {
      id: crypto.randomUUID(),
      name,
      type: 'folder',
      isExpanded: true,
    };

    if (stack.length === 0) {
      root.push(node);
    } else {
      const parent = stack[stack.length - 1].node;
      parent.children = parent.children ?? [];
      parent.children.push(node);
    }

    stack.push({ depth, node });
  }

  applyFileFolderHeuristic(root);
  return { nodes: root, errors, warnings };
}
