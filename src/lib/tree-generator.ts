import { TreeNode, ASCIITreeConfig } from './types';

/**
 * Génère une représentation ASCII d'un arbre de nœuds
 * @param nodes - Tableau de nœuds racine à convertir en ASCII
 * @param config - Configuration pour les caractères ASCII (préfixe, connecteurs, etc.)
 * @returns Représentation ASCII de l'arbre sous forme de chaîne
 * @example
 * ```typescript
 * const tree = [{ id: '1', name: 'root', type: 'folder', children: [...] }];
 * const ascii = generateASCIITree(tree);
 * // Retourne: "├── root\n    ├── child1\n    └── child2"
 * ```
 */
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

/**
 * Génère la représentation ASCII récursive d'un nœud et de ses enfants
 * @param node - Le nœud à convertir
 * @param prefix - Le préfixe à ajouter (pour l'indentation)
 * @param isLast - Indique si c'est le dernier nœud au niveau actuel
 * @param config - Configuration ASCII
 * @returns Représentation ASCII du nœud et de ses enfants
 */
function generateNodeASCII(
  node: TreeNode,
  prefix: string,
  isLast: boolean,
  config: ASCIITreeConfig
): string {
  const connector = isLast ? config.lastConnector : config.prefix;
  // Ajouter un \ à la fin des noms de dossiers si l'option est activée
  const nodeName = node.type === 'folder' && config.showFolderSlash 
    ? node.name + '\\' 
    : node.name;
  const currentLine = prefix + connector + nodeName;
  
  if (!node.children || node.children.length === 0) {
    return currentLine;
  }
  
  const childPrefix = prefix + (isLast ? config.indent : config.connector);
  const childrenLines = node.children.map((child, index) => 
    generateNodeASCII(child, childPrefix, index === node.children!.length - 1, config)
  );
  
  return [currentLine, ...childrenLines].join('\n');
}

/**
 * Trie récursivement les nœuds d'un arbre
 * - Les dossiers sont placés avant les fichiers
 * - Les éléments sont triés par ordre alphabétique à chaque niveau
 * @param nodes - Tableau de nœuds à trier
 * @returns Nouveau tableau de nœuds triés (l'original n'est pas modifié)
 */
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

/**
 * Aplatit un arbre en un tableau linéaire de tous les nœuds
 * @param nodes - Tableau de nœuds racine
 * @returns Tableau plat contenant tous les nœuds de l'arbre
 */
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

/**
 * Recherche récursive d'un nœud par son ID dans un arbre
 * @param nodes - Tableau de nœuds racine où chercher
 * @param id - ID du nœud à trouver
 * @returns Le nœud trouvé ou null si non trouvé
 */
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

/**
 * Met à jour récursivement le nom d'un nœud dans un arbre
 * @param nodes - Tableau de nœuds racine
 * @param id - ID du nœud à mettre à jour
 * @param newName - Nouveau nom à assigner
 * @returns Nouveau tableau de nœuds avec le nom mis à jour
 */
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

/**
 * Bascule récursivement l'état d'expansion d'un nœud dans un arbre
 * @param nodes - Tableau de nœuds racine
 * @param id - ID du nœud dont l'expansion doit être basculée
 * @returns Nouveau tableau de nœuds avec l'état d'expansion mis à jour
 */
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
