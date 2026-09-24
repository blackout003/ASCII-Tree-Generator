# Générateur de README — spécification de conception

Date : 2026-09-24
Statut : à relire par l'utilisateur

## 1. Objectif

Ajouter un outil « Générateur de README » qui aide un développeur à produire un `README.md` de qualité, soit pour un **projet**, soit pour un **profil GitHub** (`username/username`), sans partir d'une page blanche.

Critères de succès :
- Un README propre et accessible en quelques minutes.
- Aucun import n'est jamais requis : on peut tout faire en partant de zéro.
- Le README de profil ne dépend pas silencieusement de services tiers fragiles : l'outil avertit et permet de pointer vers sa propre instance.
- Le Markdown produit est déterministe, testé et validé.

## 2. Périmètre v1

Inclus :
- Un seul outil, deux modes : **Projet** et **Profil**.
- Un wizard pas à pas qui débouche sur un éditeur de blocs, avec un état partagé.
- Extraction facultative de métadonnées (fichiers manifest locaux, URL GitHub côté client).
- Aperçu fidèle au rendu GitHub (HTML brut assaini, alertes, bascule clair/sombre).
- Validateur d'export non bloquant.
- Persistance : sauvegarde locale automatique et export/import JSON.
- Génération d'un unique workflow GitHub Actions : flux de blog RSS (profil seulement).
- Internationalisation dans les 8 locales existantes, contenu SEO, entrée d'accueil, changelog.

Hors périmètre v1 : GitLab, autres flux que le blog (commits, vidéos), génération de SVG statiques via Actions, proxy serveur, backend de toute sorte.

## 3. Décisions prises

| Sujet | Décision |
|---|---|
| Modes | Un outil, deux modes, sélecteur au début du wizard |
| Parcours | Wizard puis éditeur, même état, retour possible |
| Blocs | Structurés (champs typés) plus un bloc « Markdown libre » |
| Extraction | Facultative, côté client : import de fichiers et URL GitHub |
| Aperçu | `react-markdown` étendu (`rehype-raw`, `rehype-sanitize`, plugin d'alertes) |
| Interaction | Drag-drop HTML5 natif plus boutons monter/descendre |
| Services tiers | URL publiques par défaut, champ « URL de base », avertissement, pas de faux cache-busting |
| CI/CD | Un seul workflow : blog RSS |
| Validateur | Avertissements non bloquants, `alt` auto-générés pour badges et icônes |
| Persistance | `localStorage` automatique (dans un `try/catch`) plus JSON validé par Zod |
| Architecture | Registre de blocs, un module par type |

## 4. Architecture

Suit le découpage de l'outil `tree-commands`.

```
src/lib/readme/
  types.ts          Block, ReadmeMode, ReadmeState, ThemeOptions
  registry.ts       définitions de blocs par mode
  blocks/*.ts       un module par bloc : schéma Zod, défauts, toMarkdown, règles
  generate.ts       generateReadme(state) : fonction pure, retourne une string
  validate.ts       validateReadme(markdown, state) : avertissements
  extract.ts        parseurs de manifest et client API GitHub
  persistence.ts    save/load localStorage, import/export JSON
src/components/readme-generator/
  readme-generator.tsx   conteneur, possède tout l'état (hooks React, pas de store global)
  wizard/                étapes : mode, départ, infos, sections, style
  editor/                liste de blocs, panneau d'édition, aperçu, export
src/app/[locale]/tools/readme-generator/page.tsx
tests/readme/            vitest
```

Chaque bloc du registre déclare : son schéma Zod, ses valeurs par défaut, son formulaire d'édition, sa fonction `toMarkdown` et ses règles de validation. Le générateur, l'éditeur et le validateur parcourent le registre sans connaître chaque bloc. Ajouter un bloc revient à ajouter un fichier.

### Modèle de données

- `ReadmeState = { mode: 'project' | 'profile', blocks: Block[], theme: ThemeOptions, meta: {...} }`
- `Block = { id, type, enabled, data }`, où `data` est validé par le schéma du type.
- Un seul état dans `readme-generator.tsx`. Le wizard et l'éditeur lisent et écrivent le même état.
- `generateReadme` est pure. L'aperçu réutilise sa sortie, ce qui interdit toute divergence entre aperçu et fichier exporté.
- Une liste de blocs par mode : changer de mode ne mélange pas les catalogues.

## 5. Catalogue de blocs

### Projet

Les blocs marqués (c) sont critiques et activés par défaut.

| Bloc | Contenu |
|---|---|
| En-tête (c) | Titre, accroche, logo facultatif |
| Badges | Shields.io, 3 à 5 recommandés, avertissement au-delà |
| Preuve visuelle | Capture ou GIF, `alt` obligatoire |
| Table des matières | Générée à partir des blocs actifs |
| Installation (c) | Prérequis, gestionnaire de paquets, commandes |
| Utilisation (c) | Exemple de code |
| Architecture / Feuille de route | Facultatif |
| Contribution | Lien ou texte court |
| Licence et remerciements (c) | Type de licence, crédits |
| Alerte | `[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`, `[!CAUTION]` |
| Markdown libre | Échappatoire |

### Profil

| Bloc | Contenu |
|---|---|
| Bannière | Titre animé (typing SVG) ou texte |
| Bio | Gabarit « je travaille sur… » |
| Compétences | Icônes via skill-icons |
| Statistiques | Cartes github-readme-stats, URL de base réglable |
| Trophées | Facultatif |
| Articles de blog | Flux RSS, balises d'ancrage, active le workflow |
| Contact | Badges hyperliés |
| Markdown libre | Échappatoire |

Règles : chaque bloc peut être ajouté plusieurs fois, sauf En-tête et Licence. Les `alt` de badges, icônes et cartes sont générés automatiquement.

## 6. Wizard

Cinq étapes sautables, avec « Passer à l'éditeur » toujours visible :

1. **Mode** : Projet ou Profil.
2. **Départ** : « Partir de zéro » (mis en avant) ou « Pré-remplir » (manifest ou URL GitHub).
3. **Infos** : champs de base, tous facultatifs sauf le nom, avec exemples en placeholder.
4. **Sections** : cases à cocher sur les blocs du catalogue.
5. **Style** : palette unique appliquée à tous les badges et cartes.

## 7. Extraction (facultative)

Deux sources produisent le même objet partiel `ExtractedMeta = { name?, description?, license?, repoUrl?, languages?, installCommand?, author? }`.

- **Import de fichier** : `package.json`, `Cargo.toml`, `pyproject.toml`. Un parseur pur par format. Le TOML est lu par une petite fonction ciblée sur les clés utiles, sans nouvelle dépendance. Les fichiers restent dans le navigateur.
- **URL GitHub** : `GET /repos/{owner}/{repo}` et `/languages` depuis le navigateur, sans token. L'URL est validée par expression stricte (`github.com/{owner}/{repo}`) avant tout appel.

Règles de fusion : le résultat ne remplit que les champs **vides** et n'écrase jamais une saisie. Le wizard liste les champs remplis automatiquement pour relecture. Les valeurs reçues sont du texte, jamais du HTML.

Erreurs, toutes non bloquantes (l'utilisateur reste dans le wizard, champs intacts) :

| Cas | Comportement |
|---|---|
| Limite de débit (403/429) | Message clair, invitation à saisir à la main |
| Dépôt privé ou introuvable (404) | Même message, sans détail technique |
| Fichier illisible | Message, aucun champ modifié |
| Hors ligne | Même repli |

## 8. Éditeur, aperçu, validateur

**Éditeur.** Colonne de blocs avec poignée de drag-drop (mécanisme HTML5 natif de `tree-view.tsx`, aucune bibliothèque), boutons monter/descendre, interrupteur activé/désactivé, suppression. Un clic ouvre le formulaire du bloc dans un panneau. « Ajouter un bloc » est toujours visible. Sur mobile, panneau et aperçu passent en onglets.

**Aperçu.** Sortie de `generateReadme` rendue par `react-markdown`, `remark-gfm`, `rehype-raw`, `rehype-sanitize` et un plugin d'alertes. Le schéma d'assainissement autorise `<picture>`, `<img>`, `<div align>`, `<details>` et retire scripts, gestionnaires d'événements et styles en ligne. Bascule clair/sombre. Une image externe qui ne charge pas affiche un texte de repli.

**Validateur.** Avertissements non bloquants, chacun relié au bloc concerné :
- image sans `alt` (bloc libre seulement) ;
- balise HTML non fermée ;
- tableau utilisé pour la mise en page ;
- plus de 5 badges ;
- bloc Blog sans workflow téléchargé ;
- URL de base de statistiques laissée sur le service public, avec l'explication de la fragilité.

**Export.** Copier, télécharger `README.md`, télécharger le workflow (profil seulement), export/import JSON.

## 9. Profil : services tiers et cache

Les URL vers skill-icons, github-readme-stats, typing SVG et shields.io sont générées par défaut vers les services publics. Un champ « URL de base » permet de pointer vers sa propre instance. Un avertissement pédagogique explique que les instances publiques peuvent saturer leur quota et casser les images.

Aucun paramètre d'horodatage n'est injecté dans les URL : il serait figé dans le fichier généré et ne rafraîchirait rien à travers le proxy Camo de GitHub. L'outil explique le fonctionnement de Camo au lieu de le simuler. Il oriente vers des ressources à fond transparent pour la compatibilité avec les thèmes clair et sombre.

## 10. Workflow blog (profil)

Produit uniquement si un bloc Blog est actif.

- Le README reçoit les balises d'ancrage `<!-- BLOG-POST-LIST:START -->` et `<!-- BLOG-POST-LIST:END -->`.
- Fichier généré : `.github/workflows/blog-post-workflow.yml`, avec `permissions: contents: write`, déclenchement planifié et manuel, action tierce **épinglée à une version précise**.
- Un guide de trois étapes explique où placer le fichier et pourquoi la permission d'écriture est nécessaire.
- La version de l'action à épingler est à confirmer avec `ctx7` au moment d'écrire le plan.

## 11. Intégration au projet

- Route `src/app/[locale]/tools/readme-generator/page.tsx`.
- Entrées dans `tools.ts` (nouvelle icône dans `icons.tsx`), `tools-showcase.tsx`, `seo-config.ts`, `tool-seo-content.ts`.
- Clés i18n dans les 8 locales (`fr`, `en`, `es`, `de`, `it`, `pt`, `ru`, `ja`), aucune chaîne en dur.
- Événements analytics via `analytics-events.ts`, en respectant l'opt-out.
- Version : `CHANGELOG.md`, `src/lib/changelog.ts`, `package.json`, montée mineure.
- Dépendances ajoutées : `rehype-raw`, `rehype-sanitize`, un plugin d'alertes GFM. Les versions sont à vérifier avec `ctx7`.

## 12. Tests (`vitest`, `tests/readme/`)

- `generate` : Markdown attendu par bloc, ordre respecté, bloc désactivé absent.
- `validate` : un cas par avertissement.
- `extract` : parseurs des trois manifests, fusion sans écrasement, erreurs API simulées.
- `persistence` : aller-retour JSON, rejet d'un fichier invalide, repli sans `localStorage`.
- `sanitize` : `<script>` et `onerror` retirés, `<picture>` conservé.
- `i18n` et `seo` : mêmes contrôles que pour les autres outils.

## 13. Découpage de la livraison

Une spec, trois cycles plan puis implémentation :

1. **Socle** : types, registre, `generate`, `validate`, `persistence`, éditeur, aperçu, route, i18n, SEO, avec deux blocs témoins (En-tête et Markdown libre). Ce plan fixe le contrat du registre.
2. **Mode Projet** : catalogue projet, wizard, extraction.
3. **Mode Profil** : catalogue profil, thème global, bloc Blog, workflow.

## 14. Risques

- Le contrat du registre, fixé au plan 1, conditionne les deux suivants.
- Le sanitizer est la pièce sensible : ses tests sont obligatoires.
- Les versions des services tiers et de l'action de blog peuvent changer : à vérifier au moment de rédiger les plans.
- Volume de traduction : 8 locales pour un outil à nombreux libellés.
