import {
  Heading1,
  Pilcrow,
  Bold,
  Quote,
  List,
  Code2,
  Link2,
  Image,
  Table,
  Minus,
  Slash,
  Sparkles,
} from '@/components/icons';
import type { LucideIcon } from '@/components/icons';

/**
 * A single Markdown example: the raw source the user types (`code`) and the
 * rendered HTML it produces (`html`, shown in a prose preview).
 *
 * Nothing here is translated — Markdown syntax is language-neutral. The learning
 * text (category title + description) lives in the i18n files, keyed by category id.
 */
export interface MarkdownExample {
  code: string;
  html: string;
}

export interface MarkdownCategory {
  id: string;
  icon: LucideIcon;
  examples: MarkdownExample[];
}

export const MARKDOWN_CATEGORIES: MarkdownCategory[] = [
  {
    id: 'headings',
    icon: Heading1,
    examples: [
      {
        code: `# Titre 1
## Titre 2
### Titre 3
#### Titre 4
##### Titre 5
###### Titre 6`,
        html: `<h1>Titre 1</h1><h2>Titre 2</h2><h3>Titre 3</h3><h4>Titre 4</h4><h5>Titre 5</h5><h6>Titre 6</h6>`,
      },
      {
        code: `Titre 1 (syntaxe alternative)
===

Titre 2 (syntaxe alternative)
---`,
        html: `<h1>Titre 1 (syntaxe alternative)</h1><h2>Titre 2 (syntaxe alternative)</h2>`,
      },
    ],
  },
  {
    id: 'paragraphs',
    icon: Pilcrow,
    examples: [
      {
        code: `Un paragraphe est un bloc de texte.

Une ligne vide sépare deux paragraphes.`,
        html: `<p>Un paragraphe est un bloc de texte.</p><p>Une ligne vide sépare deux paragraphes.</p>`,
      },
      {
        code: `Terminez une ligne par deux espaces␣␣
pour forcer un saut de ligne.

Ou utilisez une barre oblique inverse\\
en fin de ligne.`,
        html: `<p>Terminez une ligne par deux espaces<br>pour forcer un saut de ligne.</p><p>Ou utilisez une barre oblique inverse<br>en fin de ligne.</p>`,
      },
    ],
  },
  {
    id: 'emphasis',
    icon: Bold,
    examples: [
      {
        code: `*italique* ou _italique_
**gras** ou __gras__
***gras et italique***
~~barré~~`,
        html: `<p><em>italique</em> ou <em>italique</em><br><strong>gras</strong> ou <strong>gras</strong><br><strong><em>gras et italique</em></strong><br><del>barré</del></p>`,
      },
    ],
  },
  {
    id: 'blockquotes',
    icon: Quote,
    examples: [
      {
        code: `> Une citation simple.
>
> Sur plusieurs lignes.`,
        html: `<blockquote><p>Une citation simple.</p><p>Sur plusieurs lignes.</p></blockquote>`,
      },
      {
        code: `> Citation
>> Citation imbriquée
>>> Encore plus profond`,
        html: `<blockquote><p>Citation</p><blockquote><p>Citation imbriquée</p><blockquote><p>Encore plus profond</p></blockquote></blockquote></blockquote>`,
      },
    ],
  },
  {
    id: 'lists',
    icon: List,
    examples: [
      {
        code: `- Premier élément
- Deuxième élément
- Troisième élément

* Fonctionne aussi avec *
+ ou avec +`,
        html: `<ul><li>Premier élément</li><li>Deuxième élément</li><li>Troisième élément</li></ul><ul><li>Fonctionne aussi avec *</li><li>ou avec +</li></ul>`,
      },
      {
        code: `1. Premier
2. Deuxième
3. Troisième`,
        html: `<ol><li>Premier</li><li>Deuxième</li><li>Troisième</li></ol>`,
      },
      {
        code: `- Élément parent
  - Sous-élément
    - Sous-sous-élément
- Retour au parent`,
        html: `<ul><li>Élément parent<ul><li>Sous-élément<ul><li>Sous-sous-élément</li></ul></li></ul></li><li>Retour au parent</li></ul>`,
      },
      {
        code: `- [x] Tâche terminée
- [ ] Tâche à faire
- [ ] Autre tâche`,
        html: `<ul class="contains-task-list"><li class="task-list-item"><input type="checkbox" checked disabled> Tâche terminée</li><li class="task-list-item"><input type="checkbox" disabled> Tâche à faire</li><li class="task-list-item"><input type="checkbox" disabled> Autre tâche</li></ul>`,
      },
    ],
  },
  {
    id: 'code',
    icon: Code2,
    examples: [
      {
        code: `Utilisez \`code en ligne\` dans une phrase.`,
        html: `<p>Utilisez <code>code en ligne</code> dans une phrase.</p>`,
      },
      {
        code: `\`\`\`
Bloc de code sans coloration
sur plusieurs lignes
\`\`\``,
        html: `<pre><code>Bloc de code sans coloration
sur plusieurs lignes</code></pre>`,
      },
      {
        code: `\`\`\`js
function salut(nom) {
  return \`Bonjour \${nom}\`;
}
\`\`\``,
        html: `<pre><code><span style="color:#c586c0">function</span> <span style="color:#dcdcaa">salut</span>(nom) {
  <span style="color:#c586c0">return</span> <span style="color:#ce9178">\`Bonjour \${nom}\`</span>;
}</code></pre>`,
      },
    ],
  },
  {
    id: 'links',
    icon: Link2,
    examples: [
      {
        code: `[Texte du lien](https://exemple.com)
[Avec une infobulle](https://exemple.com "Titre au survol")`,
        html: `<p><a href="#preview" onclick="return false">Texte du lien</a><br><a href="#preview" onclick="return false" title="Titre au survol">Avec une infobulle</a></p>`,
      },
      {
        code: `Lien automatique : <https://exemple.com>

Lien de référence : [le texte][1]

[1]: https://exemple.com`,
        html: `<p>Lien automatique : <a href="#preview" onclick="return false">https://exemple.com</a></p><p>Lien de référence : <a href="#preview" onclick="return false">le texte</a></p>`,
      },
    ],
  },
  {
    id: 'images',
    icon: Image,
    examples: [
      {
        code: `![Texte alternatif](image.png)
![Avec titre](image.png "Titre au survol")`,
        html: `<p><svg width="120" height="72" viewBox="0 0 120 72" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Texte alternatif" style="border-radius:6px;display:block"><rect width="120" height="72" fill="hsl(var(--muted))"/><path d="M0 60 L38 30 L64 52 L86 34 L120 62 V72 H0 Z" fill="hsl(var(--muted-foreground)/0.35)"/><circle cx="88" cy="22" r="10" fill="hsl(var(--muted-foreground)/0.45)"/></svg></p>`,
      },
      {
        code: `Une image cliquable :

[![Alt](image.png)](https://exemple.com)`,
        html: `<p>Une image cliquable :</p><p><a href="#preview" onclick="return false"><svg width="120" height="72" viewBox="0 0 120 72" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Alt" style="border-radius:6px;display:block"><rect width="120" height="72" fill="hsl(var(--muted))"/><path d="M0 60 L38 30 L64 52 L86 34 L120 62 V72 H0 Z" fill="hsl(var(--muted-foreground)/0.35)"/><circle cx="88" cy="22" r="10" fill="hsl(var(--muted-foreground)/0.45)"/></svg></a></p>`,
      },
    ],
  },
  {
    id: 'tables',
    icon: Table,
    examples: [
      {
        code: `| Nom   | Rôle      | Score |
| ----- | --------- | ----- |
| Alice | Admin     | 95    |
| Bob   | Éditeur   | 82    |`,
        html: `<table><thead><tr><th>Nom</th><th>Rôle</th><th>Score</th></tr></thead><tbody><tr><td>Alice</td><td>Admin</td><td>95</td></tr><tr><td>Bob</td><td>Éditeur</td><td>82</td></tr></tbody></table>`,
      },
      {
        code: `| Gauche | Centré | Droite |
| :----- | :----: | -----: |
| a      |   b    |      c |
| dd     |   ee   |     ff |`,
        html: `<table><thead><tr><th style="text-align:left">Gauche</th><th style="text-align:center">Centré</th><th style="text-align:right">Droite</th></tr></thead><tbody><tr><td style="text-align:left">a</td><td style="text-align:center">b</td><td style="text-align:right">c</td></tr><tr><td style="text-align:left">dd</td><td style="text-align:center">ee</td><td style="text-align:right">ff</td></tr></tbody></table>`,
      },
    ],
  },
  {
    id: 'rules',
    icon: Minus,
    examples: [
      {
        code: `Trois tirets, astérisques ou underscores :

---

***

___`,
        html: `<p>Trois tirets, astérisques ou underscores :</p><hr><hr><hr>`,
      },
    ],
  },
  {
    id: 'escaping',
    icon: Slash,
    examples: [
      {
        code: `\\*Ceci n'est pas en italique\\*
\\# Ceci n'est pas un titre
\\[Ceci n'est pas un lien\\]`,
        html: `<p>*Ceci n'est pas en italique*<br># Ceci n'est pas un titre<br>[Ceci n'est pas un lien]</p>`,
      },
    ],
  },
  {
    id: 'extended',
    icon: Sparkles,
    examples: [
      {
        code: `Voici une note de bas de page.[^1]

[^1]: Le contenu de la note.`,
        html: `<p>Voici une note de bas de page.<sup><a href="#preview" onclick="return false">1</a></sup></p><hr><ol><li>Le contenu de la note. ↩</li></ol>`,
      },
      {
        code: `Émoji par code : :tada: :rocket: :+1:

Émoji direct : 🎉 🚀 👍`,
        html: `<p>Émoji par code : 🎉 🚀 👍</p><p>Émoji direct : 🎉 🚀 👍</p>`,
      },
      {
        code: `On peut aussi insérer du <mark>HTML</mark>
directement : <kbd>Ctrl</kbd> + <kbd>C</kbd>.`,
        html: `<p>On peut aussi insérer du <mark>HTML</mark> directement : <kbd>Ctrl</kbd> + <kbd>C</kbd>.</p>`,
      },
    ],
  },
];
