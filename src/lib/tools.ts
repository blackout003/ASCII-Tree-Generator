import { FolderTree, Table, BarChart2, Type, BookMarked, Smile, FileText } from '@/components/icons';
import type { LucideIcon } from '@/components/icons';

export interface Tool {
  id: string;
  href: string;
  icon: LucideIcon;
  nameKey: string;
  comingSoon?: boolean;
}

export const TOOLS: Tool[] = [
  {
    id: 'ascii-tree',
    href: '/tools/ascii-tree',
    icon: FolderTree,
    nameKey: 'asciiTree',
  },
  {
    id: 'ascii-table',
    href: '/tools/ascii-table',
    icon: Table,
    nameKey: 'asciiTable',
  },
  {
    id: 'sparkline',
    href: '/tools/sparkline',
    icon: BarChart2,
    nameKey: 'sparkline',
  },
  {
    id: 'banner',
    href: '/tools/banner',
    icon: Type,
    nameKey: 'banner',
  },
];

/**
 * Resources are reference/guide pages — not ASCII generators. They live in their
 * own navigation section, separate from {@link TOOLS}.
 */
export const RESOURCES: Tool[] = [
  {
    id: 'readme-file-tree-guide',
    href: '/guides/file-tree-for-github-readme',
    icon: FileText,
    nameKey: 'readmeGuide',
  },
  {
    id: 'markdown-guide',
    href: '/tools/markdown-guide',
    icon: BookMarked,
    nameKey: 'markdownGuide',
  },
  {
    id: 'ascii-emoji',
    href: '/tools/ascii-emoji',
    icon: Smile,
    nameKey: 'asciiEmoji',
  },
];
