import TreeGenerator from '@/components/generator/tree-generator';
import { Footer } from '@/components/ui/footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <TreeGenerator />
      </main>
      <Footer />
    </div>
  );
}
