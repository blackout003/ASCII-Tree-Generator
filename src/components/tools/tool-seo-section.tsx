// Server component: indexable SEO copy + FAQ rendered below each tool, plus
// FAQPage and SoftwareApplication JSON-LD for rich results.
import Link from 'next/link';
import { StructuredData } from '@/components/ui/structured-data-server';
import { SEO_CONFIG, getToolMetadata, type ToolSlug } from '@/lib/seo-config';
import { getToolContent } from '@/lib/tool-seo-content';
import { GUIDE_SLUG } from '@/lib/guides/file-tree-guide';

// Optional related-guide cross-link per tool (internal linking).
const RELATED_GUIDE: Partial<Record<ToolSlug, { slug: string; label: Record<string, string> }>> = {
  'ascii-tree': {
    slug: GUIDE_SLUG,
    label: {
      en: 'Guide: How to make a file tree for a GitHub README →',
      fr: 'Guide : Créer une arborescence de fichiers pour un README GitHub →',
    },
  },
};

export function ToolSeoSection({ tool, locale }: { tool: ToolSlug; locale: string }) {
  const content = getToolContent(tool, locale);
  const meta = getToolMetadata(tool, locale);
  const url = `${SEO_CONFIG.baseUrl}${meta.path}`;
  const related = RELATED_GUIDE[tool];

  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  const softwareStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: meta.title,
    description: meta.description,
    url,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web Browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    inLanguage: locale,
  };

  return (
    <section className="container mx-auto px-6 max-w-5xl mt-8 pb-12">
      <div className="border-t border-border pt-10">
        <h2 className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {content.heading}
        </h2>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground">
          {content.intro}
        </p>
      </div>

      <div className="mt-10 border-t border-border pt-8">
        <h3 className="font-mono text-sm font-semibold uppercase tracking-[0.18em] text-foreground">
          FAQ
        </h3>
        <dl className="mt-6 space-y-6">
          {content.faq.map((item, i) => (
            <div key={i} className="flex gap-3">
              <span aria-hidden="true" className="font-mono text-muted-foreground/70 select-none">
                {i === content.faq.length - 1 ? '└─' : '├─'}
              </span>
              <div>
                <dt className="font-semibold text-foreground">{item.q}</dt>
                <dd className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">
                  {item.a}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </div>

      {related && (
        <div className="mt-8 border-t border-border pt-6">
          <Link
            href={`/${locale}/guides/${related.slug}`}
            className="font-mono text-sm font-medium text-foreground underline-offset-4 hover:underline"
          >
            {related.label[locale] ?? related.label.en}
          </Link>
        </div>
      )}

      <StructuredData data={faqStructuredData} />
      <StructuredData data={softwareStructuredData} />
    </section>
  );
}
