import { FolderTree, Table } from 'lucide-react';
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
];
