import { SeparatorOptions } from './separator-types';

export function generateLine(char: string, width: number): string {
  if (!char || width <= 0) return '';
  return char.repeat(width);
}

export function generateBadge(label: string, style: SeparatorOptions['badgeStyle']): string {
  const text = label.trim();
  if (!text) return '';
  switch (style) {
    case 'brackets':
      return `[ ${text} ]`;
    case 'dashes':
      return `-- ${text} --`;
    case 'block':
      return `█ ${text} █`;
  }
}

function centerText(text: string, width: number): string {
  const pad = Math.max(0, width - text.length);
  const left = Math.floor(pad / 2);
  const right = pad - left;
  return ' '.repeat(left) + text + ' '.repeat(right);
}

export function generateCommentBlock(
  title: string,
  lang: SeparatorOptions['commentLang'],
  width: number
): string {
  const text = title.trim();
  if (!text) return '';
  const innerWidth = Math.max(text.length + 4, width);
  const rule = '-'.repeat(innerWidth);
  const centered = centerText(text.toUpperCase(), innerWidth);

  if (lang === 'c') {
    return [`/* ${rule} */`, `/* ${centered} */`, `/* ${rule} */`].join('\n');
  }
  return [`# ${rule}`, `# ${centered}`, `# ${rule}`].join('\n');
}

export function generateBlock(label: string, options: SeparatorOptions): string {
  switch (options.blockType) {
    case 'line':
      return generateLine(options.lineChar, options.width);
    case 'badge':
      return generateBadge(label, options.badgeStyle);
    case 'comment':
      return generateCommentBlock(label, options.commentLang, options.width);
  }
}
