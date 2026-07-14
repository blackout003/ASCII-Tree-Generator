import type { Metadata } from 'next';
import Link from 'next/link';
import { AppLayout } from '@/components/tools-nav/app-layout';
import { FooterInternational } from '@/components/ui/footer-international';
import { StructuredData } from '@/components/ui/structured-data-server';
import { SEO_CONFIG } from '@/lib/seo-config';
import { locales, defaultLocale } from '@/i18n/locales';
import { getFileTreeGuide, GUIDE_SLUG } from '@/lib/guides/file-tree-guide';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const guide = getFileTreeGuide(locale);
  const path = `/${locale}/guides/${GUIDE_SLUG}`;
  const languages: Record<string, string> = Object.fromEntries(
    locales.map((l) => [l, `/${l}/guides/${GUIDE_SLUG}`])
  );
  languages['x-default'] = `/${defaultLocale}/guides/${GUIDE_SLUG}`;

  return {
    title: guide.metaTitle,
    description: guide.metaDescription,
    alternates: { canonical: path, languages },
    openGraph: {
      title: guide.metaTitle,
      description: guide.metaDescription,
      url: `${SEO_CONFIG.baseUrl}${path}`,
      siteName: SEO_CONFIG.siteName,
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: guide.h1 }],
      locale,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.metaTitle,
      description: guide.metaDescription,
      images: ['/og-image.png'],
      creator: SEO_CONFIG.social.twitter.handle,
      site: SEO_CONFIG.social.twitter.site,
    },
  };
}

export default async function FileTreeGuidePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const guide = getFileTreeGuide(locale);
  const url = `${SEO_CONFIG.baseUrl}/${locale}/guides/${GUIDE_SLUG}`;
  const toolUrl = `/${locale}/tools/ascii-tree`;

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.h1,
    description: guide.metaDescription,
    inLanguage: locale,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    author: { '@type': 'Organization', name: SEO_CONFIG.siteName },
    publisher: { '@type': 'Organization', name: SEO_CONFIG.siteName },
    image: `${SEO_CONFIG.baseUrl}/og-image.png`,
  };

  const howToLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: guide.h1,
    description: guide.metaDescription,
    inLanguage: locale,
    step: guide.sections.map((s) => ({
      '@type': 'HowToStep',
      name: s.h2,
      text: s.body[0],
    })),
  };

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: guide.faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  return (
    <AppLayout>
      <div className="flex flex-1 flex-col overflow-y-auto">
        <main className="flex-1" role="main">
          <article className="container mx-auto px-6 max-w-3xl py-12">
            <h1 className="font-mono text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              {guide.h1}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{guide.lead}</p>

            {/* Primary CTA to the tool */}
            <div className="mt-8 rounded-lg border border-border bg-muted/30 p-6">
              <h2 className="font-mono text-lg font-semibold text-foreground">{guide.ctaTitle}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{guide.ctaBody}</p>
              <Link
                href={toolUrl}
                className="mt-4 inline-flex items-center rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90"
              >
                {guide.ctaButton}
              </Link>
            </div>

            {guide.sections.map((section, i) => (
              <section key={i} className="mt-10 border-t border-border pt-8">
                <h2 className="font-mono text-2xl font-bold tracking-tight text-foreground">
                  {section.h2}
                </h2>
                <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-muted-foreground">
                  {section.body.map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
                </div>
                {section.code && (
                  <figure className="mt-4">
                    {section.code.caption && (
                      <figcaption className="mb-1.5 font-mono text-xs uppercase tracking-wider text-muted-foreground/70">
                        {section.code.caption}
                      </figcaption>
                    )}
                    <pre className="overflow-x-auto rounded-md border border-border bg-muted/40 p-4 font-mono text-sm text-foreground">
                      <code>{section.code.text}</code>
                    </pre>
                  </figure>
                )}
              </section>
            ))}

            <section className="mt-10 border-t border-border pt-8">
              <h2 className="font-mono text-2xl font-bold tracking-tight text-foreground">
                {guide.faqHeading}
              </h2>
              <dl className="mt-6 space-y-6">
                {guide.faq.map((item, i) => (
                  <div key={i}>
                    <dt className="font-semibold text-foreground">{item.q}</dt>
                    <dd className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">{item.a}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </article>

          <FooterInternational />
        </main>
      </div>

      <StructuredData data={articleLd} />
      <StructuredData data={howToLd} />
      <StructuredData data={faqLd} />
    </AppLayout>
  );
}
