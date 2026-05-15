import Link from 'next/link';
import { FooterInternational } from '@/components/ui/footer-international';
import { StructuredData } from '@/components/ui/structured-data-server';
import { generateWebsiteStructuredData, generateBreadcrumbStructuredData } from '@/lib/structured-data-server';
import { SeoContentSection } from '@/components/home/seo-content-section';
import { locales } from '@/i18n/locales';
import { getTranslations } from 'next-intl/server';
import { AppLayout } from '@/components/tools-nav/app-layout';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'nav' });

  return (
    <AppLayout>
      <div className="flex flex-1 flex-col overflow-y-auto">
        <main className="flex-1" role="main" aria-label="Générateur d'arbre ASCII">
          <SeoContentSection />
        </main>

        <FooterInternational />
      </div>

      <StructuredData data={generateWebsiteStructuredData()} />
      <StructuredData data={generateBreadcrumbStructuredData()} />
    </AppLayout>
  );
}
