// FAQ for the homepage hub, localized for all 8 supported locales. `en` is
// required and used as a safety fallback. Also powers the FAQPage JSON-LD.
export type FaqItem = { q: string; a: string };
type LocalizedFaq = { en: FaqItem[] } & Partial<Record<string, FaqItem[]>>;

const HOME_FAQ: LocalizedFaq = {
  en: [
    {
      q: 'How do I add an ASCII file tree to a GitHub README?',
      a: 'Build your folder structure in the ASCII Tree tool, copy the generated output, and paste it inside a fenced code block (```) in your README.md so the box-drawing characters stay aligned.',
    },
    {
      q: 'Are these ASCII tools compatible with every terminal?',
      a: 'Yes. Each tool lets you switch between Unicode connectors (├──, │) for a cleaner look on modern terminals and editors, and plain ASCII connectors (|--, \\--) for older terminals or environments without reliable Unicode support.',
    },
    {
      q: 'Do I need to install anything or create an account?',
      a: 'No. All tools run entirely in your browser — nothing is uploaded to a server, and there is no signup or installation required.',
    },
    {
      q: 'Is this ASCII toolbox really free?',
      a: 'Yes, every tool (file tree, table, sparkline, banner, QR code, Markdown editor and emoji picker) is free to use, with no usage limits.',
    },
  ],
  fr: [
    {
      q: 'Comment intégrer un arbre ASCII dans un README GitHub ?',
      a: "Construisez votre arborescence dans l'outil Arbre ASCII, copiez le résultat généré, puis collez-le dans un bloc de code (```) de votre README.md pour que les caractères d'encadrement restent alignés.",
    },
    {
      q: 'Ces outils ASCII sont-ils compatibles avec tous les terminaux ?',
      a: "Oui. Chaque outil permet de basculer entre connecteurs Unicode (├──, │), plus nets sur les terminaux et éditeurs modernes, et connecteurs ASCII simples (|--, \\--), plus sûrs pour les vieux terminaux ou les environnements sans support Unicode fiable.",
    },
    {
      q: 'Faut-il installer un logiciel ou créer un compte ?',
      a: "Non. Tous les outils fonctionnent entièrement dans votre navigateur — rien n'est envoyé à un serveur, et aucune inscription ni installation n'est nécessaire.",
    },
    {
      q: 'Cette boîte à outils ASCII est-elle vraiment gratuite ?',
      a: "Oui, chaque outil (arbre de fichiers, tableau, sparkline, bannière, QR code, éditeur Markdown et émojis) est gratuit et sans limite d'utilisation.",
    },
  ],
};

export function getHomeFaq(locale: string): FaqItem[] {
  return HOME_FAQ[locale] ?? HOME_FAQ.en;
}
