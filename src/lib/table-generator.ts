import { TableData, TableOptions, Alignment } from './table-types';

function padCell(content: string, width: number, alignment: Alignment, padding: number): string {
  const pad = ' '.repeat(padding);
  const available = width - padding * 2;
  const len = content.length;

  let padded: string;
  if (alignment === 'center') {
    const total = available - len;
    const left = Math.floor(total / 2);
    const right = total - left;
    padded = ' '.repeat(Math.max(0, left)) + content + ' '.repeat(Math.max(0, right));
  } else if (alignment === 'right') {
    padded = content.padStart(available);
  } else {
    padded = content.padEnd(available);
  }

  return pad + padded + pad;
}

export function generateASCIITable(data: TableData, options: TableOptions): string {
  const { borderStyle, hasHeader, alignment, padding } = options;
  const { columns, rows } = data;

  if (columns.length === 0) return '';

  // Contenu d'une ligne indexé par colonne (et non par row.cells) : garantit un
  // tableau rectangulaire même si les données chargées sont "ragged".
  const rowContent = (row: TableData['rows'][number]): string[] =>
    columns.map((_, i) => row.cells[i]?.content ?? '');

  // Calcul largeur maximale par colonne
  const colWidths: number[] = columns.map((col, i) => {
    const headerLen = hasHeader ? col.length : 0;
    const maxData = rows.reduce((max, row) => {
      const cell = row.cells[i]?.content ?? '';
      return Math.max(max, cell.length);
    }, 0);
    return Math.max(headerLen, maxData) + padding * 2;
  });

  const lines: string[] = [];

  if (borderStyle === 'unicode') {
    const top = '┌' + colWidths.map(w => '─'.repeat(w)).join('┬') + '┐';
    const mid = '├' + colWidths.map(w => '─'.repeat(w)).join('┼') + '┤';
    const bot = '└' + colWidths.map(w => '─'.repeat(w)).join('┴') + '┘';

    const buildRow = (cells: string[]) =>
      '│' + cells.map((c, i) => padCell(c, colWidths[i], alignment, padding)).join('│') + '│';

    lines.push(top);
    if (hasHeader) {
      lines.push(buildRow(columns));
      if (rows.length > 0) lines.push(mid);
    }
    rows.forEach((row, ri) => {
      lines.push(buildRow(rowContent(row)));
      if (ri < rows.length - 1) lines.push(mid);
    });
    lines.push(bot);

  } else if (borderStyle === 'ascii') {
    const sep = '+' + colWidths.map(w => '-'.repeat(w)).join('+') + '+';

    const buildRow = (cells: string[]) =>
      '|' + cells.map((c, i) => padCell(c, colWidths[i], alignment, padding)).join('|') + '|';

    lines.push(sep);
    if (hasHeader) {
      lines.push(buildRow(columns));
      lines.push(sep);
    }
    rows.forEach(row => {
      lines.push(buildRow(rowContent(row)));
    });
    lines.push(sep);

  } else if (borderStyle === 'markdown') {
    // Échappe les caractères qui casseraient la structure du tableau Markdown.
    const escapeMd = (s: string) => s.replace(/\|/g, '\\|').replace(/\n/g, ' ');
    const buildRow = (cells: string[]) =>
      '|' + cells.map((c, i) => padCell(escapeMd(c), colWidths[i], alignment, padding)).join('|') + '|';

    const buildSep = () => {
      return '|' + colWidths.map(w => {
        // Markdown impose au moins un tiret ; on garantit une largeur minimale.
        const inner = '-'.repeat(Math.max(alignment === 'center' ? 2 : 1, w));
        if (alignment === 'center') return ':' + inner.slice(1, -1) + ':';
        if (alignment === 'right') return inner.slice(0, -1) + ':';
        return inner;
      }).join('|') + '|';
    };

    if (hasHeader) {
      lines.push(buildRow(columns));
      lines.push(buildSep());
    } else {
      // Markdown requires a header row; use empty headers
      lines.push(buildRow(columns.map(() => '')));
      lines.push(buildSep());
    }
    rows.forEach(row => lines.push(buildRow(rowContent(row))));

  } else {
    // simple
    const buildRow = (cells: string[], widths: number[]) =>
      cells.map((c, i) => c.padEnd(widths[i])).join('  ');

    const simpleWidths = colWidths.map(w => w - padding * 2);

    if (hasHeader) {
      lines.push(buildRow(columns, simpleWidths));
      lines.push(buildRow(simpleWidths.map(w => '-'.repeat(w)), simpleWidths));
    }
    rows.forEach(row => lines.push(buildRow(rowContent(row), simpleWidths)));
  }

  return lines.join('\n');
}
