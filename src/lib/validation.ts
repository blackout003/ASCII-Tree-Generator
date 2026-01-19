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
      errorMap: () => ({ message: 'Type doit être "file" ou "folder"' }),
    }),
    children: z
      .array(TreeNodeSchema)
      .optional()
      .refine(
        (children) => {
          // Un fichier ne peut pas avoir d'enfants
          return true;
        },
        { message: 'Un fichier ne peut pas avoir d\'enfants' }
      ),
    isExpanded: z.boolean().optional(),
  })
);

/**
 * Schéma de validation pour les options de l'arbre
 */
export const TreeOptionsSchema = z.object({
  showHidden: z.boolean(),
  maxDepth: z.number().int().min(1).max(50),
  sortAlphabetically: z.boolean(),
  includeExtensions: z.boolean(),
});

/**
 * Schéma de validation pour la configuration ASCII
 */
export const ASCIITreeConfigSchema = z.object({
  prefix: z.string(),
  connector: z.string(),
  lastConnector: z.string(),
  indent: z.string(),
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
      const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
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
      const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
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
