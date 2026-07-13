import { MetadataRoute } from 'next'
import { locales, defaultLocale } from '@/i18n/locales'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://asciitree.fr'

// Routes rendered for every locale, with their relative priority.
const localizedRoutes: { path: string; priority: number }[] = [
  { path: '', priority: 1 },
  { path: '/tools', priority: 0.9 },
  { path: '/tools/ascii-tree', priority: 0.9 },
  { path: '/tools/ascii-table', priority: 0.8 },
  { path: '/tools/banner', priority: 0.8 },
  { path: '/tools/sparkline', priority: 0.8 },
  { path: '/tools/ascii-emoji', priority: 0.8 },
  { path: '/tools/markdown-guide', priority: 0.8 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  // Build hreflang alternates once per route so every localized URL cross-links.
  const entries: MetadataRoute.Sitemap = []

  for (const { path, priority } of localizedRoutes) {
    const languages = Object.fromEntries(
      locales.map((locale) => [locale, `${baseUrl}/${locale}${path}`])
    ) as Record<string, string>
    languages['x-default'] = `${baseUrl}/${defaultLocale}${path}`

    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}/${locale}${path}`,
        lastModified,
        changeFrequency: 'weekly',
        priority: locale === defaultLocale ? priority : Math.max(0.5, priority - 0.2),
        alternates: { languages },
      })
    }
  }

  // Root (redirects to the default locale).
  entries.unshift({
    url: baseUrl,
    lastModified,
    changeFrequency: 'weekly',
    priority: 1,
  })

  return entries
}
