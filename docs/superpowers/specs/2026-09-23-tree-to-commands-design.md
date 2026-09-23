# Outil « Arbre ASCII ↔ Commandes mkdir/touch »

**Date** : 2026-09-23
**Statut** : Spec détaillée, prête pour plan d'implémentation.
**Contexte parent** : outil #2 de [docs/superpowers/specs/2026-09-22-nouveaux-outils-suite-design.md](./2026-09-22-nouveaux-outils-suite-design.md).

## Objectif

Permettre de passer d'un arbre ASCII (documentation, README) à une séquence de commandes shell qui recrée réellement l'arborescence sur disque, et inversement : reconstruire un arbre ASCII lisible à partir de commandes `mkdir`/`touch` déjà écrites.

Slug/URL : `/tools/tree-to-commands`. Nom affiché : « Arbre ↔ Commandes ».

## Modes

L'outil a deux modes, sélectionnés via un toggle/segmented control en haut du composant (un seul input/output partagé, pas de double panneau synchronisé) :

- **Mode A — Arbre → Commandes** : l'utilisateur colle un arbre ASCII (unicode ou ascii), l'outil génère une liste de commandes `mkdir -p` / `touch`.
- **Mode B — Commandes → Arbre** : l'utilisateur colle des commandes `mkdir -p` / `touch`, l'outil génère l'arbre ASCII correspondant (réutilise `generateASCIITree()`).

## Format de sortie du Mode A

Une commande par ligne, dans l'ordre de parcours de l'arbre (DFS) :

```
mkdir -p src/lib
mkdir -p src/components
touch src/lib/utils.ts
touch README.md
```

- Un `mkdir -p <chemin>` par dossier rencontré (y compris les dossiers vides).
- Un `touch <chemin>` par fichier.
- Pas de chaînage `&&` — chaque commande est indépendante, exécutable telle quelle avec `bash` ou copiable ligne par ligne. Pas d'option pour basculer vers le format chaîné (hors scope, YAGNI).

## Parsing en Mode A (arbre texte → TreeNode[])

Aucun parseur de ce type n'existe dans le code actuel (vérifié : `drag-drop-zone.tsx` construit un arbre à partir de vrais objets `File`, pas de texte). Nouvelle logique dans `parseAsciiTreeText()` :

1. **Détection du style de connecteur** par ligne : unicode (`├── `, `└── `, `│   `) ou ascii (`|-- `, `` `-- ``, `|   `). Les deux styles sont acceptés dans le même texte collé (détection ligne par ligne, pas globale) pour tolérer un copier-coller mixte.
2. **Calcul de la profondeur** : on compte, avant le connecteur (`├──`/`└──`/`|--`/`` `-- ``), le nombre de blocs de 4 caractères correspondant à une indentation (`│   `, `|   `, ou 4 espaces vides pour une branche déjà terminée). Chaque bloc = un niveau de profondeur. Cette approche est tolérante à la sortie native de `generateASCIITree()` (le cas d'usage principal : coller la sortie de l'outil Arbre ASCII existant du site) et à un `tree` Unix standard.
3. **Reconstruction hiérarchique** : pile de nœuds courants par profondeur (pattern classique de parsing d'indentation), chaque ligne devient un `TreeNode` enfant du dernier nœud vu à `profondeur - 1`.
4. **Heuristique fichier vs dossier** (le texte ASCII ne porte pas cette info explicitement, sauf le `/` final optionnel de `showFolderSlash`) :
   - Nœud qui a des enfants indentés en dessous → **dossier**.
   - Nœud terminal (feuille, pas d'enfants) :
     - se terminant par `/` → **dossier** (vide).
     - contenant un `.` dans le nom (hors premier caractère, pour ne pas traiter `.gitignore` comme sans extension) → **fichier**.
     - sinon → **dossier vide**.
5. **Lignes non reconnues** (ex. ligne vide, ligne sans connecteur valide au milieu du texte) : ignorées individuellement, ajoutées à un tableau `errors: string[]` retourné à l'appelant, sans bloquer le reste du parsing.

Signature :
```ts
function parseAsciiTreeText(text: string): { nodes: TreeNode[]; errors: string[] }
```

## Parsing en Mode B (commandes → TreeNode[])

Format d'entrée reconnu : uniquement `mkdir -p <chemin>` et `touch <chemin>`, **une commande par ligne** (symétrique au format généré par le Mode A — pas de support du chaînage `&&` sur une ligne, YAGNI, cohérent avec le choix du Mode A).

1. Chaque ligne est testée contre deux regex : `/^mkdir\s+-p\s+(.+)$/` et `/^touch\s+(.+)$/`.
2. Le chemin capturé est découpé par `/` en segments.
3. Insertion dans une structure `TreeNode[]` par le même principe « find-or-create par segment » que `buildTreeFromFiles()` dans `drag-drop-zone.tsx` (adapté à des chaînes de chemin au lieu d'objets `File`) : pour `mkdir -p`, tous les segments deviennent des dossiers ; pour `touch`, les segments intermédiaires sont des dossiers et le dernier segment est un fichier.
4. Lignes non reconnues → ignorées, ajoutées à `errors: string[]`.
5. L'arbre `TreeNode[]` résultant est ensuite rendu en ASCII via `generateASCIITree()` existant, avec le `connectorStyle` choisi dans le panneau d'options (unicode par défaut).

Signature :
```ts
function parseShellCommands(text: string): { nodes: TreeNode[]; errors: string[] }
```

## Fichiers à créer/modifier

### Logique pure
- `src/lib/tree-commands-types.ts` — `TreeCommandsMode = 'treeToCommands' | 'commandsToTree'`, `ParseResult = { nodes: TreeNode[]; errors: string[] }`.
- `src/lib/tree-commands-generator.ts` — `parseAsciiTreeText()`, `generateShellCommands(nodes: TreeNode[]): string`, `parseShellCommands()`. Fonctions pures, sans state React, réutilisent les types `TreeNode`/`ConnectorStyle` de `src/lib/types.ts` et `generateASCIITree()` de `src/lib/tree-generator.ts`.

### UI
- `src/app/[locale]/tools/tree-to-commands/page.tsx` — calqué sur `src/app/[locale]/tools/sparkline/page.tsx` (metadata via `buildToolMetadata('tree-to-commands', locale)`, `<ToolSeoSection>`, `<AdSlot>`).
- `src/components/tree-commands-generator/` (nouveau dossier, pattern `sparkline-generator/`) :
  - `tree-commands-generator.tsx` — conteneur `'use client'`. State : `mode: TreeCommandsMode`, `input: string`, `connectorStyle: ConnectorStyle`. `useMemo` pour calculer le résultat (`parseResult` + sortie texte) selon le mode. Pousse `<TreeCommandsOptionsPanel>` dans `useRightSidebar()` uniquement quand `mode === 'commandsToTree'` (le Mode A n'a pas d'options, la sortie est toujours du texte brut).
  - `tree-commands-mode-toggle.tsx` — segmented control / deux boutons pour basculer entre les deux modes.
  - `tree-commands-input.tsx` — textarea d'entrée, placeholder et texte d'exemple qui changent selon le mode actif, affichage non bloquant des `errors` sous le champ.
  - `tree-commands-preview.tsx` — bloc de sortie en lecture seule + boutons copier/télécharger, pattern `ascii-preview.tsx`.
  - `tree-commands-options-panel.tsx` — un seul champ : choix `connectorStyle` (unicode/ascii), visible uniquement en Mode B.

### Registre & SEO
- `src/lib/tools.ts` — nouvelle entrée dans `TOOLS` : `{ id: 'tree-to-commands', href: '/tools/tree-to-commands', icon: TerminalSquare, nameKey: 'treeToCommands' }` (icône exacte à choisir parmi celles déjà ré-exportées dans `src/components/icons`, ou à ajouter si `TerminalSquare` n'y est pas encore).
- `src/lib/seo-config.ts` — nouvelle entrée dans `TOOLS_SEO['tree-to-commands']` avec `titles`/`descriptions` pour les 8 locales (`en` obligatoire, source de vérité, autres traduites).
- `src/lib/tool-seo-content.ts` — nouvelle entrée `tree-to-commands` avec `heading`/`intro`/`faq` pour les 8 locales.
- `src/i18n/locales/<lang>.json` (8 fichiers : fr, en, es, de, it, pt, ru, ja) :
  - clé plate de nav `"treeToCommands": "..."` + entrée `.desc` dans le bloc de descriptions existant.
  - bloc `"treeCommandsGenerator": { "modes": {...}, "input": {...}, "preview": {...}, "options": {...} }`.

## Gestion des erreurs et cas limites

- Entrée vide → sortie vide, pas d'erreur affichée.
- Lignes non reconnues (Mode A : ligne sans connecteur valide ; Mode B : ligne qui n'est ni `mkdir -p` ni `touch`) : ignorées individuellement, accumulées dans `errors` et affichées sous forme de liste non bloquante sous le textarea d'entrée (cohérent avec `parseError` du sparkline generator — pas de toast).
- Saut de profondeur incohérent en Mode A (ex. un enfant à profondeur +2 sans intermédiaire) : traité comme si la profondeur réelle était `profondeur du parent + 1` (on ne rejette pas la ligne, on la rattache au meilleur parent disponible dans la pile), pour rester tolérant à un copier-coller légèrement mal formaté.
- Noms de fichiers/dossiers avec espaces : conservés tels quels dans les commandes générées (Mode A), sans guillemets automatiques — hors scope d'ajouter un échappement shell complet (YAGNI ; le README/l'exemple de l'outil peut mentionner cette limite).

## Analytics

`trackEvent('Copy'/'Download', { tool: 'tree-to-commands', mode })`, cohérent avec le pattern existant (`analytics-events.ts`).

## Tests

Aucun framework de test n'est configuré dans le projet (confirmé par `CLAUDE.md`). Vérification manuelle via `npm run dev` dans le navigateur une fois l'implémentation terminée, sur les deux modes et les deux styles de connecteur.

## Hors scope

- Chaînage de commandes avec `&&` (ni en génération, ni en parsing).
- Support d'autres commandes shell (`New-Item` PowerShell, `mkdir` sans `-p`, etc.).
- Échappement shell des noms contenant espaces/caractères spéciaux.
- Synchronisation bidirectionnelle en temps réel entre un panneau arbre et un panneau commandes affichés simultanément.
