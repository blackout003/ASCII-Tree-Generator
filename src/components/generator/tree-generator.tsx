'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Settings } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRightSidebar } from '@/lib/contexts/right-sidebar-context';
import { TreeNode, TreeOptions, ASCIITreeConfig } from '@/lib/types';
import { generateASCIITree, sortTreeNodes, updateNodeName, toggleNodeExpansion, compressEmptyFolders, showOnlyFiles, showOnlyFolders, findNodeById } from '@/lib/tree-generator';
import { validateSavedTreeData, validateNodeStructure } from '@/lib/validation';
import { defaultTreeOptions } from '@/lib/default-options';
import DragDropZone from './drag-drop-zone';
import { TreeView } from './tree-view';
import { TreeControls } from './tree-controls';
import { ASCIIPreview } from './ascii-preview';
import { TreeOptionsPanel } from './tree-options-panel';
import { useToast } from '@/hooks/use-toast';

/**
 * Composant principal pour l'édition et la génération d'arbres ASCII
 * Permet de créer, modifier, sauvegarder et charger des structures d'arbres de fichiers/dossiers
 * @returns Le composant TreeGenerator avec toute l'interface d'édition
 */
export default function TreeGenerator() {
  const t = useTranslations();
  const { toast } = useToast();
  const [treeData, setTreeData] = useState<TreeNode[]>([
    {
      id: '1',
      name: 'mon-projet',
      type: 'folder',
      isExpanded: true,
      children: [
        {
          id: '2',
          name: 'src',
          type: 'folder',
          isExpanded: true,
          children: [
            { id: '3', name: 'index.js', type: 'file' },
            { id: '4', name: 'styles.css', type: 'file' }
          ]
        },
        {
          id: '5',
          name: 'public',
          type: 'folder',
          isExpanded: false,
          children: [
            { id: '6', name: 'favicon.ico', type: 'file' }
          ]
        },
        { id: '7', name: 'README.md', type: 'file' },
        { id: '8', name: 'package.json', type: 'file' }
      ]
    }
  ]);

  const [options, setOptions] = useState<TreeOptions>(defaultTreeOptions);

  const [asciiConfig, setAsciiConfig] = useState<ASCIITreeConfig>({
    prefix: '├── ',
    connector: '│   ',
    lastConnector: '└── ',
    indent: '    '
  });

  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOverNode, setDragOverNode] = useState<string | null>(null);

  // États pour les modals de confirmation
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showLoadConfirm, setShowLoadConfirm] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const { setContent } = useRightSidebar();

  /**
   * Ajoute un nouveau nœud (fichier ou dossier) à l'arbre
   * @param parentId - ID du parent où ajouter le nœud (null pour la racine)
   * @param type - Type de nœud à créer ('file' ou 'folder')
   */
  const addNode = useCallback((parentId: string | null, type: 'file' | 'folder') => {
    const newNode: TreeNode = {
      id: crypto.randomUUID(),
      name: type === 'folder' ? 'nouveau-dossier' : 'nouveau-fichier',
      type,
      isExpanded: type === 'folder',
      children: type === 'folder' ? [] : undefined
    };

    if (!parentId) {
      setTreeData(prev => [...prev, newNode]);
    } else {
      setTreeData(prev => {
        const updateChildren = (nodes: TreeNode[]): TreeNode[] => {
          return nodes.map(node => {
            if (node.id === parentId) {
              return {
                ...node,
                children: [...(node.children || []), newNode]
              };
            }
            if (node.children) {
              return { ...node, children: updateChildren(node.children) };
            }
            return node;
          });
        };
        return updateChildren(prev);
      });
    }
  }, []);

  /**
   * Supprime récursivement un nœud et tous ses enfants de l'arbre
   * @param nodeId - ID du nœud à supprimer
   */
  const deleteNode = useCallback((nodeId: string) => {
    setTreeData(prev => {
      const removeNode = (nodes: TreeNode[]): TreeNode[] => {
        return nodes
          .filter(node => node.id !== nodeId)
          .map(node =>
            node.children
              ? { ...node, children: removeNode(node.children) }
              : node
          );
      };
      return removeNode(prev);
    });
  }, []);

  const startEditing = useCallback((node: TreeNode) => {
    setEditingNode(node.id);
    setEditingName(node.name);
  }, []);

  const saveEdit = useCallback(() => {
    if (editingNode && editingName.trim()) {
      setTreeData(prev => updateNodeName(prev, editingNode, editingName.trim()));
    }
    setEditingNode(null);
    setEditingName('');
  }, [editingNode, editingName]);

  const cancelEdit = useCallback(() => {
    setEditingNode(null);
    setEditingName('');
  }, []);

  const toggleExpansion = useCallback((nodeId: string) => {
    setTreeData(prev => toggleNodeExpansion(prev, nodeId));
  }, []);

  // Mémorisation du tri et du filtrage des données
  const processedTreeData = useMemo(() => {
    let processed = [...treeData];
    
    // Compresser les dossiers vides si demandé
    if (options.compressEmptyFolders) {
      processed = compressEmptyFolders(processed);
    }
    
    // Afficher uniquement les fichiers si demandé (AVANT le tri)
    if (options.showOnlyFiles) {
      processed = showOnlyFiles(processed);
      // Si on affiche uniquement les fichiers, on retourne directement (pas besoin de trier)
      return processed;
    }
    
    // Afficher uniquement les dossiers si demandé
    if (options.showOnlyFolders) {
      processed = showOnlyFolders(processed);
    }
    
    // Trier selon les options (seulement si on n'affiche pas uniquement les fichiers)
    if (options.sortAlphabetically || options.sortOrder !== 'alphabetical' || options.sortDirection !== 'asc') {
      processed = sortTreeNodes(processed, options.sortOrder, options.sortDirection);
    }
    
    return processed;
  }, [treeData, options.sortAlphabetically, options.sortOrder, options.sortDirection, options.compressEmptyFolders, options.showOnlyFiles, options.showOnlyFolders]);

  // Mémorisation de la génération ASCII pour éviter de régénérer à chaque rendu
  const asciiOutput = useMemo(() => {
    let output = generateASCIITree(processedTreeData, {
      ...asciiConfig,
      showFolderSlash: options.showFolderSlash,
      connectorStyle: options.connectorStyle,
      indentSize: options.indentSize,
      useTabs: options.useTabs,
      rootPrefix: options.rootPrefix,
      showRootPrefix: options.showRootPrefix,
      showFullPath: options.showFullPath,
      maxDepth: options.maxDepth,
      includeExtensions: options.includeExtensions,
      showHidden: options.showHidden,
    });
    
    // Ajouter la numérotation des lignes si demandé
    if (options.showLineNumbers) {
      const lines = output.split('\n');
      const maxLineNumberLength = String(lines.length).length;
      output = lines
        .map((line, index) => {
          const lineNumber = String(index + 1).padStart(maxLineNumberLength, ' ');
          return `${lineNumber} | ${line}`;
        })
        .join('\n');
    }
    
    // Ajouter les séparateurs si demandé
    if (options.showSeparators) {
      const lines = output.split('\n');
      if (lines.length > 0) {
        // Utiliser un caractère compatible ASCII et Unicode
        const separator = options.connectorStyle === 'ascii' ? '-'.repeat(50) : '─'.repeat(50);
        const separatedLines: string[] = [];
        let lineCount = 0;
        lines.forEach((line, index) => {
          // Ne compter que les lignes non vides
          if (line.trim() !== '') {
            lineCount++;
            separatedLines.push(line);
            // Ajouter un séparateur tous les 10 lignes non vides (sauf après la dernière ligne)
            if (lineCount % 10 === 0 && index < lines.length - 1) {
              separatedLines.push(separator);
            }
          } else {
            // Garder les lignes vides telles quelles
            separatedLines.push(line);
          }
        });
        output = separatedLines.join('\n');
      }
    }
    
    return output;
  }, [processedTreeData, asciiConfig, options.showFolderSlash, options.connectorStyle, options.indentSize, options.useTabs, options.rootPrefix, options.showRootPrefix, options.showFullPath, options.maxDepth, options.includeExtensions, options.showHidden, options.showLineNumbers, options.showSeparators]);

  // Injecter le panneau d'options dans la sidebar droite
  useEffect(() => {
    setContent(
      <TreeOptionsPanel options={options} onOptionsChange={setOptions} />
    );
    return () => setContent(null);
  }, [options, setOptions, setContent]);

  /**
   * Copie la représentation ASCII de l'arbre dans le presse-papiers
   * Affiche une notification de succès ou d'erreur
   */
  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(asciiOutput);
      toast({
        title: t('errors.copySuccess'),
        variant: 'default',
      });
    } catch (err) {
      toast({
        title: t('errors.copyError'),
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive',
      });
    }
  }, [asciiOutput, toast, t]);

  /**
   * Télécharge la représentation ASCII de l'arbre sous forme de fichier texte
   * Affiche une notification de succès ou d'erreur
   */
  const downloadASCII = useCallback(() => {
    try {
      const blob = new Blob([asciiOutput], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'arbre-ascii.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: t('errors.downloadSuccess'),
        variant: 'default',
      });
    } catch (err) {
      toast({
        title: t('errors.downloadError'),
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive',
      });
    }
  }, [asciiOutput, toast, t]);

  const handleFilesAdded = useCallback((newNodes: TreeNode[]) => {
    setTreeData(prev => [...prev, ...newNodes]);
  }, []);

  /**
   * Ouvre le modal de confirmation pour effacer tout l'arbre
   */
  const clearTree = useCallback(() => {
    setShowClearConfirm(true);
  }, []);

  /**
   * Confirme et exécute l'effacement de l'arbre
   */
  const confirmClearTree = useCallback(() => {
    setTreeData([]);
    setShowClearConfirm(false);
    toast({
      title: t('errors.clearSuccess'),
      variant: 'default',
    });
  }, [toast, t]);

  /**
   * Sauvegarde l'arbre actuel, ses options et sa configuration dans un fichier JSON
   * Affiche une notification de succès ou d'erreur
   */
  const saveTree = useCallback(() => {
    try {
      const treeDataToSave = {
        treeData,
        options,
        asciiConfig,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };
      
      const blob = new Blob([JSON.stringify(treeDataToSave, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `arbre-ascii-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: t('errors.saveSuccess'),
        variant: 'default',
      });
    } catch (err) {
      toast({
        title: t('errors.saveError'),
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive',
      });
    }
  }, [treeData, options, asciiConfig, toast, t]);

  /**
   * Charge réellement un fichier JSON dans l'arbre
   * @param file - Le fichier à charger
   */
  const performLoadTree = useCallback((file: File) => {
    const MAX_JSON_SIZE = 5 * 1024 * 1024; // 5 MB
    if (file.size > MAX_JSON_SIZE) {
      toast({
        title: t('errors.loadError'),
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        if (!content || content.trim().length === 0) {
          throw new Error('Le fichier est vide');
        }
        
        const parsedData = JSON.parse(content);
        
        // Validation stricte avec Zod
        const validation = validateSavedTreeData(parsedData);
        
        if (!validation.success) {
          throw new Error(validation.error);
        }
        
        const { data } = validation;
        
        // Validation supplémentaire de la structure (fichiers ne peuvent pas avoir d'enfants)
        const isValidStructure = data.treeData.every(validateNodeStructure);
        if (!isValidStructure) {
          throw new Error('Structure invalide: un fichier ne peut pas avoir d\'enfants');
        }
        
        // Mise à jour des états
        setTreeData(data.treeData);
        if (data.options) {
          setOptions({
            ...defaultTreeOptions,
            ...data.options,
            // Assurer que toutes les nouvelles options ont des valeurs par défaut
            showFolderSlash: data.options.showFolderSlash ?? defaultTreeOptions.showFolderSlash,
          });
        }
        if (data.asciiConfig) {
          setAsciiConfig(data.asciiConfig);
        }
        
        toast({
          title: t('errors.loadSuccess'),
          variant: 'default',
        });
      } catch (err) {
        toast({
          title: t('errors.loadError'),
          description: err instanceof Error ? err.message : String(err),
          variant: 'destructive',
        });
      }
    };
    
    reader.onerror = () => {
      toast({
        title: t('errors.loadError'),
        description: 'Erreur lors de la lecture du fichier',
        variant: 'destructive',
      });
    };
    
    reader.readAsText(file);
  }, [toast, t]);

  /**
   * Ouvre le modal de confirmation pour charger un fichier JSON
   * @param event - Événement de changement d'input file
   */
  const loadTree = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Réinitialiser l'input pour permettre de charger le même fichier
    event.target.value = '';

    // Stocker le fichier et ouvrir le modal de confirmation
    setPendingFile(file);
    setShowLoadConfirm(true);
  }, []);

  /**
   * Confirme et exécute le chargement du fichier
   */
  const confirmLoadTree = useCallback(() => {
    if (pendingFile) {
      performLoadTree(pendingFile);
      setPendingFile(null);
      setShowLoadConfirm(false);
    }
  }, [pendingFile, performLoadTree]);

  /**
   * Déplace un nœud dans l'arbre vers une nouvelle position parente
   * @param nodeId - ID du nœud à déplacer
   * @param newParentId - ID du nouveau parent (null pour la racine)
   */
  const moveNode = useCallback((nodeId: string, newParentId: string | null) => {
    setTreeData(prev => {
      // Vérifier si le nouveau parent est un dossier (pas un fichier)
      if (newParentId !== null) {
        const newParent = findNodeById(prev, newParentId);
        if (!newParent || newParent.type !== 'folder') {
          // Ne pas permettre de déplacer dans un fichier
          return prev;
        }
      }

      // Vérifier si on essaie de déplacer un nœud dans ses propres enfants
      const isDescendant = (parentId: string, childId: string, nodes: TreeNode[]): boolean => {
        for (const node of nodes) {
          if (node.id === parentId) {
            if (node.children) {
              return node.children.some(child => child.id === childId || isDescendant(child.id, childId, node.children!));
            }
            return false;
          }
          if (node.children && isDescendant(parentId, childId, node.children)) {
            return true;
          }
        }
        return false;
      };

      if (newParentId && isDescendant(nodeId, newParentId, prev)) {
        return prev;
      }

      // Trouver le nœud à déplacer
      const findAndRemoveNode = (nodes: TreeNode[]): [TreeNode | null, TreeNode[]] => {
        const nodeIndex = nodes.findIndex(node => node.id === nodeId);
        if (nodeIndex !== -1) {
          const [removedNode] = nodes.splice(nodeIndex, 1);
          return [removedNode, [...nodes]]; // Retourner une nouvelle copie
        }
        
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].children) {
            const [foundNode, updatedChildren] = findAndRemoveNode([...nodes[i].children!]);
            if (foundNode) {
              const newNodes = [...nodes];
              newNodes[i] = { ...newNodes[i], children: updatedChildren };
              return [foundNode, newNodes];
            }
          }
        }
        return [null, nodes];
      };

      const [nodeToMove, updatedNodes] = findAndRemoveNode([...prev]);
      
      if (!nodeToMove) {
        return prev;
      }

      // Ajouter le nœud à sa nouvelle position
      if (newParentId === null) {
        // Ajouter à la racine
        return [...updatedNodes, nodeToMove];
      } else {
        // Ajouter comme enfant du nouveau parent
        const addToParent = (nodes: TreeNode[]): TreeNode[] => {
          return nodes.map(node => {
            if (node.id === newParentId) {
              return {
                ...node,
                children: [...(node.children || []), nodeToMove],
                isExpanded: true // Ouvrir le dossier parent
              };
            }
            if (node.children) {
              return { ...node, children: addToParent(node.children) };
            }
            return node;
          });
        };
        return addToParent(updatedNodes);
      }
    });
  }, []);

  // Handlers pour TreeView
  const handleDragStart = useCallback((nodeId: string) => {
    setDraggedNode(nodeId);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedNode(null);
    setDragOverNode(null);
  }, []);

  const handleDragOver = useCallback((nodeId: string) => {
    setDragOverNode(nodeId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverNode(null);
  }, []);

  const handleDrop = useCallback((nodeId: string, droppedNodeId: string) => {
    moveNode(droppedNodeId, nodeId);
    setDraggedNode(null);
    setDragOverNode(null);
  }, [moveNode]);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">{t('title')}</h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t('description')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Zone d'édition de l'arbre */}
        <Card>
                      <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                {t('treeEditor.title')}
              </CardTitle>
              <CardDescription>
                {t('treeEditor.description')}
              </CardDescription>
            </CardHeader>
          <CardContent>
            <TreeControls
              onAddFolder={() => addNode(null, 'folder')}
              onAddFile={() => addNode(null, 'file')}
              onSave={saveTree}
              onLoad={() => document.getElementById('load-tree-input')?.click()}
              onClear={clearTree}
              onLoadFileChange={loadTree}
            />
            
            <div 
              className="border rounded-lg p-4 min-h-[400px] max-h-[600px] overflow-y-auto"
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (draggedNode) {
                  setDragOverNode('root');
                }
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setDragOverNode(null);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const droppedNodeId = e.dataTransfer.getData('text/plain');
                
                if (droppedNodeId) {
                  moveNode(droppedNodeId, null);
                  setDraggedNode(null);
                  setDragOverNode(null);
                }
              }}
            >
              <TreeView
                treeData={treeData}
                editingNode={editingNode}
                editingName={editingName}
                draggedNode={draggedNode}
                dragOverNode={dragOverNode}
                onEditName={setEditingName}
                onStartEdit={startEditing}
                onSaveEdit={saveEdit}
                onCancelEdit={cancelEdit}
                onToggleExpansion={toggleExpansion}
                onAddNode={addNode}
                onDeleteNode={deleteNode}
                onMoveNode={moveNode}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              />
              {dragOverNode === 'root' && (
                <div className="border-2 border-dashed border-green-500 bg-green-50 dark:bg-green-900/20 rounded p-2 mt-2 text-center text-sm text-green-600 dark:text-green-400">
                  {t('treeEditor.dropToRoot')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Zone de prévisualisation ASCII */}
        <ASCIIPreview
          asciiOutput={asciiOutput}
          onCopy={copyToClipboard}
          onDownload={downloadASCII}
        />
      </div>

      {/* Zone de drag & drop */}
      <div className="mt-6">
        <DragDropZone onFilesAdded={handleFilesAdded} />
      </div>

      {/* Modal de confirmation pour effacer tout */}
      <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('errors.clearConfirmTitle')}</DialogTitle>
            <DialogDescription>
              {t('errors.clearConfirmDescription')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowClearConfirm(false)}
            >
              {t('errors.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmClearTree}
            >
              {t('errors.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmation pour charger un fichier */}
      <Dialog open={showLoadConfirm} onOpenChange={setShowLoadConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('errors.loadConfirmTitle')}</DialogTitle>
            <DialogDescription>
              {t('errors.loadConfirmDescription')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowLoadConfirm(false);
                setPendingFile(null);
              }}
            >
              {t('errors.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmLoadTree}
            >
              {t('errors.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
