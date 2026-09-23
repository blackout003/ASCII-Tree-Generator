export type TreeCommandsMode = 'treeToCommands' | 'commandsToTree';

export interface ParseResult {
  nodes: import('./types').TreeNode[];
  errors: string[];
  warnings: string[];
}
