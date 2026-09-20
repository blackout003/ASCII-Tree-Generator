import { FooterInternational } from '@/components/ui/footer-international';
import { SeoContentSection } from '@/components/home/seo-content-section';
import { ToolsShowcase } from '@/components/home/tools-showcase';
import { AdSlot } from '@/components/ui/ad-slot';
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
        <main className="flex-1" role="main" aria-label="Boîte à outils ASCII">
          <ToolsShowcase />
          <AdSlot slot="home-mid" format="rectangle" className="container mx-auto my-10 px-4" />
          <SeoContentSection />
        </main>

        <FooterInternational />
      </div>
    </AppLayout>
  );
}
