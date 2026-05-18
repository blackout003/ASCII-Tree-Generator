export interface TableCell {
  content: string;
}

export interface TableRow {
  id: string;
  cells: TableCell[];
}

export interface TableData {
  columns: string[];
  rows: TableRow[];
}

export type BorderStyle = 'unicode' | 'ascii' | 'markdown' | 'simple';
export type Alignment = 'left' | 'center' | 'right';

export interface TableOptions {
  borderStyle: BorderStyle;
  hasHeader: boolean;
  alignment: Alignment;
  padding: number;
}
