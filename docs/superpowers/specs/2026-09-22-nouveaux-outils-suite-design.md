# Extension de la suite asciitree.fr — 5 nouveaux outils

**Date** : 2026-09-22
**Statut** : Vue d'ensemble + priorisation (spec globale). Chaque outil recevra sa propre spec détaillée + plan d'implémentation au moment de son build.

## Contexte

Le site propose déjà 7 outils sous `src/app/[locale]/tools/` (ascii-tree, ascii-table, sparkline, banner, qr-code-generator, markdown-editor, ascii-emoji). L'objectif est d'étendre la suite avec 5 outils supplémentaires, ciblés sur les besoins concrets des développeurs (README, code, terminaux) et à fort potentiel SEO.

Les 5 outils, tirés d'une proposition initiale :

1. Générateur de séparateurs & badges textuels
2. Convertisseur Arbre ASCII ↔ commandes `mkdir`/`touch`
3. Nettoyeur Unicode → ASCII / strip formatting
4. Générateur Image → ASCII
5. Éditeur de diagrammes ASCII (façon ASCIIFlow)

## Architecture commune

Tous les outils suivent le pattern existant, sans écart de stack :

| Aspect | Convention |
|---|---|
| Route | `src/app/[locale]/tools/<slug>/page.tsx`, i18n via `generateStaticParams()`, métadonnées SEO comme les outils actuels (voir `seo-config.ts`, `tool-seo-content.ts`) |
| Logique pure | `src/lib/<tool>-generator.ts` + `<tool>-types.ts` — fonctions pures, testables, sans state React (cf. `sparkline-generator.ts`, `table-generator.ts`) |
| UI | Composants dans `src/components/generator/`, state local via hooks React uniquement — pas de state manager global (cohérent avec `tree-generator.tsx`) |
| Registre nav | Entrée ajoutée dans `TOOLS` ou `RESOURCES` (`src/lib/tools.ts`) |
| i18n | Clés ajoutées dans les 8 fichiers `src/i18n/locales/<lang>.json` ; jamais de string en dur (`useTranslations()`) |
| Exécution | 100% client-side, aucun backend requis — cohérent avec l'existant |

**Nouveauté à isoler proprement** : l'outil Image → ASCII sera le premier du site à lire des pixels via `<canvas>` (les outils actuels comme le générateur de bannière font du text-art pur, sans traitement d'image). Ce traitement doit rester encapsulé dans son propre lib file (`image-to-ascii-generator.ts`) pour ne pas polluer les patterns des autres outils.

## Ordre de livraison recommandé

Basé sur le rapport effort/impact :

1. **Séparateurs & badges** — complexité très faible, livrable rapidement, valide le pattern d'ajout d'outil sur un cas simple, bon SEO longue traîne.
2. **Arbre ↔ commandes mkdir/touch** — complexité faible (parsing regex), réutilise directement `tree-generator.ts` et le parseur d'arbre existant, forte valeur pour l'audience déjà présente sur le site.
3. **Nettoyeur Unicode → ASCII** — complexité faible à moyenne, réutilise les connecteurs déjà modélisés dans `types.ts` (`ConnectorStyle`), même audience que l'outil arbre.
4. **Image → ASCII** — complexité moyenne, premier traitement `<canvas>` pixel du site, impact SEO très fort (volume de recherche élevé).
5. **Éditeur de diagrammes ASCII** — le plus complexe (grille interactive, dessin, layout), à faire en dernier une fois les patterns client rodés sur les 4 autres. Nécessitera sa propre spec architecturale détaillée avant implémentation (canvas interactif, gestion d'état de dessin, export).

## Détail par outil

### 1. Séparateurs & badges textuels

- **Objectif** : générer des blocs de séparation pour structurer un README ou un fichier source.
- **Fonctionnalités** :
  - Lignes décoratives (`════════`, `────────`, largeur paramétrable)
  - Badges minimalistes (`[ STATUS: ACTIVE ]`, `[ v2.1.0 ]`)
  - Blocs de commentaires par langage (C/JS, Python, Bash — syntaxe de commentaire adaptée)
- **Input** : texte du badge/titre, choix de style, largeur/longueur.
- **Output** : texte copiable, pas de state complexe.
- **Complexité** : très faible (templates préremplis + interpolation de texte).

### 2. Arbre ASCII ↔ commandes mkdir/touch

- **Objectif** : passer de la documentation (arbre ASCII) à la création réelle de l'arborescence sur disque, et inversement.
- **Mode A (arbre → commandes)** : parse un arbre ASCII collé (Unicode ou ASCII) → génère une séquence `mkdir -p ... && touch ...`.
- **Mode B (commandes → arbre)** : opération inverse, réutilise `generateASCIITree()` existant.
- **Réutilisation** : le parseur d'indentation utilisé pour l'import (logique proche de celle de `DragDropZone` / `validation.ts`).
- **Complexité** : faible (parsing regex sur la structure d'indentation/connecteurs).

### 3. Nettoyeur Unicode / ASCII

- **Objectif** : rendre un arbre ou schéma compatible avec des terminaux anciens, et nettoyer les artefacts de copier-coller.
- **Fonctionnalités** :
  - Conversion `├── │ └──` ↔ `|-- | \--` (mapping déjà modélisé par `ConnectorStyle`)
  - Option "strip formatting" : retire les espaces indésirables, réaligne les colonnes brisées par un collage hors police monospace
- **Complexité** : faible — essentiellement une fonction pure texte → texte.

### 4. Image → ASCII

- **Objectif** : convertir une image ou un logo en art ASCII pour bannières de terminal, écrans de démarrage CLI, README.
- **Fonctionnement** : upload/drag-drop → lecture pixels via `<canvas>` → mapping niveaux de gris sur une palette de densité de caractères (`@%#*+=-:. `).
- **Options** : largeur de sortie (colonnes), inversion, palette de caractères, contraste.
- **Complexité** : moyenne — premier traitement d'image côté client du site, à encapsuler dans son propre module.

### 5. Éditeur de diagrammes ASCII (façon ASCIIFlow)

- **Objectif** : représenter une architecture logicielle, un flux d'API ou un diagramme de séquence directement en texte, sans image hébergée.
- **Fonctionnement** : grille type canvas pour tracer boîtes, flèches, losanges de décision, liaisons textuelles (`+---+`, `--->`).
- **Interaction** : dessin à la souris/clavier, export en bloc de texte ASCII.
- **Complexité** : élevée — grille interactive, gestion d'état de dessin, moteur de layout. **Ébauche uniquement dans ce document** ; nécessite une spec architecturale dédiée avant implémentation.

## Hors scope de cette spec

- Le détail d'implémentation (composants exacts, edge cases, tests) de chaque outil : à traiter dans une spec/plan dédiée au moment de son build, en suivant l'ordre de livraison ci-dessus.
- L'éditeur de diagrammes (#5) n'aura pas de spec technique complète avant que les 4 premiers outils soient livrés.
