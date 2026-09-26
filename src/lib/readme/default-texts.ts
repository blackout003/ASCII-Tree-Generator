import type { ReadmeLanguage } from './types';

export type TextKey =
  | 'toc'
  | 'installation'
  | 'prerequisites'
  | 'usage'
  | 'architecture'
  | 'roadmap'
  | 'contributing'
  | 'license'
  | 'acknowledgements'
  | 'screenshot'
  | 'licenseSentence'
  | 'greeting'
  | 'bio'
  | 'bioAnonymous'
  | 'skills'
  | 'stats'
  | 'trophies'
  | 'blog'
  | 'contact'
  | 'statsAlt'
  | 'languagesAlt'
  | 'trophiesAlt';

/**
 * Text that ends up inside the generated README (section headings, the license
 * sentence, image alt texts). It follows `meta.language`, not the interface
 * language, so it lives here rather than in the next-intl messages. Placeholders
 * (`{license}`, `{name}`, `{username}`) are replaced at render time.
 */
export const DEFAULT_TEXTS: Record<ReadmeLanguage, Record<TextKey, string>> = {
  fr: {
    toc: 'Table des matières',
    installation: 'Installation',
    prerequisites: 'Prérequis',
    usage: 'Utilisation',
    architecture: 'Architecture',
    roadmap: 'Feuille de route',
    contributing: 'Contribuer',
    license: 'Licence',
    acknowledgements: 'Remerciements',
    screenshot: "Capture d'écran",
    licenseSentence: "Distribué sous licence {license}. Voir [LICENSE](LICENSE) pour plus d'informations.",
    greeting: "Salut, moi c'est {name}",
    bio: "Salut 👋, moi c'est {name}",
    bioAnonymous: 'Salut 👋',
    skills: 'Compétences',
    stats: 'Statistiques GitHub',
    trophies: 'Trophées',
    blog: 'Derniers articles',
    contact: 'Me contacter',
    statsAlt: 'Statistiques GitHub de {username}',
    languagesAlt: 'Langages les plus utilisés par {username}',
    trophiesAlt: 'Trophées GitHub de {username}',
  },
  en: {
    toc: 'Table of contents',
    installation: 'Installation',
    prerequisites: 'Prerequisites',
    usage: 'Usage',
    architecture: 'Architecture',
    roadmap: 'Roadmap',
    contributing: 'Contributing',
    license: 'License',
    acknowledgements: 'Acknowledgements',
    screenshot: 'Screenshot',
    licenseSentence: 'Distributed under the {license} license. See [LICENSE](LICENSE) for more information.',
    greeting: "Hi, I'm {name}",
    bio: "Hi 👋, I'm {name}",
    bioAnonymous: 'Hi there 👋',
    skills: 'Skills',
    stats: 'GitHub stats',
    trophies: 'Trophies',
    blog: 'Latest blog posts',
    contact: 'Get in touch',
    statsAlt: "{username}'s GitHub stats",
    languagesAlt: 'Most used languages of {username}',
    trophiesAlt: 'GitHub trophies of {username}',
  },
  es: {
    toc: 'Tabla de contenidos',
    installation: 'Instalación',
    prerequisites: 'Requisitos previos',
    usage: 'Uso',
    architecture: 'Arquitectura',
    roadmap: 'Hoja de ruta',
    contributing: 'Contribuir',
    license: 'Licencia',
    acknowledgements: 'Agradecimientos',
    screenshot: 'Captura de pantalla',
    licenseSentence: 'Distribuido bajo la licencia {license}. Consulta [LICENSE](LICENSE) para más información.',
    greeting: 'Hola, soy {name}',
    bio: 'Hola 👋, soy {name}',
    bioAnonymous: 'Hola 👋',
    skills: 'Habilidades',
    stats: 'Estadísticas de GitHub',
    trophies: 'Trofeos',
    blog: 'Últimos artículos',
    contact: 'Contacto',
    statsAlt: 'Estadísticas de GitHub de {username}',
    languagesAlt: 'Lenguajes más usados por {username}',
    trophiesAlt: 'Trofeos de GitHub de {username}',
  },
  de: {
    toc: 'Inhaltsverzeichnis',
    installation: 'Installation',
    prerequisites: 'Voraussetzungen',
    usage: 'Verwendung',
    architecture: 'Architektur',
    roadmap: 'Roadmap',
    contributing: 'Mitwirken',
    license: 'Lizenz',
    acknowledgements: 'Danksagungen',
    screenshot: 'Screenshot',
    licenseSentence: 'Veröffentlicht unter der {license}-Lizenz. Weitere Informationen in [LICENSE](LICENSE).',
    greeting: 'Hallo, ich bin {name}',
    bio: 'Hallo 👋, ich bin {name}',
    bioAnonymous: 'Hallo 👋',
    skills: 'Fähigkeiten',
    stats: 'GitHub-Statistiken',
    trophies: 'Trophäen',
    blog: 'Neueste Blogbeiträge',
    contact: 'Kontakt',
    statsAlt: 'GitHub-Statistiken von {username}',
    languagesAlt: 'Meistgenutzte Sprachen von {username}',
    trophiesAlt: 'GitHub-Trophäen von {username}',
  },
  it: {
    toc: 'Indice',
    installation: 'Installazione',
    prerequisites: 'Prerequisiti',
    usage: 'Utilizzo',
    architecture: 'Architettura',
    roadmap: 'Roadmap',
    contributing: 'Contribuire',
    license: 'Licenza',
    acknowledgements: 'Ringraziamenti',
    screenshot: 'Schermata',
    licenseSentence: 'Distribuito con licenza {license}. Vedi [LICENSE](LICENSE) per maggiori informazioni.',
    greeting: 'Ciao, sono {name}',
    bio: 'Ciao 👋, sono {name}',
    bioAnonymous: 'Ciao 👋',
    skills: 'Competenze',
    stats: 'Statistiche GitHub',
    trophies: 'Trofei',
    blog: 'Ultimi articoli',
    contact: 'Contatti',
    statsAlt: 'Statistiche GitHub di {username}',
    languagesAlt: 'Linguaggi più usati da {username}',
    trophiesAlt: 'Trofei GitHub di {username}',
  },
  pt: {
    toc: 'Índice',
    installation: 'Instalação',
    prerequisites: 'Pré-requisitos',
    usage: 'Utilização',
    architecture: 'Arquitetura',
    roadmap: 'Roteiro',
    contributing: 'Contribuir',
    license: 'Licença',
    acknowledgements: 'Agradecimentos',
    screenshot: 'Captura de ecrã',
    licenseSentence: 'Distribuído sob a licença {license}. Consulte [LICENSE](LICENSE) para mais informações.',
    greeting: 'Olá, eu sou {name}',
    bio: 'Olá 👋, eu sou {name}',
    bioAnonymous: 'Olá 👋',
    skills: 'Competências',
    stats: 'Estatísticas do GitHub',
    trophies: 'Troféus',
    blog: 'Últimos artigos',
    contact: 'Contacto',
    statsAlt: 'Estatísticas do GitHub de {username}',
    languagesAlt: 'Linguagens mais usadas por {username}',
    trophiesAlt: 'Troféus do GitHub de {username}',
  },
  ru: {
    toc: 'Содержание',
    installation: 'Установка',
    prerequisites: 'Требования',
    usage: 'Использование',
    architecture: 'Архитектура',
    roadmap: 'Дорожная карта',
    contributing: 'Участие в разработке',
    license: 'Лицензия',
    acknowledgements: 'Благодарности',
    screenshot: 'Снимок экрана',
    licenseSentence: 'Распространяется по лицензии {license}. Подробности см. в [LICENSE](LICENSE).',
    greeting: 'Привет, я {name}',
    bio: 'Привет 👋, я {name}',
    bioAnonymous: 'Привет 👋',
    skills: 'Навыки',
    stats: 'Статистика GitHub',
    trophies: 'Трофеи',
    blog: 'Последние статьи',
    contact: 'Связаться со мной',
    statsAlt: 'Статистика GitHub пользователя {username}',
    languagesAlt: 'Самые используемые языки {username}',
    trophiesAlt: 'Трофеи GitHub пользователя {username}',
  },
  ja: {
    toc: '目次',
    installation: 'インストール',
    prerequisites: '前提条件',
    usage: '使い方',
    architecture: 'アーキテクチャ',
    roadmap: 'ロードマップ',
    contributing: 'コントリビューション',
    license: 'ライセンス',
    acknowledgements: '謝辞',
    screenshot: 'スクリーンショット',
    licenseSentence: '{license}ライセンスの下で配布されています。詳細は[LICENSE](LICENSE)をご覧ください。',
    greeting: 'こんにちは、{name}です',
    bio: 'こんにちは 👋 {name}です',
    bioAnonymous: 'こんにちは 👋',
    skills: 'スキル',
    stats: 'GitHubの統計',
    trophies: 'トロフィー',
    blog: '最新のブログ記事',
    contact: '連絡先',
    statsAlt: '{username}のGitHub統計',
    languagesAlt: '{username}がよく使う言語',
    trophiesAlt: '{username}のGitHubトロフィー',
  },
};

// Templates (`{…}`) and the license sentence are not headings a user leaves untouched.
const DEFAULT_HEADINGS = new Set(
  Object.values(DEFAULT_TEXTS).flatMap((texts) =>
    Object.entries(texts)
      .filter(([key, value]) => key !== 'licenseSentence' && !value.includes('{'))
      .map(([, value]) => value)
  )
);

/** True when `value` is an untouched default heading, in any language. */
export function isDefaultText(value: string): boolean {
  return DEFAULT_HEADINGS.has(value);
}

export function getDefaultText(language: ReadmeLanguage, key: TextKey): string {
  return (DEFAULT_TEXTS[language] ?? DEFAULT_TEXTS.en)[key];
}
