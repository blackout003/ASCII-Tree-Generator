import TreeGenerator from '@/components/generator/tree-generator';
import { FooterInternational } from '@/components/ui/footer-international';
import { StructuredData } from '@/components/ui/structured-data-server';
import { generateWebsiteStructuredData, generateBreadcrumbStructuredData } from '@/lib/structured-data-server';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sr-only">
        <h1>Générateur d&apos;Arbre ASCII - Créez des structures de projet visuelles</h1>
        <p>Générateur d&apos;arbre ASCII gratuit et intuitif pour visualiser et créer la structure parfaite de votre projet</p>
      </header>
      
      <main className="flex-1" role="main" aria-label="Générateur d'arbre ASCII">
        <TreeGenerator />
      </main>
      
      <FooterInternational />
      
      {/* Données structurées pour le SEO */}
      <StructuredData data={generateWebsiteStructuredData()} />
      <StructuredData data={generateBreadcrumbStructuredData()} />
    </div>
  );
}
