import { TreeNode, ASCIITreeConfig, ConnectorStyle, SortOrder, SortDirection } from './types';

/**
 * Obtient les caractères de connecteurs selon le style choisi
 */
function getConnectors(style: ConnectorStyle = 'unicode') {
  if (style === 'ascii') {
    return {
      prefix: '|-- ',
      connector: '|   ',
      lastConnector: '`-- ',
      indent: '    '
    };
  }
  return {
    prefix: '├── ',
    connector: '│   ',
    lastConnector: '└── ',
    indent: '    '
  };
}

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
  // Utiliser le style de connecteurs si spécifié (priorité sur les valeurs du config)
  // Si connectorStyle est défini (même si c'est 'unicode'), utiliser les connecteurs du style
  const connectorStyle = config.connectorStyle !== undefined ? config.connectorStyle : 'unicode';
  const connectors = getConnectors(connectorStyle);
  
  // Toujours utiliser les connecteurs du style si connectorStyle est défini dans le config
  // Sinon, utiliser ceux du config ou les connecteurs par défaut
  const finalConfig = {
    ...config,
    prefix: config.connectorStyle !== undefined ? connectors.prefix : (config.prefix || connectors.prefix),
    connector: config.connectorStyle !== undefined ? connectors.connector : (config.connector || connectors.connector),
    lastConnector: config.connectorStyle !== undefined ? connectors.lastConnector : (config.lastConnector || connectors.lastConnector),
    indent: config.indent || connectors.indent,
  };

  // Gérer l'indentation personnalisée - IMPORTANT: vérifier useTabs en premier
  if (config.useTabs === true) {
    // Utiliser des tabulations
    finalConfig.indent = '\t';
    // Remplacer les 4 espaces par une tabulation dans le connecteur
    // Pour Unicode: '│   ' devient '│\t'
    // Pour ASCII: '|   ' devient '|\t'
    const connectorChar = finalConfig.connector.charAt(0);
    finalConfig.connector = connectorChar + '\t';
  } else if (config.indentSize !== undefined && config.indentSize !== 4) {
    // Utiliser des espaces avec une taille personnalisée
    const indentSize = config.indentSize;
    finalConfig.indent = ' '.repeat(indentSize);
    // Ajuster le connecteur pour correspondre à la nouvelle indentation
    const connectorChar = finalConfig.connector.charAt(0);
    finalConfig.connector = connectorChar + finalConfig.indent;
  }

  // Filtrer les nœuds racine selon les options
  const filteredRootNodes = nodes.filter(node => {
    // Filtrer les fichiers/dossiers cachés
    if (finalConfig.showHidden === false && node.name.startsWith('.')) {
      return false;
    }
    // Filtrer les fichiers sans extensions
    if (node.type === 'file' && finalConfig.includeExtensions === false) {
      const hasExtension = /\.\w+$/.test(node.name);
      if (!hasExtension) {
        return false;
      }
    }
    return true;
  });

  return filteredRootNodes
    .map((node, index) => {
      const isLast = index === filteredRootNodes.length - 1;
      const prefix = finalConfig.showRootPrefix !== false ? (finalConfig.rootPrefix || '') : '';
      // Pour le chemin complet, commencer avec le nom du nœud racine
      const rootPath = finalConfig.showFullPath ? node.name : '';
      return generateNodeASCII(node, prefix, isLast, finalConfig, rootPath, 0);
    })
    .filter(line => line !== '') // Filtrer les lignes vides (profondeur max)
    .join('\n');
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
  config: ASCIITreeConfig,
  fullPath: string = '',
  currentDepth: number = 0
): string {
  // Vérifier la profondeur maximale
  if (config.maxDepth !== undefined && currentDepth >= config.maxDepth) {
    return '';
  }

  // Filtrer les fichiers/dossiers cachés si showHidden est false
  if (config.showHidden === false && node.name.startsWith('.')) {
    return '';
  }

  // Filtrer les fichiers sans extensions si includeExtensions est false
  if (node.type === 'file' && config.includeExtensions === false) {
    // Un fichier a une extension s'il contient un point suivi d'au moins un caractère alphanumérique à la fin
    // Exclure les fichiers qui commencent par un point (déjà géré par showHidden)
    const hasExtension = /\.\w+$/.test(node.name);
    if (!hasExtension) {
      return '';
    }
  }

  const connector = isLast ? config.lastConnector : config.prefix;
  // Construire le chemin complet si nécessaire
  const currentPath = fullPath ? `${fullPath}/${node.name}` : node.name;
  
  // Déterminer le nom à afficher
  let nodeName: string;
  if (config.showFullPath) {
    // Utiliser le chemin complet
    nodeName = currentPath;
    // Ajouter \ à la fin si c'est un dossier et que l'option est activée
    if (node.type === 'folder' && config.showFolderSlash) {
      nodeName += '\\';
    }
  } else {
    // Utiliser juste le nom
    nodeName = node.type === 'folder' && config.showFolderSlash 
      ? node.name + '\\' 
      : node.name;
  }
  
  const currentLine = prefix + connector + nodeName;
  
  if (!node.children || node.children.length === 0) {
    return currentLine;
  }
  
  // Filtrer les enfants avant de les traiter
  const filteredChildren = node.children.filter(child => {
    // Filtrer les fichiers/dossiers cachés
    if (config.showHidden === false && child.name.startsWith('.')) {
      return false;
    }
    // Filtrer les fichiers sans extensions
    if (child.type === 'file' && config.includeExtensions === false) {
      const hasExtension = /\.\w+$/.test(child.name);
      if (!hasExtension) {
        return false;
      }
    }
    return true;
  });

  if (filteredChildren.length === 0) {
    return currentLine;
  }

  const childPrefix = prefix + (isLast ? config.indent : config.connector);
  const childrenLines = filteredChildren
    .map((child, index) => 
      generateNodeASCII(child, childPrefix, index === filteredChildren.length - 1, config, currentPath, currentDepth + 1)
    )
    .filter(line => line !== ''); // Filtrer les lignes vides (profondeur max)
  
  if (childrenLines.length === 0) {
    return currentLine;
  }
  
  return [currentLine, ...childrenLines].join('\n');
}

/**
 * Trie récursivement les nœuds d'un arbre selon l'ordre et la direction spécifiés
 * @param nodes - Tableau de nœuds à trier
 * @param sortOrder - Ordre de tri ('alphabetical' ou 'type')
 * @param sortDirection - Direction de tri ('asc' ou 'desc')
 * @returns Nouveau tableau de nœuds triés (l'original n'est pas modifié)
 */
export function sortTreeNodes(
  nodes: TreeNode[],
  sortOrder: SortOrder = 'alphabetical',
  sortDirection: SortDirection = 'asc'
): TreeNode[] {
  const direction = sortDirection === 'desc' ? -1 : 1;
  
  return nodes.sort((a, b) => {
    let comparison = 0;
    
    if (sortOrder === 'type') {
      // Dossiers en premier (ou en dernier si desc)
      if (a.type !== b.type) {
        comparison = a.type === 'folder' ? -1 : 1;
      } else {
        // Même type, trier par nom
        comparison = a.name.localeCompare(b.name);
      }
    } else {
      // Tri alphabétique
      comparison = a.name.localeCompare(b.name);
    }
    
    return comparison * direction;
  }).map(node => ({
    ...node,
    children: node.children ? sortTreeNodes(node.children, sortOrder, sortDirection) : undefined
  }));
}

/**
 * Compresse les dossiers vides (supprime les dossiers sans fichiers)
 * @param nodes - Tableau de nœuds racine
 * @returns Nouveau tableau de nœuds sans les dossiers vides
 */
export function compressEmptyFolders(nodes: TreeNode[]): TreeNode[] {
  return nodes
    .map(node => {
      if (node.type === 'folder' && node.children) {
        const compressedChildren = compressEmptyFolders(node.children);
        // Si le dossier a des enfants après compression, le garder
        if (compressedChildren.length > 0) {
          return { ...node, children: compressedChildren };
        }
        // Sinon, supprimer le dossier vide
        return null;
      }
      return node;
    })
    .filter((node): node is TreeNode => node !== null);
}

/**
 * Filtre l'arbre pour afficher uniquement les fichiers
 * @param nodes - Tableau de nœuds racine
 * @returns Nouveau tableau contenant uniquement les fichiers
 */
export function showOnlyFiles(nodes: TreeNode[]): TreeNode[] {
  const result: TreeNode[] = [];
  
  function traverse(node: TreeNode) {
    if (node.type === 'file') {
      // Créer une copie du nœud sans enfants (un fichier ne peut pas avoir d'enfants)
      result.push({
        ...node,
        children: undefined
      });
    } else if (node.children) {
      // Parcourir récursivement les enfants
      node.children.forEach(traverse);
    }
  }
  
  nodes.forEach(traverse);
  return result;
}

/**
 * Filtre l'arbre pour afficher uniquement les dossiers
 * @param nodes - Tableau de nœuds racine
 * @returns Nouveau tableau contenant uniquement les dossiers
 */
export function showOnlyFolders(nodes: TreeNode[]): TreeNode[] {
  function filterFolders(node: TreeNode): TreeNode | null {
    if (node.type === 'folder') {
      const filteredChildren = node.children
        ? node.children
            .map(filterFolders)
            .filter((child): child is TreeNode => child !== null)
        : undefined;
      
      return {
        ...node,
        children: filteredChildren && filteredChildren.length > 0 ? filteredChildren : undefined
      };
    }
    return null;
  }
  
  return nodes
    .map(filterFolders)
    .filter((node): node is TreeNode => node !== null);
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
