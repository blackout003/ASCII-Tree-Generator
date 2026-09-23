import type { TreeNode } from './types';

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
