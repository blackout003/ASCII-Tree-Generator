import { FolderTree, Table, BarChart2, Type, BookMarked } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

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
  {
    id: 'markdown-guide',
    href: '/tools/markdown-guide',
    icon: BookMarked,
    nameKey: 'markdownGuide',
  },
];
