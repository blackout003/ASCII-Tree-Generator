'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Home, Globe, Sun, Moon, Monitor, MoreHorizontal, PencilRuler } from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ChangelogDialog } from '@/components/tools-nav/changelog-dialog';
import { TOOLS, RESOURCES } from '@/lib/tools';
import { locales, localeNames, type Locale } from '@/i18n/locales';

const localeFlags: Record<Locale, string> = {
  fr: '🇫🇷',
  en: '🇬🇧',
  it: '🇮🇹',
  es: '🇪🇸',
  de: '🇩🇪',
  pt: '🇧🇷',
  ru: '🇷🇺',
  ja: '🇯🇵',
};

export function ToolsSidebar() {
  const t = useTranslations('nav');
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const switchLanguage = (newLocale: Locale) => {
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const themeLabels: Record<string, string> = { light: 'Clair', dark: 'Sombre', system: 'Système' };
  const currentThemeLabel = mounted ? (themeLabels[theme ?? 'system'] ?? 'Système') : 'Système';

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={`/${locale}`}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground overflow-hidden">
                  <PencilRuler className="size-5" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
                  <span className="font-semibold">ASCII Tools</span>
                  <span className="text-xs text-muted-foreground">asciitree.fr</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={t('home')}>
                <Link href={`/${locale}`} className="flex items-center gap-2 w-full">
                  <Home className="size-4" />
                  <span>{t('home')}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t('tools')}</SidebarGroupLabel>
          <SidebarMenu>
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              const href = `/${locale}${tool.href}`;
              const isActive = pathname.includes(tool.href);

              return (
                <SidebarMenuItem key={tool.id}>
                  <SidebarMenuButton
                    asChild={!tool.comingSoon}
                    isActive={isActive}
                    disabled={tool.comingSoon}
                    tooltip={t(tool.nameKey as Parameters<typeof t>[0])}
                  >
                    {tool.comingSoon ? (
                      <span className="flex items-center gap-2 w-full">
                        <Icon className="size-4" />
                        <span>{t(tool.nameKey as Parameters<typeof t>[0])}</span>
                        <Badge variant="secondary" className="ml-auto text-xs py-0">
                          {t('comingSoon')}
                        </Badge>
                      </span>
                    ) : (
                      <Link href={href} className="flex items-center gap-2 w-full">
                        <Icon className="size-4" />
                        <span>{t(tool.nameKey as Parameters<typeof t>[0])}</span>
                      </Link>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t('resources')}</SidebarGroupLabel>
          <SidebarMenu>
            {RESOURCES.map((resource) => {
              const Icon = resource.icon;
              const href = `/${locale}${resource.href}`;
              const isActive = pathname.includes(resource.href);

              return (
                <SidebarMenuItem key={resource.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={t(resource.nameKey as Parameters<typeof t>[0])}
                  >
                    <Link href={href} className="flex items-center gap-2 w-full">
                      <Icon className="size-4" />
                      <span>{t(resource.nameKey as Parameters<typeof t>[0])}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton tooltip={localeNames[locale]}>
                  <Globe className="size-4" />
                  <span>{localeNames[locale]}</span>
                  <MoreHorizontal className="ml-auto size-4 opacity-50" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="end" className="min-w-[160px]">
                {locales.map((loc) => (
                  <DropdownMenuItem
                    key={loc}
                    onClick={() => switchLanguage(loc as Locale)}
                    className={locale === loc ? 'bg-accent' : ''}
                  >
                    <span className="mr-2">{localeFlags[loc as Locale]}</span>
                    {localeNames[loc]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton tooltip={currentThemeLabel}>
                  <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span>{currentThemeLabel}</span>
                  <MoreHorizontal className="ml-auto size-4 opacity-50" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="end">
                <DropdownMenuItem onClick={() => setTheme('light')}>
                  <Sun className="mr-2 h-4 w-4" />
                  Clair
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                  <Moon className="mr-2 h-4 w-4" />
                  Sombre
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                  <Monitor className="mr-2 h-4 w-4" />
                  Système
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <ChangelogDialog />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
