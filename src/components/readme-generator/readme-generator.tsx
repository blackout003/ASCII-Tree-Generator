'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';
import { trackEvent } from '@/lib/analytics-events';
import { generateReadme } from '@/lib/readme/generate';
import {
  loadState,
  parseReadmeState,
  saveState,
  serializeReadmeState,
} from '@/lib/readme/persistence';
import { getCatalog } from '@/lib/readme/registry';
import {
  addBlock,
  canAddBlock,
  createInitialState,
  moveBlock,
  removeBlock,
  reorderBlock,
  switchMode,
  toggleBlock,
  updateBlockData,
} from '@/lib/readme/state';
import type { BlockType, ReadmeMode, ReadmeState } from '@/lib/readme/types';
import { validateReadme } from '@/lib/readme/validate';
import { cn } from '@/lib/utils';
import { BlockForm } from './block-forms';
import { BlockList } from './block-list';
import { ReadmePreview } from './readme-preview';
import { ReadmeToolbar } from './readme-toolbar';
import { WarningsPanel } from './warnings-panel';

const MAX_IMPORT_BYTES = 1_000_000;

function downloadFile(content: string, filename: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function ReadmeGenerator() {
  const t = useTranslations('readmeGenerator');
  const { toast } = useToast();

  // `null` until mounted: the saved state is only known in the browser.
  const [state, setState] = useState<ReadmeState | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');
  const storageWarned = useRef(false);

  useEffect(() => {
    setState(loadState() ?? createInitialState('project'));
  }, []);

  useEffect(() => {
    if (!state) return;
    if (!saveState(state) && !storageWarned.current) {
      storageWarned.current = true;
      toast({ description: t('messages.storageUnavailable') });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const markdown = useMemo(() => (state ? generateReadme(state) : ''), [state]);
  const warnings = useMemo(() => (state ? validateReadme(state) : []), [state]);

  const update = useCallback((change: (current: ReadmeState) => ReadmeState) => {
    setState((current) => (current ? change(current) : current));
  }, []);

  if (!state) {
    return <div className="mx-auto max-w-6xl p-6" aria-busy="true" />;
  }

  const selected = state.blocks.find((block) => block.id === selectedId) ?? state.blocks[0] ?? null;
  const catalog = getCatalog(state.mode).map((def) => ({
    type: def.type,
    disabled: !canAddBlock(state, def.type),
  }));
  const blockLabels = Object.fromEntries(state.blocks.map((block) => [block.id, t(`blocks.${block.type}`)]));

  // Actions that replace the whole work (mode switch, import, reset) offer to
  // restore the state they replaced: the autosave would otherwise overwrite the
  // only copy.
  const undoAction = (previous: ReadmeState) => (
    <ToastAction
      altText={t('messages.undo')}
      onClick={() => {
        setState(previous);
        setSelectedId(null);
      }}
    >
      {t('messages.undo')}
    </ToastAction>
  );

  const handleModeChange = (mode: ReadmeMode) => {
    const result = switchMode(state, mode);
    setState(result.state);
    setSelectedId(null);
    if (result.dropped > 0) {
      toast({
        description: t('messages.modeSwitchDropped', { count: result.dropped }),
        action: undoAction(state),
      });
    }
  };

  const handleAdd = (type: BlockType) => {
    const next = addBlock(state, type);
    if (next === state) return;
    setState(next);
    setSelectedId(next.blocks[next.blocks.length - 1].id);
    setTab('edit');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      trackEvent('Copy', { tool: 'readme-generator', mode: state.mode });
      toast({ description: t('messages.copySuccess') });
    } catch {
      toast({ description: t('messages.copyError'), variant: 'destructive' });
    }
  };

  const handleDownload = () => {
    try {
      downloadFile(markdown, 'README.md', 'text/markdown');
      trackEvent('Download', { tool: 'readme-generator', mode: state.mode });
    } catch {
      toast({ description: t('messages.downloadError'), variant: 'destructive' });
    }
  };

  const handleExportJson = () => {
    try {
      downloadFile(serializeReadmeState(state), `readme-${state.mode}.json`, 'application/json');
    } catch {
      toast({ description: t('messages.downloadError'), variant: 'destructive' });
    }
  };

  const handleImportFile = async (file: File) => {
    try {
      if (file.size > MAX_IMPORT_BYTES) throw new Error('file too large');
      const result = parseReadmeState(JSON.parse(await file.text()));
      if (!result.ok) throw new Error('invalid file');
      setState(result.state);
      setSelectedId(null);
      const description =
        result.dropped > 0
          ? `${t('messages.importSuccess')} ${t('messages.importDropped', { count: result.dropped })}`
          : t('messages.importSuccess');
      toast({ description, action: undoAction(state) });
    } catch {
      toast({ description: t('messages.importError'), variant: 'destructive' });
    }
  };

  const handleReset = () => {
    setState(createInitialState(state.mode));
    setSelectedId(null);
    toast({ description: t('messages.resetDone'), action: undoAction(state) });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <ReadmeToolbar
        mode={state.mode}
        onModeChange={handleModeChange}
        onCopy={handleCopy}
        onDownload={handleDownload}
        onExportJson={handleExportJson}
        onImportFile={handleImportFile}
        onReset={handleReset}
      />

      <div className="flex gap-2 lg:hidden" role="group">
        <Button size="sm" variant={tab === 'edit' ? 'default' : 'outline'} aria-pressed={tab === 'edit'} onClick={() => setTab('edit')}>
          {t('blocks.title')}
        </Button>
        <Button size="sm" variant={tab === 'preview' ? 'default' : 'outline'} aria-pressed={tab === 'preview'} onClick={() => setTab('preview')}>
          {t('preview.title')}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={cn('space-y-6', tab === 'preview' && 'hidden lg:block lg:space-y-6')}>
          <BlockList
            blocks={state.blocks}
            selectedId={selected?.id ?? null}
            catalog={catalog}
            onSelect={setSelectedId}
            onToggle={(id) => update((current) => toggleBlock(current, id))}
            onMove={(id, delta) => update((current) => moveBlock(current, id, delta))}
            onRemove={(id) => update((current) => removeBlock(current, id))}
            onReorder={(fromId, toId) => update((current) => reorderBlock(current, fromId, toId))}
            onAdd={handleAdd}
          />
          {selected && (
            <Card>
              <CardHeader>
                <CardTitle>{t(`blocks.${selected.type}`)}</CardTitle>
              </CardHeader>
              <CardContent>
                <BlockForm
                  block={selected}
                  onChange={(data) => update((current) => updateBlockData(current, selected.id, data))}
                />
              </CardContent>
            </Card>
          )}
          <WarningsPanel warnings={warnings} blockLabels={blockLabels} />
        </div>
        <div className={cn(tab === 'edit' && 'hidden lg:block')}>
          <ReadmePreview markdown={markdown} />
        </div>
      </div>
    </div>
  );
}
