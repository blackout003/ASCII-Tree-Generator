'use client';

import { useTranslations } from 'next-intl';

/** A titled block ruled with a hairline, mono heading sitting on the rule like a fieldset legend. */
function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border pt-8">
      <h2 className="font-mono text-sm font-semibold uppercase tracking-[0.18em] text-foreground">
        {label}
      </h2>
      <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

/** A list where each item is prefixed by a monospace box-drawing marker. */
function AsciiList({ items, last = '└─', mid = '├─' }: { items: string[]; last?: string; mid?: string }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span aria-hidden="true" className="font-mono text-muted-foreground/70 select-none">
            {i === items.length - 1 ? last : mid}
          </span>
          <span className="text-foreground/80">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function SeoContentSection() {
  const t = useTranslations('seoContent');

  return (
    <section className="container mx-auto px-6 max-w-5xl mt-16 pb-4">
      <div className="border-t border-border pt-10">
        <h2 className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {t('title')}
        </h2>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground">
          {t('intro')}
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
        <Block label={t('whyUse.title')}>
          <p>{t('whyUse.para1')}</p>
          <AsciiList
            items={[
              t('whyUse.benefit1'),
              t('whyUse.benefit2'),
              t('whyUse.benefit3'),
              t('whyUse.benefit4'),
            ]}
          />
        </Block>

        <Block label={t('howToUse.title')}>
          <p>{t('howToUse.para1')}</p>
          <ol className="space-y-2.5">
            {[t('howToUse.step1'), t('howToUse.step2'), t('howToUse.step3'), t('howToUse.step4')].map(
              (step, i) => (
                <li key={i} className="flex gap-3">
                  <span aria-hidden="true" className="font-mono text-muted-foreground/70 tabular-nums select-none">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-foreground/80">{step}</span>
                </li>
              )
            )}
          </ol>
          <p>{t('howToUse.para2')}</p>
        </Block>

        <Block label={t('useCases.title')}>
          <p>{t('useCases.para1')}</p>
          <AsciiList
            items={[
              t('useCases.useCase1'),
              t('useCases.useCase2'),
              t('useCases.useCase3'),
              t('useCases.useCase4'),
            ]}
          />
          <p>{t('useCases.para2')}</p>
        </Block>

        <Block label={t('features.title')}>
          <p>{t('features.para1')}</p>
          <AsciiList
            items={[
              t('features.feature1'),
              t('features.feature2'),
              t('features.feature3'),
              t('features.feature4'),
              t('features.feature5'),
              t('features.feature6'),
            ]}
          />
          <p>{t('features.para2')}</p>
        </Block>
      </div>
    </section>
  );
}
