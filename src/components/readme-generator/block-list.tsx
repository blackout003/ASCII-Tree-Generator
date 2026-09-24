'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { ChevronDown, ChevronUp, Move, Plus, Trash2 } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { Block, BlockType } from '@/lib/readme/types';

interface BlockListProps {
  blocks: Block[];
  selectedId: string | null;
  catalog: { type: BlockType; disabled: boolean }[];
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onMove: (id: string, delta: -1 | 1) => void;
  onRemove: (id: string) => void;
  onReorder: (fromId: string, toId: string) => void;
  onAdd: (type: BlockType) => void;
}

export function BlockList({
  blocks,
  selectedId,
  catalog,
  onSelect,
  onToggle,
  onMove,
  onRemove,
  onReorder,
  onAdd,
}: BlockListProps) {
  const t = useTranslations('readmeGenerator');
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const endDrag = () => {
    setDragId(null);
    setOverId(null);
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>{t('blocks.title')}</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-1" />
              {t('blocks.add')}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {catalog.map(({ type, disabled }) => (
              <DropdownMenuItem key={type} disabled={disabled} onSelect={() => onAdd(type)}>
                {t(`blocks.${type}`)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        {blocks.length === 0 && <p className="text-sm text-muted-foreground">{t('blocks.empty')}</p>}
        <ul className="space-y-2">
          {blocks.map((block, index) => (
            <li
              key={block.id}
              draggable
              onDragStart={(e) => {
                setDragId(block.id);
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', block.id);
              }}
              onDragEnd={endDrag}
              onDragOver={(e) => {
                if (dragId && dragId !== block.id) {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  setOverId(block.id);
                }
              }}
              onDragLeave={() => setOverId((current) => (current === block.id ? null : current))}
              onDrop={(e) => {
                e.preventDefault();
                if (dragId) onReorder(dragId, block.id);
                endDrag();
              }}
              className={cn(
                'flex items-center gap-2 rounded-md border p-2',
                selectedId === block.id && 'border-primary',
                overId === block.id && 'ring-2 ring-primary/50',
                dragId === block.id && 'opacity-50'
              )}
            >
              <span className="cursor-grab text-muted-foreground" title={t('blocks.drag')}>
                <Move className="w-4 h-4" aria-hidden="true" />
                <span className="sr-only">{t('blocks.drag')}</span>
              </span>
              <button
                type="button"
                className={cn('flex-1 truncate text-left text-sm', !block.enabled && 'text-muted-foreground line-through')}
                aria-current={selectedId === block.id}
                onClick={() => onSelect(block.id)}
              >
                {t(`blocks.${block.type}`)}
              </button>
              <Switch
                checked={block.enabled}
                onCheckedChange={() => onToggle(block.id)}
                aria-label={t('blocks.enabled')}
              />
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                disabled={index === 0}
                onClick={() => onMove(block.id, -1)}
                aria-label={t('blocks.moveUp')}
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                disabled={index === blocks.length - 1}
                onClick={() => onMove(block.id, 1)}
                aria-label={t('blocks.moveDown')}
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => onRemove(block.id)}
                aria-label={t('blocks.remove')}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
