import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://asciitree.fr'
  
  const locales = ['fr', 'en', 'es', 'de', 'it']
  
  const routes = locales.map((locale) => ({
    url: `${baseUrl}/${locale}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: locale === 'fr' ? 1 : 0.8,
  }))
  
  // Page d'accueil (redirection vers /fr)
  routes.unshift({
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 1,
  })
  
  return routes
}
