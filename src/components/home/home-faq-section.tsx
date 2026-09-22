// Server component: visible FAQ + FAQPage JSON-LD for the homepage hub.
import { StructuredData } from '@/components/ui/structured-data-server';
import { generateFAQStructuredData } from '@/lib/structured-data-server';
import { getHomeFaq } from '@/lib/home-faq-content';

export function HomeFaqSection({ locale }: { locale: string }) {
  const faq = getHomeFaq(locale);

  return (
    <section className="container mx-auto px-6 max-w-5xl mt-4 pb-4">
      <div className="border-t border-border pt-8">
        <h2 className="font-mono text-sm font-semibold uppercase tracking-[0.18em] text-foreground">
          FAQ
        </h2>
        <dl className="mt-6 space-y-6">
          {faq.map((item, i) => (
            <div key={i} className="flex gap-3">
              <span aria-hidden="true" className="font-mono text-muted-foreground/70 select-none">
                {i === faq.length - 1 ? '└─' : '├─'}
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

      <StructuredData data={generateFAQStructuredData(faq)} />
    </section>
  );
}
