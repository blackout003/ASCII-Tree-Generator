'use client';

import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Trash2, TableIcon, Save, Upload } from 'lucide-react';
import { TableData } from '@/lib/table-types';
import { useTranslations } from 'next-intl';

interface TableEditorProps {
  tableData: TableData;
  onUpdateColumn: (index: number, value: string) => void;
  onUpdateCell: (rowId: string, colIndex: number, value: string) => void;
  onAddRow: () => void;
  onDeleteRow: (rowId: string) => void;
  onAddColumn: () => void;
  onDeleteColumn: (index: number) => void;
  onSave: () => void;
  onLoad: () => void;
  onClear: () => void;
  onLoadFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

interface AutoResizeInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

function AutoResizeInput({ value, onChange, placeholder, className = '' }: AutoResizeInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.width = '0';
      inputRef.current.style.width = Math.max(60, inputRef.current.scrollWidth + 8) + 'px';
    }
  }, [value]);

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`min-w-[60px] max-w-[220px] bg-transparent border-0 outline-none focus:ring-1 focus:ring-ring rounded px-1 py-0.5 text-sm ${className}`}
    />
  );
}

export function TableEditor({
  tableData,
  onUpdateColumn,
  onUpdateCell,
  onAddRow,
  onDeleteRow,
  onAddColumn,
  onDeleteColumn,
  onSave,
  onLoad,
  onClear,
  onLoadFileChange,
}: TableEditorProps) {
  const t = useTranslations('tableGenerator');
  const { columns, rows } = tableData;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2">
            <TableIcon className="w-5 h-5" />
            {t('editor.title')}
          </CardTitle>
          <div className="flex gap-2 flex-wrap">
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={onSave}>
                <Save className="w-4 h-4 mr-1" />
                {t('editor.save')}
              </Button>
              <Button size="sm" variant="outline" onClick={onLoad}>
                <Upload className="w-4 h-4 mr-1" />
                {t('editor.load')}
              </Button>
              <Button size="sm" variant="destructive" onClick={onClear}>
                <Trash2 className="w-4 h-4 mr-1" />
                {t('editor.clearAll')}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={onAddColumn}>
                <PlusCircle className="w-4 h-4 mr-1" />
                {t('editor.addColumn')}
              </Button>
              <Button size="sm" variant="outline" onClick={onAddRow}>
                <PlusCircle className="w-4 h-4 mr-1" />
                {t('editor.addRow')}
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="border-collapse w-full">
            <thead>
              <tr>
                {columns.map((col, ci) => (
                  <th
                    key={ci}
                    className="border border-border bg-muted px-2 py-1 text-left"
                  >
                    <div className="flex items-center gap-1">
                      <AutoResizeInput
                        value={col}
                        onChange={(v) => onUpdateColumn(ci, v)}
                        placeholder={`${t('editor.columnPlaceholder')} ${ci + 1}`}
                        className="font-semibold"
                      />
                      {columns.length > 1 && (
                        <button
                          onClick={() => onDeleteColumn(ci)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-0.5 rounded"
                          title={t('editor.deleteColumn')}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </th>
                ))}
                <th className="w-8 border-0" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="group">
                  {columns.map((_, ci) => (
                    <td key={ci} className="border border-border px-2 py-1">
                      <AutoResizeInput
                        value={row.cells[ci]?.content ?? ''}
                        onChange={(v) => onUpdateCell(row.id, ci, v)}
                        placeholder="..."
                      />
                    </td>
                  ))}
                  <td className="border-0 pl-1">
                    {rows.length > 1 && (
                      <button
                        onClick={() => onDeleteRow(row.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 p-0.5 rounded"
                        title={t('editor.deleteRow')}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
      <input
        id="load-table-input"
        type="file"
        accept=".json"
        onChange={onLoadFileChange}
        className="hidden"
      />
    </Card>
  );
}
