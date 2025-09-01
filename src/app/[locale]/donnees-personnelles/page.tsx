import LegalPageWrapper from '@/components/legal/legal-page-wrapper';
import { FooterInternational } from '@/components/ui/footer-international';

export default function DonneesPersonnellesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1" role="main">
        <LegalPageWrapper type="privacy" />
      </main>
      <FooterInternational />
    </div>
  );
}
