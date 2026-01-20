export interface TreeNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: TreeNode[];
  isExpanded?: boolean;
}

export interface TreeOptions {
  showHidden: boolean;
  maxDepth: number;
  sortAlphabetically: boolean;
  includeExtensions: boolean;
  showFolderSlash: boolean;
}

export interface ASCIITreeConfig {
  prefix: string;
  connector: string;
  lastConnector: string;
  indent: string;
  showFolderSlash?: boolean;
}
