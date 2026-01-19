import TreeGenerator from '@/components/generator/tree-generator';
import { FooterInternational } from '@/components/ui/footer-international';
import { StructuredData } from '@/components/ui/structured-data-server';
import { generateWebsiteStructuredData, generateBreadcrumbStructuredData } from '@/lib/structured-data-server';
import { SeoContentSection } from '@/components/home/seo-content-section';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1" role="main" aria-label="Générateur d'arbre ASCII">
        <TreeGenerator />
        <SeoContentSection />
      </main>
      
      <FooterInternational />
      
      {/* Données structurées pour le SEO */}
      <StructuredData data={generateWebsiteStructuredData()} />
      <StructuredData data={generateBreadcrumbStructuredData()} />
    </div>
  );
}
