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
  | 'licenseSentence';

/**
 * Text that ends up inside the generated README (section headings, the license
 * sentence). It follows `meta.language`, not the interface language, so it lives
 * here rather than in the next-intl messages. `{license}` is replaced at render.
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
  },
};

export function getDefaultText(language: ReadmeLanguage, key: TextKey): string {
  return (DEFAULT_TEXTS[language] ?? DEFAULT_TEXTS.en)[key];
}
