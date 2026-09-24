# Générateur de README — Plan 3 : mode Profil et workflow blog

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Compléter le mode Profil du générateur de README : sept blocs (bannière animée, présentation, compétences, statistiques, trophées, articles de blog, contact), génération du workflow GitHub Actions qui remplit la zone d'articles, avertissements sur les services tiers, et assistant adapté au profil.

**Architecture:** On étend le registre de blocs des plans 1 et 2 : sept nouveaux modules purs et testés dans `src/lib/readme/blocks/`, quelques utilitaires partagés (`services.ts`, `skill-catalog.ts`) et un générateur de workflow pur (`workflow.ts`). L'interface ajoute sept formulaires, un panneau de guide pour le workflow et deux règles CSS pour l'aperçu clair/sombre.

**Tech Stack:** identique aux plans 1 et 2. Aucune nouvelle dépendance.

**Spec:** `docs/superpowers/specs/2026-09-24-readme-generator-design.md` (sections 5, 9, 10, 13). Plans précédents : `docs/superpowers/plans/2026-09-24-readme-generator-plan-1-socle.md`, `…-plan-2-mode-projet.md`.

**Périmètre et découpage.** La spec prévoyait trois plans ; ce plan-ci couvre le **contenu** du mode Profil et le workflow. L'**ouverture publique** (retrait de `noindex` et de `comingSoon`, accueil, sitemap, changelog, version 2.5.0) et le **durcissement** avant lancement (les mineurs différés des revues des plans 1 et 2) passent dans un **plan 4** : on n'ouvre au public qu'après ce durcissement. L'outil reste donc caché à l'issue de ce plan.

**Vérifié auprès des services eux-mêmes** (le 24 septembre 2026, à l'écriture du plan) :
- Les paramètres d'URL de skill-icons, readme-typing-svg, github-readme-stats et github-profile-trophy viennent de leurs README. Les URL construites par ce plan répondent `200 image/svg+xml` pour skill-icons, readme-typing-svg et Shields.
- **Le service public de github-readme-stats répond `503 DEPLOYMENT_PAUSED` et celui de github-profile-trophy `402 DEPLOYMENT_DISABLED`** : ces déploiements sont désactivés par leurs propriétaires. D'où la décision ci-dessous.
- L'identifiant skill-icons de Python est `py`, pas `python` (`python` n'existe pas). La liste des compétences du plan est vérifiée contre la liste officielle.
- Actions du workflow, épinglées par SHA de commit : `gautamkrishnar/blog-post-workflow` **1.9.7** = `f177491c77670f150ab4e9b9890254d8eba4164b` (le tag `v1` pointe sur le même commit) ; `actions/checkout` **v7.0.1** = `3d3c42e5aac5ba805825da76410c181273ba90b1`.

**Décisions prises avec l'utilisateur pour ce plan :**
- **URL de base obligatoire pour Statistiques et Trophées.** Aucune adresse publique par défaut : tant que le champ est vide, le bloc ne génère rien et un avertissement explique comment déployer sa propre instance. Ainsi aucun README n'est produit avec des images cassées. (La spec prévoyait un défaut public plus un avertissement ; l'état des services l'invalide.)

**Écarts assumés par rapport à la spec :**
- Pas d'avertissement « bloc Blog sans workflow téléchargé » dans le validateur : l'état « téléchargé » n'est pas une donnée du README. Un panneau de guide, visible tant qu'un bloc Blog est actif, remplit ce rôle.
- Un seul flux par bloc Blog, et un seul bloc Blog par README (le nom de la balise d'ancrage est fixe).
- Pas de carte « streak » : les statistiques se limitent à la carte générale et à celle des langages.
- Les cartes et icônes à thème existent en deux variantes, repérées par les fragments `#gh-light-mode-only` et `#gh-dark-mode-only` (mécanisme de GitHub), plutôt que par `<picture>` : l'aperçu peut ainsi les suivre avec son bouton clair/sombre.

## Global Constraints

- Aucune chaîne visible par l'utilisateur en dur dans les composants : tout passe par `useTranslations('readmeGenerator')`, avec les 8 locales `fr`, `en`, `es`, `de`, `it`, `pt`, `ru`, `ja`.
- Le texte produit **dans le README** (intitulés, textes alternatifs) vient de `DEFAULT_TEXTS` selon `meta.language`, jamais de next-intl.
- Pas de backend et aucune requête réseau : ce plan ne fait que **construire des URL** vers des services tiers et **générer un fichier**.
- Toute URL vers un service tiers se construit avec `safeUrl` et des paramètres encodés ; l'URL de base est validée par `parseBaseUrl` (https uniquement, sans paramètres ni fragment). Aucune valeur saisie n'est interpolée telle quelle dans une URL ou dans le YAML.
- Toute regex appliquée à du texte utilisateur est sans retour arrière quadratique et bornée en longueur (leçon des plans 1 et 2).
- Chaque bloc doit rester valide pour son propre schéma à partir de `meta` à sa longueur maximale (`META_LIMITS`) : le test de contrat du registre le vérifie.
- Le workflow généré épingle **chaque action à un SHA de commit complet**, avec la version en commentaire ; jamais un tag mobile.
- `generateReadme` reste pure ; l'aperçu rend exactement sa sortie.
- Aucune nouvelle dépendance. TypeScript strict, Zod 4, alias `@/*` → `src/*`.
- `vitest` ne lance que `tests/**/*.test.ts` en environnement `node` : la logique testable reste dans `src/lib/readme/`.
- Messages de commit en français, terminés par `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`.
- Contrat d'extension du registre : un nouveau bloc = un module dans `blocks/`, un littéral dans `BlockType`, une entrée dans `DEFINITIONS` (`registry.ts`), un cas dans `BlockForm` (`block-forms.tsx`) et les clés `blocks.<type>` dans les 8 locales.

## Review Focus

Entrées que la spec implique sans que les tâches nominales les couvrent ; chacune a son test dans la tâche indiquée.

1. Valeur saisie hostile dans une URL de service (`username` avec `&`, `/`, espace ou 40 caractères ; URL de base `http://…`, avec `?x=1`, `#`, espace, ou de 400 caractères) : aucune requête n'est produite, le bloc rend `''` et un avertissement précis s'affiche. Test : Tâches 2, 6.
2. Adresse de flux ou adresse de contact qui casserait le YAML ou le lien (`"` , `,`, retour à la ligne, `javascript:`, `mailto:` mal formé) : refusée avant d'atteindre le workflow ou le Markdown. Test : Tâches 2, 5, 7.
3. Texte de bannière contenant `;`, `+`, `%`, `#`, des apostrophes ou plus de cinq lignes : l'URL reste valide et le SVG affiche le texte voulu. Test : Tâche 4.
4. Identifiant d'icône inconnu ou dupliqué dans un fichier importé : ignoré ou dédoublonné, jamais envoyé au service. Test : Tâche 5.
5. Un README de profil relu après rechargement contient les mêmes blocs : chaque bloc créé à partir de `meta` maximal passe son schéma. Test : Tâche 1 (contrat du registre, étendu aux sept blocs).

En plus : les blocs Statistiques et Trophées ne génèrent **rien** tant que l'URL de base est vide (Tâche 6) ; le workflow n'est produit que si un bloc Blog actif a un flux valide (Tâche 7).

---

## Structure des fichiers

```
src/lib/readme/
  services.ts             cleanUsername, parseBaseUrl, param, themedPair, safeFeedUrl, safeEmail, safeWebUrl
  skill-catalog.ts        SKILL_GROUPS, SKILL_IDS, isSkillId, skillLabel
  workflow.ts             generateWorkflow, WORKFLOW_FILE_NAME
  blocks/banner.ts, bio.ts, skills.ts, stats.ts, trophies.ts, blog.ts, contact.ts
  (modifiés) types.ts, defaults.ts, default-texts.ts, persistence.ts, registry.ts
src/components/readme-generator/
  workflow-panel.tsx      guide en trois étapes et téléchargement du workflow
  (modifiés) block-forms.tsx, readme-wizard.tsx, readme-generator.tsx, readme-preview.css
tests/readme/             services, skill-catalog, blocks-profile, workflow, wizard + extensions
tests/i18n/readme-generator-profile-locales.test.ts
```

---

### Task 1: Nom d'utilisateur et textes par défaut du profil

**Files:**
- Modify: `src/lib/readme/types.ts`, `src/lib/readme/defaults.ts`, `src/lib/readme/persistence.ts`, `src/lib/readme/default-texts.ts` (réécriture complète)
- Test: `tests/readme/default-texts.test.ts`, `tests/readme/persistence.test.ts`, `tests/readme/registry.test.ts`, `tests/readme/wizard.test.ts`

**Interfaces:**
- Consumes: `META_LIMITS`, `EMPTY_META`, `ReadmeMeta`, `DEFAULT_TEXTS`, `isDefaultText`.
- Produces :
  - `ReadmeMeta` gagne `username: string` (nom d'utilisateur GitHub) ; `META_LIMITS.username = 39` ; `EMPTY_META.username = ''` ; l'enveloppe de persistance accepte un fichier sans `username` (défaut `''`).
  - `TextKey` gagne `'greeting' | 'bio' | 'bioAnonymous' | 'skills' | 'stats' | 'trophies' | 'blog' | 'contact' | 'statsAlt' | 'languagesAlt' | 'trophiesAlt'`. Les gabarits contiennent `{name}` (`greeting`, `bio`) ou `{username}` (`statsAlt`, `languagesAlt`, `trophiesAlt`).
  - `isDefaultText` ignore désormais tout texte contenant `{` (les gabarits ne sont pas des intitulés « par défaut » : leur valeur finale contient un nom).

- [ ] **Step 1: Écrire les tests qui échouent**

Modify `tests/readme/default-texts.test.ts` : remplacer la liste `KEYS`.

```ts
const KEYS: TextKey[] = [
  'toc', 'installation', 'prerequisites', 'usage', 'architecture', 'roadmap',
  'contributing', 'license', 'acknowledgements', 'screenshot', 'licenseSentence',
  'greeting', 'bio', 'bioAnonymous', 'skills', 'stats', 'trophies', 'blog', 'contact',
  'statsAlt', 'languagesAlt', 'trophiesAlt',
];
```

Dans le même fichier, ajouter avant la dernière ligne `});` :

```ts
  it.each(locales)('%s templates carry their placeholders', (language) => {
    const texts = DEFAULT_TEXTS[language];
    expect(texts.greeting).toContain('{name}');
    expect(texts.bio).toContain('{name}');
    for (const key of ['statsAlt', 'languagesAlt', 'trophiesAlt'] as const) {
      expect(texts[key], `${language}:${key}`).toContain('{username}');
    }
  });

  it('treats templates as custom text, not as an untouched default heading', () => {
    expect(isDefaultText('Skills')).toBe(true);
    expect(isDefaultText('Compétences')).toBe(true);
    expect(isDefaultText(DEFAULT_TEXTS.en.bio)).toBe(false);
    expect(isDefaultText(DEFAULT_TEXTS.fr.statsAlt)).toBe(false);
  });
```

Modify `tests/readme/persistence.test.ts` : remplacer la ligne

```ts
    expect(result.ok && result.state.meta).toEqual({ ...legacyMeta, installCommand: '', language: 'en' });
```

par

```ts
    expect(result.ok && result.state.meta).toEqual({ ...legacyMeta, installCommand: '', language: 'en', username: '' });
```

Puis ajouter dans `describe('parseReadmeState', …)`, avant le test `rejects a wrong version…` :

```ts
  it('keeps the GitHub username and rejects one longer than GitHub allows', () => {
    const meta = { ...EMPTY_META };
    const ok = parseReadmeState(fileWith({ meta: { ...meta, username: 'octocat' } }));
    expect(ok.ok && ok.state.meta.username).toBe('octocat');
    expect(parseReadmeState(fileWith({ meta: { ...meta, username: 'x'.repeat(40) } })).ok).toBe(false);
  });

```

Modify `tests/readme/registry.test.ts` : dans `maximalMeta`, ajouter après la ligne `installCommand` :

```ts
  username: 'x'.repeat(META_LIMITS.username),
```

Modify `tests/readme/wizard.test.ts` : dans l'objet `longest`, ajouter après la ligne `installCommand` :

```ts
      username: 'x'.repeat(META_LIMITS.username),
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run tests/readme/default-texts.test.ts tests/readme/persistence.test.ts`
Expected: FAIL. Les nouvelles clés sont `undefined` (`Cannot read properties of undefined`), et les deux tests de persistance sur `username` échouent.

- [ ] **Step 3: Étendre le modèle**

Modify `src/lib/readme/types.ts` : dans `ReadmeMeta`, remplacer

```ts
  installCommand: string;
  language: ReadmeLanguage;
}
```

par

```ts
  installCommand: string;
  language: ReadmeLanguage;
  /** GitHub username, used by the profile blocks (stats, trophies). */
  username: string;
}
```

Modify `src/lib/readme/defaults.ts` : remplacer

```ts
  installCommand: 300,
} as const;
```

par

```ts
  installCommand: 300,
  /** GitHub caps usernames at 39 characters. */
  username: 39,
} as const;
```

et remplacer

```ts
  installCommand: '',
  language: 'en',
};
```

par

```ts
  installCommand: '',
  language: 'en',
  username: '',
};
```

Modify `src/lib/readme/persistence.ts` : remplacer

```ts
    language: z.enum(locales).default('en'),
  }),
```

par

```ts
    language: z.enum(locales).default('en'),
    username: z.string().max(META_LIMITS.username).default(''),
  }),
```

- [ ] **Step 4: Réécrire les textes par défaut**

Replace `src/lib/readme/default-texts.ts` par :

```ts
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
```

- [ ] **Step 5: Vérifier que tout passe**

Run: `npx vitest run tests/readme && npx tsc --noEmit`
Expected: PASS ; aucune erreur de types.

- [ ] **Step 6: Commit**

```bash
git add src/lib/readme tests/readme
git commit -m "$(cat <<'EOF'
feat(readme): ajoute le nom d'utilisateur GitHub et les textes par défaut du profil

meta gagne username (39 caractères, les fichiers existants restent
lisibles). Intitulés et textes alternatifs du profil dans les 8 langues,
avec des gabarits {name} et {username} ; isDefaultText ignore les gabarits.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Utilitaires de services tiers et catalogue de compétences

**Files:**
- Create: `src/lib/readme/services.ts`, `src/lib/readme/skill-catalog.ts`
- Test: `tests/readme/services.test.ts`, `tests/readme/skill-catalog.test.ts`

**Interfaces:**
- Consumes: `safeUrl` (`markdown-utils.ts`).
- Produces :
  - `services.ts` : `cleanUsername(value: string): string` (nom valide, sans `@` initial, sinon `''`) ; `parseBaseUrl(value: string): BaseUrl` avec `BaseUrl = { status: 'empty' } | { status: 'invalid' } | { status: 'ok'; url: string }` (`url` sans barre finale) ; `param(key: string, value: string | number | boolean): string` (`key=valeur` encodée) ; `themedPair(alt, lightUrl, darkUrl): string` (deux images repérées par `#gh-light-mode-only` et `#gh-dark-mode-only`) ; `safeFeedUrl(value): string` ; `safeEmail(value): string` ; `safeWebUrl(value): string` (http(s) uniquement).
  - `skill-catalog.ts` : `SKILL_GROUPS` (six groupes `languages | frontend | backend | data | cloud | tools`, chacun avec `skills: { id, label }[]`), `SKILL_IDS: string[]`, `isSkillId(value: string): boolean`, `skillLabel(id: string): string`.

- [ ] **Step 1: Écrire les tests qui échouent**

Create `tests/readme/services.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import {
  cleanUsername,
  param,
  parseBaseUrl,
  safeEmail,
  safeFeedUrl,
  safeWebUrl,
  themedPair,
} from '@/lib/readme/services';

describe('cleanUsername', () => {
  it.each([
    ['octocat', 'octocat'],
    ['@octocat', 'octocat'],
    ['  a-b  ', 'a-b'],
    ['a'.repeat(39), 'a'.repeat(39)],
    ['a'.repeat(40), ''],
    ['-a', ''],
    ['a-', ''],
    ['a b', ''],
    ['a&b=c', ''],
    ['a/b', ''],
    ['', ''],
  ])('cleans %j to %j', (input, expected) => {
    expect(cleanUsername(input)).toBe(expected);
  });
});

describe('parseBaseUrl', () => {
  it.each(['', '   '])('treats %j as empty', (input) => {
    expect(parseBaseUrl(input)).toEqual({ status: 'empty' });
  });

  it.each([
    ['https://stats.example.com', 'https://stats.example.com'],
    ['  https://stats.example.com/  ', 'https://stats.example.com'],
    ['https://stats.example.com/api/v1/', 'https://stats.example.com/api/v1'],
    ['https://x.example.com:8080', 'https://x.example.com:8080'],
    ['https://my-app.vercel.app', 'https://my-app.vercel.app'],
  ])('accepts %j', (input, url) => {
    expect(parseBaseUrl(input)).toEqual({ status: 'ok', url });
  });

  it.each([
    'http://x.example.com',
    'https://',
    'https://x.example.com?a=1',
    'https://x.example.com#top',
    'https://x .example.com',
    'https://x.example.com/a b',
    'javascript:alert(1)',
    '//x.example.com',
    `https://${'a'.repeat(400)}.com`,
  ])('rejects %j', (input) => {
    expect(parseBaseUrl(input)).toEqual({ status: 'invalid' });
  });

  it('runs in linear time on hostile input', () => {
    const start = performance.now();
    parseBaseUrl('https://' + 'a.'.repeat(150) + '/' + 'a/'.repeat(150) + '?');
    parseBaseUrl('https://a' + '-'.repeat(299));
    expect(performance.now() - start).toBeLessThan(100);
  });
});

describe('param / themedPair', () => {
  it('encodes the value', () => {
    expect(param('font', 'Fira Code')).toBe('font=Fira%20Code');
    expect(param('lines', "a&b=c#d'e")).toBe("lines=a%26b%3Dc%23d'e");
    expect(param('size', 24)).toBe('size=24');
    expect(param('center', true)).toBe('center=true');
  });

  it('builds the light and dark variant GitHub picks between', () => {
    expect(themedPair('Alt', 'https://x/l', 'https://x/d')).toBe(
      '![Alt](https://x/l#gh-light-mode-only) ![Alt](https://x/d#gh-dark-mode-only)'
    );
  });
});

describe('safeFeedUrl', () => {
  it.each(['https://blog.example.com/feed.xml', 'http://blog.example.com/rss?x=1'])('keeps %j', (url) => {
    expect(safeFeedUrl(` ${url} `)).toBe(url);
  });

  it.each([
    '',
    'ftp://x.example.com/feed',
    'https://x.example.com/a,b',
    'https://x.example.com/"y',
    "https://x.example.com/'y",
    'https://x.example.com/a b',
    'https://x.example.com/a\\b',
    'https://x.example.com/<y>',
    'https://x.example.com/`y`',
    'javascript:alert(1)',
    `https://x.example.com/${'a'.repeat(500)}`,
  ])('rejects %j', (url) => {
    expect(safeFeedUrl(url)).toBe('');
  });
});

describe('safeEmail', () => {
  it.each(['jane@example.com', 'a.b+c@sub.example.co', ' jane@example.com '])('keeps %j', (value) => {
    expect(safeEmail(value)).toBe(value.trim());
  });

  it.each(['', 'jane@', '@x.io', 'a b@x.io', 'a@x', 'a@x..io', 'a@x.io\nb@y.io', '<a@x.io>', 'a@x.io?subject=hi'])(
    'rejects %j',
    (value) => {
      expect(safeEmail(value)).toBe('');
    }
  );
});

describe('safeWebUrl', () => {
  it('keeps http(s) URLs and drops everything else, including relative ones', () => {
    expect(safeWebUrl('https://x.io/a')).toBe('https://x.io/a');
    expect(safeWebUrl('javascript:alert(1)')).toBe('');
    expect(safeWebUrl('mailto:a@x.io')).toBe('');
    expect(safeWebUrl('./relative')).toBe('');
    expect(safeWebUrl('')).toBe('');
  });
});
```

Create `tests/readme/skill-catalog.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import { SKILL_GROUPS, SKILL_IDS, isSkillId, skillLabel } from '@/lib/readme/skill-catalog';

describe('skill catalog', () => {
  it('has six non-empty groups', () => {
    expect(SKILL_GROUPS.map((group) => group.key)).toEqual(['languages', 'frontend', 'backend', 'data', 'cloud', 'tools']);
    for (const group of SKILL_GROUPS) expect(group.skills.length, group.key).toBeGreaterThan(0);
  });

  it('lists each icon id once, as a plain lowercase token', () => {
    expect(new Set(SKILL_IDS).size).toBe(SKILL_IDS.length);
    for (const id of SKILL_IDS) expect(id).toMatch(/^[a-z0-9]+$/);
  });

  it("uses skill-icons' real ids: Python is `py`, and `python` does not exist", () => {
    expect(isSkillId('py')).toBe(true);
    expect(isSkillId('python')).toBe(false);
    expect(isSkillId('js')).toBe(true);
  });

  it('gives every skill a label, and falls back to the id for an unknown one', () => {
    expect(skillLabel('js')).toBe('JavaScript');
    expect(skillLabel('cs')).toBe('C#');
    expect(skillLabel('nope')).toBe('nope');
  });

  it('rejects ids that could smuggle a query separator', () => {
    for (const bad of ['js,ts', 'js&x=1', 'JS', '', ' js']) expect(isSkillId(bad)).toBe(false);
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run tests/readme/services.test.ts tests/readme/skill-catalog.test.ts`
Expected: FAIL, modules `@/lib/readme/services` et `@/lib/readme/skill-catalog` introuvables.

- [ ] **Step 3: Écrire les utilitaires de services**

Create `src/lib/readme/services.ts` :

```ts
import { safeUrl } from './markdown-utils';

// Third-party image services are reached through URLs built from user input. Every
// value is validated here, or encoded, before it can end up in one.

const GITHUB_USERNAME = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;

/** A valid GitHub username (without a leading `@`), or '' when the value is not one. */
export function cleanUsername(value: string): string {
  const name = value.trim().replace(/^@/, '');
  return GITHUB_USERNAME.test(name) ? name : '';
}

export type BaseUrl = { status: 'empty' } | { status: 'invalid' } | { status: 'ok'; url: string };

const MAX_BASE_URL_LENGTH = 300;
const BASE_URL = /^https:\/\/[A-Za-z0-9](?:[A-Za-z0-9.-]{0,251}[A-Za-z0-9])?(?::\d{1,5})?(?:\/[A-Za-z0-9._~-]+)*\/?$/;

/**
 * The base address of a self-hosted service: https only, no query string, no
 * fragment, no space. The returned URL has no trailing slash.
 */
export function parseBaseUrl(value: string): BaseUrl {
  const trimmed = value.trim();
  if (trimmed === '') return { status: 'empty' };
  if (trimmed.length > MAX_BASE_URL_LENGTH || !BASE_URL.test(trimmed)) return { status: 'invalid' };
  return { status: 'ok', url: trimmed.replace(/\/+$/, '') };
}

/** `key=value` with the value percent-encoded. */
export function param(key: string, value: string | number | boolean): string {
  return `${key}=${encodeURIComponent(String(value))}`;
}

/**
 * Two images of the same card, one per GitHub theme. GitHub shows the one that
 * matches the viewer's theme and hides the other (the preview does the same).
 */
export function themedPair(alt: string, lightUrl: string, darkUrl: string): string {
  return `![${alt}](${lightUrl}#gh-light-mode-only) ![${alt}](${darkUrl}#gh-dark-mode-only)`;
}

const MAX_FEED_URL_LENGTH = 500;

/**
 * A feed address safe to put in a YAML double-quoted string and in a
 * comma-separated list: http(s), and none of `,` `"` `'` `\` `<` `>` `` ` `` or whitespace.
 */
export function safeFeedUrl(value: string): string {
  const url = value.trim();
  return url.length <= MAX_FEED_URL_LENGTH && /^https?:\/\/[^\s,"'\\<>`]+$/.test(url) ? url : '';
}

/** An email address made only of characters that need no escaping in a `mailto:` link. */
export function safeEmail(value: string): string {
  const email = value.trim();
  return /^[A-Za-z0-9._%+-]{1,64}@(?:[A-Za-z0-9-]{1,63}\.){1,8}[A-Za-z]{2,24}$/.test(email) ? email : '';
}

/** A link destination that is an absolute http(s) URL, or ''. */
export function safeWebUrl(value: string): string {
  const url = safeUrl(value);
  return /^https?:\/\//i.test(url) ? url : '';
}
```

- [ ] **Step 4: Écrire le catalogue de compétences**

Create `src/lib/readme/skill-catalog.ts` :

```ts
// Icon ids come from the official skill-icons list (https://github.com/tandpfun/skill-icons).
// Note Python is `py`. Labels are proper names and are not translated.

export interface Skill {
  id: string;
  label: string;
}

export type SkillGroupKey = 'languages' | 'frontend' | 'backend' | 'data' | 'cloud' | 'tools';

export interface SkillGroup {
  key: SkillGroupKey;
  skills: readonly Skill[];
}

export const SKILL_GROUPS: readonly SkillGroup[] = [
  {
    key: 'languages',
    skills: [
      { id: 'js', label: 'JavaScript' },
      { id: 'ts', label: 'TypeScript' },
      { id: 'py', label: 'Python' },
      { id: 'java', label: 'Java' },
      { id: 'go', label: 'Go' },
      { id: 'rust', label: 'Rust' },
      { id: 'c', label: 'C' },
      { id: 'cpp', label: 'C++' },
      { id: 'cs', label: 'C#' },
      { id: 'php', label: 'PHP' },
      { id: 'ruby', label: 'Ruby' },
      { id: 'kotlin', label: 'Kotlin' },
      { id: 'swift', label: 'Swift' },
      { id: 'dart', label: 'Dart' },
      { id: 'bash', label: 'Bash' },
      { id: 'lua', label: 'Lua' },
    ],
  },
  {
    key: 'frontend',
    skills: [
      { id: 'html', label: 'HTML' },
      { id: 'css', label: 'CSS' },
      { id: 'sass', label: 'Sass' },
      { id: 'tailwind', label: 'Tailwind CSS' },
      { id: 'react', label: 'React' },
      { id: 'vue', label: 'Vue' },
      { id: 'angular', label: 'Angular' },
      { id: 'svelte', label: 'Svelte' },
      { id: 'nextjs', label: 'Next.js' },
      { id: 'nuxtjs', label: 'Nuxt' },
      { id: 'astro', label: 'Astro' },
      { id: 'vite', label: 'Vite' },
      { id: 'webpack', label: 'Webpack' },
      { id: 'redux', label: 'Redux' },
      { id: 'threejs', label: 'Three.js' },
    ],
  },
  {
    key: 'backend',
    skills: [
      { id: 'nodejs', label: 'Node.js' },
      { id: 'express', label: 'Express' },
      { id: 'nestjs', label: 'NestJS' },
      { id: 'django', label: 'Django' },
      { id: 'flask', label: 'Flask' },
      { id: 'fastapi', label: 'FastAPI' },
      { id: 'spring', label: 'Spring' },
      { id: 'laravel', label: 'Laravel' },
      { id: 'rails', label: 'Rails' },
      { id: 'graphql', label: 'GraphQL' },
      { id: 'prisma', label: 'Prisma' },
    ],
  },
  {
    key: 'data',
    skills: [
      { id: 'postgres', label: 'PostgreSQL' },
      { id: 'mysql', label: 'MySQL' },
      { id: 'mongodb', label: 'MongoDB' },
      { id: 'redis', label: 'Redis' },
      { id: 'sqlite', label: 'SQLite' },
      { id: 'firebase', label: 'Firebase' },
      { id: 'supabase', label: 'Supabase' },
    ],
  },
  {
    key: 'cloud',
    skills: [
      { id: 'docker', label: 'Docker' },
      { id: 'kubernetes', label: 'Kubernetes' },
      { id: 'aws', label: 'AWS' },
      { id: 'azure', label: 'Azure' },
      { id: 'gcp', label: 'Google Cloud' },
      { id: 'vercel', label: 'Vercel' },
      { id: 'netlify', label: 'Netlify' },
      { id: 'terraform', label: 'Terraform' },
      { id: 'nginx', label: 'NGINX' },
      { id: 'linux', label: 'Linux' },
      { id: 'ubuntu', label: 'Ubuntu' },
    ],
  },
  {
    key: 'tools',
    skills: [
      { id: 'git', label: 'Git' },
      { id: 'github', label: 'GitHub' },
      { id: 'gitlab', label: 'GitLab' },
      { id: 'vscode', label: 'VS Code' },
      { id: 'vim', label: 'Vim' },
      { id: 'figma', label: 'Figma' },
      { id: 'npm', label: 'npm' },
      { id: 'yarn', label: 'Yarn' },
      { id: 'pnpm', label: 'pnpm' },
      { id: 'bun', label: 'Bun' },
      { id: 'deno', label: 'Deno' },
      { id: 'jest', label: 'Jest' },
      { id: 'cypress', label: 'Cypress' },
      { id: 'flutter', label: 'Flutter' },
      { id: 'androidstudio', label: 'Android Studio' },
      { id: 'unity', label: 'Unity' },
      { id: 'godot', label: 'Godot' },
      { id: 'arduino', label: 'Arduino' },
      { id: 'raspberrypi', label: 'Raspberry Pi' },
      { id: 'wordpress', label: 'WordPress' },
    ],
  },
];

export const SKILL_IDS: string[] = SKILL_GROUPS.flatMap((group) => group.skills.map((skill) => skill.id));

const LABELS = new Map(SKILL_GROUPS.flatMap((group) => group.skills.map((skill) => [skill.id, skill.label] as const)));

export function isSkillId(value: string): boolean {
  return LABELS.has(value);
}

export function skillLabel(id: string): string {
  return LABELS.get(id) ?? id;
}
```

- [ ] **Step 5: Vérifier que tout passe**

Run: `npx vitest run tests/readme && npx tsc --noEmit`
Expected: PASS ; aucune erreur de types.

- [ ] **Step 6: Commit**

```bash
git add src/lib/readme tests/readme
git commit -m "$(cat <<'EOF'
feat(readme): ajoute les utilitaires de services tiers et le catalogue de compétences

Validation stricte du nom d'utilisateur, de l'URL de base (https, sans
paramètres), du flux RSS et de l'e-mail ; images clair/sombre repérées
par les fragments GitHub ; catalogue d'icônes vérifié contre la liste
officielle de skill-icons.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Traductions du mode Profil (8 locales)

**Files:**
- Modify: `src/i18n/locales/{fr,en,es,de,it,pt,ru,ja}.json`
- Create (temporaire, non commité) : `tmp-i18n-readme-plan3.mjs`
- Test: `tests/i18n/readme-generator-profile-locales.test.ts`

**Interfaces:**
- Consumes: le namespace `readmeGenerator` des plans 1 et 2.
- Produces : dans chaque locale, sous `readmeGenerator` : `blocks.{banner,bio,skills,stats,trophies,blog,contact}`, `fields.*` (bannière, présentation, compétences, services, blog, contact), `options.{auto,light,dark,left,center,daily,weekly}`, `skillGroups.{languages,frontend,backend,data,cloud,tools}`, `hints.{lines,points,baseUrl,feedUrl,contactValue}`, `placeholders.{baseUrl,feedUrl,username}`, `warnings.{missingUsername,missingBaseUrl,invalidBaseUrl,invalidFeed}`, `meta.username`, `workflow.*`. Utilisées par les Tâches 8 et 9.

- [ ] **Step 1: Écrire le test qui échoue**

Create `tests/i18n/readme-generator-profile-locales.test.ts` :

```ts
import { describe, it, expect } from 'vitest';
import { locales } from '@/i18n/locales';

const REQUIRED_KEYS = [
  'blocks.banner', 'blocks.bio', 'blocks.skills', 'blocks.stats', 'blocks.trophies', 'blocks.blog', 'blocks.contact',
  'fields.lines', 'fields.font', 'fields.size', 'fields.width', 'fields.align', 'fields.color', 'fields.intro',
  'fields.points', 'fields.iconTheme', 'fields.perLine', 'fields.skills', 'fields.username', 'fields.baseUrl',
  'fields.showStats', 'fields.showLanguages', 'fields.layout', 'fields.hideBorder', 'fields.columns', 'fields.rows',
  'fields.feedUrl', 'fields.maxPosts', 'fields.schedule', 'fields.network', 'fields.value', 'fields.addContact',
  'fields.removeContact',
  'options.auto', 'options.light', 'options.dark', 'options.left', 'options.center', 'options.daily', 'options.weekly',
  'skillGroups.languages', 'skillGroups.frontend', 'skillGroups.backend', 'skillGroups.data', 'skillGroups.cloud',
  'skillGroups.tools',
  'hints.lines', 'hints.points', 'hints.baseUrl', 'hints.feedUrl', 'hints.contactValue',
  'placeholders.baseUrl', 'placeholders.feedUrl', 'placeholders.username',
  'warnings.missingUsername', 'warnings.missingBaseUrl', 'warnings.invalidBaseUrl', 'warnings.invalidFeed',
  'meta.username',
  'workflow.title', 'workflow.intro', 'workflow.step1', 'workflow.step2', 'workflow.step3', 'workflow.note',
  'workflow.download', 'workflow.noFeed',
] as const;

const PLACEHOLDERS: Record<string, string[]> = {
  'warnings.missingBaseUrl': ['{service}'],
};

function getPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

describe('readme generator profile-mode translations', () => {
  it.each(locales)('%s has every key, non-empty', async (locale) => {
    const messages = (await import(`@/i18n/locales/${locale}.json`)).default;
    for (const key of REQUIRED_KEYS) {
      const value = getPath(messages.readmeGenerator, key);
      expect(typeof value, `${locale}:${key}`).toBe('string');
      expect((value as string).trim().length, `${locale}:${key}`).toBeGreaterThan(0);
    }
  });

  it.each(locales)('%s keeps the ICU placeholders', async (locale) => {
    const messages = (await import(`@/i18n/locales/${locale}.json`)).default;
    for (const [key, placeholders] of Object.entries(PLACEHOLDERS)) {
      for (const placeholder of placeholders) {
        expect(getPath(messages.readmeGenerator, key) as string, `${locale}:${key}`).toContain(placeholder);
      }
    }
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run tests/i18n/readme-generator-profile-locales.test.ts`
Expected: FAIL, 16 échecs (2 tests × 8 locales) : les clés n'existent pas.

- [ ] **Step 3: Créer le script de traductions**

Create `tmp-i18n-readme-plan3.mjs` à la racine (fichier temporaire, jamais commité). Chaque ligne est `clé => fr | en | es | de | it | pt | ru | ja` ; le script refuse toute ligne qui n'a pas exactement huit traductions.

```js
import fs from 'node:fs';

const ORDER = ['fr', 'en', 'es', 'de', 'it', 'pt', 'ru', 'ja'];

const TABLE = `
blocks.banner => Bannière animée | Animated banner | Banner animado | Animiertes Banner | Banner animato | Faixa animada | Анимированный баннер | アニメーションバナー
blocks.bio => Présentation | About me | Sobre mí | Über mich | Chi sono | Sobre mim | Обо мне | 自己紹介
blocks.skills => Compétences | Skills | Habilidades | Fähigkeiten | Competenze | Competências | Навыки | スキル
blocks.stats => Statistiques GitHub | GitHub stats | Estadísticas de GitHub | GitHub-Statistiken | Statistiche GitHub | Estatísticas do GitHub | Статистика GitHub | GitHubの統計
blocks.trophies => Trophées | Trophies | Trofeos | Trophäen | Trofei | Troféus | Трофеи | トロフィー
blocks.blog => Articles de blog | Blog posts | Artículos del blog | Blogbeiträge | Articoli del blog | Artigos do blog | Статьи блога | ブログ記事
blocks.contact => Contact | Contact | Contacto | Kontakt | Contatti | Contacto | Контакты | 連絡先
fields.lines => Lignes de texte | Text lines | Líneas de texto | Textzeilen | Righe di testo | Linhas de texto | Строки текста | テキスト行
fields.font => Police | Font | Fuente | Schriftart | Carattere | Tipo de letra | Шрифт | フォント
fields.size => Taille du texte | Text size | Tamaño del texto | Textgröße | Dimensione del testo | Tamanho do texto | Размер текста | 文字サイズ
fields.width => Largeur | Width | Ancho | Breite | Larghezza | Largura | Ширина | 幅
fields.align => Alignement | Alignment | Alineación | Ausrichtung | Allineamento | Alinhamento | Выравнивание | 配置
fields.color => Couleur | Color | Color | Farbe | Colore | Cor | Цвет | 色
fields.intro => Introduction | Introduction | Introducción | Einleitung | Introduzione | Introdução | Введение | 導入文
fields.points => Points clés | Key points | Puntos clave | Kernpunkte | Punti chiave | Pontos-chave | Ключевые пункты | ポイント
fields.iconTheme => Fond des icônes | Icon background | Fondo de los iconos | Icon-Hintergrund | Sfondo delle icone | Fundo dos ícones | Фон значков | アイコンの背景
fields.perLine => Icônes par ligne | Icons per line | Iconos por línea | Icons pro Zeile | Icone per riga | Ícones por linha | Значков в строке | 1行あたりのアイコン数
fields.skills => Compétences à afficher | Skills to show | Habilidades a mostrar | Anzuzeigende Fähigkeiten | Competenze da mostrare | Competências a mostrar | Навыки для показа | 表示するスキル
fields.username => Nom d'utilisateur GitHub | GitHub username | Usuario de GitHub | GitHub-Benutzername | Nome utente GitHub | Utilizador do GitHub | Имя пользователя GitHub | GitHubのユーザー名
fields.baseUrl => URL de base de votre instance | Base URL of your instance | URL base de tu instancia | Basis-URL Ihrer Instanz | URL di base della tua istanza | URL base da sua instância | Базовый URL вашего экземпляра | インスタンスのベースURL
fields.showStats => Carte de statistiques | Stats card | Tarjeta de estadísticas | Statistikkarte | Scheda delle statistiche | Cartão de estatísticas | Карточка статистики | 統計カード
fields.showLanguages => Carte des langages | Languages card | Tarjeta de lenguajes | Sprachenkarte | Scheda dei linguaggi | Cartão de linguagens | Карточка языков | 言語カード
fields.layout => Disposition des langages | Languages layout | Diseño de lenguajes | Sprachen-Layout | Layout dei linguaggi | Disposição das linguagens | Вид карточки языков | 言語カードのレイアウト
fields.hideBorder => Masquer la bordure | Hide the border | Ocultar el borde | Rahmen ausblenden | Nascondi il bordo | Ocultar a borda | Скрыть рамку | 枠線を隠す
fields.columns => Colonnes | Columns | Columnas | Spalten | Colonne | Colunas | Столбцы | 列
fields.rows => Lignes | Rows | Filas | Zeilen | Righe | Linhas | Строки | 行
fields.feedUrl => Adresse du flux RSS ou Atom | RSS or Atom feed URL | URL del feed RSS o Atom | Adresse des RSS- oder Atom-Feeds | URL del feed RSS o Atom | URL do feed RSS ou Atom | Адрес RSS- или Atom-ленты | RSS/AtomフィードのURL
fields.maxPosts => Nombre d'articles | Number of posts | Número de artículos | Anzahl der Beiträge | Numero di articoli | Número de artigos | Количество статей | 記事数
fields.schedule => Fréquence de mise à jour | Update frequency | Frecuencia de actualización | Aktualisierungsintervall | Frequenza di aggiornamento | Frequência de atualização | Частота обновления | 更新頻度
fields.network => Réseau | Network | Red | Netzwerk | Rete | Rede | Сеть | ネットワーク
fields.value => Adresse | Address | Dirección | Adresse | Indirizzo | Endereço | Адрес | アドレス
fields.addContact => Ajouter un contact | Add a contact | Añadir un contacto | Kontakt hinzufügen | Aggiungi un contatto | Adicionar um contacto | Добавить контакт | 連絡先を追加
fields.removeContact => Retirer ce contact | Remove this contact | Quitar este contacto | Diesen Kontakt entfernen | Rimuovi questo contatto | Remover este contacto | Удалить этот контакт | この連絡先を削除
options.auto => Automatique (clair et sombre) | Automatic (light and dark) | Automático (claro y oscuro) | Automatisch (hell und dunkel) | Automatico (chiaro e scuro) | Automático (claro e escuro) | Автоматически (светлая и тёмная) | 自動（ライト・ダーク）
options.light => Clair | Light | Claro | Hell | Chiaro | Claro | Светлая | ライト
options.dark => Sombre | Dark | Oscuro | Dunkel | Scuro | Escuro | Тёмная | ダーク
options.left => À gauche | Left | Izquierda | Links | Sinistra | Esquerda | Слева | 左
options.center => Centré | Centered | Centrado | Zentriert | Centrato | Centrado | По центру | 中央
options.daily => Chaque jour | Every day | Cada día | Täglich | Ogni giorno | Todos os dias | Каждый день | 毎日
options.weekly => Chaque semaine | Every week | Cada semana | Wöchentlich | Ogni settimana | Todas as semanas | Каждую неделю | 毎週
skillGroups.languages => Langages | Languages | Lenguajes | Sprachen | Linguaggi | Linguagens | Языки | 言語
skillGroups.frontend => Front-end | Front-end | Front-end | Front-End | Front-end | Front-end | Фронтенд | フロントエンド
skillGroups.backend => Back-end | Back-end | Back-end | Back-End | Back-end | Back-end | Бэкенд | バックエンド
skillGroups.data => Données | Data | Datos | Daten | Dati | Dados | Данные | データ
skillGroups.cloud => Cloud et systèmes | Cloud and systems | Nube y sistemas | Cloud und Systeme | Cloud e sistemi | Nuvem e sistemas | Облако и системы | クラウドとシステム
skillGroups.tools => Outils et autres | Tools and more | Herramientas y otros | Werkzeuge und mehr | Strumenti e altro | Ferramentas e outros | Инструменты и другое | ツールその他
hints.lines => Une ligne de texte par ligne, cinq au maximum. Elles défilent l'une après l'autre. | One line of text per line, five at most. They type out one after the other. | Una línea de texto por línea, cinco como máximo. Se escriben una tras otra. | Eine Textzeile pro Zeile, höchstens fünf. Sie werden nacheinander getippt. | Una riga di testo per riga, al massimo cinque. Vengono scritte una dopo l'altra. | Uma linha de texto por linha, no máximo cinco. São escritas uma a seguir à outra. | Одна строка текста на строку, не более пяти. Они печатаются по очереди. | 1行に1つ、最大5行。順番にタイプされます。
hints.points => Un point par ligne, affiché comme une liste à puces. Vous pouvez y mettre des emojis. | One point per line, shown as a bulleted list. You can include emojis. | Un punto por línea, mostrado como lista con viñetas. Puedes incluir emojis. | Ein Punkt pro Zeile, als Aufzählung dargestellt. Emojis sind möglich. | Un punto per riga, mostrato come elenco puntato. Puoi usare le emoji. | Um ponto por linha, mostrado como lista com marcadores. Pode incluir emojis. | Один пункт на строку, отображается маркированным списком. Можно использовать эмодзи. | 1行に1項目、箇条書きで表示されます。絵文字も使えます。
hints.baseUrl => Ce service public est régulièrement indisponible. Déployez votre propre instance (par exemple sur Vercel, en suivant la documentation du projet) et collez son adresse ici. Tant que ce champ est vide, rien n'est généré. | This public service is often unavailable. Deploy your own instance (for example on Vercel, following the project's documentation) and paste its address here. Nothing is generated while this field is empty. | Este servicio público suele no estar disponible. Despliega tu propia instancia (por ejemplo en Vercel, siguiendo la documentación del proyecto) y pega aquí su dirección. Mientras este campo esté vacío no se genera nada. | Dieser öffentliche Dienst ist häufig nicht erreichbar. Betreiben Sie eine eigene Instanz (z. B. auf Vercel, gemäß der Projektdokumentation) und tragen Sie deren Adresse hier ein. Solange das Feld leer ist, wird nichts erzeugt. | Questo servizio pubblico è spesso non disponibile. Distribuisci una tua istanza (ad esempio su Vercel, seguendo la documentazione del progetto) e incolla qui il suo indirizzo. Finché il campo è vuoto non viene generato nulla. | Este serviço público está frequentemente indisponível. Implemente a sua própria instância (por exemplo na Vercel, seguindo a documentação do projeto) e cole aqui o respetivo endereço. Enquanto este campo estiver vazio, nada é gerado. | Этот публичный сервис часто недоступен. Разверните собственный экземпляр (например, на Vercel, следуя документации проекта) и вставьте его адрес сюда. Пока поле пусто, ничего не создаётся. | この公開サービスはよく利用できなくなります。ご自身のインスタンス（例：プロジェクトのドキュメントに従ってVercelに）をデプロイし、そのアドレスをここに貼り付けてください。空欄の間は何も生成されません。
hints.feedUrl => L'adresse publique du flux de votre blog, en https. Elle est écrite dans le workflow. | The public address of your blog's feed, over https. It is written into the workflow. | La dirección pública del feed de tu blog, con https. Se escribe en el workflow. | Die öffentliche Adresse des Feeds Ihres Blogs, per https. Sie wird in den Workflow geschrieben. | L'indirizzo pubblico del feed del tuo blog, in https. Viene scritto nel workflow. | O endereço público do feed do seu blogue, em https. É escrito no workflow. | Публичный адрес ленты вашего блога по https. Он записывается в workflow. | ブログのフィードの公開アドレス（https）。ワークフローに書き込まれます。
hints.contactValue => L'adresse complète (https://…) ou, pour l'e-mail, l'adresse électronique. | The full address (https://…) or, for email, the email address. | La dirección completa (https://…) o, para el correo, la dirección de correo. | Die vollständige Adresse (https://…) bzw. bei E-Mail die E-Mail-Adresse. | L'indirizzo completo (https://…) oppure, per l'e-mail, l'indirizzo di posta. | O endereço completo (https://…) ou, no caso do e-mail, o endereço de correio eletrónico. | Полный адрес (https://…) или, для почты, адрес электронной почты. | 完全なアドレス（https://…）。メールの場合はメールアドレス。
placeholders.baseUrl => https://mon-instance.vercel.app | https://my-instance.vercel.app | https://mi-instancia.vercel.app | https://meine-instanz.vercel.app | https://mia-istanza.vercel.app | https://minha-instancia.vercel.app | https://my-instance.vercel.app | https://my-instance.vercel.app
placeholders.feedUrl => https://exemple.com/feed.xml | https://example.com/feed.xml | https://ejemplo.com/feed.xml | https://beispiel.de/feed.xml | https://esempio.it/feed.xml | https://exemplo.pt/feed.xml | https://example.com/feed.xml | https://example.com/feed.xml
placeholders.username => octocat | octocat | octocat | octocat | octocat | octocat | octocat | octocat
warnings.missingUsername => Nom d'utilisateur GitHub manquant ou invalide : rien n'est généré. | Missing or invalid GitHub username: nothing is generated. | Falta el usuario de GitHub o no es válido: no se genera nada. | GitHub-Benutzername fehlt oder ist ungültig: Es wird nichts erzeugt. | Nome utente GitHub mancante o non valido: non viene generato nulla. | Utilizador do GitHub em falta ou inválido: nada é gerado. | Имя пользователя GitHub отсутствует или неверно: ничего не создаётся. | GitHubのユーザー名が未入力か無効なため、何も生成されません。
warnings.missingBaseUrl => URL de base manquante pour {service} : rien n'est généré. Le service public est souvent indisponible, déployez votre propre instance. | Missing base URL for {service}: nothing is generated. The public service is often down, deploy your own instance. | Falta la URL base de {service}: no se genera nada. El servicio público suele caerse, despliega tu propia instancia. | Basis-URL für {service} fehlt: Es wird nichts erzeugt. Der öffentliche Dienst fällt oft aus, betreiben Sie eine eigene Instanz. | URL di base mancante per {service}: non viene generato nulla. Il servizio pubblico è spesso fuori uso, distribuisci una tua istanza. | URL base em falta para {service}: nada é gerado. O serviço público falha muitas vezes, implemente a sua própria instância. | Не указан базовый URL для {service}: ничего не создаётся. Публичный сервис часто недоступен, разверните свой экземпляр. | {service}のベースURLが未入力のため、何も生成されません。公開サービスはよく停止するので、ご自身のインスタンスをデプロイしてください。
warnings.invalidBaseUrl => URL de base invalide : utilisez une adresse https sans paramètres, par exemple https://mon-instance.vercel.app. | Invalid base URL: use an https address without parameters, for example https://my-instance.vercel.app. | URL base no válida: usa una dirección https sin parámetros, por ejemplo https://mi-instancia.vercel.app. | Ungültige Basis-URL: Verwenden Sie eine https-Adresse ohne Parameter, z. B. https://meine-instanz.vercel.app. | URL di base non valido: usa un indirizzo https senza parametri, ad esempio https://mia-istanza.vercel.app. | URL base inválido: use um endereço https sem parâmetros, por exemplo https://minha-instancia.vercel.app. | Неверный базовый URL: используйте адрес https без параметров, например https://my-instance.vercel.app. | ベースURLが無効です。パラメーターなしのhttpsアドレス（例：https://my-instance.vercel.app）を使ってください。
warnings.invalidFeed => Adresse de flux manquante ou invalide : le workflow ne peut pas être généré. | Missing or invalid feed address: the workflow cannot be generated. | Falta la dirección del feed o no es válida: no se puede generar el workflow. | Feed-Adresse fehlt oder ist ungültig: Der Workflow kann nicht erzeugt werden. | Indirizzo del feed mancante o non valido: impossibile generare il workflow. | Endereço do feed em falta ou inválido: não é possível gerar o workflow. | Адрес ленты отсутствует или неверен: workflow создать нельзя. | フィードのアドレスが未入力か無効なため、ワークフローを生成できません。
meta.username => Nom d'utilisateur GitHub | GitHub username | Usuario de GitHub | GitHub-Benutzername | Nome utente GitHub | Utilizador do GitHub | Имя пользователя GitHub | GitHubのユーザー名
workflow.title => Mise à jour automatique des articles | Automatic blog post updates | Actualización automática de artículos | Automatische Aktualisierung der Beiträge | Aggiornamento automatico degli articoli | Atualização automática dos artigos | Автоматическое обновление статей | 記事の自動更新
workflow.intro => Ce README contient une zone réservée aux articles. Pour qu'elle se remplisse toute seule, ajoutez ce workflow au dépôt de votre profil (celui qui porte le même nom que votre compte GitHub). | This README has a reserved area for blog posts. To have it fill itself in, add this workflow to your profile repository (the one named after your GitHub account). | Este README tiene una zona reservada para los artículos. Para que se rellene sola, añade este workflow al repositorio de tu perfil (el que tiene el mismo nombre que tu cuenta de GitHub). | Dieses README enthält einen reservierten Bereich für Beiträge. Damit er sich selbst füllt, fügen Sie diesen Workflow zum Profil-Repository hinzu (dem Repository mit dem Namen Ihres GitHub-Kontos). | Questo README contiene un'area riservata agli articoli. Perché si riempia da sola, aggiungi questo workflow al repository del tuo profilo (quello con lo stesso nome del tuo account GitHub). | Este README tem uma zona reservada aos artigos. Para que se preencha sozinha, adicione este workflow ao repositório do seu perfil (o que tem o mesmo nome da sua conta do GitHub). | В этом README есть зона для статей. Чтобы она заполнялась сама, добавьте этот workflow в репозиторий вашего профиля (тот, что называется как ваш аккаунт GitHub). | このREADMEには記事用の領域があります。自動で埋めるには、このワークフローをプロフィール用リポジトリ（GitHubアカウントと同名のリポジトリ）に追加してください。
workflow.step1 => Créez le fichier .github/workflows/blog-post-workflow.yml dans ce dépôt et collez-y le contenu du fichier téléchargé. | Create the file .github/workflows/blog-post-workflow.yml in that repository and paste the content of the downloaded file. | Crea el archivo .github/workflows/blog-post-workflow.yml en ese repositorio y pega el contenido del archivo descargado. | Erstellen Sie die Datei .github/workflows/blog-post-workflow.yml in diesem Repository und fügen Sie den Inhalt der heruntergeladenen Datei ein. | Crea il file .github/workflows/blog-post-workflow.yml in quel repository e incolla il contenuto del file scaricato. | Crie o ficheiro .github/workflows/blog-post-workflow.yml nesse repositório e cole o conteúdo do ficheiro transferido. | Создайте в этом репозитории файл .github/workflows/blog-post-workflow.yml и вставьте содержимое скачанного файла. | そのリポジトリに .github/workflows/blog-post-workflow.yml を作成し、ダウンロードしたファイルの内容を貼り付けます。
workflow.step2 => Dans Settings > Actions > General, réglez « Workflow permissions » sur « Read and write permissions » puis enregistrez : le workflow doit pouvoir écrire dans le README. | In Settings > Actions > General, set "Workflow permissions" to "Read and write permissions" and save: the workflow must be able to write to the README. | En Settings > Actions > General, establece «Workflow permissions» en «Read and write permissions» y guarda: el workflow debe poder escribir en el README. | Stellen Sie unter Settings > Actions > General „Workflow permissions“ auf „Read and write permissions“ und speichern Sie: Der Workflow muss in das README schreiben können. | In Settings > Actions > General imposta «Workflow permissions» su «Read and write permissions» e salva: il workflow deve poter scrivere nel README. | Em Settings > Actions > General, defina «Workflow permissions» como «Read and write permissions» e guarde: o workflow tem de poder escrever no README. | В Settings > Actions > General установите «Workflow permissions» в «Read and write permissions» и сохраните: workflow должен иметь право писать в README. | Settings > Actions > General で「Workflow permissions」を「Read and write permissions」に設定して保存します。ワークフローがREADMEに書き込めるようにするためです。
workflow.step3 => Ouvrez l'onglet Actions, choisissez ce workflow et cliquez sur « Run workflow » pour le lancer une première fois. Ensuite il s'exécute tout seul. | Open the Actions tab, pick this workflow and click "Run workflow" to run it once. After that it runs by itself. | Abre la pestaña Actions, elige este workflow y pulsa «Run workflow» para ejecutarlo una primera vez. Después se ejecuta solo. | Öffnen Sie den Tab Actions, wählen Sie diesen Workflow und klicken Sie auf „Run workflow“, um ihn einmal zu starten. Danach läuft er von selbst. | Apri la scheda Actions, scegli questo workflow e fai clic su «Run workflow» per avviarlo la prima volta. Poi si esegue da solo. | Abra o separador Actions, escolha este workflow e clique em «Run workflow» para o executar uma primeira vez. Depois corre sozinho. | Откройте вкладку Actions, выберите этот workflow и нажмите «Run workflow», чтобы запустить его первый раз. Дальше он работает сам. | Actions タブでこのワークフローを選び、「Run workflow」をクリックして初回実行します。以降は自動で実行されます。
workflow.note => GitHub désactive les workflows planifiés après 60 jours sans activité dans le dépôt : relancez-le à la main si les articles ne se mettent plus à jour. | GitHub disables scheduled workflows after 60 days without activity in the repository: run it by hand if the posts stop updating. | GitHub desactiva los workflows programados tras 60 días sin actividad en el repositorio: ejecútalo a mano si los artículos dejan de actualizarse. | GitHub deaktiviert geplante Workflows nach 60 Tagen ohne Aktivität im Repository: Starten Sie ihn von Hand, wenn die Beiträge nicht mehr aktualisiert werden. | GitHub disattiva i workflow pianificati dopo 60 giorni senza attività nel repository: avvialo a mano se gli articoli non si aggiornano più. | O GitHub desativa os workflows agendados após 60 dias sem atividade no repositório: execute-o à mão se os artigos deixarem de se atualizar. | GitHub отключает запланированные workflow после 60 дней без активности в репозитории: запустите его вручную, если статьи перестали обновляться. | GitHubはリポジトリに60日間アクティビティがないと定期実行のワークフローを無効にします。記事が更新されなくなったら手動で実行してください。
workflow.download => Télécharger le workflow | Download the workflow | Descargar el workflow | Workflow herunterladen | Scarica il workflow | Transferir o workflow | Скачать workflow | ワークフローをダウンロード
workflow.noFeed => Renseignez une adresse de flux valide pour pouvoir générer le workflow. | Enter a valid feed address to be able to generate the workflow. | Introduce una dirección de feed válida para poder generar el workflow. | Geben Sie eine gültige Feed-Adresse ein, um den Workflow erzeugen zu können. | Inserisci un indirizzo di feed valido per poter generare il workflow. | Introduza um endereço de feed válido para poder gerar o workflow. | Укажите корректный адрес ленты, чтобы создать workflow. | ワークフローを生成するには、有効なフィードのアドレスを入力してください。
`;

function setPath(target, path, value) {
  const keys = path.split('.');
  let node = target;
  for (const key of keys.slice(0, -1)) {
    if (typeof node[key] !== 'object' || node[key] === null) node[key] = {};
    node = node[key];
  }
  node[keys[keys.length - 1]] = value;
}

const rows = TABLE.trim().split('\n').map((line) => {
  const [key, rest] = line.split(' => ');
  const values = rest.split(' | ');
  if (values.length !== ORDER.length) throw new Error(`${key}: expected ${ORDER.length} translations, got ${values.length}`);
  return { key, values };
});

for (const [index, locale] of ORDER.entries()) {
  const file = `src/i18n/locales/${locale}.json`;
  const messages = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const { key, values } of rows) setPath(messages.readmeGenerator, key, values[index]);
  fs.writeFileSync(file, JSON.stringify(messages, null, 2) + '\n');
  console.log('updated', file, rows.length, 'keys');
}
```

- [ ] **Step 4: Exécuter le script, puis le supprimer**

Run: `node tmp-i18n-readme-plan3.mjs`
Expected: huit lignes `updated src/i18n/locales/<locale>.json 69 keys` (le nombre exact est celui des lignes du tableau).

Run: `rm tmp-i18n-readme-plan3.mjs`

- [ ] **Step 5: Vérifier que les tests passent et que les diffs sont propres**

Run: `npx vitest run tests/i18n`
Expected: PASS (tous les tests i18n, dont les 16 nouveaux).

Run: `git diff --stat src/i18n/locales`
Expected: huit fichiers modifiés, uniquement des lignes ajoutées (hors la virgule ajoutée à l'ancienne dernière entrée de chaque objet).

- [ ] **Step 6: Commit**

```bash
git add src/i18n/locales tests/i18n/readme-generator-profile-locales.test.ts
git commit -m "$(cat <<'EOF'
feat(readme): ajoute les traductions du mode Profil dans les 8 locales

Noms et formulaires des sept blocs, avertissements sur les services
tiers, guide du workflow blog, avec contrôle des paramètres ICU.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```


---

### Task 4: Blocs Bannière animée et Présentation

**Files:**
- Create: `src/lib/readme/blocks/banner.ts`, `src/lib/readme/blocks/bio.ts`
- Modify: `src/lib/readme/types.ts` (`BlockType`), `src/lib/readme/registry.ts`
- Test: `tests/readme/blocks-profile-intro.test.ts`, `tests/readme/state.test.ts`

**Interfaces:**
- Consumes: `defineBlock` ; `getDefaultText` ; `atxHeading`, `escapeAlt`, `escapeMarkdownText`, `nonEmptyLines`, `normalizeNewlines`, `safeUrl` (`markdown-utils.ts`) ; `param`, `parseBaseUrl` (`services.ts`).
- Produces :
  - `banner.ts` : `bannerBlock` (mode `profile`, `recommended`), `BANNER_FONTS`, `BANNER_SIZES = [16, 20, 24, 28, 32]`, `BANNER_WIDTHS = [400, 500, 600, 800]`, `BANNER_LIMITS { lines: 1500; baseUrl: 300 }`, `DEFAULT_TYPING_BASE = 'https://readme-typing-svg.demolab.com'`, `BannerData { lines; font; size; width; align: 'left' | 'center'; color; baseUrl }`.
  - `bio.ts` : `bioBlock` (mode `profile`, `recommended`), `BIO_LIMITS { heading: 300; intro: 2000; points: 2000 }`, `BioData { heading; intro; points }`.
  - `BlockType` gagne `'banner' | 'bio'`.

- [ ] **Step 1: Écrire le test qui échoue**

Create `tests/readme/blocks-profile-intro.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import { EMPTY_META } from '@/lib/readme/defaults';
import { generateReadme } from '@/lib/readme/generate';
import { createBlock } from '@/lib/readme/state';
import { block, stateWith } from './helpers';

const profile = (blocks: Parameters<typeof stateWith>[0]) => stateWith(blocks, 'profile');

const banner = (over: Record<string, unknown> = {}) => ({
  lines: "Hi, I'm Jane\nFull stack developer",
  font: 'Fira Code',
  size: 24,
  width: 500,
  align: 'center',
  color: '',
  baseUrl: '',
  ...over,
});

const BANNER_URL =
  "https://readme-typing-svg.demolab.com/?font=Fira%20Code&amp;size=24&amp;width=500&amp;height=54&amp;color=0969da&amp;center=true&amp;vCenter=true&amp;lines=Hi%2C+I'm+Jane;Full+stack+developer";

describe('banner block', () => {
  it('renders a centered typing SVG with the accent color', () => {
    expect(generateReadme(profile([block('b', 'banner', banner())]))).toBe(
      `<div align="center">\n\n![Hi, I'm Jane](${BANNER_URL})\n\n</div>\n`
    );
  });

  it('renders a left-aligned banner without the wrapper', () => {
    const output = generateReadme(profile([block('b', 'banner', banner({ align: 'left' }))]));
    expect(output).toBe(`![Hi, I'm Jane](${BANNER_URL.replace('center=true', 'center=false')})\n`);
  });

  it('uses the chosen color and a self-hosted base URL', () => {
    const output = generateReadme(
      profile([block('b', 'banner', banner({ color: 'ff0000', baseUrl: 'https://typing.example.com/' }))])
    );
    expect(output).toContain('(https://typing.example.com/?font=Fira%20Code');
    expect(output).toContain('color=ff0000');
  });

  it('renders nothing for an invalid base URL or without text', () => {
    expect(generateReadme(profile([block('b', 'banner', banner({ baseUrl: 'http://typing.example.com' }))]))).toBe('');
    expect(generateReadme(profile([block('b', 'banner', banner({ lines: ' \n ' }))]))).toBe('');
  });

  it('keeps the URL valid for text with separators and special characters', () => {
    const output = generateReadme(profile([block('b', 'banner', banner({ lines: 'a;b\n50% off + #1' }))]));
    expect(output).toContain('lines=a%2Cb;50%25+off+%2B+%231');
  });

  it('keeps at most five lines of at most 100 characters', () => {
    const many = Array.from({ length: 7 }, (_, i) => `line ${i}`).join('\n');
    const query = /lines=([^)]*)\)/.exec(generateReadme(profile([block('b', 'banner', banner({ lines: many }))])))![1];
    expect(query.split(';')).toHaveLength(5);
    const long = /lines=([^)]*)\)/.exec(generateReadme(profile([block('b', 'banner', banner({ lines: 'a'.repeat(150) }))])))![1];
    expect(long).toBe('a'.repeat(100));
  });

  it('is created from the name and description, in the README language', () => {
    const created = createBlock('banner', { ...EMPTY_META, name: 'Jane', description: 'Dev', language: 'fr' });
    expect((created.data as { lines: string }).lines).toBe("Salut, moi c'est Jane\nDev");
    expect((createBlock('banner', EMPTY_META).data as { lines: string }).lines).toBe('');
  });
});

describe('bio block', () => {
  const data = { heading: "Hi 👋, I'm Jane", intro: 'I build things.', points: '🔭 Working on x\n- not a list' };

  it('renders the heading, the introduction and the points as a list', () => {
    expect(generateReadme(profile([block('b', 'bio', data)]))).toBe(
      "## Hi 👋, I'm Jane\n\nI build things.\n\n- 🔭 Working on x\n- \\- not a list\n"
    );
  });

  it('renders nothing when only the heading is filled', () => {
    expect(generateReadme(profile([block('b', 'bio', { ...data, intro: '', points: '' })]))).toBe('');
  });

  it('is created with a greeting that uses the name, in the README language', () => {
    const heading = (meta: Partial<typeof EMPTY_META>) =>
      (createBlock('bio', { ...EMPTY_META, ...meta }).data as { heading: string }).heading;
    expect(heading({ name: 'Jane' })).toBe("Hi 👋, I'm Jane");
    expect(heading({})).toBe('Hi there 👋');
    expect(heading({ name: 'Jane', language: 'fr' })).toBe("Salut 👋, moi c'est Jane");
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run tests/readme/blocks-profile-intro.test.ts`
Expected: FAIL, `TypeError: Cannot read properties of undefined (reading 'toMarkdown')` (les blocs `banner` et `bio` n'existent pas encore).

- [ ] **Step 3: Écrire les deux blocs**

Create `src/lib/readme/blocks/banner.ts` :

```ts
import { z } from 'zod';
import { defineBlock } from '../block-definition';
import { getDefaultText } from '../default-texts';
import { escapeAlt, nonEmptyLines, safeUrl } from '../markdown-utils';
import { param, parseBaseUrl } from '../services';

export const BANNER_FONTS = ['monospace', 'Fira Code', 'JetBrains Mono', 'Roboto', 'Poppins', 'Space Mono'] as const;
export const BANNER_SIZES = [16, 20, 24, 28, 32] as const;
export const BANNER_WIDTHS = [400, 500, 600, 800] as const;
export const BANNER_LIMITS = { lines: 1500, baseUrl: 300 } as const;
export const DEFAULT_TYPING_BASE = 'https://readme-typing-svg.demolab.com';

const MAX_LINES = 5;
const MAX_LINE_LENGTH = 100;

const oneOf = (list: readonly number[]) => (value: number) => list.includes(value);

const schema = z.object({
  lines: z.string().max(BANNER_LIMITS.lines),
  font: z.enum(BANNER_FONTS),
  size: z.number().refine(oneOf(BANNER_SIZES)),
  width: z.number().refine(oneOf(BANNER_WIDTHS)),
  align: z.enum(['left', 'center']),
  /** Six hex digits, or '' to use the theme accent color. */
  color: z.string().regex(/^([0-9a-fA-F]{6})?$/),
  baseUrl: z.string().max(BANNER_LIMITS.baseUrl),
});

export type BannerData = z.infer<typeof schema>;

export const bannerBlock = defineBlock<BannerData>({
  type: 'banner',
  modes: ['profile'],
  singleton: false,
  defaultOnCreate: false,
  recommended: true,
  schema,
  createData: (meta) => ({
    lines: [meta.name ? getDefaultText(meta.language, 'greeting').replace('{name}', () => meta.name) : '', meta.description]
      .filter((line) => line !== '')
      .join('\n'),
    font: 'Fira Code',
    size: 24,
    width: 500,
    align: 'center',
    color: '',
    baseUrl: '',
  }),
  toMarkdown: (data, ctx) => {
    // `;` separates the lines in the service's URL, so it cannot appear in a line.
    const lines = nonEmptyLines(data.lines)
      .slice(0, MAX_LINES)
      .map((line) => line.slice(0, MAX_LINE_LENGTH).replace(/;/g, ','));
    if (lines.length === 0) return '';
    const base = parseBaseUrl(data.baseUrl);
    if (base.status === 'invalid') return '';
    const root = base.status === 'ok' ? base.url : DEFAULT_TYPING_BASE;
    const query = [
      param('font', data.font),
      param('size', data.size),
      param('width', data.width),
      param('height', data.size + 30),
      param('color', data.color || ctx.theme.accentColor),
      param('center', data.align === 'center'),
      'vCenter=true',
      `lines=${lines.map((line) => encodeURIComponent(line).replace(/%20/g, '+')).join(';')}`,
    ].join('&');
    const image = `![${escapeAlt(lines[0])}](${safeUrl(`${root}/?${query}`)})`;
    return data.align === 'center' ? `<div align="center">\n\n${image}\n\n</div>` : image;
  },
});
```

Create `src/lib/readme/blocks/bio.ts` :

```ts
import { z } from 'zod';
import { defineBlock } from '../block-definition';
import { getDefaultText } from '../default-texts';
import { atxHeading, escapeMarkdownText, nonEmptyLines, normalizeNewlines } from '../markdown-utils';

export const BIO_LIMITS = { heading: 300, intro: 2000, points: 2000 } as const;

const schema = z.object({
  heading: z.string().max(BIO_LIMITS.heading),
  intro: z.string().max(BIO_LIMITS.intro),
  points: z.string().max(BIO_LIMITS.points),
});

export type BioData = z.infer<typeof schema>;

export const bioBlock = defineBlock<BioData>({
  type: 'bio',
  modes: ['profile'],
  singleton: false,
  defaultOnCreate: false,
  recommended: true,
  schema,
  createData: (meta) => ({
    heading: meta.name
      ? getDefaultText(meta.language, 'bio').replace('{name}', () => meta.name)
      : getDefaultText(meta.language, 'bioAnonymous'),
    intro: '',
    points: '',
  }),
  toMarkdown: (data) => {
    const intro = normalizeNewlines(data.intro).trim();
    const points = nonEmptyLines(data.points);
    if (intro === '' && points.length === 0) return '';
    return [
      atxHeading(2, data.heading),
      intro,
      points.map((point) => `- ${escapeMarkdownText(point)}`).join('\n'),
    ]
      .filter((part) => part !== '')
      .join('\n\n');
  },
});
```

- [ ] **Step 4: Enregistrer les blocs**

Modify `src/lib/readme/types.ts` : remplacer

```ts
  | 'freeMarkdown';
```

par

```ts
  | 'banner'
  | 'bio'
  | 'freeMarkdown';
```

Modify `src/lib/readme/registry.ts` : remplacer la ligne

```ts
import { alertBlock } from './blocks/alert';
```

par

```ts
import { alertBlock } from './blocks/alert';
import { bannerBlock } from './blocks/banner';
import { bioBlock } from './blocks/bio';
```

et remplacer la ligne

```ts
  freeMarkdown: freeMarkdownBlock,
```

par

```ts
  banner: bannerBlock,
  bio: bioBlock,
  freeMarkdown: freeMarkdownBlock,
```

Modify `tests/readme/state.test.ts` : le catalogue Profil n'est plus vide de recommandations, ce qui casse l'ancien test. Remplacer

```ts
  it('is empty for the profile catalog, which has no recommended block yet', () => {
    expect(getRecommendedTypes('profile')).toEqual([]);
  });
```

par (la liste complète n'est connue qu'à la Tâche 8, qui resserre ce test)

```ts
  it('recommends the profile intro blocks first, in catalog order', () => {
    expect(getRecommendedTypes('profile').slice(0, 2)).toEqual(['banner', 'bio']);
  });
```

- [ ] **Step 5: Vérifier que tout passe**

Run: `npx vitest run tests/readme && npx tsc --noEmit`
Expected: PASS, y compris le contrat du registre (`registry.test.ts`), qui vérifie maintenant aussi `banner` et `bio` avec des métadonnées de longueur maximale ; aucune erreur de types.

- [ ] **Step 6: Commit**

```bash
git add src/lib/readme tests/readme
git commit -m "$(cat <<'EOF'
feat(readme): ajoute les blocs Bannière animée et Présentation

Typing SVG paramétré (police, taille, largeur, alignement, couleur
d'accent, instance auto-hébergeable), texte des lignes encodé pour que
l'URL reste valide, présentation avec liste de points échappés.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Blocs Compétences et Contact

**Files:**
- Create: `src/lib/readme/blocks/skills.ts`, `src/lib/readme/blocks/contact.ts`
- Modify: `src/lib/readme/types.ts` (`BlockType`), `src/lib/readme/registry.ts`
- Test: `tests/readme/blocks-profile-links.test.ts`

**Interfaces:**
- Consumes: `defineBlock` ; `getDefaultText` ; `atxHeading`, `escapeAlt`, `safeUrl` ; `themedPair`, `safeEmail`, `safeWebUrl` (`services.ts`) ; `isSkillId`, `skillLabel` (`skill-catalog.ts`) ; `shieldsText` (`shields.ts`).
- Produces :
  - `skills.ts` : `skillsBlock` (mode `profile`, `recommended`), `SKILLS_LIMITS { heading: 200; maxIcons: 80 }`, `SKILL_PER_LINE = [5, 8, 10, 12, 15]`, `SkillsData { heading; icons: string[]; theme: 'auto' | 'light' | 'dark'; perLine }`.
  - `contact.ts` : `contactBlock` (mode `profile`), `CONTACT_NETWORKS` (douze réseaux : `label`, `logo`, `kind: 'url' | 'email'`), `CONTACT_NETWORK_KEYS`, `ContactNetwork`, `CONTACT_LIMITS { heading: 200; value: 300; maxItems: 12 }`, `ContactData { heading; items: { network; value }[] }`.
  - `BlockType` gagne `'skills' | 'contact'`.

- [ ] **Step 1: Écrire le test qui échoue**

Create `tests/readme/blocks-profile-links.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import { generateReadme } from '@/lib/readme/generate';
import { block, stateWith } from './helpers';

const profile = (blocks: Parameters<typeof stateWith>[0]) => stateWith(blocks, 'profile');

describe('skills block', () => {
  const data = (over: Record<string, unknown> = {}) => ({
    heading: 'Skills',
    icons: ['js', 'ts'],
    theme: 'auto',
    perLine: 10,
    ...over,
  });
  const url = (theme: string) => `https://skillicons.dev/icons?i=js,ts&amp;perline=10&amp;theme=${theme}`;

  it('renders one image per GitHub theme, with the skill names as alt text', () => {
    expect(generateReadme(profile([block('s', 'skills', data())]))).toBe(
      `## Skills\n\n![JavaScript, TypeScript](${url('light')}#gh-light-mode-only) ![JavaScript, TypeScript](${url('dark')}#gh-dark-mode-only)\n`
    );
  });

  it('renders a single image for a fixed theme', () => {
    expect(generateReadme(profile([block('s', 'skills', data({ theme: 'dark' }))]))).toBe(
      `## Skills\n\n![JavaScript, TypeScript](${url('dark')})\n`
    );
  });

  it('ignores unknown ids and duplicates, and never lets an id add a query parameter', () => {
    const output = generateReadme(
      profile([block('s', 'skills', data({ icons: ['py', 'python', 'js&x=1', 'py', 'JS', 'js,ts', 'ts'], theme: 'dark' }))])
    );
    expect(output).toContain('icons?i=py,ts&amp;perline=10');
    expect(output).toContain('![Python, TypeScript]');
  });

  it('renders nothing without a valid icon', () => {
    expect(generateReadme(profile([block('s', 'skills', data({ icons: [] }))]))).toBe('');
    expect(generateReadme(profile([block('s', 'skills', data({ icons: ['nope'] }))]))).toBe('');
  });
});

describe('contact block', () => {
  const data = (items: { network: string; value: string }[]) => ({ heading: 'Get in touch', items });

  it('renders each contact as a badge in the accent color, linked to its address', () => {
    const state = profile([
      block('c', 'contact', data([{ network: 'linkedin', value: 'https://linkedin.com/in/jane' }])),
    ]);
    expect(generateReadme(state)).toBe(
      '## Get in touch\n\n[![LinkedIn](https://img.shields.io/badge/LinkedIn-0969da?style=for-the-badge&amp;logo=linkedin&amp;logoColor=white)](https://linkedin.com/in/jane)\n'
    );
    expect(generateReadme({ ...state, theme: { accentColor: 'ff0000' } })).toContain('LinkedIn-ff0000');
  });

  it('links an email with mailto: and puts several badges on one line', () => {
    const state = profile([
      block(
        'c',
        'contact',
        data([
          { network: 'email', value: 'jane@example.com' },
          { network: 'stackoverflow', value: 'https://stackoverflow.com/users/1' },
        ])
      ),
    ]);
    expect(generateReadme(state)).toBe(
      '## Get in touch\n\n' +
        '[![Email](https://img.shields.io/badge/Email-0969da?style=for-the-badge)](mailto:jane@example.com) ' +
        '[![Stack Overflow](https://img.shields.io/badge/Stack_Overflow-0969da?style=for-the-badge&amp;logo=stackoverflow&amp;logoColor=white)](https://stackoverflow.com/users/1)\n'
    );
  });

  it('drops contacts whose address is unusable: dangerous links and malformed emails', () => {
    const state = profile([
      block(
        'c',
        'contact',
        data([
          { network: 'website', value: 'javascript:alert(1)' },
          { network: 'website', value: './relative' },
          { network: 'email', value: 'jane@' },
          { network: 'email', value: 'a@x.io?subject=hi' },
          { network: 'linkedin', value: '' },
        ])
      ),
    ]);
    expect(generateReadme(state)).toBe('');
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run tests/readme/blocks-profile-links.test.ts`
Expected: FAIL, `TypeError: Cannot read properties of undefined (reading 'toMarkdown')`.

- [ ] **Step 3: Écrire les deux blocs**

Create `src/lib/readme/blocks/skills.ts` :

```ts
import { z } from 'zod';
import { defineBlock } from '../block-definition';
import { getDefaultText } from '../default-texts';
import { atxHeading, escapeAlt, safeUrl } from '../markdown-utils';
import { themedPair } from '../services';
import { isSkillId, skillLabel } from '../skill-catalog';

export const SKILLS_LIMITS = { heading: 200, maxIcons: 80 } as const;
export const SKILL_PER_LINE = [5, 8, 10, 12, 15] as const;

const schema = z.object({
  heading: z.string().max(SKILLS_LIMITS.heading),
  // Ids are checked when the Markdown is generated, so a stale or edited id in an
  // imported file is ignored instead of making the whole block invalid.
  icons: z.array(z.string().max(40)).max(SKILLS_LIMITS.maxIcons),
  theme: z.enum(['auto', 'light', 'dark']),
  perLine: z.number().refine((value) => (SKILL_PER_LINE as readonly number[]).includes(value)),
});

export type SkillsData = z.infer<typeof schema>;

export const skillsBlock = defineBlock<SkillsData>({
  type: 'skills',
  modes: ['profile'],
  singleton: false,
  defaultOnCreate: false,
  recommended: true,
  schema,
  createData: (meta) => ({ heading: getDefaultText(meta.language, 'skills'), icons: [], theme: 'auto', perLine: 10 }),
  toMarkdown: (data) => {
    const ids = [...new Set(data.icons.filter(isSkillId))];
    if (ids.length === 0) return '';
    const alt = escapeAlt(ids.map(skillLabel).join(', '));
    const url = (theme: string) => safeUrl(`https://skillicons.dev/icons?i=${ids.join(',')}&perline=${data.perLine}&theme=${theme}`);
    const image =
      data.theme === 'auto'
        ? themedPair(alt, url('light'), url('dark'))
        : `![${alt}](${url(data.theme)})`;
    return [atxHeading(2, data.heading), image].filter((part) => part !== '').join('\n\n');
  },
});
```

Create `src/lib/readme/blocks/contact.ts` :

```ts
import { z } from 'zod';
import { defineBlock } from '../block-definition';
import { getDefaultText } from '../default-texts';
import { atxHeading, escapeAlt, safeUrl } from '../markdown-utils';
import { safeEmail, safeWebUrl } from '../services';
import { shieldsText } from '../shields';

/** `logo` is a Simple Icons slug (checked to exist); `kind` says how the address is validated. */
export const CONTACT_NETWORKS = {
  linkedin: { label: 'LinkedIn', logo: 'linkedin', kind: 'url' },
  x: { label: 'X', logo: 'x', kind: 'url' },
  bluesky: { label: 'Bluesky', logo: 'bluesky', kind: 'url' },
  mastodon: { label: 'Mastodon', logo: 'mastodon', kind: 'url' },
  youtube: { label: 'YouTube', logo: 'youtube', kind: 'url' },
  devto: { label: 'DEV', logo: 'devdotto', kind: 'url' },
  medium: { label: 'Medium', logo: 'medium', kind: 'url' },
  instagram: { label: 'Instagram', logo: 'instagram', kind: 'url' },
  twitch: { label: 'Twitch', logo: 'twitch', kind: 'url' },
  stackoverflow: { label: 'Stack Overflow', logo: 'stackoverflow', kind: 'url' },
  website: { label: 'Website', logo: '', kind: 'url' },
  email: { label: 'Email', logo: '', kind: 'email' },
} as const;

export type ContactNetwork = keyof typeof CONTACT_NETWORKS;
export const CONTACT_NETWORK_KEYS = Object.keys(CONTACT_NETWORKS) as [ContactNetwork, ...ContactNetwork[]];
export const CONTACT_LIMITS = { heading: 200, value: 300, maxItems: 12 } as const;

const itemSchema = z.object({
  network: z.enum(CONTACT_NETWORK_KEYS),
  value: z.string().max(CONTACT_LIMITS.value),
});

const schema = z.object({
  heading: z.string().max(CONTACT_LIMITS.heading),
  items: z.array(itemSchema).max(CONTACT_LIMITS.maxItems),
});

export type ContactItem = z.infer<typeof itemSchema>;
export type ContactData = z.infer<typeof schema>;

export const contactBlock = defineBlock<ContactData>({
  type: 'contact',
  modes: ['profile'],
  singleton: false,
  defaultOnCreate: false,
  recommended: true,
  schema,
  createData: (meta) => ({ heading: getDefaultText(meta.language, 'contact'), items: [] }),
  toMarkdown: (data, ctx) => {
    const badges = data.items
      .map((item) => {
        const network = CONTACT_NETWORKS[item.network];
        const address = network.kind === 'email' ? safeEmail(item.value) : safeWebUrl(item.value);
        if (address === '') return '';
        const target = network.kind === 'email' ? `mailto:${address}` : address;
        const query = network.logo ? 'style=for-the-badge&logo=' + network.logo + '&logoColor=white' : 'style=for-the-badge';
        const image = `![${escapeAlt(network.label)}](${safeUrl(
          `https://img.shields.io/badge/${shieldsText(network.label)}-${ctx.theme.accentColor}?${query}`
        )})`;
        return `[${image}](${target})`;
      })
      .filter((badge) => badge !== '');
    if (badges.length === 0) return '';
    return [atxHeading(2, data.heading), badges.join(' ')].filter((part) => part !== '').join('\n\n');
  },
});
```

- [ ] **Step 4: Enregistrer les blocs**

Modify `src/lib/readme/types.ts` : remplacer

```ts
  | 'freeMarkdown';
```

par

```ts
  | 'skills'
  | 'contact'
  | 'freeMarkdown';
```

Modify `src/lib/readme/registry.ts` : remplacer

```ts
import { bioBlock } from './blocks/bio';
```

par

```ts
import { bioBlock } from './blocks/bio';
import { contactBlock } from './blocks/contact';
import { skillsBlock } from './blocks/skills';
```

et remplacer

```ts
  bio: bioBlock,
  freeMarkdown: freeMarkdownBlock,
```

par

```ts
  bio: bioBlock,
  skills: skillsBlock,
  contact: contactBlock,
  freeMarkdown: freeMarkdownBlock,
```

- [ ] **Step 5: Vérifier que tout passe**

Run: `npx vitest run tests/readme && npx tsc --noEmit`
Expected: PASS ; aucune erreur de types.

- [ ] **Step 6: Commit**

```bash
git add src/lib/readme tests/readme
git commit -m "$(cat <<'EOF'
feat(readme): ajoute les blocs Compétences et Contact

Icônes skill-icons en deux thèmes GitHub, identifiants validés contre le
catalogue ; contacts en badges harmonisés sur la couleur d'accent, liens
http(s) ou mailto validés, jamais de lien relatif ni javascript:.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Blocs Statistiques et Trophées (URL de base obligatoire)

**Files:**
- Create: `src/lib/readme/card-service.ts`, `src/lib/readme/blocks/stats.ts`, `src/lib/readme/blocks/trophies.ts`
- Modify: `src/lib/readme/types.ts` (`BlockType`, `WarningCode`), `src/lib/readme/registry.ts`
- Test: `tests/readme/blocks-profile-cards.test.ts`

**Interfaces:**
- Consumes: `cleanUsername`, `parseBaseUrl`, `param`, `themedPair` (`services.ts`) ; `defineBlock` ; `getDefaultText` ; `atxHeading`, `escapeAlt`, `safeUrl` ; `validateReadme`.
- Produces :
  - `card-service.ts` : `resolveCardService(usernameInput, fallbackUsername, baseUrlInput): CardService` (`{ username: string; base: BaseUrl }`) et `cardWarnings(service: string, card: CardService): BlockWarning[]` (`missingUsername`, `missingBaseUrl` avec `params.service`, `invalidBaseUrl`).
  - `stats.ts` : `statsBlock` (mode `profile`, `recommended`), `STATS_LAYOUTS = ['compact', 'normal', 'donut', 'donut-vertical', 'pie']`, `STATS_LIMITS { heading: 200; username: 100; baseUrl: 300 }`, `StatsData { heading; username; baseUrl; showStats; showLanguages; layout; hideBorder }`.
  - `trophies.ts` : `trophiesBlock` (mode `profile`), `TROPHY_COLUMNS = [3, 4, 6, 8]`, `TROPHY_ROWS = [1, 2, 3]`, `TROPHIES_LIMITS`, `TrophiesData { heading; username; baseUrl; columns; rows }`.
  - `BlockType` gagne `'stats' | 'trophies'` ; `WarningCode` gagne `'missingUsername' | 'missingBaseUrl' | 'invalidBaseUrl'`.
  - Règle centrale : **sans URL de base valide ni nom d'utilisateur valide, le bloc rend `''`** et le validateur explique pourquoi. Aucune adresse publique n'est jamais utilisée par défaut.

- [ ] **Step 1: Écrire le test qui échoue**

Create `tests/readme/blocks-profile-cards.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import { EMPTY_META } from '@/lib/readme/defaults';
import { generateReadme } from '@/lib/readme/generate';
import { validateReadme } from '@/lib/readme/validate';
import { block, stateWith } from './helpers';

const profile = (blocks: Parameters<typeof stateWith>[0], meta: Partial<typeof EMPTY_META> = {}) => ({
  ...stateWith(blocks, 'profile'),
  meta: { ...EMPTY_META, ...meta },
});

const BASE = 'https://stats.example.com';

describe('stats block', () => {
  const data = (over: Record<string, unknown> = {}) => ({
    heading: 'GitHub stats',
    username: 'jane',
    baseUrl: BASE,
    showStats: true,
    showLanguages: true,
    layout: 'compact',
    hideBorder: true,
    ...over,
  });
  const common = 'title_color=0969da&amp;icon_color=0969da&amp;hide_border=true';
  const statsLight = `${BASE}/api?username=jane&amp;show_icons=true&amp;${common}`;
  const langsLight = `${BASE}/api/top-langs/?username=jane&amp;layout=compact&amp;${common}`;

  it('renders both cards, each in a light and a dark variant, from the given instance', () => {
    const image = (alt: string, url: string, mode: 'light' | 'dark') => `![${alt}](${url}#gh-${mode}-mode-only)`;
    expect(generateReadme(profile([block('s', 'stats', data())]))).toBe(
      '## GitHub stats\n\n<div align="center">\n\n' +
        [
          image("jane's GitHub stats", statsLight, 'light'),
          image("jane's GitHub stats", `${statsLight}&amp;theme=dark`, 'dark'),
          image('Most used languages of jane', langsLight, 'light'),
          image('Most used languages of jane', `${langsLight}&amp;theme=dark`, 'dark'),
        ].join(' ') +
        '\n\n</div>\n'
    );
  });

  it('renders only the requested cards and follows the border and layout choices', () => {
    const only = generateReadme(profile([block('s', 'stats', data({ showLanguages: false, hideBorder: false }))]));
    expect(only).toContain(`${BASE}/api?username=jane`);
    expect(only).not.toContain('top-langs');
    expect(only).not.toContain('hide_border');
    const donut = generateReadme(profile([block('s', 'stats', data({ showStats: false, layout: 'donut' }))]));
    expect(donut).toContain('layout=donut');
    expect(donut).not.toContain('show_icons');
  });

  it('falls back to the username of the README, and renders nothing when neither is valid', () => {
    expect(generateReadme(profile([block('s', 'stats', data({ username: '' }))], { username: 'octocat' }))).toContain(
      'username=octocat'
    );
    expect(generateReadme(profile([block('s', 'stats', data({ username: 'a b' }))], { username: 'x&y' }))).toBe('');
  });

  it('renders nothing without a base URL: no public instance is ever used by default', () => {
    for (const baseUrl of ['', '  ']) {
      expect(generateReadme(profile([block('s', 'stats', data({ baseUrl }))]))).toBe('');
    }
    expect(generateReadme(profile([block('s', 'stats', data({ baseUrl: 'https://github-readme-stats.vercel.app', username: '' }))]))).toBe('');
  });

  it('renders nothing for an invalid base URL', () => {
    for (const baseUrl of ['http://stats.example.com', `${BASE}?x=1`, `${BASE}/a b`]) {
      expect(generateReadme(profile([block('s', 'stats', data({ baseUrl }))]))).toBe('');
    }
  });

  it('tells the user why nothing is generated', () => {
    const codes = (over: Record<string, unknown>, meta: Partial<typeof EMPTY_META> = {}) =>
      validateReadme(profile([block('s', 'stats', data(over))], meta)).map((w) => w.code);
    expect(codes({})).toEqual([]);
    expect(codes({ baseUrl: '' })).toEqual(['missingBaseUrl']);
    expect(codes({ baseUrl: 'http://x.example.com' })).toEqual(['invalidBaseUrl']);
    expect(codes({ username: '' })).toEqual(['missingUsername']);
    expect(codes({ username: '', baseUrl: '' })).toEqual(['missingUsername', 'missingBaseUrl']);
    expect(codes({ baseUrl: '', showStats: false, showLanguages: false })).toEqual([]);
    expect(validateReadme(profile([block('s', 'stats', data({ baseUrl: '' }))]))[0]).toEqual({
      code: 'missingBaseUrl',
      params: { service: 'github-readme-stats' },
      blockId: 's',
    });
  });
});

describe('trophies block', () => {
  const data = (over: Record<string, unknown> = {}) => ({
    heading: 'Trophies',
    username: 'jane',
    baseUrl: BASE,
    columns: 6,
    rows: 1,
    ...over,
  });

  it('renders the trophies in a light and a dark variant', () => {
    const light = `${BASE}/?username=jane&amp;theme=flat&amp;column=6&amp;row=1`;
    const dark = `${BASE}/?username=jane&amp;theme=onedark&amp;column=6&amp;row=1`;
    expect(generateReadme(profile([block('t', 'trophies', data())]))).toBe(
      '## Trophies\n\n<div align="center">\n\n' +
        `![GitHub trophies of jane](${light}#gh-light-mode-only) ![GitHub trophies of jane](${dark}#gh-dark-mode-only)` +
        '\n\n</div>\n'
    );
  });

  it('renders nothing without a base URL or a valid username, and says why', () => {
    expect(generateReadme(profile([block('t', 'trophies', data({ baseUrl: '' }))]))).toBe('');
    expect(generateReadme(profile([block('t', 'trophies', data({ username: '' }))]))).toBe('');
    expect(validateReadme(profile([block('t', 'trophies', data({ baseUrl: '' }))]))).toEqual([
      { code: 'missingBaseUrl', params: { service: 'github-profile-trophy' }, blockId: 't' },
    ]);
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run tests/readme/blocks-profile-cards.test.ts`
Expected: FAIL, `TypeError: Cannot read properties of undefined (reading 'toMarkdown')`.

- [ ] **Step 3: Écrire le service commun et les deux blocs**

Create `src/lib/readme/card-service.ts` :

```ts
import { cleanUsername, parseBaseUrl, type BaseUrl } from './services';
import type { BlockWarning } from './types';

export interface CardService {
  username: string;
  base: BaseUrl;
}

/**
 * What a card block needs to build its URLs: a valid GitHub username (the block's
 * own, else the README's) and the self-hosted base URL. Without both the block
 * renders nothing: there is deliberately no public instance to fall back on.
 */
export function resolveCardService(usernameInput: string, fallbackUsername: string, baseUrlInput: string): CardService {
  return {
    username: cleanUsername(usernameInput) || cleanUsername(fallbackUsername),
    base: parseBaseUrl(baseUrlInput),
  };
}

export function cardWarnings(service: string, card: CardService): BlockWarning[] {
  const warnings: BlockWarning[] = [];
  if (card.username === '') warnings.push({ code: 'missingUsername' });
  if (card.base.status === 'empty') warnings.push({ code: 'missingBaseUrl', params: { service } });
  if (card.base.status === 'invalid') warnings.push({ code: 'invalidBaseUrl' });
  return warnings;
}
```

Create `src/lib/readme/blocks/stats.ts` :

```ts
import { z } from 'zod';
import { defineBlock } from '../block-definition';
import { cardWarnings, resolveCardService } from '../card-service';
import { getDefaultText } from '../default-texts';
import { atxHeading, escapeAlt, safeUrl } from '../markdown-utils';
import { param, themedPair } from '../services';

export const STATS_LAYOUTS = ['compact', 'normal', 'donut', 'donut-vertical', 'pie'] as const;
export const STATS_LIMITS = { heading: 200, username: 100, baseUrl: 300 } as const;

const schema = z.object({
  heading: z.string().max(STATS_LIMITS.heading),
  username: z.string().max(STATS_LIMITS.username),
  baseUrl: z.string().max(STATS_LIMITS.baseUrl),
  showStats: z.boolean(),
  showLanguages: z.boolean(),
  layout: z.enum(STATS_LAYOUTS),
  hideBorder: z.boolean(),
});

export type StatsData = z.infer<typeof schema>;

const SERVICE = 'github-readme-stats';

export const statsBlock = defineBlock<StatsData>({
  type: 'stats',
  modes: ['profile'],
  singleton: false,
  defaultOnCreate: false,
  recommended: true,
  schema,
  createData: (meta) => ({
    heading: getDefaultText(meta.language, 'stats'),
    username: meta.username,
    baseUrl: '',
    showStats: true,
    showLanguages: true,
    layout: 'compact',
    hideBorder: true,
  }),
  toMarkdown: (data, ctx) => {
    const { username, base } = resolveCardService(data.username, ctx.meta.username, data.baseUrl);
    if (username === '' || base.status !== 'ok' || (!data.showStats && !data.showLanguages)) return '';
    const accent = ctx.theme.accentColor;
    const card = (path: string, extra: string[], dark: boolean) =>
      safeUrl(
        `${base.url}${path}?` +
          [
            param('username', username),
            ...extra,
            param('title_color', accent),
            param('icon_color', accent),
            ...(data.hideBorder ? ['hide_border=true'] : []),
            ...(dark ? ['theme=dark'] : []),
          ].join('&')
      );
    const images: string[] = [];
    if (data.showStats) {
      const alt = escapeAlt(getDefaultText(ctx.meta.language, 'statsAlt').replace('{username}', () => username));
      images.push(themedPair(alt, card('/api', ['show_icons=true'], false), card('/api', ['show_icons=true'], true)));
    }
    if (data.showLanguages) {
      const alt = escapeAlt(getDefaultText(ctx.meta.language, 'languagesAlt').replace('{username}', () => username));
      const extra = [param('layout', data.layout)];
      images.push(themedPair(alt, card('/api/top-langs/', extra, false), card('/api/top-langs/', extra, true)));
    }
    return [atxHeading(2, data.heading), `<div align="center">\n\n${images.join(' ')}\n\n</div>`]
      .filter((part) => part !== '')
      .join('\n\n');
  },
  validate: (data, ctx) =>
    data.showStats || data.showLanguages
      ? cardWarnings(SERVICE, resolveCardService(data.username, ctx.meta.username, data.baseUrl))
      : [],
});
```

Create `src/lib/readme/blocks/trophies.ts` :

```ts
import { z } from 'zod';
import { defineBlock } from '../block-definition';
import { cardWarnings, resolveCardService } from '../card-service';
import { getDefaultText } from '../default-texts';
import { atxHeading, escapeAlt, safeUrl } from '../markdown-utils';
import { param, themedPair } from '../services';

export const TROPHY_COLUMNS = [3, 4, 6, 8] as const;
export const TROPHY_ROWS = [1, 2, 3] as const;
export const TROPHIES_LIMITS = { heading: 200, username: 100, baseUrl: 300 } as const;

const oneOf = (list: readonly number[]) => (value: number) => list.includes(value);

const schema = z.object({
  heading: z.string().max(TROPHIES_LIMITS.heading),
  username: z.string().max(TROPHIES_LIMITS.username),
  baseUrl: z.string().max(TROPHIES_LIMITS.baseUrl),
  columns: z.number().refine(oneOf(TROPHY_COLUMNS)),
  rows: z.number().refine(oneOf(TROPHY_ROWS)),
});

export type TrophiesData = z.infer<typeof schema>;

const SERVICE = 'github-profile-trophy';

export const trophiesBlock = defineBlock<TrophiesData>({
  type: 'trophies',
  modes: ['profile'],
  singleton: false,
  defaultOnCreate: false,
  schema,
  createData: (meta) => ({
    heading: getDefaultText(meta.language, 'trophies'),
    username: meta.username,
    baseUrl: '',
    columns: 6,
    rows: 1,
  }),
  toMarkdown: (data, ctx) => {
    const { username, base } = resolveCardService(data.username, ctx.meta.username, data.baseUrl);
    if (username === '' || base.status !== 'ok') return '';
    const url = (theme: string) =>
      safeUrl(
        `${base.url}/?` +
          [param('username', username), param('theme', theme), param('column', data.columns), param('row', data.rows)].join('&')
      );
    const alt = escapeAlt(getDefaultText(ctx.meta.language, 'trophiesAlt').replace('{username}', () => username));
    return [atxHeading(2, data.heading), `<div align="center">\n\n${themedPair(alt, url('flat'), url('onedark'))}\n\n</div>`]
      .filter((part) => part !== '')
      .join('\n\n');
  },
  validate: (data, ctx) => cardWarnings(SERVICE, resolveCardService(data.username, ctx.meta.username, data.baseUrl)),
});
```

- [ ] **Step 4: Enregistrer les blocs et les avertissements**

Modify `src/lib/readme/types.ts` : remplacer

```ts
  | 'freeMarkdown';
```

par

```ts
  | 'stats'
  | 'trophies'
  | 'freeMarkdown';
```

et remplacer la ligne de `WarningCode`

```ts
export type WarningCode = 'imageMissingAlt' | 'htmlTagMismatch' | 'layoutTable' | 'tooManyBadges';
```

par

```ts
export type WarningCode =
  | 'imageMissingAlt'
  | 'htmlTagMismatch'
  | 'layoutTable'
  | 'tooManyBadges'
  | 'missingUsername'
  | 'missingBaseUrl'
  | 'invalidBaseUrl';
```

Modify `src/lib/readme/registry.ts` : remplacer

```ts
import { skillsBlock } from './blocks/skills';
```

par

```ts
import { skillsBlock } from './blocks/skills';
import { statsBlock } from './blocks/stats';
import { trophiesBlock } from './blocks/trophies';
```

et remplacer

```ts
  skills: skillsBlock,
  contact: contactBlock,
```

par

```ts
  skills: skillsBlock,
  stats: statsBlock,
  trophies: trophiesBlock,
  contact: contactBlock,
```

- [ ] **Step 5: Vérifier que tout passe**

Run: `npx vitest run tests/readme && npx tsc --noEmit`
Expected: PASS ; aucune erreur de types.

- [ ] **Step 6: Commit**

```bash
git add src/lib/readme tests/readme
git commit -m "$(cat <<'EOF'
feat(readme): ajoute les blocs Statistiques et Trophées

L'URL de base de l'instance est obligatoire : sans elle (ou sans nom
d'utilisateur valide) le bloc ne génère rien et le validateur explique
pourquoi, car les services publics sont désactivés. Cartes en variantes
clair et sombre repérées par les fragments GitHub.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Bloc Articles de blog et workflow

**Files:**
- Create: `src/lib/readme/blocks/blog.ts`, `src/lib/readme/workflow.ts`
- Modify: `src/lib/readme/types.ts` (`BlockType`, `WarningCode`), `src/lib/readme/registry.ts`
- Test: `tests/readme/blog-workflow.test.ts`

**Interfaces:**
- Consumes: `safeFeedUrl` (`services.ts`) ; `getBlockDefinition` (`registry.ts`) ; `atxHeading` ; `getDefaultText` ; `canAddBlock` (`state.ts`).
- Produces :
  - `blog.ts` : `blogBlock` (mode `profile`, **singleton**), `BLOG_TAG = 'BLOG-POST-LIST'`, `BLOG_START`, `BLOG_END`, `BLOG_MAX_POSTS = [3, 5, 8, 10]`, `BLOG_LIMITS { heading: 200; feedUrl: 500 }`, `BlogData { heading; feedUrl; maxPosts; schedule: 'daily' | 'weekly' }`.
  - `workflow.ts` : `generateWorkflow(state: ReadmeState): string | null` (le YAML du workflow, ou `null` sans bloc Blog actif à flux valide), `WORKFLOW_FILE_NAME = 'blog-post-workflow.yml'`, `WORKFLOW_PATH = '.github/workflows/blog-post-workflow.yml'`. Les deux actions sont épinglées par SHA de commit.
  - `BlockType` gagne `'blog'` ; `WarningCode` gagne `'invalidFeed'`.

- [ ] **Step 1: Écrire le test qui échoue**

Create `tests/readme/blog-workflow.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import { generateReadme } from '@/lib/readme/generate';
import { canAddBlock } from '@/lib/readme/state';
import { validateReadme } from '@/lib/readme/validate';
import { WORKFLOW_FILE_NAME, WORKFLOW_PATH, generateWorkflow } from '@/lib/readme/workflow';
import { block, stateWith } from './helpers';

const profile = (blocks: Parameters<typeof stateWith>[0]) => stateWith(blocks, 'profile');

const blog = (over: Record<string, unknown> = {}) => ({
  heading: 'Latest blog posts',
  feedUrl: 'https://blog.example.com/feed.xml',
  maxPosts: 5,
  schedule: 'daily',
  ...over,
});

describe('blog block', () => {
  it('renders the heading and the anchors the workflow fills', () => {
    expect(generateReadme(profile([block('b', 'blog', blog())]))).toBe(
      '## Latest blog posts\n\n<!-- BLOG-POST-LIST:START -->\n<!-- BLOG-POST-LIST:END -->\n'
    );
  });

  it('keeps the anchors even without a heading or a feed', () => {
    expect(generateReadme(profile([block('b', 'blog', blog({ heading: '', feedUrl: '' }))]))).toBe(
      '<!-- BLOG-POST-LIST:START -->\n<!-- BLOG-POST-LIST:END -->\n'
    );
  });

  it('warns about a missing or unusable feed address', () => {
    expect(validateReadme(profile([block('b', 'blog', blog())]))).toEqual([]);
    for (const feedUrl of ['', 'ftp://x.example.com/feed', 'https://x.example.com/a,b']) {
      expect(validateReadme(profile([block('b', 'blog', blog({ feedUrl }))]))).toEqual([
        { code: 'invalidFeed', blockId: 'b' },
      ]);
    }
  });

  it('allows a single Blog block per README', () => {
    expect(canAddBlock(profile([block('b', 'blog', blog())]), 'blog')).toBe(false);
    expect(canAddBlock(profile([]), 'blog')).toBe(true);
  });
});

describe('generateWorkflow', () => {
  const YAML = [
    'name: Latest blog posts',
    'on:',
    '  schedule:',
    "    - cron: '0 0 * * *'",
    '  workflow_dispatch:',
    'permissions:',
    '  contents: write',
    'jobs:',
    '  update-readme-with-blog:',
    '    name: Update this README with the latest blog posts',
    '    runs-on: ubuntu-latest',
    '    steps:',
    '      - name: Checkout',
    '        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1',
    '      - name: Pull in blog posts',
    '        uses: gautamkrishnar/blog-post-workflow@f177491c77670f150ab4e9b9890254d8eba4164b # 1.9.7',
    '        with:',
    '          feed_list: "https://blog.example.com/feed.xml"',
    '          max_post_count: 5',
    '',
  ].join('\n');

  it('generates the workflow for an active Blog block with a valid feed', () => {
    expect(generateWorkflow(profile([block('b', 'blog', blog())]))).toBe(YAML);
  });

  it('follows the schedule and the number of posts', () => {
    const weekly = generateWorkflow(profile([block('b', 'blog', blog({ schedule: 'weekly', maxPosts: 10 }))]));
    expect(weekly).toContain("- cron: '0 0 * * 0'");
    expect(weekly).toContain('max_post_count: 10');
  });

  it('pins every action to a full commit SHA, never to a moving tag', () => {
    const uses = generateWorkflow(profile([block('b', 'blog', blog())]))!
      .split('\n')
      .filter((line) => line.includes('uses:'));
    expect(uses).toHaveLength(2);
    for (const line of uses) expect(line).toMatch(/@[0-9a-f]{40} # \S+$/);
  });

  it('generates nothing without an active Blog block or with an unusable feed', () => {
    expect(generateWorkflow(profile([]))).toBeNull();
    expect(generateWorkflow(profile([block('b', 'blog', blog(), false)]))).toBeNull();
    for (const feedUrl of ['', 'ftp://x.example.com/feed', 'https://x.example.com/a"b', 'https://x.example.com/a\nb']) {
      expect(generateWorkflow(profile([block('b', 'blog', blog({ feedUrl }))])), feedUrl).toBeNull();
    }
    expect(generateWorkflow(profile([block('b', 'blog', { heading: 'x' })]))).toBeNull();
  });

  it('names the file where GitHub expects it', () => {
    expect(WORKFLOW_FILE_NAME).toBe('blog-post-workflow.yml');
    expect(WORKFLOW_PATH).toBe('.github/workflows/blog-post-workflow.yml');
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run tests/readme/blog-workflow.test.ts`
Expected: FAIL, module `@/lib/readme/workflow` introuvable.

- [ ] **Step 3: Écrire le bloc et le générateur**

Create `src/lib/readme/blocks/blog.ts` :

```ts
import { z } from 'zod';
import { defineBlock } from '../block-definition';
import { getDefaultText } from '../default-texts';
import { atxHeading } from '../markdown-utils';
import { safeFeedUrl } from '../services';

export const BLOG_TAG = 'BLOG-POST-LIST';
export const BLOG_START = `<!-- ${BLOG_TAG}:START -->`;
export const BLOG_END = `<!-- ${BLOG_TAG}:END -->`;
export const BLOG_MAX_POSTS = [3, 5, 8, 10] as const;
export const BLOG_LIMITS = { heading: 200, feedUrl: 500 } as const;

const schema = z.object({
  heading: z.string().max(BLOG_LIMITS.heading),
  feedUrl: z.string().max(BLOG_LIMITS.feedUrl),
  maxPosts: z.number().refine((value) => (BLOG_MAX_POSTS as readonly number[]).includes(value)),
  schedule: z.enum(['daily', 'weekly']),
});

export type BlogData = z.infer<typeof schema>;

export const blogBlock = defineBlock<BlogData>({
  type: 'blog',
  modes: ['profile'],
  // The anchor name is fixed, so one Blog block per README.
  singleton: true,
  defaultOnCreate: false,
  schema,
  createData: (meta) => ({ heading: getDefaultText(meta.language, 'blog'), feedUrl: '', maxPosts: 5, schedule: 'daily' }),
  // The posts between the anchors are written by the workflow, never by this tool.
  toMarkdown: (data) => [atxHeading(2, data.heading), `${BLOG_START}\n${BLOG_END}`].filter((part) => part !== '').join('\n\n'),
  validate: (data) => (safeFeedUrl(data.feedUrl) === '' ? [{ code: 'invalidFeed' }] : []),
});
```

Create `src/lib/readme/workflow.ts` :

```ts
import type { BlogData } from './blocks/blog';
import { getBlockDefinition } from './registry';
import { safeFeedUrl } from './services';
import type { ReadmeState } from './types';

export const WORKFLOW_FILE_NAME = 'blog-post-workflow.yml';
export const WORKFLOW_PATH = `.github/workflows/${WORKFLOW_FILE_NAME}`;

// Pinned to full commit SHAs, because a tag can be moved to different code; the
// version stays in a comment for humans. To upgrade, resolve the new tag with
// `git ls-remote <repository> refs/tags/<tag>` and update both the SHA and the comment.
const CHECKOUT_ACTION = 'actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1';
const BLOG_ACTION = 'gautamkrishnar/blog-post-workflow@f177491c77670f150ab4e9b9890254d8eba4164b # 1.9.7';
const CRON = { daily: '0 0 * * *', weekly: '0 0 * * 0' } as const;

/**
 * The GitHub Actions workflow that refreshes the blog posts between the README's
 * anchors, or null when there is no active Blog block with a usable feed. The feed
 * address was validated to contain nothing that could break out of the YAML string.
 */
export function generateWorkflow(state: ReadmeState): string | null {
  const blogBlock = state.blocks.find((block) => block.enabled && block.type === 'blog');
  if (!blogBlock) return null;
  const parsed = getBlockDefinition('blog').parseData(blogBlock.data);
  if (!parsed.success) return null;
  const data = parsed.data as BlogData;
  const feed = safeFeedUrl(data.feedUrl);
  if (feed === '') return null;
  return (
    [
      'name: Latest blog posts',
      'on:',
      '  schedule:',
      `    - cron: '${CRON[data.schedule]}'`,
      '  workflow_dispatch:',
      'permissions:',
      '  contents: write',
      'jobs:',
      '  update-readme-with-blog:',
      '    name: Update this README with the latest blog posts',
      '    runs-on: ubuntu-latest',
      '    steps:',
      '      - name: Checkout',
      `        uses: ${CHECKOUT_ACTION}`,
      '      - name: Pull in blog posts',
      `        uses: ${BLOG_ACTION}`,
      '        with:',
      `          feed_list: "${feed}"`,
      `          max_post_count: ${data.maxPosts}`,
    ].join('\n') + '\n'
  );
}
```

- [ ] **Step 4: Enregistrer le bloc**

Modify `src/lib/readme/types.ts` : remplacer

```ts
  | 'freeMarkdown';
```

par

```ts
  | 'blog'
  | 'freeMarkdown';
```

et remplacer

```ts
  | 'invalidBaseUrl';
```

par

```ts
  | 'invalidBaseUrl'
  | 'invalidFeed';
```

Modify `src/lib/readme/registry.ts` : remplacer

```ts
import { bioBlock } from './blocks/bio';
```

par

```ts
import { bioBlock } from './blocks/bio';
import { blogBlock } from './blocks/blog';
```

et remplacer

```ts
  trophies: trophiesBlock,
  contact: contactBlock,
```

par

```ts
  trophies: trophiesBlock,
  blog: blogBlock,
  contact: contactBlock,
```

- [ ] **Step 5: Vérifier que tout passe**

Run: `npx vitest run tests/readme && npx tsc --noEmit`
Expected: PASS ; aucune erreur de types.

- [ ] **Step 6: Commit**

```bash
git add src/lib/readme tests/readme
git commit -m "$(cat <<'EOF'
feat(readme): ajoute le bloc Articles de blog et le générateur de workflow

Balises d'ancrage BLOG-POST-LIST, un seul bloc par README, workflow
GitHub Actions dont les deux actions sont épinglées par SHA de commit et
dont l'adresse de flux est validée avant d'entrer dans le YAML.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```


---

### Task 8: Assistant adapté au profil

**Files:**
- Modify: `src/components/readme-generator/readme-wizard.tsx`
- Test: `tests/readme/wizard.test.ts`, `tests/readme/state.test.ts`

**Interfaces:**
- Consumes: `applyWizard`, `getRecommendedTypes`, `getDefaultText`, `META_LIMITS.username`, `EMPTY_META` (avec `username`), les blocs des Tâches 4 à 7.
- Produces: rien de nouveau côté API. L'assistant en mode Profil demande le nom d'utilisateur GitHub (étape « Informations »), ne propose plus le pré-remplissage par manifeste (qui ne concerne que les projets), et `getRecommendedTypes('profile')` vaut `['banner', 'bio', 'skills', 'stats', 'contact']`.

Le comportement de `applyWizard` n'a pas besoin de changer : les blocs du profil se créent, se remplissent et se re-traduisent par les mêmes mécanismes (`createData(meta)`, `refreshData`). Cette tâche le **prouve** par des tests, puis adapte l'interface.

- [ ] **Step 1: Resserrer le test des recommandations du profil**

Modify `tests/readme/state.test.ts` : remplacer

```ts
  it('recommends the profile intro blocks first, in catalog order', () => {
    expect(getRecommendedTypes('profile').slice(0, 2)).toEqual(['banner', 'bio']);
  });
```

par

```ts
  it('lists the recommended blocks of the profile catalog, in catalog order', () => {
    expect(getRecommendedTypes('profile')).toEqual(['banner', 'bio', 'skills', 'stats', 'contact']);
  });
```

- [ ] **Step 2: Écrire les tests de l'assistant en mode Profil**

Modify `tests/readme/wizard.test.ts` : remplacer la ligne d'import

```ts
import { getBlockDefinition } from '@/lib/readme/registry';
```

par

```ts
import { getDefaultText } from '@/lib/readme/default-texts';
import { BLOCK_TYPES, getBlockDefinition, getRecommendedTypes } from '@/lib/readme/registry';
```

Puis ajouter à la fin du fichier :

```ts
describe('applyWizard for a profile', () => {
  const stats = (id: string, username: string) =>
    block(id, 'stats', {
      heading: 'GitHub stats',
      username,
      baseUrl: '',
      showStats: true,
      showLanguages: true,
      layout: 'compact',
      hideBorder: true,
    });

  it('creates the recommended profile blocks, seeded from the collected info and language', () => {
    const fresh = {
      ...stateWith([], 'profile'),
      meta: { ...EMPTY_META, name: 'Jane', username: 'jane', description: 'Dev', language: 'fr' as const },
    };
    const result = applyWizard(fresh, { mode: 'profile', selected: getRecommendedTypes('profile'), isNew: true });
    expect(result.blocks.map((b) => b.type)).toEqual(['banner', 'bio', 'skills', 'stats', 'contact']);
    const [banner, bio, , statsBlock] = result.blocks.map((b) => b.data as Record<string, string>);
    expect(banner.lines).toBe("Salut, moi c'est Jane\nDev");
    expect(bio.heading).toBe(getDefaultText('fr', 'bio').replace('{name}', 'Jane'));
    expect(statsBlock.username).toBe('jane');
  });

  it('fills an empty username from the meta and never overwrites a typed one', () => {
    const base = { ...stateWith([stats('a', ''), stats('b', 'typed')], 'profile'), meta: { ...EMPTY_META, username: 'octocat' } };
    const result = applyWizard(base, { mode: 'profile', selected: ['stats'], isNew: false });
    expect(dataOf(result, 'a').username).toBe('octocat');
    expect(dataOf(result, 'b').username).toBe('typed');
  });

  it('re-seeds a greeting heading that is still the default text when the language changes', () => {
    const anonymous = block('bio', 'bio', { heading: getDefaultText('en', 'bioAnonymous'), intro: '', points: '' });
    const custom = block('own', 'bio', { heading: 'My own title', intro: '', points: '' });
    const base = { ...stateWith([anonymous, custom], 'profile'), meta: { ...EMPTY_META, language: 'fr' as const } };
    const result = applyWizard(base, { mode: 'profile', selected: ['bio'], isNew: false });
    expect(dataOf(result, 'bio').heading).toBe(getDefaultText('fr', 'bioAnonymous'));
    expect(dataOf(result, 'own').heading).toBe('My own title');
  });

  it('never produces a profile block that fails its own schema, even from the longest meta', () => {
    const longest = {
      name: 'x'.repeat(META_LIMITS.name),
      description: 'x'.repeat(META_LIMITS.description),
      author: 'x'.repeat(META_LIMITS.author),
      license: 'x'.repeat(META_LIMITS.license),
      repoUrl: 'x'.repeat(META_LIMITS.repoUrl),
      installCommand: 'x'.repeat(META_LIMITS.installCommand),
      username: 'x'.repeat(META_LIMITS.username),
      language: 'ja' as const,
    };
    const profileTypes = BLOCK_TYPES.filter((type) => getBlockDefinition(type).modes.includes('profile'));
    const result = applyWizard({ ...stateWith([], 'profile'), meta: longest }, { mode: 'profile', selected: profileTypes, isNew: true });
    expect(result.blocks.map((b) => b.type)).toEqual(profileTypes);
    for (const b of result.blocks) {
      expect(getBlockDefinition(b.type).parseData(b.data).success, b.type).toBe(true);
    }
  });
});
```

- [ ] **Step 3: Vérifier le résultat**

Run: `npx vitest run tests/readme/wizard.test.ts tests/readme/state.test.ts`
Expected: PASS. Ces tests décrivent des comportements que les Tâches 1 à 7 rendent déjà vrais ; si l'un échoue, c'est un défaut d'une tâche précédente (le corriger là, avec son test), pas de cette tâche.

- [ ] **Step 4: Adapter l'assistant**

Modify `src/components/readme-generator/readme-wizard.tsx` :

Remplacer

```tsx
type MetaField = 'name' | 'description' | 'author' | 'license' | 'repoUrl' | 'installCommand';
const PROJECT_FIELDS: MetaField[] = ['name', 'description', 'author', 'license', 'repoUrl', 'installCommand'];
const PROFILE_FIELDS: MetaField[] = ['name', 'description'];
```

par

```tsx
type MetaField = 'name' | 'description' | 'author' | 'license' | 'repoUrl' | 'installCommand' | 'username';
const PROJECT_FIELDS: MetaField[] = ['name', 'description', 'author', 'license', 'repoUrl', 'installCommand'];
const PROFILE_FIELDS: MetaField[] = ['name', 'description', 'username'];
```

Remplacer la ligne du `placeholder` de l'`Input` de l'étape 3

```tsx
                    placeholder={field === 'name' ? t('placeholders.title') : field === 'repoUrl' ? t('placeholders.repoUrl') : undefined}
```

par

```tsx
                    placeholder={
                      field === 'name'
                        ? t('placeholders.title')
                        : field === 'repoUrl'
                          ? t('placeholders.repoUrl')
                          : field === 'username'
                            ? t('placeholders.username')
                            : undefined
                    }
```

Remplacer le test d'appartenance de l'étiquette « rempli automatiquement » : `ExtractedKey` ne contient pas `username`, ce qui ferait échouer `includes` au typage.

```tsx
                    {filled.includes(field) && (
```

par

```tsx
                    {filled.some((key) => key === field) && (
```

Dans l'étape 2, remplacer le bouton et le panneau de pré-remplissage :

```tsx
              <button
                type="button"
                aria-expanded={showPrefill}
                onClick={() => setShowPrefill((open) => !open)}
                className="w-full rounded-md border p-4 text-left hover:bg-muted"
              >
                <span className="block font-medium">{t('wizard.prefill')}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{t('wizard.prefillDesc')}</span>
              </button>
              {showPrefill && <ExtractionPanel onExtracted={handleExtracted} />}
```

par (l'extraction lit des manifestes de projet : elle n'a pas de sens pour un profil)

```tsx
              {mode === 'project' && (
                <button
                  type="button"
                  aria-expanded={showPrefill}
                  onClick={() => setShowPrefill((open) => !open)}
                  className="w-full rounded-md border p-4 text-left hover:bg-muted"
                >
                  <span className="block font-medium">{t('wizard.prefill')}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">{t('wizard.prefillDesc')}</span>
                </button>
              )}
              {mode === 'project' && showPrefill && <ExtractionPanel onExtracted={handleExtracted} />}
```

- [ ] **Step 5: Vérifier types, lint et suite**

Run: `npx tsc --noEmit && npm run lint && npx vitest run tests/readme tests/i18n`
Expected: PASS ; aucune erreur de types ni de lint.

- [ ] **Step 6: Commit**

```bash
git add src/components/readme-generator/readme-wizard.tsx tests/readme
git commit -m "$(cat <<'EOF'
feat(readme): adapte l'assistant au mode Profil

L'assistant demande le nom d'utilisateur GitHub pour un profil et ne
propose plus l'extraction de manifeste, propre aux projets. Les tests
prouvent que les blocs du profil se créent, se remplissent et suivent la
langue du README comme ceux du mode Projet.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: Formulaires du profil, panneau du workflow et aperçu clair/sombre

**Files:**
- Create: `src/components/readme-generator/workflow-panel.tsx`
- Modify: `src/components/readme-generator/block-forms.tsx`, `src/components/readme-generator/readme-generator.tsx`, `src/components/readme-generator/readme-preview.tsx`, `src/components/readme-generator/readme-preview.css`

**Interfaces:**
- Consumes: les sept blocs et leurs constantes de limites (Tâches 4 à 7) ; `SKILL_GROUPS` (Tâche 2) ; `generateWorkflow`, `WORKFLOW_FILE_NAME` (Tâche 7) ; les clés i18n de la Tâche 3 (`fields.*`, `options.*`, `skillGroups.*`, `hints.*`, `placeholders.*`, `workflow.*`).
- Produces : un cas `BlockForm` pour chacun des sept types, `WorkflowPanel({ workflow: string | null; onDownload: () => void })`, et l'aperçu qui n'affiche que la variante d'image du thème actif.

Cette tâche ne se teste pas par vitest (aucun test de composant dans le projet) : elle est couverte par `tsc`, `lint` et par la vérification en navigateur de la Tâche 10.

**Ruling assumé :** le champ `baseUrl` du bloc Bannière (instance auto-hébergée de readme-typing-svg) n'a pas de champ dans le formulaire. Le service public de la bannière fonctionne, contrairement à ceux des statistiques et des trophées ; le réglage reste disponible par le fichier JSON exporté, sans alourdir l'interface ni les 8 locales.

- [ ] **Step 1: L'aperçu montre la variante de thème qui correspond à son bouton**

GitHub n'affiche que l'image portant le fragment du thème actif ; l'aperçu doit faire pareil, sinon il montrerait chaque image en double.

Modify `src/components/readme-generator/readme-preview.tsx` : remplacer

```tsx
type PreviewImageProps = React.ComponentPropsWithoutRef<'img'> & { node?: unknown };

/** Shows the alt text when an external image (badge, stats card…) fails to load. */
function PreviewImage({ node, src, alt, ...rest }: PreviewImageProps) {
  void node;
  const [failed, setFailed] = useState(false);
  if (typeof src !== 'string' || failed) {
    return <span className="italic opacity-70">{alt}</span>;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...rest} src={src} alt={alt ?? ''} onError={() => setFailed(true)} />;
}
```

par

```tsx
type PreviewImageProps = React.ComponentPropsWithoutRef<'img'> & { node?: unknown };

// GitHub shows only the image whose fragment matches the reader's theme.
const THEME_FRAGMENT = /#gh-(light|dark)-mode-only$/;

/**
 * Shows the alt text when an external image (badge, stats card…) fails to load.
 * The theme variant is kept on either rendering so a failed variant of the other
 * theme stays hidden too.
 */
function PreviewImage({ node, src, alt, ...rest }: PreviewImageProps) {
  void node;
  const [failed, setFailed] = useState(false);
  const variant = typeof src === 'string' ? THEME_FRAGMENT.exec(src)?.[1] : undefined;
  if (typeof src !== 'string' || failed) {
    return (
      <span className="italic opacity-70" data-variant={variant}>
        {alt}
      </span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...rest} src={src} alt={alt ?? ''} data-variant={variant} onError={() => setFailed(true)} />;
}
```

Modify `src/components/readme-generator/readme-preview.css` : ajouter à la fin

```css

/* Images made for the other theme (#gh-light-mode-only / #gh-dark-mode-only) are hidden, as on GitHub. */
.readme-preview[data-theme='light'] [data-variant='dark'],
.readme-preview[data-theme='dark'] [data-variant='light'] {
  display: none;
}
```

- [ ] **Step 2: Créer le panneau du workflow**

Create `src/components/readme-generator/workflow-panel.tsx` :

```tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download } from '@/components/icons';

interface WorkflowPanelProps {
  /** The YAML file, or null while the feed address is missing or invalid. */
  workflow: string | null;
  onDownload: () => void;
}

/** Explains the three things the user must do on GitHub for the blog area to fill itself. */
export function WorkflowPanel({ workflow, onDownload }: WorkflowPanelProps) {
  const t = useTranslations('readmeGenerator');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('workflow.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p>{t('workflow.intro')}</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>{t('workflow.step1')}</li>
          <li>{t('workflow.step2')}</li>
          <li>{t('workflow.step3')}</li>
        </ol>
        <p className="text-muted-foreground">{t('workflow.note')}</p>
        {workflow ? (
          <Button type="button" size="sm" onClick={onDownload}>
            <Download className="w-4 h-4 mr-1" />
            {t('workflow.download')}
          </Button>
        ) : (
          <p role="status" className="text-muted-foreground">
            {t('workflow.noFeed')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Ajouter les sept formulaires**

Modify `src/components/readme-generator/block-forms.tsx` :

Remplacer

```tsx
import { ARCHITECTURE_LIMITS, type ArchitectureData } from '@/lib/readme/blocks/architecture';
import { BADGE_LIMITS, type BadgeItem, type BadgesData } from '@/lib/readme/blocks/badges';
import { CONTRIBUTING_LIMITS, type ContributingData } from '@/lib/readme/blocks/contributing';
```

par

```tsx
import { ARCHITECTURE_LIMITS, type ArchitectureData } from '@/lib/readme/blocks/architecture';
import { BADGE_LIMITS, type BadgeItem, type BadgesData } from '@/lib/readme/blocks/badges';
import {
  BANNER_FONTS,
  BANNER_LIMITS,
  BANNER_SIZES,
  BANNER_WIDTHS,
  type BannerData,
} from '@/lib/readme/blocks/banner';
import { BIO_LIMITS, type BioData } from '@/lib/readme/blocks/bio';
import { BLOG_LIMITS, BLOG_MAX_POSTS, type BlogData } from '@/lib/readme/blocks/blog';
import {
  CONTACT_LIMITS,
  CONTACT_NETWORKS,
  CONTACT_NETWORK_KEYS,
  type ContactData,
  type ContactItem,
} from '@/lib/readme/blocks/contact';
import { CONTRIBUTING_LIMITS, type ContributingData } from '@/lib/readme/blocks/contributing';
```

Remplacer

```tsx
import { LICENSE_LIMITS, type LicenseData } from '@/lib/readme/blocks/license';
import { TOC_HEADING_MAX, type TocData } from '@/lib/readme/blocks/table-of-contents';
```

par

```tsx
import { LICENSE_LIMITS, type LicenseData } from '@/lib/readme/blocks/license';
import { SKILL_PER_LINE, SKILLS_LIMITS, type SkillsData } from '@/lib/readme/blocks/skills';
import { STATS_LAYOUTS, STATS_LIMITS, type StatsData } from '@/lib/readme/blocks/stats';
import { TOC_HEADING_MAX, type TocData } from '@/lib/readme/blocks/table-of-contents';
import { TROPHIES_LIMITS, TROPHY_COLUMNS, TROPHY_ROWS, type TrophiesData } from '@/lib/readme/blocks/trophies';
```

Remplacer

```tsx
import type { Block } from '@/lib/readme/types';
import { cn } from '@/lib/utils';
```

par

```tsx
import type { Block } from '@/lib/readme/types';
import { SKILL_GROUPS } from '@/lib/readme/skill-catalog';
import { cn } from '@/lib/utils';
```

Ajouter, juste après la fonction `SelectField` (avant le commentaire `/** A hex color input …`), deux petits champs partagés :

```tsx
function NumberSelectField({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  options: readonly number[];
  onChange: (value: number) => void;
}) {
  return (
    <SelectField
      id={id}
      label={label}
      value={String(value)}
      options={options.map((option) => ({ value: String(option), label: String(option) }))}
      onChange={(next) => onChange(Number(next))}
    />
  );
}

function CheckField({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2 text-sm">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}
```

Ajouter, juste avant `interface BlockFormProps {`, les sept formulaires :

```tsx
function BannerForm({ idPrefix, data, onChange }: FormProps<BannerData>) {
  const t = useTranslations('readmeGenerator');
  const set = (patch: Partial<BannerData>) => onChange({ ...data, ...patch });
  const fonts = BANNER_FONTS.map((font) => ({ value: font, label: font }));
  const aligns = [
    { value: 'left' as const, label: t('options.left') },
    { value: 'center' as const, label: t('options.center') },
  ];
  return (
    <div className="space-y-3">
      <AreaField id={`${idPrefix}-lines`} label={t('fields.lines')} hint={t('hints.lines')} value={data.lines} max={BANNER_LIMITS.lines} rows={3} onChange={(lines) => set({ lines })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <SelectField id={`${idPrefix}-font`} label={t('fields.font')} value={data.font} options={fonts} onChange={(font) => set({ font })} />
        <NumberSelectField id={`${idPrefix}-size`} label={t('fields.size')} value={data.size} options={BANNER_SIZES} onChange={(size) => set({ size })} />
        <NumberSelectField id={`${idPrefix}-width`} label={t('fields.width')} value={data.width} options={BANNER_WIDTHS} onChange={(width) => set({ width })} />
        <SelectField id={`${idPrefix}-align`} label={t('fields.align')} value={data.align} options={aligns} onChange={(align) => set({ align })} />
      </div>
      <ColorField id={`${idPrefix}-color`} label={t('fields.color')} hint={t('hints.badgeColor')} value={data.color} onChange={(color) => set({ color })} />
    </div>
  );
}

function BioForm({ idPrefix, data, onChange }: FormProps<BioData>) {
  const t = useTranslations('readmeGenerator');
  const set = (patch: Partial<BioData>) => onChange({ ...data, ...patch });
  return (
    <div className="space-y-3">
      <TextField id={`${idPrefix}-heading`} label={t('fields.heading')} value={data.heading} max={BIO_LIMITS.heading} onChange={(heading) => set({ heading })} />
      <AreaField id={`${idPrefix}-intro`} label={t('fields.intro')} value={data.intro} max={BIO_LIMITS.intro} rows={3} onChange={(intro) => set({ intro })} />
      <AreaField id={`${idPrefix}-points`} label={t('fields.points')} hint={t('hints.points')} value={data.points} max={BIO_LIMITS.points} rows={4} onChange={(points) => set({ points })} />
    </div>
  );
}

function SkillsForm({ idPrefix, data, onChange }: FormProps<SkillsData>) {
  const t = useTranslations('readmeGenerator');
  const set = (patch: Partial<SkillsData>) => onChange({ ...data, ...patch });
  const themes = [
    { value: 'auto' as const, label: t('options.auto') },
    { value: 'light' as const, label: t('options.light') },
    { value: 'dark' as const, label: t('options.dark') },
  ];
  const full = data.icons.length >= SKILLS_LIMITS.maxIcons;
  const toggle = (id: string) =>
    set({ icons: data.icons.includes(id) ? data.icons.filter((icon) => icon !== id) : [...data.icons, id] });
  return (
    <div className="space-y-4">
      <TextField id={`${idPrefix}-heading`} label={t('fields.heading')} value={data.heading} max={SKILLS_LIMITS.heading} onChange={(heading) => set({ heading })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <SelectField id={`${idPrefix}-theme`} label={t('fields.iconTheme')} value={data.theme} options={themes} onChange={(theme) => set({ theme })} />
        <NumberSelectField id={`${idPrefix}-perLine`} label={t('fields.perLine')} value={data.perLine} options={SKILL_PER_LINE} onChange={(perLine) => set({ perLine })} />
      </div>
      <p className="text-sm font-medium">{t('fields.skills')}</p>
      {SKILL_GROUPS.map((group) => (
        <fieldset key={group.key} className="space-y-2">
          <legend className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t(`skillGroups.${group.key}`)}</legend>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 sm:grid-cols-3">
            {group.skills.map((skill) => {
              const checked = data.icons.includes(skill.id);
              return (
                <label key={skill.id} className={cn('flex items-center gap-2 text-sm', !checked && full ? 'opacity-50' : 'cursor-pointer')}>
                  <input type="checkbox" checked={checked} disabled={!checked && full} onChange={() => toggle(skill.id)} />
                  {skill.label}
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

function StatsForm({ idPrefix, data, onChange }: FormProps<StatsData>) {
  const t = useTranslations('readmeGenerator');
  const set = (patch: Partial<StatsData>) => onChange({ ...data, ...patch });
  const layouts = STATS_LAYOUTS.map((layout) => ({ value: layout, label: layout }));
  return (
    <div className="space-y-3">
      <TextField id={`${idPrefix}-heading`} label={t('fields.heading')} value={data.heading} max={STATS_LIMITS.heading} onChange={(heading) => set({ heading })} />
      <TextField id={`${idPrefix}-username`} label={t('fields.username')} value={data.username} max={STATS_LIMITS.username} placeholder={t('placeholders.username')} onChange={(username) => set({ username })} />
      <TextField id={`${idPrefix}-baseUrl`} label={t('fields.baseUrl')} hint={t('hints.baseUrl')} value={data.baseUrl} max={STATS_LIMITS.baseUrl} placeholder={t('placeholders.baseUrl')} onChange={(baseUrl) => set({ baseUrl })} />
      <CheckField id={`${idPrefix}-showStats`} label={t('fields.showStats')} checked={data.showStats} onChange={(showStats) => set({ showStats })} />
      <CheckField id={`${idPrefix}-showLanguages`} label={t('fields.showLanguages')} checked={data.showLanguages} onChange={(showLanguages) => set({ showLanguages })} />
      <SelectField id={`${idPrefix}-layout`} label={t('fields.layout')} value={data.layout} options={layouts} onChange={(layout) => set({ layout })} />
      <CheckField id={`${idPrefix}-hideBorder`} label={t('fields.hideBorder')} checked={data.hideBorder} onChange={(hideBorder) => set({ hideBorder })} />
    </div>
  );
}

function TrophiesForm({ idPrefix, data, onChange }: FormProps<TrophiesData>) {
  const t = useTranslations('readmeGenerator');
  const set = (patch: Partial<TrophiesData>) => onChange({ ...data, ...patch });
  return (
    <div className="space-y-3">
      <TextField id={`${idPrefix}-heading`} label={t('fields.heading')} value={data.heading} max={TROPHIES_LIMITS.heading} onChange={(heading) => set({ heading })} />
      <TextField id={`${idPrefix}-username`} label={t('fields.username')} value={data.username} max={TROPHIES_LIMITS.username} placeholder={t('placeholders.username')} onChange={(username) => set({ username })} />
      <TextField id={`${idPrefix}-baseUrl`} label={t('fields.baseUrl')} hint={t('hints.baseUrl')} value={data.baseUrl} max={TROPHIES_LIMITS.baseUrl} placeholder={t('placeholders.baseUrl')} onChange={(baseUrl) => set({ baseUrl })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberSelectField id={`${idPrefix}-columns`} label={t('fields.columns')} value={data.columns} options={TROPHY_COLUMNS} onChange={(columns) => set({ columns })} />
        <NumberSelectField id={`${idPrefix}-rows`} label={t('fields.rows')} value={data.rows} options={TROPHY_ROWS} onChange={(rows) => set({ rows })} />
      </div>
    </div>
  );
}

function BlogForm({ idPrefix, data, onChange }: FormProps<BlogData>) {
  const t = useTranslations('readmeGenerator');
  const set = (patch: Partial<BlogData>) => onChange({ ...data, ...patch });
  const schedules = [
    { value: 'daily' as const, label: t('options.daily') },
    { value: 'weekly' as const, label: t('options.weekly') },
  ];
  return (
    <div className="space-y-3">
      <TextField id={`${idPrefix}-heading`} label={t('fields.heading')} value={data.heading} max={BLOG_LIMITS.heading} onChange={(heading) => set({ heading })} />
      <TextField id={`${idPrefix}-feedUrl`} label={t('fields.feedUrl')} hint={t('hints.feedUrl')} value={data.feedUrl} max={BLOG_LIMITS.feedUrl} placeholder={t('placeholders.feedUrl')} onChange={(feedUrl) => set({ feedUrl })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberSelectField id={`${idPrefix}-maxPosts`} label={t('fields.maxPosts')} value={data.maxPosts} options={BLOG_MAX_POSTS} onChange={(maxPosts) => set({ maxPosts })} />
        <SelectField id={`${idPrefix}-schedule`} label={t('fields.schedule')} value={data.schedule} options={schedules} onChange={(schedule) => set({ schedule })} />
      </div>
    </div>
  );
}

function ContactForm({ idPrefix, data, onChange }: FormProps<ContactData>) {
  const t = useTranslations('readmeGenerator');
  const networks = CONTACT_NETWORK_KEYS.map((key) => ({ value: key, label: CONTACT_NETWORKS[key].label }));
  const setItem = (index: number, patch: Partial<ContactItem>) =>
    onChange({ ...data, items: data.items.map((item, i) => (i === index ? { ...item, ...patch } : item)) });
  return (
    <div className="space-y-4">
      <TextField id={`${idPrefix}-heading`} label={t('fields.heading')} value={data.heading} max={CONTACT_LIMITS.heading} onChange={(heading) => onChange({ ...data, heading })} />
      {data.items.map((item, index) => (
        <div key={index} className="space-y-3 rounded-md border p-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField id={`${idPrefix}-${index}-network`} label={t('fields.network')} value={item.network} options={networks} onChange={(network) => setItem(index, { network })} />
            <TextField id={`${idPrefix}-${index}-value`} label={t('fields.value')} hint={index === 0 ? t('hints.contactValue') : undefined} value={item.value} max={CONTACT_LIMITS.value} onChange={(value) => setItem(index, { value })} />
          </div>
          <Button type="button" size="sm" variant="ghost" onClick={() => onChange({ ...data, items: data.items.filter((_, i) => i !== index) })}>
            <Trash2 className="w-4 h-4 mr-1" />
            {t('fields.removeContact')}
          </Button>
        </div>
      ))}
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={data.items.length >= CONTACT_LIMITS.maxItems}
        onClick={() => onChange({ ...data, items: [...data.items, { network: 'linkedin', value: '' }] })}
      >
        <Plus className="w-4 h-4 mr-1" />
        {t('fields.addContact')}
      </Button>
    </div>
  );
}
```

Dans `BlockForm`, remplacer

```tsx
    case 'freeMarkdown':
      return <FreeMarkdownForm {...common} data={block.data as FreeMarkdownData} />;
```

par

```tsx
    case 'banner':
      return <BannerForm {...common} data={block.data as BannerData} />;
    case 'bio':
      return <BioForm {...common} data={block.data as BioData} />;
    case 'skills':
      return <SkillsForm {...common} data={block.data as SkillsData} />;
    case 'stats':
      return <StatsForm {...common} data={block.data as StatsData} />;
    case 'trophies':
      return <TrophiesForm {...common} data={block.data as TrophiesData} />;
    case 'blog':
      return <BlogForm {...common} data={block.data as BlogData} />;
    case 'contact':
      return <ContactForm {...common} data={block.data as ContactData} />;
    case 'freeMarkdown':
      return <FreeMarkdownForm {...common} data={block.data as FreeMarkdownData} />;
```

- [ ] **Step 4: Brancher le panneau et le téléchargement du workflow**

Modify `src/components/readme-generator/readme-generator.tsx` :

Remplacer

```tsx
import { validateReadme } from '@/lib/readme/validate';
import { cn } from '@/lib/utils';
```

par

```tsx
import { validateReadme } from '@/lib/readme/validate';
import { WORKFLOW_FILE_NAME, generateWorkflow } from '@/lib/readme/workflow';
import { cn } from '@/lib/utils';
```

Remplacer

```tsx
import { WarningsPanel } from './warnings-panel';
```

par

```tsx
import { WarningsPanel } from './warnings-panel';
import { WorkflowPanel } from './workflow-panel';
```

Remplacer

```tsx
  const warnings = useMemo(() => (state ? validateReadme(state) : []), [state]);
```

par

```tsx
  const warnings = useMemo(() => (state ? validateReadme(state) : []), [state]);
  const workflow = useMemo(() => (state ? generateWorkflow(state) : null), [state]);
```

Remplacer

```tsx
  const handleExportJson = () => {
```

par

```tsx
  const handleDownloadWorkflow = () => {
    if (!workflow) return;
    try {
      downloadFile(workflow, WORKFLOW_FILE_NAME, 'text/yaml');
      trackEvent('Download', { tool: 'readme-generator', mode: state.mode, file: 'workflow' });
    } catch {
      toast({ description: t('messages.downloadError'), variant: 'destructive' });
    }
  };

  const handleExportJson = () => {
```

Remplacer

```tsx
          <WarningsPanel warnings={warnings} blockLabels={blockLabels} />
```

par

```tsx
          <WarningsPanel warnings={warnings} blockLabels={blockLabels} />
          {state.blocks.some((block) => block.enabled && block.type === 'blog') && (
            <WorkflowPanel workflow={workflow} onDownload={handleDownloadWorkflow} />
          )}
```

- [ ] **Step 5: Vérifier types, lint et suite**

Run: `npx tsc --noEmit && npm run lint && npx vitest run`
Expected: PASS ; aucune erreur de types ni de lint ; toute la suite verte.

- [ ] **Step 6: Commit**

```bash
git add src/components/readme-generator
git commit -m "$(cat <<'EOF'
feat(readme): ajoute les formulaires du mode Profil et le guide du workflow

Sept formulaires (bannière, présentation, compétences, statistiques,
trophées, blog, contact), panneau en trois étapes avec téléchargement du
workflow, et un aperçu qui n'affiche que la variante d'image du thème
actif, comme GitHub.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: Vérification finale du plan

**Files:** aucun fichier de production. Corriger dans la tâche concernée tout défaut trouvé, avec un test qui échoue d'abord.

- [ ] **Step 1: Suite complète, types, lint, build**

Run: `npx vitest run && npx tsc --noEmit && npm run lint && npm run build`
Expected: tout passe. La page `/[locale]/tools/readme-generator` reste générée pour les 8 locales et **toujours `noindex`** ; l'outil reste `comingSoon` (l'ouverture publique est le plan 4).

- [ ] **Step 2: Contrôle en navigateur du mode Profil**

Lancer `npm run dev`, ouvrir `http://localhost:3000/fr/tools/readme-generator` avec un `localStorage` vide (les tests du navigateur doivent utiliser des ticks `MessageChannel` et non `setTimeout`, un onglet en arrière-plan bride les minuteries). Vérifier, dans cet ordre :

1. Assistant : choisir « Profil GitHub » ; l'étape 2 ne propose plus que « Partir de zéro » ; l'étape 3 demande nom, description et **nom d'utilisateur GitHub** ; l'étape 4 coche bannière, présentation, compétences, statistiques, contact ; terminer.
2. Éditeur : les cinq blocs existent, la bannière est pré-remplie avec le nom et la description. L'aperçu affiche la bannière animée.
3. Statistiques : tant que l'URL de base est vide, l'aperçu ne montre **aucune** carte et le panneau d'avertissements affiche « URL de base manquante » avec le nom du service ; en saisissant `http://x.example.com` l'avertissement devient « URL invalide » ; avec `https://stats.example.com` deux cartes sont produites (les images sont cassées, c'est attendu : le texte alternatif s'affiche à leur place) et un seul jeu s'affiche à la fois.
4. Bouton « Sombre » de l'aperçu : la variante `#gh-dark-mode-only` remplace la variante claire ; jamais les deux ensemble.
5. Compétences : cocher trois icônes ; le Markdown copié contient `icons?i=…` avec les identifiants cochés dans l'ordre du clic, `py` pour Python.
6. Contact : ajouter LinkedIn avec `javascript:alert(1)` → aucun badge (le bloc ne rend rien) ; avec `https://linkedin.com/in/jane` → un badge.
7. Blog : ajouter le bloc (le menu « Ajouter » le désactive ensuite, singleton) ; le panneau « Mise à jour automatique des articles » apparaît avec « Renseignez une adresse de flux valide… » ; avec `https://blog.example.com/feed.xml`, le bouton de téléchargement apparaît ; le fichier téléchargé est identique au YAML attendu par `tests/readme/blog-workflow.test.ts` (`diff` avec le contenu du test), et ses deux lignes `uses:` se terminent par un SHA de 40 caractères.
8. Recharger la page : les blocs, l'URL de base et les compétences sont conservés ; exporter le JSON puis l'importer redonne le même Markdown.
9. Changer de langue de README (étape 3 de l'assistant, en rouvrant l'assistant) : les titres encore par défaut passent à la nouvelle langue, les titres modifiés à la main ne bougent pas.
10. Passer en mode Projet puis revenir : le toast annonce les blocs retirés et « Annuler » les restaure.

Expected: chaque point se comporte comme décrit ; aucun message d'erreur dans la console du navigateur autre que les images tierces cassées.

- [ ] **Step 3: Relecture du périmètre**

Confirmer par `git status` que seuls les fichiers de la « Structure des fichiers » sont touchés, que `tmp-i18n-readme-plan3.mjs` n'est pas commité, et que `git log --oneline` montre un commit par tâche.

---

## Auto-revue du plan

- **Couverture de la spec** (sections 5, 9, 10, 13) : les sept blocs du catalogue Profil (Tâches 4 à 7), l'harmonisation chromatique par la couleur d'accent (bannière, badges de contact, cartes), les avertissements sur les services tiers (Tâche 6, décision « URL de base obligatoire »), les deux thèmes clair/sombre (Tâches 5, 6, 9), les balises d'ancrage du blog et le workflow avec droits d'écriture expliqués (Tâches 7, 9), l'assistant adapté (Tâche 8). Le cache Camo n'est pas traité : les URL ne portent **aucun** paramètre d'horodatage inventé, car le rafraîchissement dépend des en-têtes du service et pas de l'URL ; l'écart est celui déjà annoncé dans l'en-tête du plan.
- **Hors périmètre, dans le plan 4** : ouverture publique, durcissement, version 2.5.0.
- **Cohérence des noms** : `resolveCardService`/`cardWarnings` (Tâche 6) ; `generateWorkflow`, `WORKFLOW_FILE_NAME` (Tâche 7) consommés par la Tâche 9 ; les clés i18n `fields.*`, `options.*`, `skillGroups.*`, `hints.*`, `placeholders.*`, `workflow.*` viennent de la Tâche 3 et couvrent tout ce que les formulaires utilisent (`fields.heading`, `hints.badgeColor` et `blocks.<type>` existent depuis les plans 1 et 2).
