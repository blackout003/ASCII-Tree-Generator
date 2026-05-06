import { TreeOptions } from './types';

/**
 * Valeurs par défaut pour les options de l'arbre
 */
export const defaultTreeOptions: TreeOptions = {
  // Options existantes
  showHidden: false,
  maxDepth: 10,
  sortAlphabetically: true,
  includeExtensions: true,
  showFolderSlash: true,
  
  // Formatage ASCII
  connectorStyle: 'unicode',
  indentSize: 4,
  useTabs: false,
  rootPrefix: '',
  showRootPrefix: false,
  
  // Tri
  sortOrder: 'alphabetical',
  sortDirection: 'asc',
  
  // Structure
  compressEmptyFolders: false,
  showOnlyFiles: false,
  showOnlyFolders: false,
  showFullPath: false,
  
  // Visuel
  showLineNumbers: false,
  showSeparators: false,
};
