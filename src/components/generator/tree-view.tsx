'use client';

import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Folder, File, ChevronDown, ChevronRight, Trash2, Move, Edit3 } from '@/components/icons';
import { TreeNode } from '@/lib/types';
import { useTranslations } from 'next-intl';

interface TreeViewProps {
  treeData: TreeNode[];
  editingNode: string | null;
  editingName: string;
  draggedNode: string | null;
  dragOverNode: string | null;
  onEditName: (name: string) => void;
  onStartEdit: (node: TreeNode) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onToggleExpansion: (nodeId: string) => void;
  onAddNode: (parentId: string | null, type: 'file' | 'folder') => void;
  onDeleteNode: (nodeId: string) => void;
  onMoveNode: (nodeId: string, newParentId: string | null) => void;
  onDragStart: (nodeId: string) => void;
  onDragEnd: () => void;
  onDragOver: (nodeId: string) => void;
  onDragLeave: () => void;
  onDrop: (nodeId: string, droppedNodeId: string) => void;
}

/**
 * Composant pour afficher et interagir avec l'arbre de nœuds
 */
export function TreeView({
  treeData,
  editingNode,
  editingName,
  draggedNode,
  dragOverNode,
  onEditName,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onToggleExpansion,
  onAddNode,
  onDeleteNode,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
}: TreeViewProps) {
  const t = useTranslations();

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
            onDragStart(node.id);
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', node.id);
          }}
          onDragEnd={() => {
            setTimeout(() => {
              onDragEnd();
            }, 100);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (draggedNode && draggedNode !== node.id && node.type === 'folder') {
              onDragOver(node.id);
            }
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              onDragLeave();
            }
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const droppedNodeId = e.dataTransfer.getData('text/plain');
            
            if (droppedNodeId && droppedNodeId !== node.id && node.type === 'folder') {
              onDrop(node.id, droppedNodeId);
            }
          }}
        >
          {canExpand && (
            <button
              onClick={() => onToggleExpansion(node.id)}
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
                onChange={(e) => onEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSaveEdit();
                  if (e.key === 'Escape') onCancelEdit();
                }}
                className="h-6 text-sm"
                autoFocus
              />
              <Button size="sm" onClick={onSaveEdit} className="h-6 px-2">
                ✓
              </Button>
              <Button size="sm" variant="outline" onClick={onCancelEdit} className="h-6 px-2">
                ✕
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              <span 
                className="flex-1 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                onDoubleClick={() => onStartEdit(node)}
              >
                {node.name}
              </span>
              
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onAddNode(node.id, 'folder')}
                  className={`h-6 w-6 p-0 ${node.type === 'file' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={node.type === 'file' ? t('treeEditor.cannotAddFolderToFile') : t('treeEditor.addFolder')}
                  aria-label={node.type === 'file' ? t('treeEditor.cannotAddFolderToFile') : t('treeEditor.addFolder')}
                  disabled={node.type === 'file'}
                >
                  <Folder className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onAddNode(node.id, 'file')}
                  className={`h-6 w-6 p-0 ${node.type === 'file' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={node.type === 'file' ? t('treeEditor.cannotAddFileToFile') : t('treeEditor.addFile')}
                  aria-label={node.type === 'file' ? t('treeEditor.cannotAddFileToFile') : t('treeEditor.addFile')}
                  disabled={node.type === 'file'}
                >
                  <File className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 cursor-move"
                  title={t('treeEditor.move')}
                  aria-label={t('treeEditor.move')}
                >
                  <Move className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onStartEdit(node)}
                  className="h-6 w-6 p-0 text-blue-500 hover:text-blue-700"
                  title={t('treeEditor.editName')}
                  aria-label={t('treeEditor.editName')}
                >
                  <Edit3 className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDeleteNode(node.id)}
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  title={t('treeEditor.delete')}
                  aria-label={t('treeEditor.delete')}
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
                onDrop(node.id, droppedNodeId);
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {t('treeEditor.dropInFolder', { name: node.name })}
          </div>
        )}
      </div>
    );
  }, [editingNode, editingName, draggedNode, dragOverNode, onEditName, onStartEdit, onSaveEdit, onCancelEdit, onToggleExpansion, onAddNode, onDeleteNode, onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop, t]);

  return (
    <div className="group">
      {treeData.map(node => renderNode(node))}
    </div>
  );
}
