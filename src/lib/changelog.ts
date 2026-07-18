/**
 * Version actuelle de l'application, affichée dans la barre latérale.
 * Doit rester synchronisée avec le champ "version" de package.json et CHANGELOG.md.
 */
export const APP_VERSION = '2.1.0';

export interface ChangelogSection {
  /** Titre de la section (ex: "Ajouté", "Modifié"). */
  title: string;
  items: string[];
}

export interface ChangelogEntry {
  version: string;
  /** Date au format ISO (AAAA-MM-JJ) ou undefined si non datée. */
  date?: string;
  /** Résumé court de la version. */
  summary?: string;
  sections: ChangelogSection[];
}

/**
 * Historique des versions, de la plus récente à la plus ancienne.
 * Source lisible : CHANGELOG.md à la racine du projet.
 */
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '2.1.0',
    date: '2026-07-18',
    summary:
      'Ajout d’un éditeur Markdown avec aperçu en direct, barre de formatage, coloration du code et export.',
    sections: [
      {
        title: 'Ajouté',
        items: [
          'Éditeur Markdown : édition en direct avec aperçu côte à côte.',
          'Prise en charge du GitHub Flavored Markdown (tableaux, listes de tâches, texte barré).',
          'Coloration syntaxique des blocs de code dans l’aperçu.',
          'Barre de formatage (gras, italique, titres, listes, citations, code, liens).',
          'Export : copie du Markdown, copie du HTML rendu et téléchargement en .md.',
          'Modes d’affichage (partagé, éditeur seul, aperçu seul) et localisation dans les 8 langues.',
        ],
      },
    ],
  },
  {
    version: '2.0.0',
    date: '2026-07-14',
    summary:
      "Passage d'un générateur unique à une suite d'outils ASCII complète, avec navigation dédiée, guides de référence et localisation dans 8 langues.",
    sections: [
      {
        title: 'Ajouté',
        items: [
          'Nouvelle architecture multi-outils avec barre latérale, en-tête et mise en page partagée.',
          'Générateur de tableaux ASCII (gestion des lignes et alignement).',
          'Sparklines ASCII et graphiques en barres.',
          'Générateur de bannières en art ASCII avec aperçu en direct.',
          'Outil emoji ASCII classé par catégories, avec recherche.',
          'Guide Markdown de référence.',
          'Section Ressources regroupant les guides.',
          "Section outils sur la page d'accueil avec animations.",
          "Pied de page enrichi d'une section dédiée aux outils.",
        ],
      },
      {
        title: 'Modifié',
        items: [
          'Localisation étendue pour les 8 langues (fr, en, es, de, it, pt, ru, ja).',
          'Variables de thème de la barre latérale migrées vers des propriétés CSS personnalisées.',
          "Réinitialisation du contenu lors du changement d'options du générateur d'arborescence.",
          'Barre latérale réduite : masquage des informations additionnelles.',
        ],
      },
    ],
  },
  {
    version: '1.0.0',
    summary: "Générateur d'arborescence ASCII initial.",
    sections: [
      {
        title: 'Ajouté',
        items: [
          "Édition de l'arbre avec glisser-déposer.",
          'Options de rendu (styles Unicode et ASCII), aperçu, copie et téléchargement.',
          'Internationalisation initiale et pages légales.',
        ],
      },
    ],
  },
];
