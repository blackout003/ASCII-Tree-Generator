'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRightSidebar } from '@/lib/contexts/right-sidebar-context';
import { useToast } from '@/hooks/use-toast';
import { TableData, TableOptions } from '@/lib/table-types';
import { generateASCIITable } from '@/lib/table-generator';
import { validateSavedTableData } from '@/lib/validation';
import { TableEditor } from './table-editor';
import { TablePreview } from './table-preview';
import { TableOptionsPanel } from './table-options-panel';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const defaultData: TableData = {
  columns: ['Nom', 'Âge', 'Ville'],
  rows: [
    { id: '1', cells: [{ content: 'Alice' }, { content: '30' }, { content: 'Paris' }] },
    { id: '2', cells: [{ content: 'Bob' }, { content: '25' }, { content: 'Lyon' }] },
    { id: '3', cells: [{ content: 'Clara' }, { content: '28' }, { content: 'Nice' }] },
  ],
};

const defaultOptions: TableOptions = {
  borderStyle: 'unicode',
  hasHeader: true,
  alignment: 'left',
  padding: 1,
};

export function TableGenerator() {
  const t = useTranslations('tableGenerator');
  const { toast } = useToast();
  const { setContent } = useRightSidebar();

  const [tableData, setTableData] = useState<TableData>(defaultData);
  const [options, setOptions] = useState<TableOptions>(defaultOptions);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showLoadConfirm, setShowLoadConfirm] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const asciiOutput = useMemo(
    () => generateASCIITable(tableData, options),
    [tableData, options]
  );

  useEffect(() => {
    setContent(
      <TableOptionsPanel options={options} onOptionsChange={setOptions} />
    );
    return () => setContent(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  const updateColumn = useCallback((index: number, value: string) => {
    setTableData(prev => {
      const columns = [...prev.columns];
      columns[index] = value;
      return { ...prev, columns };
    });
  }, []);

  const updateCell = useCallback((rowId: string, colIndex: number, value: string) => {
    setTableData(prev => ({
      ...prev,
      rows: prev.rows.map(row =>
        row.id === rowId
          ? {
              ...row,
              cells: row.cells.map((cell, i) =>
                i === colIndex ? { content: value } : cell
              ),
            }
          : row
      ),
    }));
  }, []);

  const addRow = useCallback(() => {
    setTableData(prev => ({
      ...prev,
      rows: [
        ...prev.rows,
        {
          id: crypto.randomUUID(),
          cells: prev.columns.map(() => ({ content: '' })),
        },
      ],
    }));
  }, []);

  const deleteRow = useCallback((rowId: string) => {
    setTableData(prev => ({
      ...prev,
      rows: prev.rows.filter(r => r.id !== rowId),
    }));
  }, []);

  const addColumn = useCallback(() => {
    setTableData(prev => ({
      columns: [...prev.columns, `Col ${prev.columns.length + 1}`],
      rows: prev.rows.map(row => ({
        ...row,
        cells: [...row.cells, { content: '' }],
      })),
    }));
  }, []);

  const deleteColumn = useCallback((index: number) => {
    setTableData(prev => ({
      columns: prev.columns.filter((_, i) => i !== index),
      rows: prev.rows.map(row => ({
        ...row,
        cells: row.cells.filter((_, i) => i !== index),
      })),
    }));
  }, []);

  const clearTable = useCallback(() => {
    setShowClearConfirm(true);
  }, []);

  const confirmClearTable = useCallback(() => {
    setTableData({
      columns: ['Col 1', 'Col 2', 'Col 3'],
      rows: [{ id: crypto.randomUUID(), cells: [{ content: '' }, { content: '' }, { content: '' }] }],
    });
    setOptions(defaultOptions);
    setShowClearConfirm(false);
    toast({ description: t('errors.clearSuccess') });
  }, [toast, t]);

  const saveTable = useCallback(() => {
    try {
      const dataToSave = {
        tableData,
        options,
        timestamp: new Date().toISOString(),
        version: '1.0',
      };
      const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tableau-ascii-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ description: t('errors.saveSuccess') });
    } catch (err) {
      toast({ description: err instanceof Error ? err.message : t('errors.saveError'), variant: 'destructive' });
    }
  }, [tableData, options, toast, t]);

  const performLoadTable = useCallback((file: File) => {
    const MAX_JSON_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_JSON_SIZE) {
      toast({ description: t('errors.loadError'), variant: 'destructive' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        if (!content || content.trim().length === 0) throw new Error('Le fichier est vide');
        const parsedData = JSON.parse(content);
        const validation = validateSavedTableData(parsedData);
        if (!validation.success) throw new Error(validation.error);
        const { data } = validation;
        setTableData(data.tableData);
        if (data.options) setOptions({ ...defaultOptions, ...data.options });
        toast({ description: t('errors.loadSuccess') });
      } catch (err) {
        toast({ description: err instanceof Error ? err.message : t('errors.loadError'), variant: 'destructive' });
      }
    };
    reader.onerror = () => {
      toast({ description: t('errors.loadError'), variant: 'destructive' });
    };
    reader.readAsText(file);
  }, [toast, t]);

  const loadTable = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = '';
    setPendingFile(file);
    setShowLoadConfirm(true);
  }, []);

  const confirmLoadTable = useCallback(() => {
    if (pendingFile) {
      performLoadTable(pendingFile);
      setPendingFile(null);
    }
    setShowLoadConfirm(false);
  }, [pendingFile, performLoadTable]);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(asciiOutput);
      toast({ description: t('copySuccess') });
    } catch {
      toast({ description: t('copyError'), variant: 'destructive' });
    }
  }, [asciiOutput, t, toast]);

  const downloadASCII = useCallback(() => {
    try {
      const blob = new Blob([asciiOutput], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tableau-ascii.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast({ description: t('downloadError'), variant: 'destructive' });
    }
  }, [asciiOutput, t, toast]);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <TableEditor
        tableData={tableData}
        onUpdateColumn={updateColumn}
        onUpdateCell={updateCell}
        onAddRow={addRow}
        onDeleteRow={deleteRow}
        onAddColumn={addColumn}
        onDeleteColumn={deleteColumn}
        onSave={saveTable}
        onLoad={() => document.getElementById('load-table-input')?.click()}
        onClear={clearTable}
        onLoadFileChange={loadTable}
      />
      <TablePreview
        asciiOutput={asciiOutput}
        onCopy={copyToClipboard}
        onDownload={downloadASCII}
      />

      <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('errors.clearConfirmTitle')}</DialogTitle>
            <DialogDescription>{t('errors.clearConfirmDescription')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearConfirm(false)}>
              {t('errors.cancel')}
            </Button>
            <Button variant="destructive" onClick={confirmClearTable}>
              {t('errors.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showLoadConfirm} onOpenChange={setShowLoadConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('errors.loadConfirmTitle')}</DialogTitle>
            <DialogDescription>{t('errors.loadConfirmDescription')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowLoadConfirm(false); setPendingFile(null); }}>
              {t('errors.cancel')}
            </Button>
            <Button variant="destructive" onClick={confirmLoadTable}>
              {t('errors.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
