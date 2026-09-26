# Générateur de README — Plan 4 : durcissement et ouverture publique

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corriger les défauts différés par les revues des plans 1 à 3 (perte de travail silencieuse, blocs absorbés par un code non fermé, ancres de table des matières, lecteur TOML, accessibilité, fluidité de frappe), puis ouvrir l'outil au public : retrait de `noindex` et de `comingSoon`, plan du site, accueil, version 2.5.0.

**Architecture:** Aucune nouvelle brique : des correctifs ciblés dans `src/lib/readme/` (fonctions pures, testées), quelques hooks et composants du générateur, et l'intégration de l'outil au reste du site (registre d'outils, sitemap, vitrine, changelog). Un test de contrat relie le registre d'outils au sitemap et aux textes de l'accueil pour qu'un outil visible ne puisse plus être oublié quelque part.

**Tech Stack:** identique aux plans 1 à 3. Aucune nouvelle dépendance.

**Spec:** `docs/superpowers/specs/2026-09-24-readme-generator-design.md` (sections 8, 11, 13, 14). Plans précédents : `docs/superpowers/plans/2026-09-24-readme-generator-plan-1-socle.md`, `…-plan-2-mode-projet.md`, `…-plan-3-mode-profil.md`.

**Périmètre.** Ce plan reprend, parmi les mineurs différés des plans 1 à 3, ceux qui font perdre du travail, produisent un README faux ou rendent l'outil inutilisable au clavier ou au lecteur d'écran. **Écartés, avec la raison :**
- Le bouton clair/sombre ne bascule pas les balises `<picture>` écrites à la main dans un bloc Markdown libre : le navigateur les résout selon le système, pas selon un attribut. L'outil n'en produit aucune.
- Les formes d'URL GitHub `git@…`, `?tab=readme` et `/tree/main` restent refusées : la spec demande la forme stricte.
- Deux onglets ouverts sur le même README : la dernière sauvegarde gagne. Un vrai arbitrage demande une conception à part (`BroadcastChannel`, fusion) qui ne tient pas dans un plan de durcissement.
- `$` dans un champ texte (formule sur GitHub) : jamais reproduit, non vérifié ; on n'ajoute pas d'échappement à l'aveugle.
- Les textes « huit outils » de l'accueil (`seoContent`) datent d'avant les outils Séparateurs et Arbre ↔ Commandes : ils ne sont pas touchés ici, pour ne pas mêler une refonte de copie à l'ouverture d'un outil.

## Global Constraints

- Aucune chaîne visible par l'utilisateur en dur dans les composants : tout passe par `useTranslations('readmeGenerator')`, avec les 8 locales `fr`, `en`, `es`, `de`, `it`, `pt`, `ru`, `ja`.
- Le texte produit **dans le README** vient de `DEFAULT_TEXTS` selon `meta.language`, jamais de next-intl.
- Pas de backend et aucune requête réseau ajoutée : les correctifs ne touchent que la logique locale et les pages.
- Toute regex appliquée à du texte utilisateur est sans retour arrière quadratique et bornée en longueur ; un balayage manuel linéaire est préféré à une regex non ancrée (leçon des plans 1 à 3).
- Chaque bloc doit rester valide pour son propre schéma à partir de `meta` à sa longueur maximale : le test de contrat du registre le vérifie.
- `generateReadme` reste pure ; l'aperçu rend exactement sa sortie.
- Aucune nouvelle dépendance. TypeScript strict, Zod 4, alias `@/*` → `src/*`.
- `vitest` ne lance que `tests/**/*.test.ts` en environnement `node` : la logique testable reste dans `src/lib/readme/` ; les composants et hooks sont vérifiés à la Tâche 12, en navigateur.
- Messages de commit en français, terminés par `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`.
- Version du site : `CHANGELOG.md`, `src/lib/changelog.ts` (`APP_VERSION` et entrée `CHANGELOG`) et `package.json` restent synchronisés (montée mineure : 2.5.0).

## Review Focus

Entrées que la spec implique sans que les tâches nominales les couvrent ; chacune a son test dans la tâche indiquée.

1. Un champ libre (Utilisation, Architecture, Contribution, Markdown libre) contenant un bloc de code jamais refermé : GitHub l'étend jusqu'à la fin du fichier et engloutit tous les blocs suivants. L'utilisateur doit être averti, jamais laissé devant un README cassé sans un mot. Test : Tâche 2.
2. Une adresse de contact refusée, une URL de base de bannière invalide, ou un nom d'utilisateur invalide saisi dans un bloc : le bloc doit avertir, pas disparaître ni être remplacé en silence par le nom du README. Test : Tâche 3.
3. Titres de section piégeux dans la table des matières : lien dans l'intitulé, entité (`R&amp;D`), commentaire HTML, intitulé souligné (Setext), intitulé identique à un titre d'un autre niveau. Chaque lien de la table doit pointer sur l'ancre que GitHub calcule vraiment. Test : Tâches 4 et 9 (contrat entre la table et l'aperçu).
4. Fichier `pyproject.toml` réel : liste d'auteurs sur plusieurs lignes, chaîne multiligne, clé entre guillemets, et fichier de 20 000 caractères hostile : jamais de blocage de l'onglet. Test : Tâche 5.
5. Ajout de sections par l'assistant à un README déjà rédigé : elles se placent à leur rang habituel (la table des matières avant l'installation, la licence en dernier), pas au bout. Test : Tâche 6.
6. Travail enregistré devenu illisible ou amputé (mise à jour de l'outil, stockage corrompu) : aucune perte silencieuse, une copie est conservée et proposée. Stockage plein : le message dit que c'est plein, pas « indisponible ». Test : Tâche 7.
7. Note de bas de page dans un bloc libre : le lien de renvoi de l'aperçu doit mener à la note. Test : Tâche 9.
8. Deux blocs du même type dans la liste : chacun doit avoir un nom distinct pour un lecteur d'écran. Test : Tâche 10.
9. Ouverture : un outil sorti de `comingSoon` doit figurer dans le sitemap, la navigation, la vitrine de l'accueil et avoir son texte d'accueil dans les 8 langues. Test : Tâche 11.

Déjà corrigés sur `main` avant ce plan, à la suite de la revue du plan 3 (commit `fb27cf8`) : un emoji coupé ou un substitut isolé dans la bannière ou un badge faisait planter la page (`URIError`), et l'adresse du flux acceptait `${{ … }}` que GitHub évalue dans le workflow.

---

## Structure des fichiers

**Créés**
- `src/lib/readme/block-labels.ts` — noms d'affichage des blocs, avec un rang quand un type se répète.
- `src/lib/readme/hex-input.ts` — nettoyage de la saisie d'une couleur hexadécimale.
- `src/lib/readme/preview-anchors.ts` — greffon rehype : ids de titres et liens `#fragment` de l'aperçu.
- `src/components/readme-generator/use-autosave.ts` — sauvegarde différée et vidage à la fermeture.
- Tests : `tests/i18n/readme-generator-hardening-locales.test.ts`, `tests/readme/{unclosed-fence,blocks-validation,blocks-profile-warnings,skill-toggle,headings,toml,selection-order,storage-recovery,preview-anchors,block-labels,hex-input}.test.ts`, `tests/seo/tools-registry.test.ts`.

**Modifiés**
- `src/lib/readme/` : `types.ts`, `markdown-checks.ts`, `headings.ts` (réécrit), `generate.ts`, `card-service.ts`, `skill-catalog.ts`, `extract.ts`, `state.ts`, `persistence.ts`, `markdown-pipeline.ts`, `blocks/{usage,architecture,contributing,alert,contact,banner,table-of-contents}.ts`.
- `src/components/readme-generator/` : `readme-generator.tsx`, `block-list.tsx`, `block-forms.tsx`, `readme-wizard.tsx`, `extraction-panel.tsx`, `readme-preview.css`.
- `src/i18n/locales/*.json`, `src/lib/tools.ts`, `src/app/[locale]/tools/readme-generator/page.tsx`, `src/app/sitemap.ts`, `src/components/home/tools-showcase.tsx`, `src/lib/changelog.ts`, `CHANGELOG.md`, `package.json`, `package-lock.json`, `tests/readme/{toc,state}.test.ts`.

---

### Task 1: Traductions du durcissement (8 locales)

**Files:**
- Modify: `src/i18n/locales/{fr,en,es,de,it,pt,ru,ja}.json`
- Create (temporaire, non commité) : `tmp-i18n-readme-plan4.mjs`
- Test: `tests/i18n/readme-generator-hardening-locales.test.ts`

**Interfaces:**
- Consumes: le namespace `readmeGenerator` des plans 1 à 3.
- Produces : dans chaque locale, sous `readmeGenerator` : `warnings.{unclosedFence,invalidContact,invalidUsername}` (`invalidContact` porte `{network}`) ; `messages.{storageFull,loadDropped,loadUnreadable,backupKept,downloadBackup}` ; `blocks.{dragFor,enabledFor,moveUpFor,moveDownFor,removeFor}` (avec `{name}`) ; `extraction.loading`. Réécrit cinq textes existants dont les revues ont montré qu'ils étaient faux ou incomplets : `workflow.step2` (le fichier demande lui-même l'écriture, le réglage du dépôt n'est qu'un recours), `workflow.note` (les commits « keepalive » de l'action), `hints.baseUrl` (le proxy Camo, que la spec §9 demande d'expliquer), `hints.lines` (coupe à 100 caractères, `;` remplacé) et `hints.feedUrl` (`http` accepté, `$` et accolades refusés). Utilisées par les Tâches 2, 3, 6, 9.

- [ ] **Step 1: Écrire le test qui échoue**

Create `tests/i18n/readme-generator-hardening-locales.test.ts` :

```ts
import { describe, it, expect } from 'vitest';
import { locales } from '@/i18n/locales';

const REQUIRED_KEYS = [
  'warnings.unclosedFence', 'warnings.invalidContact', 'warnings.invalidUsername',
  'messages.storageFull', 'messages.loadDropped', 'messages.loadUnreadable', 'messages.backupKept', 'messages.downloadBackup',
  'blocks.dragFor', 'blocks.enabledFor', 'blocks.moveUpFor', 'blocks.moveDownFor', 'blocks.removeFor',
  'extraction.loading',
] as const;

const PLACEHOLDERS: Record<string, string[]> = {
  'warnings.invalidContact': ['{network}'],
  'messages.loadDropped': ['{count}'],
  'blocks.dragFor': ['{name}'],
  'blocks.enabledFor': ['{name}'],
  'blocks.moveUpFor': ['{name}'],
  'blocks.moveDownFor': ['{name}'],
  'blocks.removeFor': ['{name}'],
};

// Texts rewritten because a review found them wrong or incomplete: each must say the missing thing.
const MENTIONS: Record<string, string> = {
  'workflow.step2': 'contents: write',
  'workflow.note': 'keepalive',
  'hints.baseUrl': 'Camo',
};

function getPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

describe('readme generator hardening translations', () => {
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

  it.each(locales)('%s rewritten texts carry what the reviews found missing', async (locale) => {
    const messages = (await import(`@/i18n/locales/${locale}.json`)).default;
    for (const [key, mention] of Object.entries(MENTIONS)) {
      expect(getPath(messages.readmeGenerator, key) as string, `${locale}:${key}`).toContain(mention);
    }
  });

  it.each(locales)('%s feed hint no longer promises https only', async (locale) => {
    const messages = (await import(`@/i18n/locales/${locale}.json`)).default;
    const hint = getPath(messages.readmeGenerator, 'hints.feedUrl') as string;
    expect(hint, locale).toContain('$');
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run tests/i18n/readme-generator-hardening-locales.test.ts`
Expected: FAIL, 32 échecs (4 tests × 8 locales) : les clés n'existent pas, et les cinq textes existants ne disent pas encore ce que les revues ont relevé.

- [ ] **Step 3: Créer le script de traductions**

Create `tmp-i18n-readme-plan4.mjs` à la racine (fichier temporaire, jamais commité). Chaque ligne est `clé => fr | en | es | de | it | pt | ru | ja` ; le script refuse toute ligne qui n'a pas exactement huit traductions.

```js
import fs from 'node:fs';

const ORDER = ['fr', 'en', 'es', 'de', 'it', 'pt', 'ru', 'ja'];

const TABLE = `
warnings.unclosedFence => Un bloc de code n'est pas refermé : il absorbe tout ce qui suit dans le README. | A code block is never closed: it swallows everything after it in the README. | Un bloque de código no se cierra: absorbe todo lo que le sigue en el README. | Ein Codeblock wird nicht geschlossen: Er verschluckt alles, was danach im README folgt. | Un blocco di codice non è chiuso: assorbe tutto ciò che segue nel README. | Um bloco de código não é fechado: absorve tudo o que vem a seguir no README. | Блок кода не закрыт: он поглощает всё, что идёт после него в README. | コードブロックが閉じられていません。README内のそれ以降がすべて飲み込まれます。
messages.storageFull => Le stockage du navigateur est plein : vos dernières modifications ne sont pas enregistrées. Exportez votre travail en JSON. | Browser storage is full: your latest changes are not saved. Export your work as JSON. | El almacenamiento del navegador está lleno: tus últimos cambios no se guardan. Exporta tu trabajo en JSON. | Der Browserspeicher ist voll: Ihre letzten Änderungen werden nicht gespeichert. Exportieren Sie Ihre Arbeit als JSON. | La memoria del browser è piena: le ultime modifiche non vengono salvate. Esporta il tuo lavoro in JSON. | O armazenamento do navegador está cheio: as suas últimas alterações não são guardadas. Exporte o seu trabalho em JSON. | Хранилище браузера заполнено: последние изменения не сохраняются. Экспортируйте работу в JSON. | ブラウザのストレージがいっぱいです。最新の変更は保存されません。作業をJSONでエクスポートしてください。
messages.loadDropped => Blocs illisibles ignorés à l'ouverture : {count}. Une copie de votre ancien travail est conservée. | Unreadable blocks skipped on opening: {count}. A copy of your previous work is kept. | Bloques ilegibles omitidos al abrir: {count}. Se conserva una copia de tu trabajo anterior. | Beim Öffnen übersprungene unlesbare Blöcke: {count}. Eine Kopie Ihrer bisherigen Arbeit bleibt erhalten. | Blocchi illeggibili ignorati all'apertura: {count}. Viene conservata una copia del lavoro precedente. | Blocos ilegíveis ignorados ao abrir: {count}. Uma cópia do seu trabalho anterior foi guardada. | Нечитаемые блоки, пропущенные при открытии: {count}. Копия прежней работы сохранена. | 読み込めず無視したブロック：{count}件。以前の作業のコピーを保存しています。
messages.loadUnreadable => Votre travail enregistré est illisible et n'a pas pu être rouvert. Une copie brute est conservée. | Your saved work is unreadable and could not be reopened. A raw copy is kept. | Tu trabajo guardado es ilegible y no se pudo reabrir. Se conserva una copia sin procesar. | Ihre gespeicherte Arbeit ist unlesbar und konnte nicht geöffnet werden. Eine Rohkopie bleibt erhalten. | Il lavoro salvato è illeggibile e non è stato possibile riaprirlo. Viene conservata una copia grezza. | O seu trabalho guardado está ilegível e não foi possível reabri-lo. Uma cópia em bruto foi guardada. | Сохранённая работа нечитаема и не может быть открыта. Сырая копия сохранена. | 保存された作業が読み取れず、開けませんでした。元のデータのコピーを保存しています。
messages.backupKept => Une copie de sauvegarde d'un travail précédent est disponible dans ce navigateur. | A backup copy of previous work is available in this browser. | Hay una copia de seguridad de un trabajo anterior disponible en este navegador. | In diesem Browser ist eine Sicherungskopie einer früheren Arbeit verfügbar. | In questo browser è disponibile una copia di backup di un lavoro precedente. | Está disponível neste navegador uma cópia de segurança de um trabalho anterior. | В этом браузере доступна резервная копия предыдущей работы. | このブラウザに、以前の作業のバックアップコピーがあります。
messages.downloadBackup => Télécharger la copie | Download the copy | Descargar la copia | Kopie herunterladen | Scarica la copia | Transferir a cópia | Скачать копию | コピーをダウンロード
blocks.dragFor => Glisser pour réorganiser : {name} | Drag to reorder: {name} | Arrastrar para reordenar: {name} | Zum Umsortieren ziehen: {name} | Trascina per riordinare: {name} | Arrastar para reordenar: {name} | Перетащите, чтобы изменить порядок: {name} | ドラッグして並べ替え：{name}
blocks.enabledFor => Activer le bloc : {name} | Enable block: {name} | Activar el bloque: {name} | Block aktivieren: {name} | Attiva il blocco: {name} | Ativar o bloco: {name} | Включить блок: {name} | ブロックを有効にする：{name}
blocks.moveUpFor => Monter : {name} | Move up: {name} | Subir: {name} | Nach oben: {name} | Sposta su: {name} | Subir: {name} | Выше: {name} | 上へ移動：{name}
blocks.moveDownFor => Descendre : {name} | Move down: {name} | Bajar: {name} | Nach unten: {name} | Sposta giù: {name} | Descer: {name} | Ниже: {name} | 下へ移動：{name}
blocks.removeFor => Supprimer : {name} | Remove: {name} | Eliminar: {name} | Entfernen: {name} | Rimuovi: {name} | Remover: {name} | Удалить: {name} | 削除：{name}
extraction.loading => Chargement… | Loading… | Cargando… | Wird geladen … | Caricamento… | A carregar… | Загрузка… | 読み込み中…
warnings.invalidContact => Adresse de contact invalide pour {network} : le badge n'est pas généré. Utilisez une adresse https://… ou, pour l'e-mail, une adresse électronique. | Invalid contact address for {network}: the badge is not generated. Use an https://… address or, for email, an email address. | Dirección de contacto no válida para {network}: no se genera la insignia. Usa una dirección https://… o, para el correo, una dirección de correo electrónico. | Ungültige Kontaktadresse für {network}: Das Badge wird nicht erzeugt. Verwenden Sie eine https://…-Adresse oder, für E-Mail, eine E-Mail-Adresse. | Indirizzo di contatto non valido per {network}: il badge non viene generato. Usa un indirizzo https://… oppure, per l'email, un indirizzo email. | Endereço de contacto inválido para {network}: o emblema não é gerado. Use um endereço https://… ou, para o e-mail, um endereço de correio eletrónico. | Недопустимый контактный адрес для {network}: значок не создаётся. Укажите адрес https://… или, для почты, адрес электронной почты. | {network}の連絡先アドレスが無効です。バッジは生成されません。https://… のアドレス、またはメールの場合はメールアドレスを使用してください。
warnings.invalidUsername => Nom d'utilisateur GitHub du bloc invalide : rien n'est généré. Saisissez le nom seul (sans adresse) ou videz le champ pour utiliser celui du README. | Invalid GitHub username in this block: nothing is generated. Enter the name alone (no address) or clear the field to use the README's. | Nombre de usuario de GitHub no válido en este bloque: no se genera nada. Escribe solo el nombre (sin dirección) o vacía el campo para usar el del README. | Ungültiger GitHub-Benutzername in diesem Block: Es wird nichts erzeugt. Geben Sie nur den Namen ein (keine Adresse) oder leeren Sie das Feld, um den des READMEs zu verwenden. | Nome utente GitHub non valido in questo blocco: non viene generato nulla. Inserisci solo il nome (senza indirizzo) oppure svuota il campo per usare quello del README. | Nome de utilizador do GitHub inválido neste bloco: nada é gerado. Introduza apenas o nome (sem endereço) ou limpe o campo para usar o do README. | Недопустимое имя пользователя GitHub в этом блоке: ничего не создаётся. Введите только имя (без адреса) или очистите поле, чтобы использовать имя из README. | このブロックのGitHubユーザー名が無効です。何も生成されません。アドレスではなく名前だけを入力するか、空にしてREADMEのユーザー名を使用してください。
workflow.step2 => Le fichier demande lui-même le droit d'écrire dans le README (contents: write). Si une exécution échoue avec une erreur de permission, vérifiez dans Settings > Actions > General qu'une politique d'organisation n'a pas limité « Workflow permissions » à la lecture seule. | The file itself asks for permission to write to the README (contents: write). If a run fails with a permission error, check in Settings > Actions > General that an organization policy has not limited "Workflow permissions" to read-only. | El propio archivo solicita permiso para escribir en el README (contents: write). Si una ejecución falla con un error de permisos, comprueba en Settings > Actions > General que una política de la organización no haya limitado «Workflow permissions» a solo lectura. | Die Datei fordert die Schreibberechtigung für das README selbst an (contents: write). Schlägt ein Lauf mit einem Berechtigungsfehler fehl, prüfen Sie unter Settings > Actions > General, ob eine Organisationsrichtlinie „Workflow permissions“ auf reinen Lesezugriff beschränkt hat. | Il file stesso richiede il permesso di scrivere nel README (contents: write). Se un'esecuzione fallisce con un errore di permessi, verifica in Settings > Actions > General che una policy dell'organizzazione non abbia limitato «Workflow permissions» alla sola lettura. | O próprio ficheiro pede permissão para escrever no README (contents: write). Se uma execução falhar com um erro de permissões, verifique em Settings > Actions > General se uma política da organização não limitou «Workflow permissions» a apenas leitura. | Сам файл запрашивает право записи в README (contents: write). Если запуск завершается ошибкой доступа, проверьте в Settings > Actions > General, не ограничила ли политика организации «Workflow permissions» только чтением. | ファイル自体がREADMEへの書き込み権限（contents: write）を要求します。権限エラーで実行に失敗した場合は、Settings > Actions > General で、組織のポリシーが「Workflow permissions」を読み取り専用に制限していないか確認してください。
workflow.note => GitHub désactive les workflows planifiés après 60 jours sans activité. L'action ajoute donc de temps en temps un commit « keepalive » pour garder le dépôt actif : c'est normal. Si les articles ne se mettent plus à jour, relancez le workflow à la main. | GitHub disables scheduled workflows after 60 days without activity. The action therefore occasionally adds a "keepalive" commit to keep the repository active: this is expected. If the posts stop updating, run the workflow by hand. | GitHub desactiva los workflows programados tras 60 días sin actividad. Por eso la acción añade de vez en cuando un commit «keepalive» para mantener activo el repositorio: es normal. Si los artículos dejan de actualizarse, ejecuta el workflow a mano. | GitHub deaktiviert geplante Workflows nach 60 Tagen ohne Aktivität. Die Action fügt deshalb gelegentlich einen „keepalive“-Commit hinzu, um das Repository aktiv zu halten: Das ist normal. Werden die Beiträge nicht mehr aktualisiert, starten Sie den Workflow von Hand. | GitHub disattiva i workflow pianificati dopo 60 giorni senza attività. L'action aggiunge quindi ogni tanto un commit «keepalive» per mantenere attivo il repository: è normale. Se gli articoli non si aggiornano più, avvia il workflow a mano. | O GitHub desativa os workflows agendados após 60 dias sem atividade. Por isso, a action adiciona de vez em quando um commit «keepalive» para manter o repositório ativo: é normal. Se os artigos deixarem de atualizar, execute o workflow manualmente. | GitHub отключает запланированные workflow после 60 дней без активности. Поэтому action время от времени добавляет коммит «keepalive», чтобы репозиторий оставался активным: это нормально. Если статьи перестали обновляться, запустите workflow вручную. | GitHubは60日間活動がないと、スケジュール実行のworkflowを無効にします。そのためactionは、リポジトリを有効に保つ「keepalive」コミットをときどき追加します。これは正常な動作です。記事が更新されなくなったら、workflowを手動で実行してください。
hints.baseUrl => Ce service public est régulièrement indisponible. Déployez votre propre instance (par exemple sur Vercel, en suivant la documentation du projet) et collez son adresse ici. Tant que ce champ est vide, rien n'est généré. GitHub charge les images par un serveur mandataire (Camo) qui les met en cache : une carte peut mettre du temps à se rafraîchir, et aucun paramètre d'URL ne peut le forcer. | This public service is often unavailable. Deploy your own instance (for example on Vercel, following the project's documentation) and paste its address here. Nothing is generated while this field is empty. GitHub loads images through a proxy (Camo) that caches them: a card can take a while to refresh, and no URL parameter can force it. | Este servicio público suele estar caído. Despliega tu propia instancia (por ejemplo en Vercel, siguiendo la documentación del proyecto) y pega aquí su dirección. Mientras este campo esté vacío, no se genera nada. GitHub carga las imágenes a través de un proxy (Camo) que las guarda en caché: una tarjeta puede tardar en actualizarse y ningún parámetro de la URL puede forzarlo. | Dieser öffentliche Dienst ist oft nicht erreichbar. Betreiben Sie eine eigene Instanz (zum Beispiel auf Vercel, gemäß der Projektdokumentation) und fügen Sie hier deren Adresse ein. Solange das Feld leer ist, wird nichts erzeugt. GitHub lädt Bilder über einen Proxy (Camo), der sie zwischenspeichert: Eine Karte kann sich verzögert aktualisieren, und kein URL-Parameter kann das erzwingen. | Questo servizio pubblico è spesso non disponibile. Distribuisci la tua istanza (ad esempio su Vercel, seguendo la documentazione del progetto) e incolla qui il suo indirizzo. Finché il campo è vuoto, non viene generato nulla. GitHub carica le immagini tramite un proxy (Camo) che le mette in cache: una scheda può impiegare tempo ad aggiornarsi e nessun parametro dell'URL può forzarlo. | Este serviço público está muitas vezes indisponível. Implemente a sua própria instância (por exemplo na Vercel, seguindo a documentação do projeto) e cole aqui o endereço. Enquanto este campo estiver vazio, nada é gerado. O GitHub carrega as imagens através de um proxy (Camo) que as guarda em cache: um cartão pode demorar a atualizar e nenhum parâmetro do URL o consegue forçar. | Этот публичный сервис часто недоступен. Разверните собственный экземпляр (например, на Vercel, по документации проекта) и вставьте сюда его адрес. Пока поле пусто, ничего не создаётся. GitHub загружает изображения через прокси (Camo), который их кэширует: карточка может обновляться с задержкой, и параметром URL это не ускорить. | この公開サービスはしばしば利用できなくなります。ご自身のインスタンス（例：Vercel、プロジェクトのドキュメントに従う）をデプロイし、そのアドレスをここに貼り付けてください。このフィールドが空の間は何も生成されません。GitHubは画像をキャッシュするプロキシ（Camo）経由で読み込むため、カードの更新に時間がかかることがあり、URLパラメータで強制することはできません。
hints.lines => Une ligne de texte par ligne, cinq au maximum, 100 caractères chacune (un point-virgule devient une virgule). Elles défilent l'une après l'autre. | One line of text per line, five at most, 100 characters each (a semicolon becomes a comma). They type out one after the other. | Una línea de texto por línea, cinco como máximo, de 100 caracteres cada una (un punto y coma se convierte en coma). Se escriben una tras otra. | Ein Text pro Zeile, höchstens fünf, je 100 Zeichen (ein Semikolon wird zum Komma). Sie werden nacheinander getippt. | Una riga di testo per riga, al massimo cinque, di 100 caratteri ciascuna (un punto e virgola diventa una virgola). Vengono scritte una dopo l'altra. | Uma linha de texto por linha, no máximo cinco, com 100 caracteres cada (um ponto e vírgula passa a vírgula). São escritas uma após a outra. | По одной строке текста, не более пяти, до 100 символов каждая (точка с запятой заменяется запятой). Они печатаются одна за другой. | 1行につき1つのテキスト、最大5行、各100文字まで（セミコロンはカンマに置き換わります）。順番にタイプされます。
hints.feedUrl => L'adresse publique du flux de votre blog (https recommandé). Elle est écrite dans le workflow ; le signe $ et les accolades ne sont pas acceptés. | The public address of your blog's feed (https recommended). It is written into the workflow; the $ sign and curly braces are not accepted. | La dirección pública del feed de tu blog (se recomienda https). Se escribe en el workflow; el signo $ y las llaves no se aceptan. | Die öffentliche Adresse des Feeds Ihres Blogs (https empfohlen). Sie wird in den Workflow geschrieben; das Zeichen $ und geschweifte Klammern werden nicht akzeptiert. | L'indirizzo pubblico del feed del tuo blog (https consigliato). Viene scritto nel workflow; il segno $ e le parentesi graffe non sono accettati. | O endereço público do feed do seu blogue (https recomendado). É escrito no workflow; o sinal $ e as chavetas não são aceites. | Публичный адрес ленты вашего блога (рекомендуется https). Он записывается в workflow; знак $ и фигурные скобки не допускаются. | ブログのフィードの公開アドレス（httpsを推奨）。workflowに書き込まれます。$記号と波括弧は使用できません。
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

Run: `node tmp-i18n-readme-plan4.mjs`
Expected: huit lignes `updated src/i18n/locales/<locale>.json 19 keys`.

Run: `rm tmp-i18n-readme-plan4.mjs`

- [ ] **Step 5: Vérifier que les tests passent et que les diffs sont propres**

Run: `npx vitest run tests/i18n`
Expected: PASS (tous les tests i18n, dont les 32 nouveaux).

Run: `git diff --stat src/i18n/locales`
Expected: huit fichiers modifiés, uniquement des lignes ajoutées (hors la virgule ajoutée à l'ancienne dernière entrée de chaque objet).

- [ ] **Step 6: Commit**

```bash
git add src/i18n/locales tests/i18n/readme-generator-hardening-locales.test.ts
git commit -m "$(cat <<'EOF'
feat(readme): ajoute les traductions du durcissement dans les 8 locales

Avertissements de bloc de code non fermé, de contact et de nom
d'utilisateur invalides, messages de stockage plein et de copie de secours,
libellés d'accessibilité nommant chaque bloc, texte de chargement de
l'extraction. Corrige cinq textes : le guide du workflow (droit d'écriture,
commits keepalive), l'aide de l'URL de base (proxy Camo), celles des lignes
de bannière et de l'adresse du flux.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Avertissement de bloc de code non fermé et contrôle des champs libres

**Files:**
- Modify: `src/lib/readme/types.ts`, `src/lib/readme/markdown-checks.ts`, `src/lib/readme/blocks/usage.ts`, `src/lib/readme/blocks/architecture.ts`, `src/lib/readme/blocks/contributing.ts`, `src/lib/readme/blocks/alert.ts`
- Test: `tests/readme/unclosed-fence.test.ts`, `tests/readme/blocks-validation.test.ts`

**Interfaces:**
- Consumes: `checkMarkdownFragment`, `linesOutsideFences`, `validateReadme`, `BlockWarning`.
- Produces :
  - `WarningCode` gagne `'unclosedFence'`.
  - `hasUnclosedFence(markdown: string): boolean` et `scanFences(markdown: string): { lines: string[]; unclosed: boolean }` exportées de `markdown-checks.ts` ; `linesOutsideFences` garde sa signature.
  - `checkMarkdownFragment` ajoute `{ code: 'unclosedFence' }` quand un bloc de code reste ouvert.
  - Les blocs `usage` (champ description), `architecture` (contenu), `contributing` (texte) et `alert` (texte) ont désormais un `validate` qui appelle `checkMarkdownFragment` ; celui de `alert` ignore `unclosedFence` (un bloc de code dans une citation s'arrête avec la citation, il n'engloutit rien).

- [ ] **Step 1: Écrire les tests qui échouent**

Create `tests/readme/unclosed-fence.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import { checkMarkdownFragment, hasUnclosedFence } from '@/lib/readme/markdown-checks';

describe('unclosed code fences', () => {
  it.each([
    ['```js\nconst a = 1;', true],
    ['~~~\ntext', true],
    ['```\ntext\n~~~', true],
    ['```\ntext\n```', false],
    ['````\n```\ninner\n```\n````', false],
    ['no fence at all', false],
    ['```\ncode\n``` trailing', true],
  ])('hasUnclosedFence(%j) is %s', (markdown, expected) => {
    expect(hasUnclosedFence(markdown)).toBe(expected);
  });

  it('reports the warning from checkMarkdownFragment', () => {
    expect(checkMarkdownFragment('intro\n\n```bash\nnpm i')).toContainEqual({ code: 'unclosedFence' });
    expect(checkMarkdownFragment('```bash\nnpm i\n```')).not.toContainEqual({ code: 'unclosedFence' });
  });

  it('scans a hostile input in linear time', () => {
    const start = performance.now();
    hasUnclosedFence('```\n'.repeat(50_000));
    hasUnclosedFence('~'.repeat(100_000));
    expect(performance.now() - start).toBeLessThan(300);
  });
});
```

Create `tests/readme/blocks-validation.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import { validateReadme } from '@/lib/readme/validate';
import { block, freeMarkdown, stateWith } from './helpers';

const codes = (blocks: ReturnType<typeof block>[]) => validateReadme(stateWith(blocks)).map((w) => w.code);

const usage = (description: string, code = '') =>
  block('u', 'usage', { heading: 'Usage', description, code, language: '' });
const architecture = (content: string) =>
  block('a', 'architecture', { heading: 'Architecture', content, roadmapHeading: 'Roadmap', roadmap: '' });
const contributing = (text: string) =>
  block('c', 'contributing', { heading: 'Contributing', text, linkUrl: '', linkLabel: '' });
const alert = (text: string) => block('n', 'alert', { kind: 'NOTE', text });

describe('unclosed code fence in a free field', () => {
  it('warns for the free Markdown block', () => {
    expect(codes([freeMarkdown('f', '```js\nlet a')])).toEqual(['unclosedFence']);
  });

  it.each([
    ['usage', usage('Run:\n\n```bash\nnpm start')],
    ['architecture', architecture('```\ntree')],
    ['contributing', contributing('Steps:\n~~~\nx')],
  ])('warns for the %s block', (_name, target) => {
    expect(codes([target])).toEqual(['unclosedFence']);
  });

  it('does not warn when the fence is closed or when the code comes from the code field', () => {
    expect(codes([usage('Run:\n\n```bash\nnpm start\n```')])).toEqual([]);
    expect(codes([usage('Run it.', 'const a = "```";')])).toEqual([]);
  });

  it('does not warn for an alert: a fence inside a quote ends with the quote', () => {
    expect(codes([alert('```\nunfinished')])).toEqual([]);
  });
});

describe('HTML mismatch in a free field', () => {
  it.each([
    ['usage', usage('<details><summary>More</summary>')],
    ['architecture', architecture('<div align="center">')],
    ['contributing', contributing('<details>')],
    ['alert', alert('<b>bold')],
  ])('warns for the %s block', (_name, target) => {
    expect(codes([target])).toEqual(['htmlTagMismatch']);
  });

  it('warns about an image without alt text in an architecture diagram', () => {
    expect(codes([architecture('![](https://x.example/a.png)')])).toEqual(['imageMissingAlt']);
  });

  it('stays quiet on ordinary text', () => {
    expect(codes([usage('Plain **text**.'), architecture('Layers: a, b.'), contributing('PRs welcome.')])).toEqual([]);
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run tests/readme/unclosed-fence.test.ts tests/readme/blocks-validation.test.ts`
Expected: FAIL. `hasUnclosedFence` est `undefined` (`TypeError: hasUnclosedFence is not a function`) et les blocs `usage`, `architecture`, `contributing`, `alert` ne renvoient aucun avertissement.

- [ ] **Step 3: Étendre le validateur**

Modify `src/lib/readme/types.ts` : remplacer

```ts
  | 'layoutTable'
  | 'tooManyBadges'
```

par

```ts
  | 'layoutTable'
  | 'unclosedFence'
  | 'tooManyBadges'
```

Modify `src/lib/readme/markdown-checks.ts` : remplacer

```ts
export function linesOutsideFences(markdown: string): string[] {
  const kept: string[] = [];
  let open: { char: string; length: number } | null = null;
```

par

```ts
export function scanFences(markdown: string): { lines: string[]; unclosed: boolean } {
  const kept: string[] = [];
  let open: { char: string; length: number } | null = null;
```

Puis remplacer

```ts
      open = null;
    }
  }
  return kept;
}
```

par

```ts
      open = null;
    }
  }
  return { lines: kept, unclosed: open !== null };
}

export function linesOutsideFences(markdown: string): string[] {
  return scanFences(markdown).lines;
}

/** True when a fenced code block opens and never closes: GitHub then runs it to the end of the file. */
export function hasUnclosedFence(markdown: string): boolean {
  return scanFences(markdown).unclosed;
}
```

Puis remplacer

```ts
  if (hasLayoutTable(markdown)) warnings.push({ code: 'layoutTable' });
  return warnings;
```

par

```ts
  if (hasLayoutTable(markdown)) warnings.push({ code: 'layoutTable' });
  if (hasUnclosedFence(markdown)) warnings.push({ code: 'unclosedFence' });
  return warnings;
```

Modify `src/lib/readme/blocks/usage.ts` : remplacer

```ts
import { defineBlock } from '../block-definition';
import { getDefaultText } from '../default-texts';
```

par

```ts
import { defineBlock } from '../block-definition';
import { getDefaultText } from '../default-texts';
import { checkMarkdownFragment } from '../markdown-checks';
```

et remplacer

```ts
      .join('\n\n');
  },
});
```

par

```ts
      .join('\n\n');
  },
  // The code field is fenced by `codeFence`; only the free-form description can break the page.
  validate: (data) => checkMarkdownFragment(data.description),
});
```

Modify `src/lib/readme/blocks/architecture.ts` : remplacer

```ts
import { defineBlock } from '../block-definition';
import { getDefaultText } from '../default-texts';
```

par

```ts
import { defineBlock } from '../block-definition';
import { getDefaultText } from '../default-texts';
import { checkMarkdownFragment } from '../markdown-checks';
```

et remplacer

```ts
    return sections.join('\n\n');
  },
});
```

par

```ts
    return sections.join('\n\n');
  },
  validate: (data) => checkMarkdownFragment(data.content),
});
```

Modify `src/lib/readme/blocks/contributing.ts` : remplacer

```ts
import { defineBlock } from '../block-definition';
import { getDefaultText } from '../default-texts';
```

par

```ts
import { defineBlock } from '../block-definition';
import { getDefaultText } from '../default-texts';
import { checkMarkdownFragment } from '../markdown-checks';
```

et remplacer

```ts
    return [atxHeading(2, data.heading), text, link].filter((part) => part !== '').join('\n\n');
  },
});
```

par

```ts
    return [atxHeading(2, data.heading), text, link].filter((part) => part !== '').join('\n\n');
  },
  validate: (data) => checkMarkdownFragment(data.text),
});
```

Modify `src/lib/readme/blocks/alert.ts` : remplacer

```ts
import { defineBlock } from '../block-definition';
import { normalizeNewlines } from '../markdown-utils';
```

par

```ts
import { defineBlock } from '../block-definition';
import { checkMarkdownFragment } from '../markdown-checks';
import { normalizeNewlines } from '../markdown-utils';
```

et remplacer

```ts
    return [`> [!${data.kind}]`, ...quoted].join('\n');
  },
});
```

par

```ts
    return [`> [!${data.kind}]`, ...quoted].join('\n');
  },
  // A code fence inside a quote ends with the quote: it cannot swallow the next blocks.
  validate: (data) => checkMarkdownFragment(data.text).filter((warning) => warning.code !== 'unclosedFence'),
});
```

- [ ] **Step 4: Vérifier que tout passe**

Run: `npx vitest run tests/readme && npx tsc --noEmit`
Expected: PASS ; aucune erreur de types. Les tests de contrat du registre (`registry.test.ts`) passent inchangés : aucun bloc ne change de schéma.

- [ ] **Step 5: Commit**

```bash
git add src/lib/readme tests/readme
git commit -m "$(cat <<'EOF'
fix(readme): avertit d'un bloc de code non fermé et contrôle les champs libres

Un bloc de code jamais refermé dans un champ libre absorbait tous les blocs
suivants sans un mot. Le validateur le signale, et les champs multilignes
d'Utilisation, Architecture, Contribution et Alerte passent maintenant les
mêmes contrôles que le bloc Markdown libre (HTML non fermé, image sans alt).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Profil : ce qui disparaissait sans un mot

**Files:**
- Modify: `src/lib/readme/types.ts`, `src/lib/readme/card-service.ts`, `src/lib/readme/blocks/contact.ts`, `src/lib/readme/blocks/banner.ts`, `src/lib/readme/skill-catalog.ts`, `src/components/readme-generator/block-forms.tsx`
- Test: `tests/readme/blocks-profile-warnings.test.ts`, `tests/readme/skill-toggle.test.ts`

**Interfaces:**
- Consumes: `validateReadme`, `resolveCardService`, `cardWarnings`, `CONTACT_NETWORKS`, `safeEmail`, `safeWebUrl`, `parseBaseUrl`, `isSkillId`.
- Produces :
  - `WarningCode` gagne `'invalidContact'` (paramètre `network`, le nom du réseau) et `'invalidUsername'`.
  - `CardService` gagne `usernameInvalid: boolean` : un nom saisi dans le bloc mais invalide n'est plus remplacé en silence par celui du README ; il vide le nom et lève `invalidUsername`. Un champ vide continue de se replier sur `meta.username`.
  - Le bloc `contact` avertit pour chaque adresse saisie mais refusée ; le bloc `banner` avertit d'une URL de base invalide (`invalidBaseUrl`).
  - `cleanSkillIds(icons: readonly string[]): string[]` et `toggleSkill(icons: readonly string[], id: string, max: number): string[]` exportées de `skill-catalog.ts` : les identifiants périmés ou en double d'un fichier importé ne comptent plus dans la limite de 80 et disparaissent au premier clic.

- [ ] **Step 1: Écrire les tests qui échouent**

Create `tests/readme/blocks-profile-warnings.test.ts` :

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

const contact = (items: { network: string; value: string }[]) => block('c', 'contact', { heading: 'Contact', items });
const stats = (username: string, baseUrl = 'https://stats.example.com') =>
  block('s', 'stats', {
    heading: 'Stats',
    username,
    baseUrl,
    showStats: true,
    showLanguages: false,
    layout: 'compact',
    hideBorder: true,
  });
const trophies = (username: string) =>
  block('t', 'trophies', { heading: 'Trophies', username, baseUrl: 'https://trophy.example.com', columns: 4, rows: 2 });
const banner = (baseUrl: string) =>
  block('b', 'banner', { lines: 'Hi', font: 'Fira Code', size: 24, width: 500, align: 'left', color: '', baseUrl });

describe('contact block', () => {
  it('warns, with the network name, about an address it drops', () => {
    const state = profile([contact([{ network: 'linkedin', value: 'linkedin.com/in/jane' }])]);
    expect(validateReadme(state)).toEqual([
      { code: 'invalidContact', params: { network: 'LinkedIn' }, blockId: 'c' },
    ]);
    expect(generateReadme(state)).toBe('');
  });

  it('warns about a malformed email and about a javascript: link', () => {
    const state = profile([
      contact([
        { network: 'email', value: 'jane@' },
        { network: 'website', value: 'javascript:alert(1)' },
      ]),
    ]);
    expect(validateReadme(state).map((w) => w.params)).toEqual([{ network: 'Email' }, { network: 'Website' }]);
  });

  it('stays quiet on valid addresses and on a row the user has not filled in yet', () => {
    const state = profile([
      contact([
        { network: 'linkedin', value: 'https://linkedin.com/in/jane' },
        { network: 'email', value: 'jane@example.com' },
        { network: 'x', value: '' },
      ]),
    ]);
    expect(validateReadme(state)).toEqual([]);
  });
});

describe('card blocks and a username typed in the block', () => {
  it('does not swap an invalid name for the README one: it warns and generates nothing', () => {
    const state = profile([stats('https://github.com/bob')], { username: 'jane' });
    expect(validateReadme(state).map((w) => w.code)).toEqual(['invalidUsername']);
    expect(generateReadme(state)).toBe('');
  });

  it('does the same for the trophies', () => {
    const state = profile([trophies('bad name!')], { username: 'jane' });
    expect(validateReadme(state).map((w) => w.code)).toEqual(['invalidUsername']);
    expect(generateReadme(state)).toBe('');
  });

  it('still falls back to the README name when the block field is empty', () => {
    const state = profile([stats('')], { username: 'jane' });
    expect(validateReadme(state)).toEqual([]);
    expect(generateReadme(state)).toContain('username=jane');
  });

  it('reports a missing name when neither the block nor the README has one', () => {
    expect(validateReadme(profile([stats('')])).map((w) => w.code)).toEqual(['missingUsername']);
  });

  it('accepts a name written with a leading @', () => {
    const state = profile([stats('@jane')]);
    expect(validateReadme(state)).toEqual([]);
    expect(generateReadme(state)).toContain('username=jane');
  });
});

describe('banner block', () => {
  it('warns about an invalid base URL instead of vanishing', () => {
    const state = profile([banner('http://typing.example.com')]);
    expect(validateReadme(state).map((w) => w.code)).toEqual(['invalidBaseUrl']);
    expect(generateReadme(state)).toBe('');
  });

  it('stays quiet with no base URL (the public instance works) or a valid one', () => {
    expect(validateReadme(profile([banner('')]))).toEqual([]);
    expect(validateReadme(profile([banner('https://typing.example.com')]))).toEqual([]);
  });
});
```

Create `tests/readme/skill-toggle.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import { cleanSkillIds, toggleSkill } from '@/lib/readme/skill-catalog';

describe('cleanSkillIds', () => {
  it('drops unknown and repeated ids, keeping the order', () => {
    expect(cleanSkillIds(['js', 'nope', 'ts', 'js', 'py'])).toEqual(['js', 'ts', 'py']);
  });
});

describe('toggleSkill', () => {
  it('adds an id at the end and removes it on the next call', () => {
    expect(toggleSkill(['js'], 'ts', 80)).toEqual(['js', 'ts']);
    expect(toggleSkill(['js', 'ts'], 'js', 80)).toEqual(['ts']);
  });

  it('never counts stale ids from an imported file against the limit', () => {
    const stale = Array.from({ length: 80 }, (_, index) => `old${index}`);
    expect(toggleSkill(stale, 'js', 80)).toEqual(['js']);
  });

  it('refuses a new id when the real ones already fill the limit, and an unknown id', () => {
    expect(toggleSkill(['js', 'ts'], 'py', 2)).toEqual(['js', 'ts']);
    expect(toggleSkill(['js'], 'nope', 80)).toEqual(['js']);
  });

  it('still lets the user untick when the list is full', () => {
    expect(toggleSkill(['js', 'ts'], 'ts', 2)).toEqual(['js']);
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run tests/readme/blocks-profile-warnings.test.ts tests/readme/skill-toggle.test.ts`
Expected: FAIL. Les blocs `contact` et `banner` n'ont pas de `validate` (les listes d'avertissements sont vides), les cartes remplacent le nom invalide par `jane` sans avertir, et `cleanSkillIds` est `undefined` (`TypeError: cleanSkillIds is not a function`).

- [ ] **Step 3: Étendre le modèle des avertissements**

Modify `src/lib/readme/types.ts` : remplacer

```ts
  | 'invalidFeed';
```

par

```ts
  | 'invalidFeed'
  | 'invalidContact'
  | 'invalidUsername';
```

Modify `src/lib/readme/card-service.ts` : remplacer

```ts
export interface CardService {
  username: string;
  base: BaseUrl;
}
```

par

```ts
export interface CardService {
  username: string;
  /** True when a name was typed in the block but is not a valid GitHub username. */
  usernameInvalid: boolean;
  base: BaseUrl;
}
```

remplacer

```ts
export function resolveCardService(usernameInput: string, fallbackUsername: string, baseUrlInput: string): CardService {
  return {
    username: cleanUsername(usernameInput) || cleanUsername(fallbackUsername),
    base: parseBaseUrl(baseUrlInput),
  };
}
```

par

```ts
export function resolveCardService(usernameInput: string, fallbackUsername: string, baseUrlInput: string): CardService {
  const own = cleanUsername(usernameInput);
  // A name typed but invalid is reported, never swapped for the README's behind the user's back.
  const usernameInvalid = own === '' && usernameInput.trim() !== '';
  return {
    username: usernameInvalid ? '' : own || cleanUsername(fallbackUsername),
    usernameInvalid,
    base: parseBaseUrl(baseUrlInput),
  };
}
```

et remplacer

```ts
  if (card.username === '') warnings.push({ code: 'missingUsername' });
```

par

```ts
  if (card.usernameInvalid) warnings.push({ code: 'invalidUsername' });
  else if (card.username === '') warnings.push({ code: 'missingUsername' });
```

- [ ] **Step 4: Avertir pour le contact et la bannière**

Modify `src/lib/readme/blocks/contact.ts` : remplacer

```ts
export const contactBlock = defineBlock<ContactData>({
```

par

```ts
/** The validated link target of a row: an https(s) address, an email address, or '' when it is unusable. */
function contactAddress(item: ContactItem): string {
  return CONTACT_NETWORKS[item.network].kind === 'email' ? safeEmail(item.value) : safeWebUrl(item.value);
}

export const contactBlock = defineBlock<ContactData>({
```

puis remplacer

```ts
        const address = network.kind === 'email' ? safeEmail(item.value) : safeWebUrl(item.value);
        if (address === '') return '';
```

par

```ts
        const address = contactAddress(item);
        if (address === '') return '';
```

puis remplacer

```ts
    return [atxHeading(2, data.heading), badges.join(' ')].filter((part) => part !== '').join('\n\n');
  },
});
```

par

```ts
    return [atxHeading(2, data.heading), badges.join(' ')].filter((part) => part !== '').join('\n\n');
  },
  // A row still empty is not an error; an address the block drops is.
  validate: (data) =>
    data.items.flatMap((item) =>
      item.value.trim() !== '' && contactAddress(item) === ''
        ? [{ code: 'invalidContact' as const, params: { network: CONTACT_NETWORKS[item.network].label } }]
        : []
    ),
});
```

Modify `src/lib/readme/blocks/banner.ts` : remplacer

```ts
    return data.align === 'center' ? `<div align="center">\n\n${image}\n\n</div>` : image;
  },
});
```

par

```ts
    return data.align === 'center' ? `<div align="center">\n\n${image}\n\n</div>` : image;
  },
  // The form has no field for the base URL, so only an imported file can hold a bad one.
  validate: (data) => (parseBaseUrl(data.baseUrl).status === 'invalid' ? [{ code: 'invalidBaseUrl' }] : []),
});
```

- [ ] **Step 5: Nettoyer la liste des compétences**

Modify `src/lib/readme/skill-catalog.ts` : ajouter à la fin du fichier

```ts

/** The known, distinct ids of a saved list: a stale or repeated id from an imported file is dropped. */
export function cleanSkillIds(icons: readonly string[]): string[] {
  return [...new Set(icons.filter(isSkillId))];
}

/**
 * Ticks or unticks `id`. The list is cleaned first, so stale ids never count
 * against `max` (with 80 of them every box would be disabled and nothing would
 * say why); a new id is refused only when the real ones already fill the limit.
 */
export function toggleSkill(icons: readonly string[], id: string, max: number): string[] {
  const current = cleanSkillIds(icons);
  if (current.includes(id)) return current.filter((icon) => icon !== id);
  return isSkillId(id) && current.length < max ? [...current, id] : current;
}
```

Modify `src/components/readme-generator/block-forms.tsx` : remplacer

```tsx
import { SKILL_GROUPS } from '@/lib/readme/skill-catalog';
```

par

```tsx
import { SKILL_GROUPS, cleanSkillIds, toggleSkill } from '@/lib/readme/skill-catalog';
```

et remplacer

```tsx
  const full = data.icons.length >= SKILLS_LIMITS.maxIcons;
  const toggle = (id: string) =>
    set({ icons: data.icons.includes(id) ? data.icons.filter((icon) => icon !== id) : [...data.icons, id] });
```

par

```tsx
  const ticked = cleanSkillIds(data.icons);
  const full = ticked.length >= SKILLS_LIMITS.maxIcons;
  const toggle = (id: string) => set({ icons: toggleSkill(data.icons, id, SKILLS_LIMITS.maxIcons) });
```

et remplacer

```tsx
              const checked = data.icons.includes(skill.id);
```

par

```tsx
              const checked = ticked.includes(skill.id);
```

- [ ] **Step 6: Vérifier que tout passe**

Run: `npx vitest run tests/readme && npx tsc --noEmit && npx eslint src tests`
Expected: PASS ; aucune erreur de types ni de lint.

- [ ] **Step 7: Commit**

```bash
git add src tests
git commit -m "$(cat <<'EOF'
fix(readme): signale ce que le mode Profil abandonnait sans un mot

Une adresse de contact refusée, une URL de base de bannière invalide et un
nom d'utilisateur invalide saisi dans un bloc disparaissaient sans
avertissement, ce dernier étant même remplacé par celui du README. Les
identifiants de compétence périmés d'un fichier importé ne comptent plus
dans la limite de 80 qui désactivait toutes les cases.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Ancres de la table des matières fidèles à GitHub

**Files:**
- Modify: `src/lib/readme/markdown-checks.ts`, `src/lib/readme/headings.ts` (réécriture complète), `src/lib/readme/types.ts`, `src/lib/readme/generate.ts`, `src/lib/readme/blocks/table-of-contents.ts`
- Test: `tests/readme/headings.test.ts`, `tests/readme/toc.test.ts`

**Interfaces:**
- Consumes: `linesOutsideFences`/`scanFences` (Tâche 2), `GenerateContext`, `githubSlugs`.
- Produces :
  - `scanFences(markdown)` renvoie en plus `masked: string[]` : toutes les lignes d'entrée, celles des blocs de code (délimiteurs compris) vidées, positions conservées. `stripComments` est exportée de `markdown-checks.ts`.
  - `headings.ts` exporte `Heading = { level: number; text: string }`, `extractHeadings(markdown): Heading[]` (tous niveaux, ordre du document, commentaires HTML ignorés, intitulés Setext reconnus), `headingLabel(text): string` (intitulé sans images, liens réduits à leur libellé, sans balises), `githubSlug` et `githubSlugs` (inchangées de signature). **`extractH2` disparaît.**
  - `GenerateContext.headings` devient `Heading[]` (tous niveaux). La table des matières numérote les ancres sur tous les niveaux, comme GitHub, et n'en liste que le niveau 2.

- [ ] **Step 1: Écrire les tests qui échouent**

Modify `tests/readme/toc.test.ts` : remplacer

```ts
import { extractH2, githubSlug, githubSlugs } from '@/lib/readme/headings';
```

par

```ts
import { extractHeadings, githubSlug, githubSlugs } from '@/lib/readme/headings';
```

Dans le même fichier, remplacer

```ts
describe('extractH2', () => {
  it('returns level-2 headings as written, ignoring other levels and code', () => {
    const md = '# T\n## A\n### B\n## C ##\n```\n## in code\n```\n#### D\n##NoSpace\n## ';
    expect(extractH2(md)).toEqual(['A', 'C']);
  });

  it('understands fences longer than three backticks', () => {
    expect(extractH2('````\n```\n## inner\n```\n````\n## outer')).toEqual(['outer']);
  });
```

par

```ts
const h2 = (markdown: string) =>
  extractHeadings(markdown)
    .filter((heading) => heading.level === 2)
    .map((heading) => heading.text);

describe('level-2 headings', () => {
  it('are returned as written, ignoring other levels and code', () => {
    const md = '# T\n## A\n### B\n## C ##\n```\n## in code\n```\n#### D\n##NoSpace\n## ';
    expect(h2(md)).toEqual(['A', 'C']);
  });

  it('understand fences longer than three backticks', () => {
    expect(h2('````\n```\n## inner\n```\n````\n## outer')).toEqual(['outer']);
  });
```

et remplacer

```ts
      extractH2(text);
```

par

```ts
      extractHeadings(text);
```

Create `tests/readme/headings.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import { generateReadme } from '@/lib/readme/generate';
import { extractHeadings, githubSlug, headingLabel } from '@/lib/readme/headings';
import { block, freeMarkdown, stateWith } from './helpers';

const toc = () => block('t', 'tableOfContents', { heading: 'Contents' });
const listed = (...sections: string[]) => generateReadme(stateWith([freeMarkdown('a', sections.join('\n\n')), toc()]));

describe('extractHeadings', () => {
  it('returns every level in document order, ignoring code', () => {
    const md = '# T\n## A\n### B\n## C ##\n```\n## in code\n```\n#### D\n##NoSpace\n## ';
    expect(extractHeadings(md)).toEqual([
      { level: 1, text: 'T' },
      { level: 2, text: 'A' },
      { level: 3, text: 'B' },
      { level: 2, text: 'C' },
      { level: 4, text: 'D' },
    ]);
  });

  it('allows up to three leading spaces and refuses four (indented code)', () => {
    expect(extractHeadings('   ## Ok\n    ## Code')).toEqual([{ level: 2, text: 'Ok' }]);
  });

  it('ignores headings inside HTML comments, single or multi-line, and after an unterminated one', () => {
    expect(extractHeadings('<!-- ## Hidden -->\n## Shown <!-- note -->')).toEqual([{ level: 2, text: 'Shown' }]);
    expect(extractHeadings('<!--\n## Hidden\n-->\n## Shown')).toEqual([{ level: 2, text: 'Shown' }]);
    expect(extractHeadings('## Shown\n<!-- oops\n## Hidden')).toEqual([{ level: 2, text: 'Shown' }]);
  });

  it('reads Setext headings, on one or several lines of text', () => {
    expect(extractHeadings('Title\n=====\n\nSub\n---\n\nTwo\nlines\n---')).toEqual([
      { level: 1, text: 'Title' },
      { level: 2, text: 'Sub' },
      { level: 2, text: 'Two lines' },
    ]);
  });

  it('does not take a rule, a list item or a fenced block for a Setext heading', () => {
    expect(extractHeadings('text\n\n---\n\n- item\n---')).toEqual([]);
    expect(extractHeadings('text\n```\ncode\n```\n---')).toEqual([]);
    expect(extractHeadings('***\n---')).toEqual([]);
  });

  it('runs in linear time on hostile lines', () => {
    const hostile = [
      '## a' + ' '.repeat(50_000) + 'b',
      '## ' + '#'.repeat(50_000) + 'x',
      '##' + ' '.repeat(50_000),
      'a\n'.repeat(50_000) + '---',
      '- - '.repeat(25_000),
    ];
    for (const text of hostile) {
      const start = performance.now();
      extractHeadings(text);
      expect(performance.now() - start).toBeLessThan(300);
    }
  });
});

describe('headingLabel', () => {
  it.each([
    ['See [docs](https://x.example/a)', 'See docs'],
    ['[![build](https://x.example/b.svg)](https://x.example) Project', 'Project'],
    ['![logo](a.png) Title', 'Title'],
    ['<a href="x">Home</a> page', 'Home page'],
    ['R&amp;D **team**', 'R&amp;D **team**'],
    ['1\\. Start', '1\\. Start'],
    ['a < b and c > d', 'a < b and c > d'],
  ])('label of %j is %j', (text, label) => {
    expect(headingLabel(text)).toBe(label);
  });
});

describe('githubSlug follows the text GitHub renders', () => {
  it.each([
    ['R&amp;D', 'rd'],
    ['Caf&#233; &#xE9;t&#xE9;', 'café-été'],
    ['See [docs](https://x.example/a)', 'see-docs'],
    ['![logo](a.png) Title', 'title'],
    ['<b>Bold</b> text', 'bold-text'],
    ['Title <span>x</span>', 'title-x'],
    ['a\\_b', 'a_b'],
    // Unknown or invalid references stay literal text, as on GitHub.
    ['&bogus; &#0; &#xD800;', 'bogus-0-xd800'],
  ])('slug of %j is %j', (text, slug) => {
    expect(githubSlug(text)).toBe(slug);
  });

  it('runs in linear time on hostile text', () => {
    const hostile = ['['.repeat(50_000), '[a]('.repeat(20_000), '<'.repeat(50_000), '&'.repeat(50_000), '![a]('.repeat(20_000), '\\'.repeat(50_000)];
    for (const text of hostile) {
      const start = performance.now();
      githubSlug(text);
      headingLabel(text);
      expect(performance.now() - start).toBeLessThan(300);
    }
  });
});

describe('table of contents anchors', () => {
  it('numbers a repeated title across levels, as GitHub does', () => {
    expect(listed('# Usage', '## Usage', '## Other')).toContain('- [Usage](#usage-1)\n- [Other](#other)');
  });

  it('lists a heading that holds a link by its label, not as a link inside a link', () => {
    expect(listed('## See [docs](https://x.example/a)')).toContain('- [See docs](#see-docs)');
  });

  it('points at the anchor of the decoded text for an entity', () => {
    expect(listed('## R&amp;D')).toContain('- [R&amp;D](#rd)');
  });

  it('ignores a trailing HTML comment and lists Setext headings', () => {
    const output = listed('## Title <!-- note -->', 'Intro\n-----');
    expect(output).toContain('- [Title](#title)\n- [Intro](#intro)');
  });

  it('skips a heading that is only an image', () => {
    expect(listed('## ![logo](a.png)', '## Real')).toContain('## Contents\n\n- [Real](#real)\n');
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run tests/readme/toc.test.ts tests/readme/headings.test.ts`
Expected: FAIL. `extractHeadings` et `headingLabel` sont `undefined` (`TypeError: extractHeadings is not a function`) ; les tests de la table des matières qui ne touchent pas à ces fonctions passent encore.

- [ ] **Step 3: Exposer les lignes masquées**

Modify `src/lib/readme/markdown-checks.ts` : remplacer

```ts
/**
 * Lines that are not inside a fenced code block. A fence closes only on a line
 * made of the same character, at least as long as the opening one.
 */
export function scanFences(markdown: string): { lines: string[]; unclosed: boolean } {
  const kept: string[] = [];
  let open: { char: string; length: number } | null = null;
  for (const line of markdown.split('\n')) {
    const marker = /^ {0,3}(`{3,}|~{3,})/.exec(line);
    if (open === null) {
      if (marker) {
        open = { char: marker[1][0], length: marker[1].length };
        continue;
      }
      kept.push(line);
    } else if (
      marker &&
      marker[1][0] === open.char &&
      marker[1].length >= open.length &&
      line.slice(marker[0].length).trim() === ''
    ) {
      open = null;
    }
  }
  return { lines: kept, unclosed: open !== null };
}
```

par

```ts
export interface FenceScan {
  /** The lines outside fenced code, in order. */
  lines: string[];
  /** Every input line, with the fenced ones (fences included) emptied: positions are kept. */
  masked: string[];
  /** True when the last fence never closes. */
  unclosed: boolean;
}

/**
 * Splits a Markdown text around fenced code blocks. A fence closes only on a
 * line made of the same character, at least as long as the opening one.
 */
export function scanFences(markdown: string): FenceScan {
  const kept: string[] = [];
  const masked: string[] = [];
  let open: { char: string; length: number } | null = null;
  for (const line of markdown.split('\n')) {
    const marker = /^ {0,3}(`{3,}|~{3,})/.exec(line);
    if (open === null && !marker) {
      kept.push(line);
      masked.push(line);
      continue;
    }
    masked.push('');
    if (open === null && marker) {
      open = { char: marker[1][0], length: marker[1].length };
    } else if (
      open !== null &&
      marker &&
      marker[1][0] === open.char &&
      marker[1].length >= open.length &&
      line.slice(marker[0].length).trim() === ''
    ) {
      open = null;
    }
  }
  return { lines: kept, masked, unclosed: open !== null };
}
```

et remplacer

```ts
function stripComments(text: string): string {
```

par

```ts
export function stripComments(text: string): string {
```

- [ ] **Step 4: Réécrire la lecture des titres**

Replace `src/lib/readme/headings.ts` par :

```ts
import { scanFences, stripComments } from './markdown-checks';

export interface Heading {
  /** 1 to 6. */
  level: number;
  /** The heading as written, closing `#` removed; may hold inline Markdown. */
  text: string;
}

// Everything below runs on user text of up to 100,000 characters on each render:
// no regex may backtrack, and the inline scanners stop at the next bracket, so a
// hostile text cannot make one of them rescan the same characters.

const ATX_HEADING = /^ {0,3}(#{1,6})[ \t]+(\S.*)$/;
const SETEXT_UNDERLINE = /^ {0,3}(=+|-+)[ \t]*$/;
const THEMATIC_BREAK = /^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/;
/** Lines that cannot be the text of a Setext heading. */
const NOT_PARAGRAPH = /^ {0,3}(?:#{1,6}(?:[ \t]|$)|[-*+][ \t]|\d{1,9}[.)][ \t]|>|\|)/;
const ESCAPE_OR_ENTITY = /\\([!-/:-@[-`{-~])|&(#[xX][0-9a-fA-F]{1,6}|#[0-9]{1,7}|[A-Za-z][A-Za-z0-9]{1,31});/g;
const SLUG_FORBIDDEN = new RegExp('[^\\p{L}\\p{N}\\p{M}_ -]', 'gu');
const NAMED_ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

/** Removes an ATX closing sequence (`## Title ##`) without regex backtracking. */
function stripClosingHashes(text: string): string {
  let end = text.length;
  while (end > 0 && text[end - 1] === '#') end--;
  if (end < text.length && (end === 0 || text[end - 1] === ' ' || text[end - 1] === '\t')) {
    return text.slice(0, end).trimEnd();
  }
  return text;
}

/**
 * The headings of a Markdown text, all levels, in document order. Fenced code and
 * HTML comments are ignored, and a Setext heading (text underlined with `===` or
 * `---`) counts like an ATX one, as on GitHub.
 */
export function extractHeadings(markdown: string): Heading[] {
  const lines = stripComments(scanFences(markdown).masked.join('\n')).split('\n');
  const headings: Heading[] = [];
  let paragraph: string[] = [];
  for (const line of lines) {
    const atx = ATX_HEADING.exec(line);
    if (atx) {
      const text = stripClosingHashes(atx[2].trimEnd());
      if (text !== '') headings.push({ level: atx[1].length, text });
      paragraph = [];
      continue;
    }
    const underline = SETEXT_UNDERLINE.exec(line);
    if (underline && paragraph.length > 0) {
      headings.push({ level: underline[1][0] === '=' ? 1 : 2, text: paragraph.join(' ') });
      paragraph = [];
      continue;
    }
    if (underline || line.trim() === '' || NOT_PARAGRAPH.test(line) || THEMATIC_BREAK.test(line)) {
      paragraph = [];
      continue;
    }
    paragraph.push(line.trim());
  }
  return headings;
}

/** `[label](destination)` starting at `open`: the label and the index just after `)`, or null. */
function linkAt(text: string, open: number): { label: string; end: number } | null {
  let close = open + 1;
  while (close < text.length && text[close] !== ']' && text[close] !== '[') close++;
  if (text[close] !== ']' || text[close + 1] !== '(') return null;
  let end = close + 2;
  while (end < text.length && text[end] !== ')' && text[end] !== '(' && text[end] !== '[' && text[end] !== ']') end++;
  return text[end] === ')' ? { label: text.slice(open + 1, close), end: end + 1 } : null;
}

/** Drops `![alt](src)` images; with `keepLabels`, turns `[label](url)` into its label. */
function replaceLinks(text: string, keepLabels: boolean): string {
  let result = '';
  let index = 0;
  while (index < text.length) {
    const image = text[index] === '!' && text[index + 1] === '[';
    const open = image ? index + 1 : text[index] === '[' ? index : -1;
    const link = open === -1 ? null : linkAt(text, open);
    if (link && (image || keepLabels)) {
      if (!image) result += link.label;
      index = link.end;
    } else {
      result += text[index];
      index++;
    }
  }
  return result;
}

/** Drops `<tag …>` and `</tag>`: only their text is part of a heading. */
function removeTags(text: string): string {
  let result = '';
  let index = 0;
  while (index < text.length) {
    if (text[index] === '<' && /[A-Za-z/]/.test(text[index + 1] ?? '')) {
      let end = index + 2;
      while (end < text.length && text[end] !== '>' && text[end] !== '<') end++;
      if (text[end] === '>') {
        index = end + 1;
        continue;
      }
    }
    result += text[index];
    index++;
  }
  return result;
}

/** A heading without images, links (only the label stays) or tags, still as written otherwise. */
export function headingLabel(text: string): string {
  return removeTags(replaceLinks(replaceLinks(text, false), true)).trim();
}

function decode(match: string, escaped: string | undefined, entity: string | undefined): string {
  if (escaped !== undefined) return escaped;
  if (entity === undefined) return match;
  if (entity[0] !== '#') return NAMED_ENTITIES[entity] ?? match;
  const code = entity[1] === 'x' || entity[1] === 'X' ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
  const valid = code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff);
  return valid ? String.fromCodePoint(code) : match;
}

/** GitHub's anchor for a heading: its text content, lowercased, punctuation removed, spaces to hyphens. */
export function githubSlug(text: string): string {
  return headingLabel(text)
    .replace(ESCAPE_OR_ENTITY, decode)
    .toLowerCase()
    .replace(SLUG_FORBIDDEN, '')
    .replace(/ /g, '-');
}

/** Anchors for a list of headings; repeated ones get `-1`, `-2`… as on GitHub. */
export function githubSlugs(texts: string[]): string[] {
  const seen = new Map<string, number>();
  return texts.map((text) => {
    const base = githubSlug(text);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
  });
}
```

- [ ] **Step 5: Brancher le contexte et le bloc**

Modify `src/lib/readme/types.ts` : remplacer

```ts
import type { Locale } from '@/i18n/locales';
```

par

```ts
import type { Locale } from '@/i18n/locales';
import type { Heading } from './headings';
```

et remplacer

```ts
  /** Level-2 headings of the other blocks, as written; set for blocks that use them. */
  headings?: string[];
```

par

```ts
  /** Headings of the other blocks, all levels, in order; set for blocks that use them. */
  headings?: Heading[];
```

Modify `src/lib/readme/generate.ts` : remplacer

```ts
import { extractH2 } from './headings';
```

par

```ts
import { extractHeadings } from './headings';
```

et remplacer

```ts
headings: extractH2(others)
```

par

```ts
headings: extractHeadings(others)
```

Modify `src/lib/readme/blocks/table-of-contents.ts` : remplacer

```ts
import { githubSlugs } from '../headings';
```

par

```ts
import { githubSlugs, headingLabel } from '../headings';
```

et remplacer

```ts
    const headings = ctx.headings ?? [];
    if (headings.length === 0) return '';
    const anchors = githubSlugs(headings);
    const list = headings.map((text, index) => `- [${text}](#${anchors[index]})`).join('\n');
    return [atxHeading(2, data.heading), list].filter((part) => part !== '').join('\n\n');
```

par

```ts
    const headings = ctx.headings ?? [];
    // GitHub numbers repeated anchors across every level, so all headings are slugged and only the level-2 ones listed.
    const anchors = githubSlugs(headings.map((heading) => heading.text));
    const items = headings
      .map((heading, index) => ({ heading, anchor: anchors[index], label: headingLabel(heading.text) }))
      .filter(({ heading, label }) => heading.level === 2 && label !== '')
      .map(({ anchor, label }) => `- [${label}](#${anchor})`);
    if (items.length === 0) return '';
    return [atxHeading(2, data.heading), items.join('\n')].filter((part) => part !== '').join('\n\n');
```

- [ ] **Step 6: Vérifier que tout passe**

Run: `npx vitest run tests/readme && npx tsc --noEmit && npx eslint src tests`
Expected: PASS ; aucune erreur de types ni de lint. Les tests existants de la table des matières (`toc.test.ts`) passent inchangés hors le remplacement de `extractH2`, ce qui prouve que le comportement nominal n'a pas bougé.

- [ ] **Step 7: Commit**

```bash
git add src tests
git commit -m "$(cat <<'EOF'
fix(readme): fait pointer la table des matières sur les vraies ancres GitHub

Les liens de la table se calculaient sur le texte brut de l'intitulé : un
lien, une entité (R&amp;D), un commentaire HTML ou un intitulé Setext
donnaient une ancre morte, et un titre répété à un autre niveau décalait la
numérotation. L'ancre suit maintenant le texte rendu, la numérotation
compte tous les niveaux, et un intitulé porteur d'un lien s'affiche par son
libellé au lieu d'un lien dans un lien. Les lecteurs d'intitulés sont
linéaires sur des entrées hostiles.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Lecteur TOML : listes multilignes et entrées hostiles

**Files:**
- Modify: `src/lib/readme/extract.ts`
- Test: `tests/readme/toml.test.ts`

**Interfaces:**
- Consumes: `parsePyproject`, `parseCargoToml`, `clean`, `authorName`.
- Produces : aucune API nouvelle. Le lecteur interne reconnaît désormais une valeur écrite sur plusieurs lignes (liste laissée ouverte, chaîne entre `"""` ou `'''`) et la lit d'un bloc, une clé entre guillemets, et remplace deux regex par un balayage linéaire (`readQuoted`, `firstQuoted`, `namedString`). Une chaîne multiligne reste **ignorée comme valeur** (comme avant) : seule sa lecture ne fabrique plus de fausses sections.

- [ ] **Step 1: Écrire les tests qui échouent**

Create `tests/readme/toml.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import { parseCargoToml, parsePyproject } from '@/lib/readme/extract';

const toml = (...lines: string[]) => lines.join('\n');

describe('pyproject.toml values on several lines', () => {
  it('reads the first author of a multi-line array of tables, and the keys after it', () => {
    const text = toml(
      '[project]',
      'name = "demo"',
      'authors = [',
      '  { name = "Jane Doe", email = "jane@example.com" },',
      '  { name = "John" },',
      ']',
      'description = "A demo"'
    );
    expect(parsePyproject(text)).toEqual({
      ok: true,
      meta: { name: 'demo', description: 'A demo', author: 'Jane Doe', installCommand: 'pip install demo' },
    });
  });

  it('reads the first author of a multi-line array of strings, with a comment in it', () => {
    const text = toml('[project]', 'name = "demo"', 'authors = [', '  # main author', "  'Jane Doe <jane@example.com>',", ']');
    expect(parsePyproject(text)).toMatchObject({ ok: true, meta: { author: 'Jane Doe' } });
  });

  it('does not read a section or a key inside a multi-line string as a real one', () => {
    const text = toml(
      '[project]',
      'name = "demo"',
      'readme = """',
      '[tool.evil]',
      'name = "hijack"',
      '"""',
      'description = "after"'
    );
    expect(parsePyproject(text)).toEqual({
      ok: true,
      meta: { name: 'demo', description: 'after', installCommand: 'pip install demo' },
    });
  });

  it('gives up on an array that never closes instead of swallowing the rest of the file', () => {
    const lines = ['[project]', 'name = "demo"', 'authors = ['];
    for (let i = 0; i < 300; i++) lines.push(`# filler ${i}`);
    lines.push('[project.urls]', 'Repository = "https://github.com/o/r"');
    const result = parsePyproject(toml(...lines));
    expect(result).toMatchObject({ ok: true, meta: { name: 'demo' } });
  });
});

describe('TOML keys and strings', () => {
  it('accepts a quoted key', () => {
    const text = toml('[package]', '"name" = "demo"', "'description' = 'A crate'");
    expect(parseCargoToml(text)).toEqual({
      ok: true,
      meta: { name: 'demo', description: 'A crate', installCommand: 'cargo add demo' },
    });
  });

  it('keeps an escaped quote inside an author name', () => {
    const text = toml('[package]', 'name = "demo"', 'authors = ["Jane \\"JD\\" Doe <j@x.io>"]');
    expect(parseCargoToml(text)).toMatchObject({ ok: true, meta: { author: 'Jane "JD" Doe' } });
  });

  it('reads the license text of an inline table', () => {
    const text = toml('[project]', 'name = "demo"', 'license = { text = "MIT" }');
    expect(parsePyproject(text)).toMatchObject({ ok: true, meta: { license: 'MIT' } });
  });
});

describe('TOML reader on hostile input', () => {
  const cases: Record<string, string> = {
    'escaped quotes never closed': '[project]\nauthors = ["' + '\\"'.repeat(9000),
    'inline table with escaped quotes': '[project]\nauthors = [{ name = "' + '\\"'.repeat(9000),
    'many opening quotes': '[project]\nauthors = [' + '"a'.repeat(9000),
    'many name keys': '[project]\nauthors = [' + 'name = "'.repeat(2400),
    'long run of spaces': '[project]\nauthors = [name' + ' '.repeat(19_000) + '= "x" ]',
    'license text keys': '[project]\nlicense = { ' + 'text = "'.repeat(2400),
    'unclosed triple quote': '[project]\nreadme = """\n' + 'line\n'.repeat(5000),
  };

  it.each(Object.entries(cases))('stays fast on %s', (_name, text) => {
    const start = performance.now();
    parsePyproject(text);
    expect(performance.now() - start).toBeLessThan(60);
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run tests/readme/toml.test.ts`
Expected: FAIL. L'auteur d'une liste multiligne est vide, la section `[tool.evil]` d'une chaîne multiligne est lue comme une vraie section (la description qui suit est perdue), la clé entre guillemets est ignorée, l'antislash d'un guillemet échappé reste dans un nom d'auteur, et les deux cas « guillemets échappés jamais fermés » dépassent 60 ms (environ 150 ms mesurées : la regex non ancrée relit toute la valeur à chaque guillemet).

- [ ] **Step 3: Réécrire le lecteur**

Modify `src/lib/readme/extract.ts` : remplacer

```ts
const MAX_TOML_LINE_LENGTH = 20_000;
```

par

```ts
const MAX_TOML_LINE_LENGTH = 20_000;
/** A multi-line array or string is joined from at most this many lines, so one key cannot swallow the file. */
const MAX_TOML_CONTINUATION_LINES = 200;
```

Dans le même fichier, remplacer

```ts
function readToml(text: string): TomlSections {
  const sections: TomlSections = new Map();
  let current = new Map<string, string>();
  for (const rawLine of text.split(/\r?\n/)) {
    if (rawLine.length > MAX_TOML_LINE_LENGTH) continue;
    const line = stripTomlComment(rawLine).trim();
    if (line === '') continue;
    const header = /^\[([^[\]]+)\]$/.exec(line);
    if (header) {
      const name = header[1].trim();
      current = sections.get(name) ?? new Map<string, string>();
      sections.set(name, current);
      continue;
    }
    if (line.startsWith('[[')) {
      current = new Map<string, string>();
      continue;
    }
    const pair = /^([A-Za-z0-9_-]+)\s*=\s*(.+)$/.exec(line);
    if (pair && !current.has(pair[1])) current.set(pair[1], pair[2].trim());
  }
  return sections;
}

const QUOTED = '"((?:[^"\\\\]|\\\\.)*)"';

function tomlString(raw: string | undefined): string {
  if (raw === undefined) return '';
  const basic = new RegExp(`^${QUOTED}$`).exec(raw);
  if (basic) return clean(basic[1].replace(/\\(["\\])/g, '$1'));
  const literal = /^'([^']*)'$/.exec(raw);
  return literal ? clean(literal[1]) : '';
}

/** First author of `["Jane <j@x>", …]` or `[{ name = "Jane", … }]`. */
function firstAuthor(raw: string | undefined): string {
  if (raw === undefined) return '';
  const named = new RegExp(`name\\s*=\\s*${QUOTED}`).exec(raw);
  const quoted = named ?? new RegExp(QUOTED).exec(raw);
  return quoted ? authorName(clean(quoted[1])) : '';
}
```

par

```ts
/** Net number of `[` and `{` still open at the end of `text`, ignoring brackets inside strings. */
function bracketDepth(text: string): number {
  let depth = 0;
  let quote: string | null = null;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quote !== null) {
      if (char === '\\' && quote === '"') i++;
      else if (char === quote) quote = null;
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === '[' || char === '{') {
      depth++;
    } else if (char === ']' || char === '}') {
      depth--;
    }
  }
  return depth;
}

/** The `"""` or `'''` a value opens without closing, or null. */
function openTripleQuote(value: string): string | null {
  const delimiter = value.startsWith('"""') ? '"""' : value.startsWith("'''") ? "'''" : null;
  return delimiter !== null && value.indexOf(delimiter, 3) === -1 ? delimiter : null;
}

const TOML_KEY_VALUE = /^([A-Za-z0-9_-]+|"[^"\n]*"|'[^'\n]*')\s*=\s*(.+)$/;

/**
 * Reads `key = value` lines. A value that runs over several lines (an array left
 * open, or a triple-quoted string) is joined first, so its inner lines are never
 * read as sections or keys of their own.
 */
function readToml(text: string): TomlSections {
  const sections: TomlSections = new Map();
  let current = new Map<string, string>();
  const rawLines = text.split(/\r?\n/);
  for (let index = 0; index < rawLines.length; index++) {
    if (rawLines[index].length > MAX_TOML_LINE_LENGTH) continue;
    const line = stripTomlComment(rawLines[index]).trim();
    if (line === '') continue;
    const header = /^\[([^[\]]+)\]$/.exec(line);
    if (header) {
      const name = header[1].trim();
      current = sections.get(name) ?? new Map<string, string>();
      sections.set(name, current);
      continue;
    }
    if (line.startsWith('[[')) {
      current = new Map<string, string>();
      continue;
    }
    const pair = TOML_KEY_VALUE.exec(line);
    if (!pair) continue;
    let value = pair[2].trim();
    const triple = openTripleQuote(value);
    let joined = 0;
    while (index + 1 < rawLines.length && joined < MAX_TOML_CONTINUATION_LINES) {
      const open = triple === null ? bracketDepth(value) > 0 : value.indexOf(triple, 3) === -1;
      if (!open) break;
      index++;
      joined++;
      const next = rawLines[index].length > MAX_TOML_LINE_LENGTH ? '' : rawLines[index];
      value += ' ' + (triple === null ? stripTomlComment(next) : next).trim();
    }
    const key = pair[1].replace(/^["']|["']$/g, '');
    if (!current.has(key)) current.set(key, value);
  }
  return sections;
}

/**
 * The string literal starting at `start` and the index after its closing quote,
 * or null. Basic strings (`"…"`) unescape `\\"` and `\\\\`; literal ones (`'…'`) are taken as is.
 * One pass, so no input can make it rescan the same characters.
 */
function readQuoted(text: string, start: number): { value: string; end: number } | null {
  const quote = text[start];
  if (quote !== '"' && quote !== "'") return null;
  let value = '';
  for (let i = start + 1; i < text.length; i++) {
    const char = text[i];
    if (char === quote) return { value, end: i + 1 };
    if (char === '\\' && quote === '"' && i + 1 < text.length) {
      const next = text[i + 1];
      value += next === '"' || next === '\\' ? next : char + next;
      i++;
    } else {
      value += char;
    }
  }
  return null;
}

/** A whole TOML value that is one basic or literal string, else '' (multi-line strings are left out). */
function tomlString(raw: string | undefined): string {
  if (raw === undefined) return '';
  const quoted = readQuoted(raw, 0);
  return quoted !== null && quoted.end === raw.length ? clean(quoted.value) : '';
}

/**
 * The first string literal found in `raw`, or undefined. A quote character that
 * failed to close once cannot close later either, so it is not retried: without
 * that, a text full of unclosed quotes would be rescanned once per quote.
 */
function firstQuoted(raw: string): string | undefined {
  const unclosed = new Set<string>();
  for (let i = 0; i < raw.length; i++) {
    const char = raw[i];
    if ((char !== '"' && char !== "'") || unclosed.has(char)) continue;
    const quoted = readQuoted(raw, i);
    if (quoted !== null) return quoted.value;
    unclosed.add(char);
  }
  return undefined;
}

/** The string assigned to `key` inside an inline table such as `{ name = "Jane" }`, or undefined. */
function namedString(raw: string, key: string): string | undefined {
  let from = 0;
  for (;;) {
    const at = raw.indexOf(key, from);
    if (at === -1) return undefined;
    from = at + key.length;
    if (/[A-Za-z0-9_-]/.test(raw[at - 1] ?? '')) continue;
    let i = from;
    while (raw[i] === ' ' || raw[i] === '\t') i++;
    if (raw[i] !== '=') continue;
    i++;
    while (raw[i] === ' ' || raw[i] === '\t') i++;
    const quoted = readQuoted(raw, i);
    if (quoted !== null) return quoted.value;
  }
}

/** First author of `["Jane <j@x>", …]` or `[{ name = "Jane", … }]`. */
function firstAuthor(raw: string | undefined): string {
  if (raw === undefined) return '';
  const name = namedString(raw, 'name') ?? firstQuoted(raw);
  return name === undefined ? '' : authorName(clean(name));
}
```

Puis remplacer

```ts
  const licenseText = new RegExp(`text\\s*=\\s*${QUOTED}`).exec(licenseRaw ?? '');
```

par

```ts
  const licenseText = namedString(licenseRaw ?? '', 'text');
```

et remplacer

```ts
      license: tomlString(licenseRaw) || clean(licenseText?.[1]),
```

par

```ts
      license: tomlString(licenseRaw) || clean(licenseText),
```

- [ ] **Step 4: Vérifier que tout passe**

Run: `npx vitest run tests/readme && npx tsc --noEmit && npx eslint src tests`
Expected: PASS ; aucune erreur de types ni de lint. Les tests existants de `extract.test.ts` passent inchangés, y compris « skips multi-line strings and array-of-tables entries ».

- [ ] **Step 5: Commit**

```bash
git add src tests
git commit -m "$(cat <<'EOF'
fix(readme): lit les listes TOML multilignes et ne se laisse plus ralentir

Le lecteur de pyproject.toml ignorait les listes d'auteurs écrites sur
plusieurs lignes, ce qui est la forme courante, et prenait le contenu d'une
chaîne multiligne pour de vraies sections. Il accepte aussi les clés entre
guillemets. Deux regex non ancrées relisaient toute la valeur à chaque
guillemet (150 ms pour 18 000 caractères) : un balayage linéaire les
remplace.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Sections ajoutées par l'assistant à leur rang habituel

**Files:**
- Modify: `src/lib/readme/state.ts`
- Test: `tests/readme/selection-order.test.ts`, `tests/readme/state.test.ts`

**Interfaces:**
- Consumes: `applySelection`, `getCatalog`, `createBlock`.
- Produces : `applySelection(state, selected)` garde les blocs existants dans leur ordre, mais place chaque bloc **nouvellement créé** juste après le dernier bloc dont le rang dans le catalogue est inférieur ou égal au sien (en tête s'il n'y en a aucun), au lieu de le mettre en fin de liste. Pour un README neuf, l'ordre du catalogue est inchangé.

- [ ] **Step 1: Écrire les tests qui échouent**

Create `tests/readme/selection-order.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import { applySelection } from '@/lib/readme/state';
import { block, freeMarkdown, header, stateWith } from './helpers';

const usage = (id: string) => block(id, 'usage', { heading: 'Usage', description: '', code: '', language: '' });
const license = (id: string) =>
  block(id, 'license', { heading: 'License', license: '', holder: '', year: '', credits: '' });
const types = (result: ReturnType<typeof applySelection>) => result.blocks.map((b) => b.type);

describe('applySelection places new blocks at their catalog position', () => {
  it('puts badges between the header and the usage, not at the end', () => {
    const base = stateWith([header('h'), usage('u'), license('l')]);
    const result = applySelection(base, ['header', 'badges', 'usage', 'license']);
    expect(types(result)).toEqual(['header', 'badges', 'usage', 'license']);
  });

  it('puts the table of contents before the installation and the license last but before free Markdown', () => {
    const base = stateWith([header('h'), usage('u'), freeMarkdown('f', 'x')]);
    const result = applySelection(base, ['header', 'tableOfContents', 'installation', 'usage', 'license', 'freeMarkdown']);
    expect(types(result)).toEqual(['header', 'tableOfContents', 'installation', 'usage', 'license', 'freeMarkdown']);
  });

  it('inserts a block that ranks first at the very top', () => {
    const base = stateWith([usage('u'), license('l')]);
    expect(types(applySelection(base, ['header', 'usage', 'license']))).toEqual(['header', 'usage', 'license']);
  });

  it('never reorders the blocks the user already arranged', () => {
    const base = stateWith([license('l'), header('h'), usage('u')]);
    const result = applySelection(base, ['license', 'header', 'usage', 'badges']);
    expect(result.blocks.map((b) => b.id).filter((id) => ['l', 'h', 'u'].includes(id))).toEqual(['l', 'h', 'u']);
    expect(types(result)).toEqual(['license', 'header', 'badges', 'usage']);
  });

  it('creates a first README in catalog order', () => {
    const result = applySelection(stateWith([]), ['license', 'usage', 'header', 'badges']);
    expect(types(result)).toEqual(['header', 'badges', 'usage', 'license']);
  });

  it('places several new blocks of a profile in catalog order around existing ones', () => {
    const base = stateWith([block('c', 'freeMarkdown', { content: 'x' })], 'profile');
    expect(types(applySelection(base, ['contact', 'banner', 'freeMarkdown', 'skills']))).toEqual([
      'banner',
      'skills',
      'contact',
      'freeMarkdown',
    ]);
  });
});
```

Modify `tests/readme/state.test.ts` : remplacer

```ts
  it('keeps existing blocks with their data, drops deselected types and appends new ones', () => {
    const base = stateWith([header('h', { title: 'Mine' }), freeMarkdown('f', 'keep'), freeMarkdown('g', 'also')]);
    const kept = applySelection(base, ['header', 'freeMarkdown', 'usage']);
    expect(kept.blocks.map((b) => b.id).slice(0, 3)).toEqual(['h', 'f', 'g']);
    expect(kept.blocks[0].data).toEqual(base.blocks[0].data);
    expect(kept.blocks[3].type).toBe('usage');
    expect(ids(applySelection(base, ['freeMarkdown']))).toEqual(['f', 'g']);
  });
```

par

```ts
  it('keeps existing blocks with their data, drops deselected types and places new ones by catalog rank', () => {
    const base = stateWith([header('h', { title: 'Mine' }), freeMarkdown('f', 'keep'), freeMarkdown('g', 'also')]);
    const kept = applySelection(base, ['header', 'freeMarkdown', 'usage']);
    expect(kept.blocks.map((b) => b.type)).toEqual(['header', 'usage', 'freeMarkdown', 'freeMarkdown']);
    expect(kept.blocks.filter((b) => b.type !== 'usage').map((b) => b.id)).toEqual(['h', 'f', 'g']);
    expect(kept.blocks[0].data).toEqual(base.blocks[0].data);
    expect(ids(applySelection(base, ['freeMarkdown']))).toEqual(['f', 'g']);
  });
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run tests/readme/selection-order.test.ts tests/readme/state.test.ts`
Expected: FAIL. Les nouveaux blocs sont ajoutés en fin de liste (`['header', 'usage', 'license', 'badges']` au lieu de `['header', 'badges', 'usage', 'license']`).

- [ ] **Step 3: Insérer au bon rang**

Modify `src/lib/readme/state.ts` : remplacer

```ts
/**
 * Applies the wizard's "Sections" choice: keeps the existing blocks of the
 * selected types (order and data untouched), drops the others, and creates one
 * block, seeded from `state.meta`, for each selected type that has none yet.
 */
export function applySelection(state: ReadmeState, selected: readonly BlockType[]): ReadmeState {
  const wanted = new Set(selected);
  const kept = state.blocks.filter((block) => wanted.has(block.type));
  const present = new Set(kept.map((block) => block.type));
  const added = getCatalog(state.mode)
    .filter((def) => wanted.has(def.type) && !present.has(def.type))
    .map((def) => createBlock(def.type, state.meta));
  return { ...state, blocks: [...kept, ...added] };
}
```

par

```ts
/**
 * Applies the wizard's "Sections" choice: keeps the existing blocks of the
 * selected types (order and data untouched), drops the others, and creates one
 * block, seeded from `state.meta`, for each selected type that has none yet.
 * A new block goes right after the last block ranked at or before it in the
 * catalog (first when there is none): the table of contents lands before the
 * installation and the license after the usage, not at the end of the file.
 */
export function applySelection(state: ReadmeState, selected: readonly BlockType[]): ReadmeState {
  const wanted = new Set(selected);
  const catalog = getCatalog(state.mode);
  const rank = new Map(catalog.map((def, index) => [def.type, index] as const));
  const blocks = state.blocks.filter((block) => wanted.has(block.type));
  const present = new Set(blocks.map((block) => block.type));
  for (const def of catalog) {
    if (!wanted.has(def.type) || present.has(def.type)) continue;
    const position = rank.get(def.type) ?? 0;
    let at = 0;
    blocks.forEach((block, index) => {
      if ((rank.get(block.type) ?? 0) <= position) at = index + 1;
    });
    blocks.splice(at, 0, createBlock(def.type, state.meta));
  }
  return { ...state, blocks };
}
```

- [ ] **Step 4: Vérifier que tout passe**

Run: `npx vitest run tests/readme && npx tsc --noEmit && npx eslint src tests`
Expected: PASS ; aucune erreur de types ni de lint. `wizard.test.ts` passe inchangé : un README neuf garde l'ordre du catalogue.

- [ ] **Step 5: Commit**

```bash
git add src tests
git commit -m "$(cat <<'EOF'
fix(readme): place les sections ajoutées par l'assistant à leur rang habituel

Sur un README déjà rédigé, une section cochée dans l'assistant (badges,
table des matières, installation) arrivait après la licence. Elle se place
maintenant juste après le dernier bloc de rang inférieur ou égal dans le
catalogue ; les blocs déjà là ne bougent pas.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Aucune perte silencieuse du travail enregistré

**Files:**
- Modify: `src/lib/readme/persistence.ts`, `src/components/readme-generator/readme-generator.tsx`
- Test: `tests/readme/storage-recovery.test.ts`

**Interfaces:**
- Consumes: `parseReadmeState`, `STORAGE_KEY`, `StorageLike`, `serializeReadmeState`, les clés i18n de la Tâche 1 (`messages.storageFull`, `loadDropped`, `loadUnreadable`, `backupKept`, `downloadBackup`).
- Produces : dans `persistence.ts` :
  - `StorageLike` gagne `removeItem?(key)`, facultatif.
  - `loadStateDetailed(storage?): LoadResult`, avec `LoadResult = { status: 'none' } | { status: 'ok'; state } | { status: 'partial'; state; dropped: number; raw: string } | { status: 'unreadable'; raw: string }`. `loadState` s'appuie dessus et garde son comportement.
  - `trySaveState(state, storage?): SaveResult` avec `SaveResult = 'saved' | 'unavailable' | 'full'` (le quota dépassé se reconnaît à `QuotaExceededError`, `NS_ERROR_DOM_QUOTA_REACHED` ou au code 22/1014). `saveState` reste un booléen.
  - `BACKUP_KEY`, `saveBackup(raw, storage?)`, `readBackup(storage?)`, `clearBackup(storage?)` : copie brute d'un travail que l'application n'a pas pu relire en entier. Aucune ne lève jamais d'exception.
  - Dans le conteneur : à l'ouverture, un travail `partial` ou `unreadable` est copié dans `BACKUP_KEY` **avant** que la sauvegarde automatique ne l'écrase, et un message propose de télécharger la copie (`readme-backup.json`) ; la copie reste proposée à chaque ouverture jusqu'à son téléchargement. Un stockage plein annonce `messages.storageFull` au lieu de « indisponible ».

- [ ] **Step 1: Écrire les tests qui échouent**

Create `tests/readme/storage-recovery.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import {
  BACKUP_KEY,
  STORAGE_KEY,
  clearBackup,
  loadState,
  loadStateDetailed,
  readBackup,
  saveBackup,
  saveState,
  serializeReadmeState,
  trySaveState,
  type StorageLike,
} from '@/lib/readme/persistence';
import { createInitialState } from '@/lib/readme/state';

function memoryStorage(initial: Record<string, string> = {}, fail?: () => Error) {
  const data = { ...initial };
  const storage: StorageLike & { data: Record<string, string> } = {
    data,
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      if (fail) throw fail();
      data[key] = value;
    },
    removeItem: (key) => {
      delete data[key];
    },
  };
  return storage;
}

const state = createInitialState('project');
const saved = serializeReadmeState(state);
const withBrokenBlock = JSON.stringify({
  ...state,
  blocks: [...state.blocks, { id: 'x', type: 'usage', enabled: true, data: { heading: 1 } }],
});

describe('trySaveState', () => {
  it('says saved, and saveState stays a boolean', () => {
    const storage = memoryStorage();
    expect(trySaveState(state, storage)).toBe('saved');
    expect(storage.data[STORAGE_KEY]).toBe(saved);
    expect(saveState(state, storage)).toBe(true);
  });

  it.each([
    ['a QuotaExceededError', () => new DOMException('full', 'QuotaExceededError')],
    ['a Firefox quota error', () => Object.assign(new Error('full'), { name: 'NS_ERROR_DOM_QUOTA_REACHED' })],
    ['a legacy code 22', () => Object.assign(new Error('full'), { code: 22 })],
  ])('says full for %s', (_name, fail) => {
    const storage = memoryStorage({}, fail);
    expect(trySaveState(state, storage)).toBe('full');
    expect(saveState(state, storage)).toBe(false);
  });

  it('says unavailable for any other failure and when there is no storage', () => {
    expect(trySaveState(state, memoryStorage({}, () => new Error('denied')))).toBe('unavailable');
    expect(trySaveState(state, null)).toBe('unavailable');
  });
});

describe('loadStateDetailed', () => {
  it('says none for an empty storage, no storage, or a storage that throws', () => {
    expect(loadStateDetailed(memoryStorage())).toEqual({ status: 'none' });
    expect(loadStateDetailed(null)).toEqual({ status: 'none' });
    const broken: StorageLike = {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {},
    };
    expect(loadStateDetailed(broken)).toEqual({ status: 'none' });
  });

  it('returns a readable state as ok', () => {
    const result = loadStateDetailed(memoryStorage({ [STORAGE_KEY]: saved }));
    expect(result.status).toBe('ok');
    expect(result.status === 'ok' && result.state).toEqual(state);
  });

  it('keeps the raw text when blocks had to be left out', () => {
    const result = loadStateDetailed(memoryStorage({ [STORAGE_KEY]: withBrokenBlock }));
    expect(result).toMatchObject({ status: 'partial', dropped: 1, raw: withBrokenBlock });
    expect(result.status === 'partial' && result.state.blocks).toHaveLength(state.blocks.length);
  });

  it.each([['not json at all'], ['{"version":2}'], ['[]'], ['null']])('keeps the raw text of %j as unreadable', (raw) => {
    expect(loadStateDetailed(memoryStorage({ [STORAGE_KEY]: raw }))).toEqual({ status: 'unreadable', raw });
  });

  it('leaves loadState behaving as before', () => {
    expect(loadState(memoryStorage({ [STORAGE_KEY]: saved }))).toEqual(state);
    expect(loadState(memoryStorage({ [STORAGE_KEY]: withBrokenBlock }))?.blocks).toHaveLength(state.blocks.length);
    expect(loadState(memoryStorage({ [STORAGE_KEY]: 'nope' }))).toBeNull();
    expect(loadState(memoryStorage())).toBeNull();
  });
});

describe('backup of work that could not be read in full', () => {
  it('keeps the raw text under its own key, never the autosave key, until it is cleared', () => {
    const storage = memoryStorage({ [STORAGE_KEY]: withBrokenBlock });
    expect(BACKUP_KEY).not.toBe(STORAGE_KEY);
    expect(readBackup(storage)).toBeNull();
    expect(saveBackup(withBrokenBlock, storage)).toBe(true);
    saveState(state, storage);
    expect(readBackup(storage)).toBe(withBrokenBlock);
    clearBackup(storage);
    expect(readBackup(storage)).toBeNull();
  });

  it('never throws, whatever the storage does', () => {
    const full = memoryStorage({}, () => new DOMException('full', 'QuotaExceededError'));
    expect(saveBackup('x', full)).toBe(false);
    expect(saveBackup('x', null)).toBe(false);
    expect(readBackup(null)).toBeNull();
    expect(() => clearBackup(null)).not.toThrow();
    const noRemove: StorageLike = { getItem: () => null, setItem: () => {} };
    expect(() => clearBackup(noRemove)).not.toThrow();
    const throwing: StorageLike = {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {},
      removeItem: () => {
        throw new Error('denied');
      },
    };
    expect(readBackup(throwing)).toBeNull();
    expect(() => clearBackup(throwing)).not.toThrow();
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run tests/readme/storage-recovery.test.ts`
Expected: FAIL, `TypeError: trySaveState is not a function` (et `loadStateDetailed`, `saveBackup`… absentes).

- [ ] **Step 3: Écrire la persistance détaillée**

Modify `src/lib/readme/persistence.ts` : remplacer

```ts
export const STORAGE_KEY = 'readme-generator:v1';
```

par

```ts
export const STORAGE_KEY = 'readme-generator:v1';
/** Raw copy of saved work the app could not read in full, kept until the user downloads it. */
export const BACKUP_KEY = 'readme-generator:v1:backup';
```

et remplacer

```ts
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
```

par

```ts
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
}
```

Dans le même fichier, remplacer

```ts
/** Never throws: returns null when storage is unavailable, empty or corrupted. */
export function loadState(storage: StorageLike | null = browserStorage()): ReadmeState | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const result = parseReadmeState(JSON.parse(raw));
    return result.ok ? result.state : null;
  } catch {
    return null;
  }
}

/** Never throws: returns false when storage is unavailable or full. */
export function saveState(state: ReadmeState, storage: StorageLike | null = browserStorage()): boolean {
  if (!storage) return false;
  try {
    storage.setItem(STORAGE_KEY, serializeReadmeState(state));
    return true;
  } catch {
    return false;
  }
}
```

par

```ts
export type LoadResult =
  /** Nothing saved, or the storage cannot be read. */
  | { status: 'none' }
  | { status: 'ok'; state: ReadmeState }
  /** Some blocks could not be read and were left out; `raw` is the saved text as found. */
  | { status: 'partial'; state: ReadmeState; dropped: number; raw: string }
  /** The saved text is not a README at all; `raw` is the saved text as found. */
  | { status: 'unreadable'; raw: string };

/**
 * Never throws. Unlike `loadState`, it tells apart "nothing saved" from "saved but
 * not fully readable" and hands back the raw text in the second case: the
 * autosave would otherwise overwrite it with the reduced state.
 */
export function loadStateDetailed(storage: StorageLike | null = browserStorage()): LoadResult {
  if (!storage) return { status: 'none' };
  let raw: string | null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return { status: 'none' };
  }
  if (!raw) return { status: 'none' };
  try {
    const result = parseReadmeState(JSON.parse(raw));
    if (!result.ok) return { status: 'unreadable', raw };
    return result.dropped > 0
      ? { status: 'partial', state: result.state, dropped: result.dropped, raw }
      : { status: 'ok', state: result.state };
  } catch {
    return { status: 'unreadable', raw };
  }
}

/** Never throws: returns null when storage is unavailable, empty or corrupted. */
export function loadState(storage: StorageLike | null = browserStorage()): ReadmeState | null {
  const result = loadStateDetailed(storage);
  return result.status === 'ok' || result.status === 'partial' ? result.state : null;
}

export type SaveResult = 'saved' | 'unavailable' | 'full';

/** The error a browser throws when the storage quota is exceeded (name or legacy code, by browser). */
function isQuotaError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  const { name, code } = error as { name?: unknown; code?: unknown };
  return name === 'QuotaExceededError' || name === 'NS_ERROR_DOM_QUOTA_REACHED' || code === 22 || code === 1014;
}

/** Never throws: says whether the state was saved, and if not whether the storage is full or unusable. */
export function trySaveState(state: ReadmeState, storage: StorageLike | null = browserStorage()): SaveResult {
  if (!storage) return 'unavailable';
  try {
    storage.setItem(STORAGE_KEY, serializeReadmeState(state));
    return 'saved';
  } catch (error) {
    return isQuotaError(error) ? 'full' : 'unavailable';
  }
}

/** Never throws: returns false when storage is unavailable or full. */
export function saveState(state: ReadmeState, storage: StorageLike | null = browserStorage()): boolean {
  return trySaveState(state, storage) === 'saved';
}

/** Never throws: keeps `raw` under its own key; returns false when it could not be stored. */
export function saveBackup(raw: string, storage: StorageLike | null = browserStorage()): boolean {
  if (!storage) return false;
  try {
    storage.setItem(BACKUP_KEY, raw);
    return true;
  } catch {
    return false;
  }
}

/** Never throws: the kept raw copy, or null. */
export function readBackup(storage: StorageLike | null = browserStorage()): string | null {
  try {
    return storage?.getItem(BACKUP_KEY) || null;
  } catch {
    return null;
  }
}

/** Never throws: forgets the kept raw copy. */
export function clearBackup(storage: StorageLike | null = browserStorage()): void {
  try {
    storage?.removeItem?.(BACKUP_KEY);
  } catch {
    // Nothing to do: the copy stays until the next attempt.
  }
}
```

- [ ] **Step 4: Brancher le conteneur**

Modify `src/components/readme-generator/readme-generator.tsx` : remplacer

```tsx
import {
  loadState,
  parseReadmeState,
  saveState,
  serializeReadmeState,
} from '@/lib/readme/persistence';
```

par

```tsx
import {
  clearBackup,
  loadStateDetailed,
  parseReadmeState,
  readBackup,
  saveBackup,
  serializeReadmeState,
  trySaveState,
} from '@/lib/readme/persistence';
```

et remplacer

```tsx
  useEffect(() => {
    const saved = loadState();
    if (saved) {
      setState(saved);
      return;
    }
    setState({ ...createInitialState('project'), blocks: [] });
    setWizardIsNew(true);
    setView('wizard');
  }, []);
```

par

```tsx
  useEffect(() => {
    const loaded = loadStateDetailed();
    if (loaded.status === 'ok' || loaded.status === 'partial') {
      setState(loaded.state);
    } else {
      setState({ ...createInitialState('project'), blocks: [] });
      setWizardIsNew(true);
      setView('wizard');
    }
    // Work the app could not read in full is copied aside before the autosave replaces it,
    // and offered for download until the user takes it.
    const lost = loaded.status === 'partial' || loaded.status === 'unreadable';
    if (lost) saveBackup(loaded.raw);
    const backup = lost ? loaded.raw : readBackup();
    if (backup === null) return;
    const description =
      loaded.status === 'partial'
        ? t('messages.loadDropped', { count: loaded.dropped })
        : loaded.status === 'unreadable'
          ? t('messages.loadUnreadable')
          : t('messages.backupKept');
    toast({
      description,
      duration: 60_000,
      action: (
        <ToastAction
          altText={t('messages.downloadBackup')}
          onClick={() => {
            try {
              downloadFile(backup, 'readme-backup.json', 'application/json');
              clearBackup();
            } catch {
              toast({ description: t('messages.downloadError'), variant: 'destructive' });
            }
          }}
        >
          {t('messages.downloadBackup')}
        </ToastAction>
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
```

et remplacer

```tsx
    if (!saveState(state) && !storageWarned.current) {
      storageWarned.current = true;
      toast({ description: t('messages.storageUnavailable') });
    }
```

par

```tsx
    const result = trySaveState(state);
    if (result === 'saved') {
      storageWarned.current = false;
    } else if (!storageWarned.current) {
      storageWarned.current = true;
      toast({ description: t(result === 'full' ? 'messages.storageFull' : 'messages.storageUnavailable') });
    }
```

- [ ] **Step 5: Vérifier que tout passe**

Run: `npx vitest run tests/readme && npx tsc --noEmit && npx eslint src tests`
Expected: PASS ; aucune erreur de types ni de lint. `persistence.test.ts` passe inchangé.

- [ ] **Step 6: Commit**

```bash
git add src tests
git commit -m "$(cat <<'EOF'
fix(readme): ne perd plus le travail enregistré quand il est illisible ou plein

Un travail dont des blocs n'étaient plus lisibles (mise à jour de l'outil)
ou tout entier corrompu était remplacé par la version réduite dès
l'ouverture, sans un mot. Une copie brute est conservée à part et proposée
en téléchargement jusqu'à ce que l'utilisateur la prenne. Un stockage plein
le dit au lieu d'annoncer « indisponible ».

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Frappe fluide dans un gros README

**Files:**
- Create: `src/components/readme-generator/use-autosave.ts`
- Modify: `src/components/readme-generator/readme-generator.tsx`

**Interfaces:**
- Consumes: `trySaveState`, `SaveResult` (Tâche 7), `generateReadme`, `validateReadme`, `generateWorkflow`.
- Produces : `useAutosave(state: ReadmeState | null, enabled: boolean, onResult: (result: SaveResult) => void): void` et `AUTOSAVE_DELAY_MS = 400` : la sauvegarde attend 400 ms sans nouvelle modification, et ce qui est en attente est écrit dès que la page est masquée ou fermée. Dans le conteneur, l'aperçu, les avertissements et le workflow suivent `useDeferredValue(state)` ; **copier et télécharger relisent l'état lui-même**, pas la valeur différée.

Pas de test unitaire : ni les hooks ni les composants ne sont testés dans ce dépôt (`vitest` en environnement `node`). La logique de sauvegarde, elle, est couverte par la Tâche 7 ; le comportement du hook (délai, vidage à la fermeture) et le gain de fluidité sont vérifiés en navigateur à la Tâche 11.

- [ ] **Step 1: Créer le hook**

Create `src/components/readme-generator/use-autosave.ts` :

```ts
'use client';

import { useEffect, useRef } from 'react';
import { trySaveState, type SaveResult } from '@/lib/readme/persistence';
import type { ReadmeState } from '@/lib/readme/types';

export const AUTOSAVE_DELAY_MS = 400;

/**
 * Saves `state` shortly after the last change instead of on every keystroke: the
 * whole README is serialized as JSON each time, which adds up while typing in a
 * large block. What is still waiting is written as soon as the page is hidden or
 * closed, so the delay cannot lose work.
 */
export function useAutosave(state: ReadmeState | null, enabled: boolean, onResult: (result: SaveResult) => void): void {
  const pending = useRef<ReadmeState | null>(null);
  const report = useRef(onResult);

  useEffect(() => {
    report.current = onResult;
  });

  useEffect(() => {
    if (!state || !enabled) {
      pending.current = null;
      return;
    }
    pending.current = state;
    const timer = window.setTimeout(() => {
      pending.current = null;
      report.current(trySaveState(state));
    }, AUTOSAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [state, enabled]);

  useEffect(() => {
    const flush = () => {
      const waiting = pending.current;
      if (!waiting) return;
      pending.current = null;
      trySaveState(waiting);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      flush();
    };
  }, []);
}
```

- [ ] **Step 2: Brancher le conteneur**

Modify `src/components/readme-generator/readme-generator.tsx` : remplacer

```tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
```

par

```tsx
import React, { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
```

et remplacer

```tsx
  serializeReadmeState,
  trySaveState,
} from '@/lib/readme/persistence';
```

par

```tsx
  serializeReadmeState,
  type SaveResult,
} from '@/lib/readme/persistence';
```

et remplacer

```tsx
import { ReadmeWizard } from './readme-wizard';
```

par

```tsx
import { ReadmeWizard } from './readme-wizard';
import { useAutosave } from './use-autosave';
```

et remplacer

```tsx
  useEffect(() => {
    if (!state || (view === 'wizard' && wizardIsNew)) return;
    const result = trySaveState(state);
    if (result === 'saved') {
      storageWarned.current = false;
    } else if (!storageWarned.current) {
      storageWarned.current = true;
      toast({ description: t(result === 'full' ? 'messages.storageFull' : 'messages.storageUnavailable') });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, view, wizardIsNew]);

  const markdown = useMemo(() => (state ? generateReadme(state) : ''), [state]);
  const warnings = useMemo(() => (state ? validateReadme(state) : []), [state]);
  const workflow = useMemo(() => (state ? generateWorkflow(state) : null), [state]);
```

par

```tsx
  // Warns once per failure streak: a full or unusable storage would otherwise toast on every save.
  const handleSaveResult = useCallback(
    (result: SaveResult) => {
      if (result === 'saved') {
        storageWarned.current = false;
      } else if (!storageWarned.current) {
        storageWarned.current = true;
        toast({ description: t(result === 'full' ? 'messages.storageFull' : 'messages.storageUnavailable') });
      }
    },
    [t, toast]
  );
  useAutosave(state, !(view === 'wizard' && wizardIsNew), handleSaveResult);

  // The preview, the warnings and the workflow follow the state one render behind, so typing
  // stays responsive in a large README. Copy and download read the state itself.
  const deferredState = useDeferredValue(state);
  const markdown = useMemo(() => (deferredState ? generateReadme(deferredState) : ''), [deferredState]);
  const warnings = useMemo(() => (deferredState ? validateReadme(deferredState) : []), [deferredState]);
  const workflow = useMemo(() => (deferredState ? generateWorkflow(deferredState) : null), [deferredState]);
```

et remplacer

```tsx
      await navigator.clipboard.writeText(markdown);
```

par

```tsx
      await navigator.clipboard.writeText(generateReadme(state));
```

et remplacer

```tsx
      downloadFile(markdown, 'README.md', 'text/markdown');
```

par

```tsx
      downloadFile(generateReadme(state), 'README.md', 'text/markdown');
```

et remplacer

```tsx
  const handleDownloadWorkflow = () => {
    if (!workflow) return;
    try {
      downloadFile(workflow, WORKFLOW_FILE_NAME, 'text/yaml');
```

par

```tsx
  const handleDownloadWorkflow = () => {
    const current = generateWorkflow(state);
    if (!current) return;
    try {
      downloadFile(current, WORKFLOW_FILE_NAME, 'text/yaml');
```

- [ ] **Step 3: Vérifier types, lint et suite**

Run: `npx tsc --noEmit && npx eslint src tests && npx vitest run`
Expected: PASS ; aucune erreur de types ni de lint ; toute la suite verte.

- [ ] **Step 4: Commit**

```bash
git add src
git commit -m "$(cat <<'EOF'
perf(readme): garde la frappe fluide dans un gros README

Chaque frappe relançait la génération, la validation, le rendu complet de
l'aperçu et une sauvegarde JSON indentée (140 à 320 ms mesurées pour 20 à
100 Ko). La sauvegarde attend 400 ms de calme et est vidée quand la page
est masquée ou fermée ; l'aperçu, les avertissements et le workflow passent
par useDeferredValue. Copier et télécharger relisent l'état courant.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: Aperçu : ancres, notes de bas de page et images vectorielles

**Files:**
- Create: `src/lib/readme/preview-anchors.ts`
- Modify: `src/lib/readme/headings.ts`, `src/lib/readme/markdown-pipeline.ts`, `src/components/readme-generator/readme-preview.css`
- Test: `tests/readme/preview-anchors.test.ts`

**Interfaces:**
- Consumes: `githubSlug`, `headingLabel` (Tâche 4), `README_MARKDOWN_PROPS`, `generateReadme`.
- Produces :
  - `slugifyText(plain: string): string` exportée de `headings.ts` : l'ancre GitHub d'un texte déjà rendu ; `githubSlug` l'appelle après avoir réduit l'intitulé écrit en Markdown à son texte.
  - `rehypePreviewAnchors()` et `ANCHOR_ID_PREFIX = 'user-content-'` dans `preview-anchors.ts` : greffon rehype qui donne à chaque titre l'id `user-content-<ancre>` (titres répétés numérotés) et oriente chaque lien `#fragment` vers l'id préfixé qui existe, comme le fait GitHub. Parcours itératif : une imbrication hostile ne fait pas déborder la pile.
  - Le pipeline place ce greffon après `rehype-sanitize` (les ids ajoutés survivent) et retire le préfixe de `remark-rehype` (`clobberPrefix: ''`) : le préfixe n'est plus posé deux fois, ce qui cassait les notes de bas de page (`id="user-content-user-content-fn-1"` pour un lien vers `#user-content-fn-1`).
  - Le test de contrat compare **deux calculs indépendants** : l'ancre que la table des matières calcule depuis le Markdown source, et l'id que l'aperçu calcule depuis le texte rendu.

- [ ] **Step 1: Écrire les tests qui échouent**

Create `tests/readme/preview-anchors.test.ts` :

```ts
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import { describe, expect, it } from 'vitest';
import { generateReadme } from '@/lib/readme/generate';
import { README_MARKDOWN_PROPS } from '@/lib/readme/markdown-pipeline';
import { rehypePreviewAnchors } from '@/lib/readme/preview-anchors';
import { block, freeMarkdown, stateWith } from './helpers';

function render(source: string): string {
  return renderToStaticMarkup(createElement(ReactMarkdown, README_MARKDOWN_PROPS, source));
}

const idsOf = (html: string) => [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
const hrefsOf = (html: string) => [...html.matchAll(/\shref="#([^"]+)"/g)].map((match) => match[1]);

describe('footnotes in the preview', () => {
  it('link the reference to the note and back, through ids that exist', () => {
    const html = render('Text[^1]\n\n[^1]: The note.');
    const ids = idsOf(html);
    expect(ids).toContain('user-content-fn-1');
    expect(ids).toContain('user-content-fnref-1');
    for (const href of hrefsOf(html)) expect(ids, href).toContain(href);
  });
});

describe('heading anchors in the preview', () => {
  it('gives each heading a prefixed id and resolves #fragment links to it', () => {
    const html = render('## Title\n\n[jump](#title)');
    expect(html).toContain('<h2 id="user-content-title">Title</h2>');
    expect(html).toContain('href="#user-content-title"');
  });

  it('numbers a repeated title across levels, like the table of contents', () => {
    const ids = idsOf(render('# Usage\n\n## Usage\n\n### Usage'));
    expect(ids).toEqual(['user-content-usage', 'user-content-usage-1', 'user-content-usage-2']);
  });

  it('leaves an external link and an unknown fragment alone', () => {
    const html = render('[a](https://example.com/#x) [b](#nowhere)');
    expect(html).toContain('href="https://example.com/#x"');
    expect(html).toContain('href="#nowhere"');
  });

  it('never leaves a bare id from the user, so it cannot shadow a page global', () => {
    const html = render('<div id="plausible">x</div>');
    expect(html).not.toMatch(/\sid="plausible"/);
  });

  it('walks a very deep tree without overflowing the stack', () => {
    type Node = { type: string; tagName?: string; children: Node[] };
    let node: Node = { type: 'element', tagName: 'h2', children: [] };
    for (let depth = 0; depth < 100_000; depth++) node = { type: 'element', tagName: 'div', children: [node] };
    expect(() => rehypePreviewAnchors()({ type: 'root', children: [node] })).not.toThrow();
  });
});

describe('every link of the table of contents lands on a heading of the preview', () => {
  const sections = [
    '# Usage',
    '## Usage',
    '## See [docs](https://x.example/a)',
    '## R&amp;D',
    '## Créer & partager',
    'Intro\n-----',
    '## Title <!-- note -->',
    '## 1. Start',
    '## C++ / Rust',
    '## 日本語 見出し',
    '## Notes',
    '## Notes',
    '## <b>Bold</b> text',
  ];

  it('for the anchors computed from the source and those computed from the rendered text', () => {
    const markdown = generateReadme(
      stateWith([freeMarkdown('a', sections.join('\n\n')), block('t', 'tableOfContents', { heading: 'Contents' })])
    );
    const html = render(markdown);
    const ids = idsOf(html);
    const links = hrefsOf(html).filter((href) => href.startsWith('user-content-'));
    expect(links).toHaveLength(sections.filter((section) => !section.startsWith('# ')).length);
    for (const href of links) expect(ids, href).toContain(decodeURIComponent(href));
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run tests/readme/preview-anchors.test.ts`
Expected: FAIL. `Cannot find package '@/lib/readme/preview-anchors'` (module absent).

- [ ] **Step 3: Écrire le greffon**

Modify `src/lib/readme/headings.ts` : remplacer

```ts
/** GitHub's anchor for a heading: its text content, lowercased, punctuation removed, spaces to hyphens. */
export function githubSlug(text: string): string {
  return headingLabel(text)
    .replace(ESCAPE_OR_ENTITY, decode)
    .toLowerCase()
    .replace(SLUG_FORBIDDEN, '')
    .replace(/ /g, '-');
}
```

par

```ts
/** GitHub's anchor for a heading's rendered text: lowercased, punctuation removed, spaces to hyphens. */
export function slugifyText(plain: string): string {
  return plain.toLowerCase().replace(SLUG_FORBIDDEN, '').replace(/ /g, '-');
}

/** GitHub's anchor for a heading as written in Markdown: the slug of the text it renders to. */
export function githubSlug(text: string): string {
  return slugifyText(headingLabel(text).replace(ESCAPE_OR_ENTITY, decode));
}
```

Create `src/lib/readme/preview-anchors.ts` :

```ts
import { slugifyText } from './headings';

/** The part of a hast node this plugin reads: enough to avoid depending on the type packages. */
interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

/** GitHub prefixes every id of a README and resolves `#fragment` links against it. */
export const ANCHOR_ID_PREFIX = 'user-content-';

/** Depth-first, document order, and iterative: hostile nesting cannot overflow the stack. */
function visit(root: HastNode, callback: (node: HastNode) => void): void {
  const stack = [root];
  for (let node = stack.pop(); node !== undefined; node = stack.pop()) {
    callback(node);
    const children = node.children ?? [];
    for (let index = children.length - 1; index >= 0; index--) stack.push(children[index]);
  }
}

function textContent(root: HastNode): string {
  let text = '';
  visit(root, (node) => {
    if (node.type === 'text') text += node.value ?? '';
  });
  return text.trim();
}

/**
 * Makes the anchors of the preview work the way GitHub's do: each heading gets a
 * `user-content-<slug>` id (repeated titles numbered, as in the table of contents), and a
 * `#fragment` link is pointed at the matching prefixed id. Footnotes go through the same
 * rule. Runs after sanitizing, so it can add ids; the prefix keeps them from shadowing
 * page globals.
 */
export function rehypePreviewAnchors() {
  return (tree: HastNode): void => {
    const seen = new Map<string, number>();
    const ids = new Set<string>();
    const links: HastNode[] = [];
    visit(tree, (node) => {
      if (node.type !== 'element') return;
      if (node.tagName !== undefined && /^h[1-6]$/.test(node.tagName)) {
        const base = slugifyText(textContent(node));
        const count = seen.get(base) ?? 0;
        seen.set(base, count + 1);
        node.properties = { ...node.properties, id: `${ANCHOR_ID_PREFIX}${count === 0 ? base : `${base}-${count}`}` };
      }
      const id = node.properties?.id;
      if (typeof id === 'string') ids.add(id);
      const href = node.properties?.href;
      if (node.tagName === 'a' && typeof href === 'string' && href.startsWith('#')) links.push(node);
    });
    for (const link of links) {
      const fragment = (link.properties?.href as string).slice(1);
      let decoded: string;
      try {
        decoded = decodeURIComponent(fragment);
      } catch {
        continue;
      }
      if (!ids.has(decoded) && ids.has(`${ANCHOR_ID_PREFIX}${decoded}`)) {
        link.properties = { ...link.properties, href: `#${ANCHOR_ID_PREFIX}${fragment}` };
      }
    }
  };
}
```

- [ ] **Step 4: Brancher le pipeline et le style**

Modify `src/lib/readme/markdown-pipeline.ts` : remplacer

```ts
import { remarkAlert } from 'remark-github-blockquote-alert';
```

par

```ts
import { remarkAlert } from 'remark-github-blockquote-alert';
import { rehypePreviewAnchors } from './preview-anchors';
```

et remplacer

```ts
  remarkRehypeOptions: { allowDangerousHtml: true },
  rehypePlugins: [rehypeRaw, [rehypeSanitize, README_SANITIZE_SCHEMA], rehypeHighlight],
```

par

```ts
  // No prefix from remark-rehype: sanitizing adds the single `user-content-` one, and
  // `rehypePreviewAnchors` points the `#fragment` links at it.
  remarkRehypeOptions: { allowDangerousHtml: true, clobberPrefix: '' },
  rehypePlugins: [rehypeRaw, [rehypeSanitize, README_SANITIZE_SCHEMA], rehypePreviewAnchors, rehypeHighlight],
```

et remplacer

```ts
 * Props spread on `<ReactMarkdown>`. Order matters: raw HTML is parsed first,
 * then sanitized, then code blocks are highlighted (highlight classes are added
 * after sanitizing, so they survive).
```

par

```ts
 * Props spread on `<ReactMarkdown>`. Order matters: raw HTML is parsed first,
 * then sanitized, then anchors are wired (ids are added after sanitizing, so they
 * survive), then code blocks are highlighted (highlight classes are added after
 * sanitizing, so they survive).
```

Modify `src/components/readme-generator/readme-preview.css` : ajouter à la fin du fichier

```css

/* An inline <svg> in a free Markdown block may declare any size: keep it inside the preview. */
.readme-preview svg:not(.octicon) {
  max-width: 100%;
  height: auto;
}
```

- [ ] **Step 5: Vérifier que tout passe**

Run: `npx vitest run && npx tsc --noEmit && npx eslint src tests`
Expected: PASS ; aucune erreur de types ni de lint. `sanitize.test.ts` passe inchangé : le greffon ne lève aucune protection (les ids restent préfixés).

- [ ] **Step 6: Commit**

```bash
git add src tests
git commit -m "$(cat <<'EOF'
fix(readme): fait fonctionner les ancres et les notes de bas de page de l'aperçu

Le préfixe user-content- était posé deux fois : le lien d'une note de bas
de page ne menait nulle part. Les titres n'avaient aucun id, donc les
liens de la table des matières ne faisaient rien dans l'aperçu. Un greffon
donne à chaque titre son id préfixé (numérotation comme GitHub) et oriente
les liens #fragment vers lui ; un test compare les ancres de la table
(calculées depuis le Markdown) aux ids de l'aperçu (calculés depuis le texte
rendu). Une image SVG en ligne de taille quelconque reste dans l'aperçu.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: Accessibilité, noms des blocs et petits défauts de formulaires

**Files:**
- Create: `src/lib/readme/block-labels.ts`, `src/lib/readme/hex-input.ts`
- Modify: `src/components/readme-generator/readme-generator.tsx`, `block-list.tsx`, `readme-wizard.tsx`, `block-forms.tsx`, `extraction-panel.tsx`
- Test: `tests/readme/block-labels.test.ts`, `tests/readme/hex-input.test.ts`

**Interfaces:**
- Consumes: les clés i18n de la Tâche 1 (`blocks.dragFor`, `enabledFor`, `moveUpFor`, `moveDownFor`, `removeFor`, `extraction.loading`), `Block`, `BlockType`.
- Produces :
  - `blockDisplayNames(blocks, nameOf): Record<string, string>` : le nom de chaque bloc par identifiant, suivi de son rang quand un type apparaît plusieurs fois (« Markdown libre 1 », « Markdown libre 2 »). Il alimente la liste de blocs, le titre du formulaire et le panneau d'avertissements, qui identifiaient jusque-là deux blocs du même type par le même mot.
  - `sanitizeHexInput(input): string` : au plus six chiffres hexadécimaux, le `#` et tout autre caractère écartés.
  - `BlockList` reçoit la prop `labels`. Les boutons de la liste (activer, monter, descendre, supprimer, glisser) nomment leur bloc.
  - L'assistant : les cartes de mode forment un `radiogroup` (rôles `radio`, flèches, un seul arrêt de tabulation) ; le focus passe au titre de l'étape à chaque changement d'étape ; le groupe des couleurs a un intitulé associé.
  - Formulaires : le champ couleur suit la valeur de son badge quand la liste change et accepte `#0969da` collé ; l'extraction ne lance qu'une requête à la fois et annonce « Chargement… ».

- [ ] **Step 1: Écrire les tests qui échouent**

Create `tests/readme/block-labels.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import { blockDisplayNames } from '@/lib/readme/block-labels';
import type { BlockType } from '@/lib/readme/types';
import { block, freeMarkdown, header } from './helpers';

const nameOf = (type: BlockType) => ({ header: 'Header', freeMarkdown: 'Free Markdown', usage: 'Usage' })[type as string] ?? type;

describe('blockDisplayNames', () => {
  it('uses the plain name of a type that appears once', () => {
    expect(blockDisplayNames([header('h'), block('u', 'usage', {})], nameOf)).toEqual({ h: 'Header', u: 'Usage' });
  });

  it('numbers the blocks of a type that appears several times, in list order', () => {
    const blocks = [freeMarkdown('a', ''), header('h'), freeMarkdown('b', ''), freeMarkdown('c', '')];
    expect(blockDisplayNames(blocks, nameOf)).toEqual({
      a: 'Free Markdown 1',
      h: 'Header',
      b: 'Free Markdown 2',
      c: 'Free Markdown 3',
    });
  });

  it('follows the list when a block is removed or moved', () => {
    expect(blockDisplayNames([freeMarkdown('b', ''), freeMarkdown('a', '')], nameOf)).toEqual({
      b: 'Free Markdown 1',
      a: 'Free Markdown 2',
    });
    expect(blockDisplayNames([freeMarkdown('a', '')], nameOf)).toEqual({ a: 'Free Markdown' });
  });

  it('returns nothing for an empty list', () => {
    expect(blockDisplayNames([], nameOf)).toEqual({});
  });
});
```

Create `tests/readme/hex-input.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import { sanitizeHexInput } from '@/lib/readme/hex-input';

describe('sanitizeHexInput', () => {
  it.each([
    ['0969da', '0969da'],
    ['#0969da', '0969da'],
    ['  #0969DA ', '0969DA'],
    ['09 69-da', '0969da'],
    ['0969dazz', '0969da'],
    ['#0969da0969da', '0969da'],
    ['xyz', ''],
    ['', ''],
    ['#', ''],
  ])('keeps the hex digits of %j as %j', (input, expected) => {
    expect(sanitizeHexInput(input)).toBe(expected);
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run tests/readme/block-labels.test.ts tests/readme/hex-input.test.ts`
Expected: FAIL, modules `@/lib/readme/block-labels` et `@/lib/readme/hex-input` introuvables.

- [ ] **Step 3: Écrire les deux aides**

Create `src/lib/readme/block-labels.ts` :

```ts
import type { Block, BlockType } from './types';

/**
 * The name shown for each block, keyed by id: the name of its type, followed by its
 * rank when the type appears more than once ("Free Markdown 1", "Free Markdown 2").
 * Without the rank, the list, the warnings and the buttons of two blocks of the same
 * type read identically, which leaves a screen reader user unable to tell them apart.
 */
export function blockDisplayNames(
  blocks: readonly Block[],
  nameOf: (type: BlockType) => string
): Record<string, string> {
  const totals = new Map<BlockType, number>();
  for (const block of blocks) totals.set(block.type, (totals.get(block.type) ?? 0) + 1);
  const seen = new Map<BlockType, number>();
  const names: Record<string, string> = {};
  for (const block of blocks) {
    const rank = (seen.get(block.type) ?? 0) + 1;
    seen.set(block.type, rank);
    names[block.id] = totals.get(block.type) === 1 ? nameOf(block.type) : `${nameOf(block.type)} ${rank}`;
  }
  return names;
}
```

Create `src/lib/readme/hex-input.ts` :

```ts
/**
 * What a color field keeps from what was typed or pasted: at most six hex digits.
 * A leading `#` (a color pasted from a design tool) and any other character are
 * dropped instead of being rejected, and the length is cut here rather than by the
 * input's own limit, which would truncate `#0969da` to `#0969d` before any code runs.
 */
export function sanitizeHexInput(input: string): string {
  return input.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
}
```

- [ ] **Step 4: Brancher les composants**

Modify `src/components/readme-generator/readme-generator.tsx` : remplacer

```tsx
import { mergeMeta, type ExtractedKey, type ExtractedMeta } from '@/lib/readme/extract';
```

par

```tsx
import { blockDisplayNames } from '@/lib/readme/block-labels';
import { mergeMeta, type ExtractedKey, type ExtractedMeta } from '@/lib/readme/extract';
```

et remplacer

```tsx
  const blockLabels = Object.fromEntries(state.blocks.map((block) => [block.id, t(`blocks.${block.type}`)]));
```

par

```tsx
  const blockLabels = blockDisplayNames(state.blocks, (type) => t(`blocks.${type}`));
```

puis remplacer

```tsx
            blocks={state.blocks}
            selectedId={selected?.id ?? null}
```

par

```tsx
            blocks={state.blocks}
            labels={blockLabels}
            selectedId={selected?.id ?? null}
```

et remplacer

```tsx
                <CardTitle>{t(`blocks.${selected.type}`)}</CardTitle>
```

par

```tsx
                <CardTitle>{blockLabels[selected.id]}</CardTitle>
```

Modify `src/components/readme-generator/block-list.tsx` : remplacer

```tsx
  blocks: Block[];
  selectedId: string | null;
```

par

```tsx
  blocks: Block[];
  /** Display name of each block, keyed by id (numbered when a type appears more than once). */
  labels: Record<string, string>;
  selectedId: string | null;
```

et remplacer

```tsx
  blocks,
  selectedId,
  catalog,
```

par

```tsx
  blocks,
  labels,
  selectedId,
  catalog,
```

puis remplacer

```tsx
              <span className="cursor-grab text-muted-foreground" title={t('blocks.drag')}>
                <Move className="w-4 h-4" aria-hidden="true" />
                <span className="sr-only">{t('blocks.drag')}</span>
              </span>
```

par

```tsx
              <span className="cursor-grab text-muted-foreground" title={t('blocks.dragFor', { name: labels[block.id] })}>
                <Move className="w-4 h-4" aria-hidden="true" />
                <span className="sr-only">{t('blocks.dragFor', { name: labels[block.id] })}</span>
              </span>
```

et remplacer

```tsx
                {t(`blocks.${block.type}`)}
              </button>
```

par

```tsx
                {labels[block.id]}
              </button>
```

puis remplacer

```tsx
                aria-label={t('blocks.enabled')}
```

par

```tsx
                aria-label={t('blocks.enabledFor', { name: labels[block.id] })}
```

et remplacer

```tsx
                aria-label={t('blocks.moveUp')}
```

par

```tsx
                aria-label={t('blocks.moveUpFor', { name: labels[block.id] })}
```

puis remplacer

```tsx
                aria-label={t('blocks.moveDown')}
```

par

```tsx
                aria-label={t('blocks.moveDownFor', { name: labels[block.id] })}
```

et remplacer

```tsx
                aria-label={t('blocks.remove')}
```

par

```tsx
                aria-label={t('blocks.removeFor', { name: labels[block.id] })}
```

Modify `src/components/readme-generator/readme-wizard.tsx` : remplacer

```tsx
import React, { useState } from 'react';
```

par

```tsx
import React, { useEffect, useRef, useState } from 'react';
```

et remplacer

```tsx
  const [step, setStep] = useState(1);
```

par

```tsx
  const [step, setStep] = useState(1);
  const stepTitle = useRef<HTMLDivElement>(null);
  const shownStep = useRef(step);
  // Moving to another step moves the focus to its title: the buttons that were used are
  // replaced, and a keyboard or screen reader user would otherwise be sent back to the top.
  useEffect(() => {
    if (shownStep.current === step) return;
    shownStep.current = step;
    stepTitle.current?.focus();
  }, [step]);
```

puis remplacer

```tsx
          <CardTitle>{t(`wizard.${STEP_KEYS[step - 1]}`)}</CardTitle>
```

par

```tsx
          <CardTitle ref={stepTitle} tabIndex={-1} role="heading" aria-level={2} className="outline-none">
            {t(`wizard.${STEP_KEYS[step - 1]}`)}
          </CardTitle>
```

et remplacer

```tsx
              <p className="text-sm text-muted-foreground">{t('wizard.modeHint')}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {MODES.map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={mode === option}
                    onClick={() => chooseMode(option)}
```

par

```tsx
              <p id="wizard-mode-hint" className="text-sm text-muted-foreground">
                {t('wizard.modeHint')}
              </p>
              <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-labelledby="wizard-mode-hint">
                {MODES.map((option, index) => (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={mode === option}
                    tabIndex={mode === option ? 0 : -1}
                    onClick={() => chooseMode(option)}
                    onKeyDown={(event) => {
                      const direction =
                        event.key === 'ArrowRight' || event.key === 'ArrowDown'
                          ? 1
                          : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
                            ? -1
                            : 0;
                      if (direction === 0) return;
                      event.preventDefault();
                      const next = (index + direction + MODES.length) % MODES.length;
                      chooseMode(MODES[next]);
                      (event.currentTarget.parentElement?.children[next] as HTMLElement | undefined)?.focus();
                    }}
```

puis remplacer

```tsx
                <Label>{t('wizard.accent')}</Label>
                <div className="flex flex-wrap gap-2">
```

par

```tsx
                <p id="wizard-accent-label" className="text-sm font-medium leading-none">
                  {t('wizard.accent')}
                </p>
                <div className="flex flex-wrap gap-2" role="group" aria-labelledby="wizard-accent-label">
```

Modify `src/components/readme-generator/block-forms.tsx` : remplacer

```tsx
import { SKILL_GROUPS, cleanSkillIds, toggleSkill } from '@/lib/readme/skill-catalog';
```

par

```tsx
import { sanitizeHexInput } from '@/lib/readme/hex-input';
import { SKILL_GROUPS, cleanSkillIds, toggleSkill } from '@/lib/readme/skill-catalog';
```

et remplacer

```tsx
  const [draft, setDraft] = useState(value);
  return (
    <Field id={id} label={label} hint={hint}>
      <Input
        id={id}
        value={draft}
        maxLength={6}
        placeholder="0969da"
```

par

```tsx
  const [draft, setDraft] = useState(value);
  const [known, setKnown] = useState(value);
  // This field can start showing another badge's color (one above it was removed): follow the value.
  if (value !== known) {
    setKnown(value);
    setDraft(value);
  }
  return (
    <Field id={id} label={label} hint={hint}>
      <Input
        id={id}
        value={draft}
        placeholder="0969da"
```

puis remplacer

```tsx
          const next = e.target.value.replace(/[^0-9a-fA-F]/g, '');
```

par

```tsx
          const next = sanitizeHexInput(e.target.value);
```

Modify `src/components/readme-generator/extraction-panel.tsx` : remplacer

```tsx
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

```

par

```tsx
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  // Enter can fire again before the state below disables the button: one request at a time.
  const busy = useRef(false);

```

et remplacer

```tsx
  const handleFetch = async () => {
    const ref = parseGithubUrl(url);
    if (!ref) {
      finish({ ok: false, error: 'invalidUrl' });
      return;
    }
    setStatus({ kind: 'loading' });
    finish(await fetchGithubMeta(ref));
  };
```

par

```tsx
  const handleFetch = async () => {
    if (busy.current) return;
    const ref = parseGithubUrl(url);
    if (!ref) {
      finish({ ok: false, error: 'invalidUrl' });
      return;
    }
    busy.current = true;
    setStatus({ kind: 'loading' });
    try {
      finish(await fetchGithubMeta(ref));
    } finally {
      busy.current = false;
    }
  };
```

puis remplacer

```tsx
        {status.kind === 'done' ? status.message : ''}
```

par

```tsx
        {status.kind === 'done' ? status.message : status.kind === 'loading' ? t('extraction.loading') : ''}
```

- [ ] **Step 5: Vérifier types, lint et suite**

Run: `npx tsc --noEmit && npx eslint src tests && npx vitest run`
Expected: PASS ; aucune erreur de types ni de lint ; toute la suite verte. Le comportement des composants est vérifié en navigateur à la Tâche 12.

- [ ] **Step 6: Commit**

```bash
git add src tests
git commit -m "$(cat <<'EOF'
fix(readme): rend la liste de blocs et l'assistant utilisables au lecteur d'écran

Deux blocs Markdown libre portaient le même nom dans la liste, les boutons
et les avertissements : ils sont numérotés, et chaque bouton nomme son
bloc. Dans l'assistant, les cartes de mode forment un groupe radio, le
focus suit le changement d'étape et le groupe de couleurs a un intitulé.
Le champ couleur d'un badge suit sa valeur après une suppression et accepte
#0969da collé ; l'extraction ne lance plus deux requêtes sur Entrée
répétée et annonce son chargement.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 11: Ouverture publique de l'outil

**Files:**
- Modify: `src/lib/tools.ts`, `src/app/[locale]/tools/readme-generator/page.tsx`, `src/app/sitemap.ts`, `src/components/home/tools-showcase.tsx`, `src/lib/changelog.ts`, `CHANGELOG.md`, `package.json`, `package-lock.json`
- Test: `tests/seo/tools-registry.test.ts`

**Interfaces:**
- Consumes: `TOOLS`, `sitemap()`, `getToolMetadata`, `getToolContent`, `buildToolMetadata`, les textes d'accueil et de navigation du plan 1 (`nav.readmeGenerator`, `home.tools.readmeGenerator.desc`, déjà présents dans les 8 locales).
- Produces :
  - `SHOWCASE_TOOLS` est exportée de `tools-showcase.tsx` (elle ne l'était pas) et gagne la carte du générateur de README.
  - **Test de contrat** `tests/seo/tools-registry.test.ts` : tout outil de `TOOLS` qui n'est pas `comingSoon` a une entrée de sitemap dans chaque langue, son titre et ses textes SEO, une carte sur l'accueil et ses textes de menu et d'accueil dans les 8 locales ; un outil `comingSoon` n'est ni dans le sitemap ni sur l'accueil ; la page du générateur n'est plus `noindex`.
  - Le générateur sort de `comingSoon`, la page perd son `robots: { index: false }`, et la version passe à **2.5.0** (`CHANGELOG.md`, `changelog.ts`, `package.json`, `package-lock.json`).

- [ ] **Step 1: Écrire le test de contrat qui échoue**

Le test lit la liste des cartes de l'accueil : il faut d'abord l'exporter (aucun changement de comportement).

Modify `src/components/home/tools-showcase.tsx` : remplacer

```tsx
const SHOWCASE_TOOLS: ShowcaseTool[] = [
```

par

```tsx
export const SHOWCASE_TOOLS: ShowcaseTool[] = [
```

Create `tests/seo/tools-registry.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import sitemap from '@/app/sitemap';
import { generateMetadata as readmeGeneratorMetadata } from '@/app/[locale]/tools/readme-generator/page';
import { SHOWCASE_TOOLS } from '@/components/home/tools-showcase';
import { locales } from '@/i18n/locales';
import { getToolMetadata, type ToolSlug } from '@/lib/seo-config';
import { getToolContent } from '@/lib/tool-seo-content';
import { TOOLS } from '@/lib/tools';

const visibleTools = TOOLS.filter((tool) => !tool.comingSoon);
const slugOf = (href: string) => href.split('/').pop() as ToolSlug;
const sitemapUrls = sitemap().map((entry) => entry.url);

function getPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

describe('every tool that is not "coming soon" is wired everywhere', () => {
  it.each(visibleTools.map((tool) => [tool.id, tool] as const))('%s is in the sitemap for every locale', (_id, tool) => {
    for (const locale of locales) {
      expect(sitemapUrls.some((url) => url.endsWith(`/${locale}${tool.href}`)), `${locale}${tool.href}`).toBe(true);
    }
  });

  it.each(visibleTools.map((tool) => [tool.id, tool] as const))('%s has its SEO title and copy', (_id, tool) => {
    for (const locale of locales) {
      expect(getToolMetadata(slugOf(tool.href), locale).title.length, locale).toBeGreaterThan(10);
      expect(getToolContent(slugOf(tool.href), locale).faq.length, locale).toBeGreaterThan(0);
    }
  });

  it.each(visibleTools.map((tool) => [tool.id, tool] as const))('%s has a card on the home page', (_id, tool) => {
    expect(SHOWCASE_TOOLS.some((card) => card.href === tool.href)).toBe(true);
  });

  it.each(locales)('%s translates every visible tool for the menu and the home page', async (locale) => {
    const messages = (await import(`@/i18n/locales/${locale}.json`)).default;
    for (const tool of visibleTools) {
      expect(typeof getPath(messages, `nav.${tool.nameKey}`), `${locale}:nav.${tool.nameKey}`).toBe('string');
      expect(typeof getPath(messages, `home.tools.${tool.nameKey}.desc`), `${locale}:home.tools.${tool.nameKey}.desc`).toBe('string');
    }
  });

  it('keeps a tool that is "coming soon" out of the sitemap and off the home page', () => {
    for (const tool of TOOLS.filter((candidate) => candidate.comingSoon)) {
      expect(sitemapUrls.some((url) => url.endsWith(tool.href))).toBe(false);
      expect(SHOWCASE_TOOLS.some((card) => card.href === tool.href)).toBe(false);
    }
  });
});

describe('the README generator page', () => {
  it.each(locales)('%s is open to search engines', async (locale) => {
    const metadata = await readmeGeneratorMetadata({ params: Promise.resolve({ locale }) });
    expect(metadata.robots).toBeUndefined();
  });

  it('is in the sitemap and on the home page', () => {
    for (const locale of locales) {
      expect(sitemapUrls.some((url) => url.endsWith(`/${locale}/tools/readme-generator`)), locale).toBe(true);
    }
    expect(SHOWCASE_TOOLS.some((card) => card.href === '/tools/readme-generator')).toBe(true);
  });

  it('is listed as a tool that is not "coming soon"', () => {
    expect(TOOLS.find((tool) => tool.id === 'readme-generator')?.comingSoon).toBeFalsy();
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run tests/seo/tools-registry.test.ts`
Expected: FAIL, 10 échecs : les 8 langues de « is open to search engines » (`expected { index: false, follow: false } to be undefined`), « is in the sitemap and on the home page » et « is listed as a tool that is not "coming soon" ». Les autres tests du fichier passent : ils prouvent que les huit outils déjà ouverts respectent le contrat.

- [ ] **Step 3: Ouvrir l'outil**

Modify `src/lib/tools.ts` : remplacer

```ts
    nameKey: 'readmeGenerator',
    comingSoon: true,
  },
```

par

```ts
    nameKey: 'readmeGenerator',
  },
```

Modify `src/app/[locale]/tools/readme-generator/page.tsx` : remplacer

```tsx
  const { locale } = await params;
  // Hidden from search engines until the profile mode ships (plan 3).
  return { ...buildToolMetadata('readme-generator', locale), robots: { index: false, follow: false } };
```

par

```tsx
  const { locale } = await params;
  return buildToolMetadata('readme-generator', locale);
```

Modify `src/app/sitemap.ts` : remplacer

```ts
  { path: '/tools/tree-to-commands', priority: 0.8 },
```

par

```ts
  { path: '/tools/tree-to-commands', priority: 0.8 },
  { path: '/tools/readme-generator', priority: 0.8 },
```

Modify `src/components/home/tools-showcase.tsx` : remplacer

```tsx
    preview: `mkdir -p src
touch src/index.ts
touch README.md`,
  },
];
```

par

```tsx
    preview: `mkdir -p src
touch src/index.ts
touch README.md`,
  },
  {
    id: 'readme-generator',
    href: '/tools/readme-generator',
    tag: 'README',
    nameKey: 'readmeGenerator',
    descKey: 'home.tools.readmeGenerator.desc',
    preview: `# my-project
[build: passing] [license: MIT]

## Installation
npm install my-project`,
  },
];
```

- [ ] **Step 4: Version 2.5.0**

Modify `CHANGELOG.md` : remplacer

```md
## [2.4.0] - 2026-09-23
```

par

```md
## [2.5.0] - 2026-09-26

Ajout d'un nouvel outil : générateur de README GitHub (projet et profil).

### Ajouté

- **Générateur de README** (`/tools/readme-generator`) : éditeur de blocs pour un
  README de projet ou un README de profil GitHub, avec un assistant en cinq
  étapes, un aperçu fidèle à GitHub (clair et sombre), un validateur non
  bloquant, la sauvegarde automatique dans le navigateur et l'export/import
  JSON. Aucun import n'est requis : tout peut se faire en partant de zéro.
- **Mode Projet** : en-tête, badges, capture d'écran, table des matières,
  installation, utilisation, architecture et feuille de route, contribution,
  licence et remerciements, alertes, Markdown libre. Pré-remplissage facultatif
  depuis `package.json`, `Cargo.toml`, `pyproject.toml` ou l'URL d'un dépôt
  GitHub public.
- **Mode Profil** : bannière animée, présentation, compétences, statistiques,
  trophées, articles de blog et contact, avec génération du workflow GitHub
  Actions qui remplit la zone d'articles. Les cartes de statistiques et de
  trophées demandent l'adresse de votre propre instance : les services publics
  sont désactivés par leurs propriétaires.

## [2.4.0] - 2026-09-23
```

Modify `src/lib/changelog.ts` : remplacer

```ts
export const APP_VERSION = '2.4.0';
```

par

```ts
export const APP_VERSION = '2.5.0';
```

et remplacer

```ts
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '2.4.0',
```

par

```ts
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '2.5.0',
    date: '2026-09-26',
    summary: 'Nouvel outil : générateur de README GitHub (projet et profil).',
    sections: [
      {
        title: 'Ajouté',
        items: [
          "Générateur de README (/tools/readme-generator) : éditeur de blocs pour un README de projet ou un README de profil GitHub, avec un assistant en cinq étapes, un aperçu fidèle à GitHub (clair et sombre), un validateur non bloquant, la sauvegarde automatique dans le navigateur et l'export/import JSON. Aucun import n'est requis : tout peut se faire en partant de zéro.",
          "Mode Projet : en-tête, badges, capture d'écran, table des matières, installation, utilisation, architecture et feuille de route, contribution, licence et remerciements, alertes, Markdown libre. Pré-remplissage facultatif depuis package.json, Cargo.toml, pyproject.toml ou l'URL d'un dépôt GitHub public.",
          "Mode Profil : bannière animée, présentation, compétences, statistiques, trophées, articles de blog et contact, avec génération du workflow GitHub Actions qui remplit la zone d'articles. Les cartes de statistiques et de trophées demandent l'adresse de votre propre instance : les services publics sont désactivés par leurs propriétaires.",
        ],
      },
    ],
  },
  {
    version: '2.4.0',
```

Run: `npm version 2.5.0 --no-git-tag-version`
Expected: `v2.5.0` ; seuls `package.json` et `package-lock.json` changent (deux lignes `"version"` chacun pour le verrou, une pour `package.json`).

- [ ] **Step 5: Vérifier types, lint, suite et build**

Run: `npx vitest run && npx tsc --noEmit && npx eslint src tests && npm run build`
Expected: tout passe. `/[locale]/tools/readme-generator` est générée pour les 8 locales, et `/sitemap.xml` liste maintenant l'outil.

- [ ] **Step 6: Commit**

```bash
git add src tests CHANGELOG.md package.json package-lock.json
git commit -m "$(cat <<'EOF'
feat(readme): ouvre le générateur de README au public, version 2.5.0

L'outil sort de « bientôt » : plus de noindex, présent dans le sitemap, la
navigation et la vitrine de l'accueil, avec changelog et version 2.5.0. Un
test de contrat relie le registre d'outils au sitemap, aux textes SEO, à la
vitrine et aux traductions pour qu'un outil ouvert ne puisse plus être
oublié quelque part.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 12: Vérification finale du plan

**Files:** aucun fichier de production. Corriger dans la tâche concernée tout défaut trouvé, avec un test qui échoue d'abord.

- [ ] **Step 1: Suite complète, types, lint, build**

Run: `npx vitest run && npx tsc --noEmit && npx eslint src tests && npm run build`
Expected: tout passe. `/[locale]/tools/readme-generator` est générée pour les 8 locales ; `/sitemap.xml` liste l'outil.

- [ ] **Step 2: Contrôle en navigateur**

Lancer `npm run dev`, ouvrir `http://localhost:3000/fr/tools/readme-generator` avec un `localStorage` vide (les tests du navigateur doivent utiliser des ticks `MessageChannel` et non `setTimeout` : un onglet en arrière-plan bride les minuteries). Vérifier, dans cet ordre :

1. **Ouverture.** Le code source de la page n'a plus de `<meta name="robots" content="noindex…">`. Le menu latéral et le pied de page proposent « Générateur de README » (sans étiquette « bientôt »), l'accueil (`/fr`) affiche sa carte `README`, et `/sitemap.xml` contient `/fr/tools/readme-generator` et les sept autres langues. La version affichée dans le menu est 2.5.0 et sa fenêtre de changelog décrit l'outil.
2. **Assistant au clavier.** Sans souris : les cartes « Projet » et « Profil » forment un seul arrêt de tabulation, les flèches changent de carte et déplacent le focus, « Suivant » place le focus sur le titre de l'étape suivante. Dans l'arbre d'accessibilité (`read_page`), les cartes ont le rôle `radio` et la question du mode est leur intitulé.
3. **Blocs nommés.** Ajouter deux blocs « Markdown libre » : la liste les nomme « Markdown libre 1 » et « Markdown libre 2 », leurs boutons (activer, monter, descendre, supprimer, glisser) portent ce nom, et le panneau d'avertissements le reprend.
4. **Bloc de code non fermé.** Dans le premier bloc libre, saisir une ligne d'ouverture de bloc de code (trois accents graves suivis de `js`) sans la refermer : l'avertissement « Un bloc de code n'est pas refermé… » apparaît. Même chose dans le champ Description d'un bloc Utilisation ; pas d'avertissement pour un bloc Alerte.
5. **Table des matières.** Ajouter le bloc, puis un bloc libre contenant `# Usage`, `## Usage`, `## Voir [la doc](https://example.com)`, `## R&amp;D`, `Intro` soulignée par `-----` : chaque lien de la table renvoie, **au clic dans l'aperçu**, au titre correspondant ; « Usage » du niveau 2 pointe sur `#usage-1`.
6. **Notes de bas de page.** Dans un bloc libre, `Texte[^1]` puis `[^1]: la note.` : le lien de renvoi de l'aperçu mène à la note et le retour ramène au texte.
7. **Sauvegarde différée.** Taper dans un champ : `localStorage['readme-generator:v1']` n'est pas mis à jour à chaque frappe mais environ 400 ms après la dernière ; en tapant puis en fermant l'onglet aussitôt (ou en le masquant), la dernière frappe est bien enregistrée. Coller 100 Ko dans un bloc libre : la saisie reste fluide (mesurer le délai entre une touche et le prochain rendu avec un tick `MessageChannel`, avant et après ce plan si besoin).
8. **Travail illisible.** Remplacer la valeur de `readme-generator:v1` par un état valide dont un bloc a une donnée invalide, recharger : un message annonce « Blocs illisibles ignorés… » avec « Télécharger la copie » ; `readme-generator:v1:backup` contient le texte d'origine ; le bouton télécharge `readme-backup.json` et vide la copie. Remplacer la valeur par `not json` : l'assistant d'un README neuf s'ouvre avec le message « illisible ». Après un rechargement sans téléchargement, le message de copie disponible revient.
9. **Stockage plein.** Remplir `localStorage` jusqu'au quota puis modifier un champ : le message « Le stockage du navigateur est plein… » s'affiche (et non « indisponible »), une seule fois.
10. **Assistant sur un README existant.** Avec un README contenant En-tête, Utilisation et Licence, rouvrir l'assistant, cocher Badges et Table des matières : ils apparaissent entre l'en-tête et l'utilisation, pas après la licence.
11. **Profil.** Bloc Statistiques : saisir `https://github.com/bob` comme nom d'utilisateur avec un nom valide dans les infos du README : l'avertissement « Nom d'utilisateur GitHub du bloc invalide » s'affiche et aucune carte n'est produite. Bloc Contact : `linkedin.com/in/jane` (sans `https://`) affiche « Adresse de contact invalide pour LinkedIn ». Compétences : importer un fichier avec 80 identifiants inconnus, les cases restent cochables.
12. **Couleur.** Dans un badge, coller `#0969da` dans le champ couleur : la valeur `0969da` est acceptée en entier ; supprimer un badge au-dessus d'un autre : le champ du badge suivant affiche sa propre couleur.
13. **Extraction.** Dans l'assistant (mode Projet, « Pré-remplir »), coller `github.com/octocat/Hello-World` et appuyer deux fois sur Entrée : une seule requête part (onglet réseau) et « Chargement… » est annoncé pendant l'attente.
14. **Langues.** Répéter les points 3, 4 et 8 en `ja` et en `de` : aucun message de traduction manquant dans la console.

Expected: chaque point se comporte comme décrit ; aucun message d'erreur dans la console du navigateur autre que les images tierces cassées.

- [ ] **Step 3: Relecture du périmètre**

Confirmer par `git status` que seuls les fichiers de la « Structure des fichiers » sont touchés, que `tmp-i18n-readme-plan4.mjs` n'est pas commité, et que `git log --oneline` montre un commit par tâche.

---

## Auto-revue du plan

- **Couverture de la spec** (sections 8, 11, 13, 14) : le validateur (Tâches 2 et 3), l'export et l'import sans perte (Tâche 7), l'aperçu fidèle à GitHub (Tâches 4 et 9), l'accessibilité de l'éditeur et de l'assistant (Tâche 10), l'intégration au projet : registre, sitemap, vitrine, SEO, i18n, changelog et version (Tâche 11). Le risque n° 1 de la spec, le sanitizer, garde ses tests (`sanitize.test.ts` passe inchangé) et le greffon d'ancres ne lève aucune protection.
- **Écarts assumés par rapport aux plans précédents** : `extractH2` disparaît au profit de `extractHeadings` (Tâche 4) ; `GenerateContext.headings` change de type (`Heading[]`) ; un README existant voit ses sections ajoutées à leur rang du catalogue et non plus en fin de liste (Tâche 6) ; l'ouverture publique laisse volontairement les textes « huit outils » de l'accueil tels quels.
- **Hors périmètre, avec la raison** : voir « Périmètre » en tête (balises `<picture>` du bloc libre, formes d'URL GitHub, deux onglets, `$` en formule, copie de l'accueil).
- **Cohérence des noms** : `scanFences`/`hasUnclosedFence` (Tâche 2) consommés par `extractHeadings` (Tâche 4) ; `headingLabel`/`slugifyText` (Tâches 4 et 9) ; `trySaveState`/`SaveResult` (Tâche 7) consommés par `useAutosave` (Tâche 8) ; `blockDisplayNames` (Tâche 10) ; les clés i18n de la Tâche 1 couvrent tout ce que les Tâches 2, 3, 7 et 10 utilisent (`warnings.unclosedFence`, `invalidContact`, `invalidUsername`, `messages.*`, `blocks.*For`, `extraction.loading`).
- **Comptes** : la suite passe de 794 tests (après les correctifs de la revue du plan 3) à 990 à l'issue de la Tâche 11.
