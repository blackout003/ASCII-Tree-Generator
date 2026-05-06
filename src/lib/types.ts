export interface TreeNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: TreeNode[];
  isExpanded?: boolean;
}

export type ConnectorStyle = 'unicode' | 'ascii';
export type SortOrder = 'alphabetical' | 'type';
export type SortDirection = 'asc' | 'desc';

export interface TreeOptions {
  showHidden: boolean;
  maxDepth: number;
  sortAlphabetically: boolean;
  includeExtensions: boolean;
  showFolderSlash: boolean;
  // Formatage ASCII
  connectorStyle: ConnectorStyle;
  indentSize: number;
  useTabs: boolean;
  rootPrefix: string;
  showRootPrefix: boolean;
  // Tri
  sortOrder: SortOrder;
  sortDirection: SortDirection;
  // Structure
  compressEmptyFolders: boolean;
  showOnlyFiles: boolean;
  showOnlyFolders: boolean;
  showFullPath: boolean;
  // Visuel
  showLineNumbers: boolean;
  showSeparators: boolean;
}

export interface ASCIITreeConfig {
  prefix: string;
  connector: string;
  lastConnector: string;
  indent: string;
  showFolderSlash?: boolean;
  connectorStyle?: ConnectorStyle;
  indentSize?: number;
  useTabs?: boolean;
  rootPrefix?: string;
  showRootPrefix?: boolean;
  showFullPath?: boolean;
  maxDepth?: number;
  includeExtensions?: boolean;
  showHidden?: boolean;
}
