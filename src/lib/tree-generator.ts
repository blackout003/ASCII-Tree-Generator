import { TreeNode, ASCIITreeConfig } from './types';

export function generateASCIITree(
  nodes: TreeNode[],
  config: ASCIITreeConfig = {
    prefix: '├── ',
    connector: '│   ',
    lastConnector: '└── ',
    indent: '    '
  }
): string {
  return nodes.map((node, index) => 
    generateNodeASCII(node, '', index === nodes.length - 1, config)
  ).join('\n');
}

function generateNodeASCII(
  node: TreeNode,
  prefix: string,
  isLast: boolean,
  config: ASCIITreeConfig
): string {
  const connector = isLast ? config.lastConnector : config.prefix;
  const currentLine = prefix + connector + node.name;
  
  if (!node.children || node.children.length === 0) {
    return currentLine;
  }
  
  const childPrefix = prefix + (isLast ? config.indent : config.connector);
  const childrenLines = node.children.map((child, index) => 
    generateNodeASCII(child, childPrefix, index === node.children!.length - 1, config)
  );
  
  return [currentLine, ...childrenLines].join('\n');
}

export function sortTreeNodes(nodes: TreeNode[]): TreeNode[] {
  return nodes.sort((a, b) => {
    // Dossiers en premier
    if (a.type !== b.type) {
      return a.type === 'folder' ? -1 : 1;
    }
    // Puis par ordre alphabétique
    return a.name.localeCompare(b.name);
  }).map(node => ({
    ...node,
    children: node.children ? sortTreeNodes(node.children) : undefined
  }));
}

export function flattenTree(nodes: TreeNode[]): TreeNode[] {
  const result: TreeNode[] = [];
  
  function traverse(node: TreeNode) {
    result.push(node);
    if (node.children) {
      node.children.forEach(traverse);
    }
  }
  
  nodes.forEach(traverse);
  return result;
}

export function findNodeById(nodes: TreeNode[], id: string): TreeNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function updateNodeName(nodes: TreeNode[], id: string, newName: string): TreeNode[] {
  return nodes.map(node => {
    if (node.id === id) {
      return { ...node, name: newName };
    }
    if (node.children) {
      return { ...node, children: updateNodeName(node.children, id, newName) };
    }
    return node;
  });
}

export function toggleNodeExpansion(nodes: TreeNode[], id: string): TreeNode[] {
  return nodes.map(node => {
    if (node.id === id) {
      return { ...node, isExpanded: !node.isExpanded };
    }
    if (node.children) {
      return { ...node, children: toggleNodeExpansion(node.children, id) };
    }
    return node;
  });
}
