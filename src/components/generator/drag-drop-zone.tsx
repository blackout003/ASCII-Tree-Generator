'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Folder, File, X } from 'lucide-react';
import { TreeNode } from '@/lib/types';
import { useTranslations } from 'next-intl';

interface DragDropZoneProps {
  onFilesAdded: (nodes: TreeNode[]) => void;
}

export default function DragDropZone({ onFilesAdded }: DragDropZoneProps) {
  const t = useTranslations();
  const [isDragOver, setIsDragOver] = useState(false);
  const [droppedItems, setDroppedItems] = useState<TreeNode[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const items = Array.from(e.dataTransfer.items);
    const newNodes: TreeNode[] = [];

    items.forEach((item, index) => {
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) {
          const path = file.webkitRelativePath || file.name;
          const pathParts = path.split('/');
          
          // Créer la structure de dossiers
          let currentLevel = newNodes;
          pathParts.forEach((part, partIndex) => {
            const isLastPart = partIndex === pathParts.length - 1;
            const isFile = isLastPart && !file.webkitRelativePath;
            
            const existingNode = currentLevel.find(node => node.name === part);
            
            if (existingNode) {
              if (isFile) {
                // Si c'est un fichier et qu'on a déjà un dossier avec ce nom, on ajoute le fichier dedans
                if (existingNode.type === 'folder') {
                  existingNode.children = existingNode.children || [];
                  existingNode.children.push({
                    id: `${Date.now()}-${index}-${partIndex}`,
                    name: part,
                    type: 'file'
                  });
                }
              } else {
                // Continuer dans le dossier existant
                currentLevel = existingNode.children || [];
              }
            } else {
              const newNode: TreeNode = {
                id: `${Date.now()}-${index}-${partIndex}`,
                name: part,
                type: isFile ? 'file' : 'folder',
                isExpanded: true,
                children: isFile ? undefined : []
              };
              
              currentLevel.push(newNode);
              if (!isFile) {
                currentLevel = newNode.children!;
              }
            }
          });
        }
      }
    });

    if (newNodes.length > 0) {
      setDroppedItems(newNodes);
      onFilesAdded(newNodes);
    }
  }, [onFilesAdded]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newNodes: TreeNode[] = [];

    files.forEach((file, index) => {
      const path = file.webkitRelativePath || file.name;
      const pathParts = path.split('/');
      
      let currentLevel = newNodes;
      pathParts.forEach((part, partIndex) => {
        const isLastPart = partIndex === pathParts.length - 1;
        const isFile = isLastPart && !file.webkitRelativePath;
        
        const existingNode = currentLevel.find(node => node.name === part);
        
        if (existingNode) {
          if (isFile) {
            if (existingNode.type === 'folder') {
              existingNode.children = existingNode.children || [];
              existingNode.children.push({
                id: `${Date.now()}-${index}-${partIndex}`,
                name: part,
                type: 'file'
              });
            }
          } else {
            currentLevel = existingNode.children || [];
          }
        } else {
          const newNode: TreeNode = {
            id: `${Date.now()}-${index}-${partIndex}`,
            name: part,
            type: isFile ? 'file' : 'folder',
            isExpanded: true,
            children: isFile ? undefined : []
          };
          
          currentLevel.push(newNode);
          if (!isFile) {
            currentLevel = newNode.children!;
          }
        }
      });
    });

    if (newNodes.length > 0) {
      setDroppedItems(newNodes);
      onFilesAdded(newNodes);
    }
  }, [onFilesAdded]);

  const clearDroppedItems = useCallback(() => {
    setDroppedItems([]);
  }, []);

  return (
    <Card className={`transition-colors ${isDragOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          {t('dragDrop.title')}
        </CardTitle>
        <CardDescription>
          {t('dragDrop.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-600'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-2">
            {t('dragDrop.dropHere')}
          </p>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('dragDrop.orClick')}
          </p>
          
          <div className="flex gap-2 justify-center">
            <Button onClick={() => document.getElementById('file-input')?.click()}>
              {t('dragDrop.selectFiles')}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => document.getElementById('folder-input')?.click()}
            >
              {t('dragDrop.selectFolder')}
            </Button>
          </div>
          
          <input
            id="file-input"
            type="file"
            multiple
            onChange={handleFileInput}
            className="hidden"
          />
          <input
            id="folder-input"
            type="file"
            {...({ webkitdirectory: "" } as React.InputHTMLAttributes<HTMLInputElement>)}
            multiple
            onChange={handleFileInput}
            className="hidden"
          />
        </div>

        {droppedItems.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">{t('dragDrop.importedItems')}</h4>
              <Button
                size="sm"
                variant="ghost"
                onClick={clearDroppedItems}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-1">
              {droppedItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {item.type === 'folder' ? (
                    <Folder className="w-4 h-4 text-blue-500" />
                  ) : (
                    <File className="w-4 h-4 text-gray-500" />
                  )}
                  <span>{item.name}</span>
                  {item.children && item.children.length > 0 && (
                    <span className="text-gray-500">({item.children.length} {t('dragDrop.items')})</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
