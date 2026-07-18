"use client"

import * as React from "react"
import { Globe } from "@/components/icons"
import { useLocale } from "next-intl"
import { useRouter, usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { locales, localeNames, type Locale } from "@/i18n/locales"

// Mapping des drapeaux pour chaque langue
const localeFlags: Record<Locale, string> = {
  fr: "🇫🇷",
  en: "🇬🇧",
  it: "🇮🇹",
  es: "🇪🇸",
  de: "🇩🇪",
  pt: "🇧🇷",
  ru: "🇷🇺",
  ja: "🇯🇵",
}

export function LanguageToggle() {
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()

  const switchLanguage = (newLocale: Locale) => {
    // Remove the current locale from the pathname and navigate to new locale
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/'
    router.push(`/${newLocale}${pathWithoutLocale}`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Changer de langue</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem 
            key={loc} 
            onClick={() => switchLanguage(loc)}
            className={locale === loc ? "bg-accent" : ""}
          >
            <span className="mr-2">{localeFlags[loc]}</span>
            {localeNames[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
