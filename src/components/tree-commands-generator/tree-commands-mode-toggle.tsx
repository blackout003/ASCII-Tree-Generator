'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import type { TreeCommandsMode } from '@/lib/tree-commands-types';

interface TreeCommandsModeToggleProps {
  mode: TreeCommandsMode;
  onModeChange: (mode: TreeCommandsMode) => void;
}

export function TreeCommandsModeToggle({ mode, onModeChange }: TreeCommandsModeToggleProps) {
  const t = useTranslations('treeCommandsGenerator');

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant={mode === 'treeToCommands' ? 'default' : 'outline'}
        onClick={() => onModeChange('treeToCommands')}
      >
        {t('modes.treeToCommands')}
      </Button>
      <Button
        size="sm"
        variant={mode === 'commandsToTree' ? 'default' : 'outline'}
        onClick={() => onModeChange('commandsToTree')}
      >
        {t('modes.commandsToTree')}
      </Button>
    </div>
  );
}
