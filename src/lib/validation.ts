import { z } from 'zod';
import { TreeNode, TreeOptions, ASCIITreeConfig } from './types';

/**
 * Schéma de validation pour un nœud de l'arbre
 */
export const TreeNodeSchema: z.ZodType<TreeNode> = z.lazy(() =>
  z.object({
    id: z.string().min(1, 'ID requis'),
    name: z.string().min(1, 'Nom requis'),
    type: z.enum(['file', 'folder'], {
      message: 'Type doit être "file" ou "folder"',
    }),
    children: z.array(TreeNodeSchema).optional(),
    isExpanded: z.boolean().optional(),
  })
);

/**
 * Schéma de validation pour les options de l'arbre
 */
export const TreeOptionsSchema = z.object({
  // Options existantes
  showHidden: z.boolean(),
  maxDepth: z.number().int().min(1).max(50),
  sortAlphabetically: z.boolean(),
  includeExtensions: z.boolean(),
  showFolderSlash: z.boolean(),
  
  // Formatage ASCII
  connectorStyle: z.enum(['unicode', 'ascii']).optional().default('unicode'),
  indentSize: z.number().int().min(1).max(8).optional().default(4),
  useTabs: z.boolean().optional().default(false),
  rootPrefix: z.string().optional().default(''),
  showRootPrefix: z.boolean().optional().default(true),
  
  // Tri
  sortOrder: z.enum(['alphabetical', 'type']).optional().default('alphabetical'),
  sortDirection: z.enum(['asc', 'desc']).optional().default('asc'),
  
  // Structure
  compressEmptyFolders: z.boolean().optional().default(false),
  showOnlyFiles: z.boolean().optional().default(false),
  showOnlyFolders: z.boolean().optional().default(false),
  showFullPath: z.boolean().optional().default(false),
  
  // Visuel
  showLineNumbers: z.boolean().optional().default(false),
  showSeparators: z.boolean().optional().default(false),
});

/**
 * Schéma de validation pour la configuration ASCII
 */
export const ASCIITreeConfigSchema = z.object({
  prefix: z.string(),
  connector: z.string(),
  lastConnector: z.string(),
  indent: z.string(),
  showFolderSlash: z.boolean().optional(),
});

/**
 * Schéma de validation pour les données sauvegardées
 */
export const SavedTreeDataSchema = z.object({
  treeData: z.array(TreeNodeSchema),
  options: TreeOptionsSchema.optional(),
  asciiConfig: ASCIITreeConfigSchema.optional(),
  timestamp: z.string().optional(),
  version: z.string().optional(),
});

/**
 * Valide et transforme des données JSON brutes en TreeNode[]
 * @param data - Les données à valider
 * @returns Un objet avec success: true et data si valide, ou success: false et error
 */
export function validateTreeData(data: unknown): 
  | { success: true; data: TreeNode[] }
  | { success: false; error: string } {
  try {
    const parsed = TreeNodeSchema.array().parse(data);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: `Erreur de validation: ${messages}` };
    }
    return { success: false, error: error instanceof Error ? error.message : 'Erreur de validation inconnue' };
  }
}

/**
 * Valide et transforme des données sauvegardées
 * @param data - Les données à valider
 * @returns Un objet avec success: true et data si valide, ou success: false et error
 */
export function validateSavedTreeData(data: unknown): 
  | { success: true; data: z.infer<typeof SavedTreeDataSchema> }
  | { success: false; error: string } {
  try {
    const parsed = SavedTreeDataSchema.parse(data);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: `Erreur de validation: ${messages}` };
    }
    return { success: false, error: error instanceof Error ? error.message : 'Erreur de validation inconnue' };
  }
}

/**
 * Valide qu'un nœud de type "file" n'a pas d'enfants
 * @param node - Le nœud à valider
 * @returns true si valide, false sinon
 */
export function validateNodeStructure(node: TreeNode): boolean {
  if (node.type === 'file' && node.children && node.children.length > 0) {
    return false;
  }
  if (node.children) {
    return node.children.every(validateNodeStructure);
  }
  return true;
}

// ── Table schemas ────────────────────────────────────────────────────────────

const TableCellSchema = z.object({
  content: z.string(),
});

const TableRowSchema = z.object({
  id: z.string().min(1),
  cells: z.array(TableCellSchema),
});

const TableDataSchemaZ = z.object({
  columns: z.array(z.string()),
  rows: z.array(TableRowSchema),
});

const TableOptionsSchemaZ = z.object({
  borderStyle: z.enum(['unicode', 'ascii', 'markdown', 'simple']),
  hasHeader: z.boolean(),
  alignment: z.enum(['left', 'center', 'right']),
  padding: z.number().int().min(0).max(10),
});

export const SavedTableDataSchema = z.object({
  tableData: TableDataSchemaZ,
  options: TableOptionsSchemaZ.optional(),
  timestamp: z.string().optional(),
  version: z.string().optional(),
});

export function validateSavedTableData(data: unknown):
  | { success: true; data: z.infer<typeof SavedTableDataSchema> }
  | { success: false; error: string } {
  try {
    const parsed = SavedTableDataSchema.parse(data);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: `Erreur de validation: ${messages}` };
    }
    return { success: false, error: error instanceof Error ? error.message : 'Erreur de validation inconnue' };
  }
}
