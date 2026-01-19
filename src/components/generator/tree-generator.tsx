'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { Folder, File, Plus, Copy, Download, Settings, ChevronDown, ChevronRight, Trash2, Move, Edit3, Save, Upload } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { useTranslations } from 'next-intl';
import { TreeNode, TreeOptions, ASCIITreeConfig } from '@/lib/types';
import { generateASCIITree, sortTreeNodes, updateNodeName, toggleNodeExpansion } from '@/lib/tree-generator';
import { validateSavedTreeData, validateNodeStructure } from '@/lib/validation';
import DragDropZone from './drag-drop-zone';
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

  const [options, setOptions] = useState<TreeOptions>({
    showHidden: false,
    maxDepth: 10,
    sortAlphabetically: true,
    includeExtensions: true
  });

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

  /**
   * Ajoute un nouveau nœud (fichier ou dossier) à l'arbre
   * @param parentId - ID du parent où ajouter le nœud (null pour la racine)
   * @param type - Type de nœud à créer ('file' ou 'folder')
   */
  const addNode = useCallback((parentId: string | null, type: 'file' | 'folder') => {
    const newNode: TreeNode = {
      id: Date.now().toString(),
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
        return nodes.filter(node => {
          if (node.id === nodeId) return false;
          if (node.children) {
            node.children = removeNode(node.children);
          }
          return true;
        });
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

  // Mémorisation du tri des données pour éviter de re-trier à chaque rendu
  const sortedTreeData = useMemo(() => {
    return options.sortAlphabetically ? sortTreeNodes(treeData) : treeData;
  }, [treeData, options.sortAlphabetically]);

  // Mémorisation de la génération ASCII pour éviter de régénérer à chaque rendu
  const asciiOutput = useMemo(() => {
    return generateASCIITree(sortedTreeData, asciiConfig);
  }, [sortedTreeData, asciiConfig]);

  const generateASCII = useCallback(() => {
    return asciiOutput;
  }, [asciiOutput]);

  /**
   * Copie la représentation ASCII de l'arbre dans le presse-papiers
   * Affiche une notification de succès ou d'erreur
   */
  const copyToClipboard = useCallback(async () => {
    const asciiTree = generateASCII();
    try {
      await navigator.clipboard.writeText(asciiTree);
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
  }, [generateASCII, toast, t]);

  /**
   * Télécharge la représentation ASCII de l'arbre sous forme de fichier texte
   * Affiche une notification de succès ou d'erreur
   */
  const downloadASCII = useCallback(() => {
    try {
      const asciiTree = generateASCII();
      const blob = new Blob([asciiTree], { type: 'text/plain' });
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
  }, [generateASCII, toast, t]);

  const handleFilesAdded = useCallback((newNodes: TreeNode[]) => {
    setTreeData(prev => [...prev, ...newNodes]);
  }, []);

  const clearTree = useCallback(() => {
    setTreeData([]);
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
   * Charge un arbre depuis un fichier JSON avec validation stricte (Zod)
   * Valide la structure, les types et la cohérence des données
   * @param event - Événement de changement d'input file
   */
  const loadTree = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
          setOptions(data.options);
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
    
    // Réinitialiser l'input pour permettre de charger le même fichier
    event.target.value = '';
  }, [toast, t]);

  const moveNode = useCallback((nodeId: string, newParentId: string | null) => {
    setTreeData(prev => {
      // Fonction helper pour trouver un nœud par son ID
      const findNodeById = (nodes: TreeNode[], id: string): TreeNode | null => {
        for (const node of nodes) {
          if (node.id === id) {
            return node;
          }
          if (node.children) {
            const found = findNodeById(node.children, id);
            if (found) return found;
          }
        }
        return null;
      };

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

  const renderNode = useCallback((node: TreeNode, depth: number = 0) => {
    const isEditing = editingNode === node.id;
    const hasChildren = node.children && node.children.length > 0;
    const canExpand = node.type === 'folder' && hasChildren;
    const isDragging = draggedNode === node.id;
    const isDragOver = dragOverNode === node.id;

    return (
      <div key={node.id} className="select-none">
        <div 
          className={`flex items-center gap-2 py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
            isEditing ? 'bg-blue-50 dark:bg-blue-900/20' : ''
          } ${
            isDragging ? 'opacity-50' : ''
          } ${
            isDragOver && node.type === 'folder' ? 'bg-green-100 dark:bg-green-900/20 border-2 border-green-500 ring-2 ring-green-300' : ''
          } ${
            isDragOver && node.type === 'file' ? 'bg-red-100 dark:bg-red-900/20 border-2 border-red-500' : ''
          }`}
          style={{ paddingLeft: `${depth * 20 + 8}px` }}
          draggable
          onDragStart={(e) => {
            setDraggedNode(node.id);
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', node.id);
          }}
          onDragEnd={() => {
            setTimeout(() => {
              setDraggedNode(null);
              setDragOverNode(null);
            }, 100);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // Ne permettre le drag over que si la cible est un dossier
            if (draggedNode && draggedNode !== node.id && node.type === 'folder') {
              setDragOverNode(node.id);
            }
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            // Vérifier si on quitte vraiment l'élément
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setDragOverNode(null);
            }
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const droppedNodeId = e.dataTransfer.getData('text/plain');
            
            // Ne permettre le drop que si la cible est un dossier
            if (droppedNodeId && droppedNodeId !== node.id && node.type === 'folder') {
              moveNode(droppedNodeId, node.id);
              setDraggedNode(null);
              setDragOverNode(null);
            }
          }}
        >
          {canExpand && (
            <button
              onClick={() => toggleExpansion(node.id)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            >
              {node.isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
          
          {node.type === 'folder' ? (
            <Folder className="w-4 h-4 text-blue-500" />
          ) : (
            <File className="w-4 h-4 text-gray-500" />
          )}

          {isEditing ? (
            <div className="flex items-center gap-2 flex-1">
              <Input
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveEdit();
                  if (e.key === 'Escape') cancelEdit();
                }}
                className="h-6 text-sm"
                autoFocus
              />
              <Button size="sm" onClick={saveEdit} className="h-6 px-2">
                ✓
              </Button>
              <Button size="sm" variant="outline" onClick={cancelEdit} className="h-6 px-2">
                ✕
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              <span 
                className="flex-1 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                onDoubleClick={() => startEditing(node)}
              >
                {node.name}
              </span>
              
                                            <div className="flex items-center gap-1">
                 <Button
                   size="sm"
                   variant="ghost"
                   onClick={() => addNode(node.id, 'folder')}
                   className={`h-6 w-6 p-0 ${node.type === 'file' ? 'opacity-50 cursor-not-allowed' : ''}`}
                   title={node.type === 'file' ? 'Impossible d\'ajouter un dossier dans un fichier' : 'Ajouter un dossier'}
                   disabled={node.type === 'file'}
                 >
                   <Folder className="w-3 h-3" />
                 </Button>
                 <Button
                   size="sm"
                   variant="ghost"
                   onClick={() => addNode(node.id, 'file')}
                   className={`h-6 w-6 p-0 ${node.type === 'file' ? 'opacity-50 cursor-not-allowed' : ''}`}
                   title={node.type === 'file' ? t('treeEditor.cannotAddFileToFile') : t('treeEditor.addFile')}
                   disabled={node.type === 'file'}
                 >
                   <File className="w-3 h-3" />
                 </Button>
                 <Button
                   size="sm"
                   variant="ghost"
                   className="h-6 w-6 p-0 cursor-move"
                   title="Déplacer (glisser-déposer)"
                 >
                   <Move className="w-3 h-3" />
                 </Button>
                 <Button
                   size="sm"
                   variant="ghost"
                   onClick={() => startEditing(node)}
                   className="h-6 w-6 p-0 text-blue-500 hover:text-blue-700"
                   title="Modifier le nom"
                 >
                   <Edit3 className="w-3 h-3" />
                 </Button>
                 <Button
                   size="sm"
                   variant="ghost"
                   onClick={() => deleteNode(node.id)}
                   className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                   title="Supprimer"
                 >
                   <Trash2 className="w-3 h-3" />
                 </Button>
               </div>
            </div>
          )}
        </div>

        {node.isExpanded && node.children && (
          <div className="group">
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
        
        {/* Zone de drop pour les dossiers */}
        {node.type === 'folder' && isDragOver && (
          <div 
            className="border-2 border-dashed border-green-500 bg-green-50 dark:bg-green-900/20 rounded p-2 mt-1 text-center text-sm text-green-600 dark:text-green-400"
            style={{ paddingLeft: `${(depth + 1) * 20 + 8}px` }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const droppedNodeId = e.dataTransfer.getData('text/plain');
              
              if (droppedNodeId && droppedNodeId !== node.id) {
                moveNode(droppedNodeId, node.id);
                setDraggedNode(null);
                setDragOverNode(null);
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            Déposer ici pour ajouter au dossier &quot;{node.name}&quot;
          </div>
        )}
      </div>
    );
  }, [editingNode, editingName, addNode, deleteNode, startEditing, saveEdit, cancelEdit, toggleExpansion, dragOverNode, draggedNode, moveNode]);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold mb-2">{t('title')}</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('description')}
          </p>
        </div>
        <div className="flex gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
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
            <div className="mb-4 flex gap-2 flex-wrap">
              <div className="flex gap-2">
                <Button onClick={() => addNode(null, 'folder')} size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  {t('treeEditor.newFolder')}
                </Button>
                <Button onClick={() => addNode(null, 'file')} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  {t('treeEditor.newFile')}
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={saveTree} size="sm" variant="outline">
                  <Save className="w-4 h-4 mr-1" />
                  {t('treeEditor.save')}
                </Button>
                <Button 
                  onClick={() => document.getElementById('load-tree-input')?.click()} 
                  size="sm" 
                  variant="outline"
                >
                  <Upload className="w-4 h-4 mr-1" />
                  {t('treeEditor.load')}
                </Button>
              </div>
              
              <Button onClick={clearTree} size="sm" variant="destructive">
                <Trash2 className="w-4 h-4 mr-1" />
                {t('treeEditor.clearAll')}
              </Button>
              
              <input
                id="load-tree-input"
                type="file"
                accept=".json"
                onChange={loadTree}
                className="hidden"
              />
            </div>
            
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
                // Vérifier si on quitte vraiment la zone
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
              <div className="group">
                {treeData.map(node => renderNode(node))}
                {dragOverNode === 'root' && (
                  <div className="border-2 border-dashed border-green-500 bg-green-50 dark:bg-green-900/20 rounded p-2 mt-2 text-center text-sm text-green-600 dark:text-green-400">
                    {t('treeEditor.dropToRoot')}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Zone de prévisualisation ASCII */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <File className="w-5 h-5" />
              {t('asciiPreview.title')}
            </CardTitle>
            <CardDescription>
              {t('asciiPreview.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex gap-2">
              <Button onClick={copyToClipboard} size="sm">
                <Copy className="w-4 h-4 mr-1" />
                {t('asciiPreview.copy')}
              </Button>
              <Button onClick={downloadASCII} size="sm" variant="outline">
                <Download className="w-4 h-4 mr-1" />
                {t('asciiPreview.download')}
              </Button>
            </div>
            
            <Textarea
              value={asciiOutput}
              readOnly
              className="font-mono text-sm min-h-[400px] resize-none"
              placeholder={t('asciiPreview.placeholder')}
            />
          </CardContent>
        </Card>
      </div>

      {/* Zone de drag & drop */}
       <div className="mt-6">
         <DragDropZone onFilesAdded={handleFilesAdded} />
       </div>

       {/* Options de configuration */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t('options.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="sortAlphabetically"
                checked={options.sortAlphabetically}
                onChange={(e) => setOptions(prev => ({ ...prev, sortAlphabetically: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="sortAlphabetically">{t('options.sortAlphabetically')}</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showHidden"
                checked={options.showHidden}
                onChange={(e) => setOptions(prev => ({ ...prev, showHidden: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="showHidden">{t('options.showHidden')}</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeExtensions"
                checked={options.includeExtensions}
                onChange={(e) => setOptions(prev => ({ ...prev, includeExtensions: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="includeExtensions">{t('options.includeExtensions')}</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <label htmlFor="maxDepth">{t('options.maxDepth')}</label>
              <Input
                id="maxDepth"
                type="number"
                min="1"
                max="20"
                value={options.maxDepth}
                onChange={(e) => setOptions(prev => ({ ...prev, maxDepth: parseInt(e.target.value) }))}
                className="w-20"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
