'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRightSidebar } from '@/lib/contexts/right-sidebar-context';
import { useToast } from '@/hooks/use-toast';
import { trackEvent } from '@/lib/analytics-events';
import { generateASCIITree } from '@/lib/tree-generator';
import { generateShellCommands, parseAsciiTreeText, parseShellCommands } from '@/lib/tree-commands-generator';
import type { ConnectorStyle } from '@/lib/types';
import type { TreeCommandsMode } from '@/lib/tree-commands-types';
import { TreeCommandsModeToggle } from './tree-commands-mode-toggle';
import { TreeCommandsInput } from './tree-commands-input';
import { TreeCommandsPreview } from './tree-commands-preview';
import { TreeCommandsOptionsPanel } from './tree-commands-options-panel';

const DEFAULT_MODE: TreeCommandsMode = 'treeToCommands';

export function TreeCommandsGenerator() {
  const t = useTranslations('treeCommandsGenerator');
  const { toast } = useToast();
  const { setContent } = useRightSidebar();

  const [mode, setMode] = useState<TreeCommandsMode>(DEFAULT_MODE);
  const [input, setInput] = useState('');
  const [connectorStyle, setConnectorStyle] = useState<ConnectorStyle>('unicode');

  const result = useMemo(() => {
    if (mode === 'treeToCommands') {
      const { nodes, errors, warnings } = parseAsciiTreeText(input);
      return { output: generateShellCommands(nodes), errors, warnings };
    }
    const { nodes, errors, warnings } = parseShellCommands(input);
    const output = generateASCIITree(nodes, {
      prefix: '',
      connector: '',
      lastConnector: '',
      indent: '',
      connectorStyle,
    });
    return { output, errors, warnings };
  }, [mode, input, connectorStyle]);

  useEffect(() => {
    if (mode === 'commandsToTree') {
      setContent(
        <TreeCommandsOptionsPanel connectorStyle={connectorStyle} onConnectorStyleChange={setConnectorStyle} />
      );
    } else {
      setContent(null);
    }
    return () => setContent(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, connectorStyle]);

  const handleClear = useCallback(() => setInput(''), []);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(result.output);
      trackEvent('Copy', { tool: 'tree-to-commands', mode });
      toast({ description: t('errors.copySuccess') });
    } catch {
      toast({ description: t('errors.copyError'), variant: 'destructive' });
    }
  }, [result.output, t, toast, mode]);

  const downloadOutput = useCallback(() => {
    try {
      const blob = new Blob([result.output], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = mode === 'treeToCommands' ? 'commands.sh' : 'tree.txt';
      a.click();
      URL.revokeObjectURL(url);
      trackEvent('Download', { tool: 'tree-to-commands', mode });
    } catch {
      toast({ description: t('errors.downloadError'), variant: 'destructive' });
    }
  }, [result.output, t, toast, mode]);

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <TreeCommandsModeToggle mode={mode} onModeChange={setMode} />
      <TreeCommandsInput
        mode={mode}
        input={input}
        errors={result.errors}
        warnings={result.warnings}
        onInputChange={setInput}
        onClear={handleClear}
      />
      <TreeCommandsPreview mode={mode} output={result.output} onCopy={copyToClipboard} onDownload={downloadOutput} />
    </div>
  );
}
