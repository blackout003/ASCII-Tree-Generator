// Indexable SEO copy + FAQ for each tool page, localized for all 8 supported
// locales. `en` is required and used as a safety fallback. The FAQ array also
// powers the FAQPage JSON-LD.
import type { ToolSlug } from '@/lib/seo-config';

export type FaqItem = { q: string; a: string };
export type ToolContent = { heading: string; intro: string; faq: FaqItem[] };
type LocalizedToolContent = { en: ToolContent } & Partial<Record<string, ToolContent>>;

const CONTENT: Record<ToolSlug, LocalizedToolContent> = {
  'ascii-tree': {
    en: {
      heading: 'About the ASCII Tree Generator',
      intro:
        'This free ASCII tree generator turns a folder structure into a clean text diagram you can paste straight into a README.md, a GitHub issue, or technical documentation. Build the tree by drag-and-drop, switch between Unicode (├──) and plain ASCII (|--) connectors, and copy the result in one click — no installation, no signup.',
      faq: [
        { q: 'How do I make a file tree for a GitHub README?', a: 'Build your folder structure in the editor, open the ASCII preview, and copy the output. Paste it inside a fenced code block (```) in your README.md so the box-drawing characters line up correctly on GitHub.' },
        { q: "What's the difference between Unicode and ASCII connectors?", a: 'Unicode connectors (├──, │, └──) look cleaner and render in most modern editors and on GitHub. Plain ASCII connectors (|--, |, \\--) use only basic characters, which is safer for older terminals, emails, or environments that do not display Unicode reliably.' },
        { q: 'Will the tree display correctly on GitHub?', a: 'Yes. Wrap the tree in a fenced code block so GitHub uses a monospace font — that keeps the branches aligned. Unicode connectors render natively on GitHub.' },
        { q: 'Is the ASCII tree generator free?', a: 'Yes, it is completely free, runs entirely in your browser, and requires no account. Nothing you build is uploaded to a server.' },
      ],
    },
    fr: {
      heading: "À propos du générateur d'arbre ASCII",
      intro:
        "Ce générateur d'arbre ASCII gratuit transforme une structure de dossiers en un diagramme texte propre à coller directement dans un README.md, une issue GitHub ou une documentation technique. Construisez l'arborescence en glisser-déposer, basculez entre connecteurs Unicode (├──) et ASCII simple (|--), et copiez le résultat en un clic — sans installation ni inscription.",
      faq: [
        { q: 'Comment créer une arborescence de fichiers pour un README GitHub ?', a: "Construisez votre structure dans l'éditeur, ouvrez l'aperçu ASCII et copiez le résultat. Collez-le dans un bloc de code (```) de votre README.md pour que les caractères d'encadrement restent alignés sur GitHub." },
        { q: 'Quelle différence entre les connecteurs Unicode et ASCII ?', a: "Les connecteurs Unicode (├──, │, └──) sont plus nets et s'affichent dans la plupart des éditeurs modernes et sur GitHub. Les connecteurs ASCII simple (|--, |, \\--) n'utilisent que des caractères de base, plus sûrs pour les vieux terminaux, les e-mails ou les environnements sans support Unicode fiable." },
        { q: "L'arbre s'affichera-t-il correctement sur GitHub ?", a: "Oui. Placez l'arbre dans un bloc de code pour que GitHub utilise une police à chasse fixe, ce qui garde les branches alignées. Les connecteurs Unicode s'affichent nativement sur GitHub." },
        { q: "Le générateur d'arbre ASCII est-il gratuit ?", a: "Oui, il est entièrement gratuit, fonctionne dans votre navigateur et ne nécessite aucun compte. Rien de ce que vous créez n'est envoyé sur un serveur." },
      ],
    },
    es: {
      heading: 'Acerca del Generador de Árbol ASCII',
      intro:
        'Este generador de árbol ASCII gratuito convierte una estructura de carpetas en un diagrama de texto limpio que puedes pegar directamente en un README.md, una issue de GitHub o documentación técnica. Construye el árbol arrastrando y soltando, alterna entre conectores Unicode (├──) y ASCII simple (|--), y copia el resultado con un clic — sin instalación ni registro.',
      faq: [
        { q: '¿Cómo hago un árbol de archivos para un README de GitHub?', a: 'Construye tu estructura de carpetas en el editor, abre la vista previa ASCII y copia el resultado. Pégalo dentro de un bloque de código (```) en tu README.md para que los caracteres de dibujo queden alineados correctamente en GitHub.' },
        { q: '¿Cuál es la diferencia entre los conectores Unicode y ASCII?', a: 'Los conectores Unicode (├──, │, └──) se ven más limpios y se muestran en la mayoría de editores modernos y en GitHub. Los conectores ASCII simple (|--, |, \\--) usan solo caracteres básicos, más seguros para terminales antiguas, correos o entornos que no muestran Unicode de forma fiable.' },
        { q: '¿Se mostrará el árbol correctamente en GitHub?', a: 'Sí. Envuelve el árbol en un bloque de código para que GitHub use una fuente monoespaciada, lo que mantiene las ramas alineadas. Los conectores Unicode se muestran de forma nativa en GitHub.' },
        { q: '¿Es gratuito el generador de árbol ASCII?', a: 'Sí, es completamente gratuito, funciona en tu navegador y no requiere cuenta. Nada de lo que creas se sube a un servidor.' },
      ],
    },
    de: {
      heading: 'Über den ASCII-Baum-Generator',
      intro:
        'Dieser kostenlose ASCII-Baum-Generator verwandelt eine Ordnerstruktur in ein sauberes Textdiagramm, das Sie direkt in eine README.md, ein GitHub-Issue oder technische Dokumentation einfügen können. Bauen Sie den Baum per Drag-and-drop, wechseln Sie zwischen Unicode- (├──) und reinen ASCII-Verbindern (|--) und kopieren Sie das Ergebnis mit einem Klick — ohne Installation, ohne Anmeldung.',
      faq: [
        { q: 'Wie erstelle ich einen Dateibaum für eine GitHub-README?', a: 'Bauen Sie Ihre Ordnerstruktur im Editor, öffnen Sie die ASCII-Vorschau und kopieren Sie das Ergebnis. Fügen Sie es in einen Codeblock (```) in Ihrer README.md ein, damit die Zeichen auf GitHub korrekt ausgerichtet bleiben.' },
        { q: 'Was ist der Unterschied zwischen Unicode- und ASCII-Verbindern?', a: 'Unicode-Verbinder (├──, │, └──) sehen sauberer aus und werden in den meisten modernen Editoren und auf GitHub dargestellt. Reine ASCII-Verbinder (|--, |, \\--) verwenden nur einfache Zeichen und sind sicherer für ältere Terminals, E-Mails oder Umgebungen ohne zuverlässige Unicode-Darstellung.' },
        { q: 'Wird der Baum auf GitHub korrekt angezeigt?', a: 'Ja. Umschließen Sie den Baum mit einem Codeblock, damit GitHub eine Monospace-Schrift verwendet — so bleiben die Verzweigungen ausgerichtet. Unicode-Verbinder werden auf GitHub nativ dargestellt.' },
        { q: 'Ist der ASCII-Baum-Generator kostenlos?', a: 'Ja, er ist komplett kostenlos, läuft in Ihrem Browser und erfordert kein Konto. Nichts, was Sie erstellen, wird auf einen Server hochgeladen.' },
      ],
    },
    it: {
      heading: 'Informazioni sul Generatore di Albero ASCII',
      intro:
        "Questo generatore di albero ASCII gratuito trasforma una struttura di cartelle in un diagramma di testo pulito da incollare direttamente in un README.md, una issue di GitHub o nella documentazione tecnica. Costruisci l'albero con il drag-and-drop, alterna tra connettori Unicode (├──) e ASCII semplice (|--) e copia il risultato con un clic — senza installazione né registrazione.",
      faq: [
        { q: 'Come creo un albero dei file per un README di GitHub?', a: "Costruisci la struttura delle cartelle nell'editor, apri l'anteprima ASCII e copia il risultato. Incollalo in un blocco di codice (```) nel tuo README.md affinché i caratteri restino allineati su GitHub." },
        { q: 'Qual è la differenza tra i connettori Unicode e ASCII?', a: 'I connettori Unicode (├──, │, └──) sono più puliti e si visualizzano nella maggior parte degli editor moderni e su GitHub. I connettori ASCII semplice (|--, |, \\--) usano solo caratteri di base, più sicuri per terminali datati, email o ambienti senza supporto Unicode affidabile.' },
        { q: "L'albero si visualizzerà correttamente su GitHub?", a: "Sì. Racchiudi l'albero in un blocco di codice affinché GitHub usi un font a spaziatura fissa, mantenendo i rami allineati. I connettori Unicode si visualizzano nativamente su GitHub." },
        { q: 'Il generatore di albero ASCII è gratuito?', a: 'Sì, è completamente gratuito, funziona nel browser e non richiede alcun account. Nulla di ciò che crei viene caricato su un server.' },
      ],
    },
    pt: {
      heading: 'Sobre o Gerador de Árvore ASCII',
      intro:
        'Este gerador de árvore ASCII gratuito transforma uma estrutura de pastas num diagrama de texto limpo para colar diretamente num README.md, numa issue do GitHub ou em documentação técnica. Construa a árvore com arrastar e soltar, alterne entre conectores Unicode (├──) e ASCII simples (|--) e copie o resultado com um clique — sem instalação nem registo.',
      faq: [
        { q: 'Como faço uma árvore de ficheiros para um README do GitHub?', a: 'Construa a sua estrutura de pastas no editor, abra a pré-visualização ASCII e copie o resultado. Cole-o dentro de um bloco de código (```) no seu README.md para que os caracteres fiquem alinhados corretamente no GitHub.' },
        { q: 'Qual é a diferença entre conectores Unicode e ASCII?', a: 'Os conectores Unicode (├──, │, └──) ficam mais limpos e aparecem na maioria dos editores modernos e no GitHub. Os conectores ASCII simples (|--, |, \\--) usam apenas caracteres básicos, mais seguros para terminais antigos, e-mails ou ambientes sem suporte fiável a Unicode.' },
        { q: 'A árvore vai aparecer corretamente no GitHub?', a: 'Sim. Envolva a árvore num bloco de código para que o GitHub use uma fonte monoespaçada, mantendo os ramos alinhados. Os conectores Unicode aparecem nativamente no GitHub.' },
        { q: 'O gerador de árvore ASCII é gratuito?', a: 'Sim, é totalmente gratuito, funciona no seu navegador e não requer conta. Nada do que criar é enviado para um servidor.' },
      ],
    },
    ru: {
      heading: 'О генераторе ASCII-дерева',
      intro:
        'Этот бесплатный генератор ASCII-дерева превращает структуру папок в аккуратную текстовую схему, которую можно вставить прямо в README.md, issue на GitHub или техническую документацию. Стройте дерево перетаскиванием, переключайтесь между коннекторами Unicode (├──) и простыми ASCII (|--) и копируйте результат в один клик — без установки и регистрации.',
      faq: [
        { q: 'Как сделать дерево файлов для README на GitHub?', a: 'Постройте структуру папок в редакторе, откройте предпросмотр ASCII и скопируйте результат. Вставьте его в блок кода (```) в вашем README.md, чтобы символы правильно выравнивались на GitHub.' },
        { q: 'В чём разница между коннекторами Unicode и ASCII?', a: 'Коннекторы Unicode (├──, │, └──) выглядят аккуратнее и отображаются в большинстве современных редакторов и на GitHub. Простые ASCII-коннекторы (|--, |, \\--) используют только базовые символы — они безопаснее для старых терминалов, писем или сред без надёжной поддержки Unicode.' },
        { q: 'Будет ли дерево правильно отображаться на GitHub?', a: 'Да. Оберните дерево в блок кода, чтобы GitHub использовал моноширинный шрифт — так ветви останутся выровненными. Коннекторы Unicode отображаются на GitHub нативно.' },
        { q: 'Генератор ASCII-дерева бесплатный?', a: 'Да, он полностью бесплатный, работает в браузере и не требует аккаунта. Ничего из созданного вами не загружается на сервер.' },
      ],
    },
    ja: {
      heading: 'ASCIIツリー生成ツールについて',
      intro:
        'この無料のASCIIツリー生成ツールは、フォルダ構成を整ったテキスト図に変換し、README.mdやGitHubのissue、技術ドキュメントにそのまま貼り付けられます。ドラッグ＆ドロップでツリーを作成し、Unicode（├──）とプレーンASCII（|--）のコネクタを切り替え、ワンクリックでコピー。インストールも登録も不要です。',
      faq: [
        { q: 'GitHubのREADME用にファイルツリーを作るには？', a: 'エディタでフォルダ構成を作り、ASCIIプレビューを開いて結果をコピーします。README.mdのコードブロック（```）内に貼り付けると、GitHub上で罫線文字が正しく揃います。' },
        { q: 'UnicodeとASCIIのコネクタの違いは？', a: 'Unicodeコネクタ（├──、│、└──）は見た目がきれいで、最近のエディタやGitHubで表示されます。プレーンASCIIコネクタ（|--、|、\\--）は基本文字のみを使うため、古い端末やメール、Unicodeを確実に表示できない環境で安全です。' },
        { q: 'ツリーはGitHubで正しく表示されますか？', a: 'はい。ツリーをコードブロックで囲むとGitHubが等幅フォントを使い、枝が揃ったまま表示されます。UnicodeコネクタはGitHubでそのまま表示されます。' },
        { q: 'ASCIIツリー生成ツールは無料ですか？', a: 'はい、完全に無料でブラウザ上で動作し、アカウントも不要です。作成した内容はサーバーに送信されません。' },
      ],
    },
  },
  'ascii-table': {
    en: {
      heading: 'About the ASCII Table Generator',
      intro:
        'Turn rows and columns into a clean plain-text table for Markdown files, source-code comments, CLI output, or documentation. Pick a border style, set alignment, and copy a table that lines up perfectly in any monospace context.',
      faq: [
        { q: 'How do I add an ASCII table to Markdown?', a: 'Generate the table, copy it, and paste it inside a fenced code block (```) so the columns stay aligned. For a native Markdown table that renders as HTML, use pipe syntax instead — this tool is ideal for fixed-width, code-comment, and terminal use.' },
        { q: 'Can I choose different border styles?', a: 'Yes. You can switch between border styles such as single lines, double lines and rounded corners, and set column alignment to left, center or right.' },
        { q: 'Does it work in code comments?', a: 'Absolutely — plain-text ASCII tables are perfect for documenting data inside source-code comments, where Markdown rendering is not available.' },
      ],
    },
    fr: {
      heading: 'À propos du générateur de tableau ASCII',
      intro:
        "Transformez des lignes et colonnes en un tableau texte propre pour vos fichiers Markdown, commentaires de code, sorties CLI ou documentation. Choisissez un style de bordure, réglez l'alignement et copiez un tableau parfaitement aligné dans tout contexte à chasse fixe.",
      faq: [
        { q: 'Comment ajouter un tableau ASCII dans du Markdown ?', a: 'Générez le tableau, copiez-le et collez-le dans un bloc de code (```) pour que les colonnes restent alignées. Pour un tableau Markdown natif rendu en HTML, utilisez la syntaxe à barres verticales — cet outil est idéal pour un usage à largeur fixe, en commentaires de code et en terminal.' },
        { q: 'Puis-je choisir différents styles de bordure ?', a: "Oui. Vous pouvez basculer entre des styles comme lignes simples, lignes doubles et coins arrondis, et régler l'alignement des colonnes à gauche, au centre ou à droite." },
        { q: 'Est-ce que ça marche dans les commentaires de code ?', a: "Tout à fait — les tableaux ASCII en texte brut sont parfaits pour documenter des données dans les commentaires de code, où le rendu Markdown n'est pas disponible." },
      ],
    },
    es: {
      heading: 'Acerca del Generador de Tablas ASCII',
      intro:
        'Convierte filas y columnas en una tabla de texto plano limpia para archivos Markdown, comentarios de código, salida de CLI o documentación. Elige un estilo de borde, ajusta la alineación y copia una tabla que se alinea perfectamente en cualquier contexto monoespaciado.',
      faq: [
        { q: '¿Cómo añado una tabla ASCII a Markdown?', a: 'Genera la tabla, cópiala y pégala dentro de un bloque de código (```) para que las columnas queden alineadas. Para una tabla Markdown nativa que se renderice como HTML, usa la sintaxis de barras verticales — esta herramienta es ideal para uso de ancho fijo, comentarios de código y terminal.' },
        { q: '¿Puedo elegir diferentes estilos de borde?', a: 'Sí. Puedes alternar entre estilos como líneas simples, líneas dobles y esquinas redondeadas, y ajustar la alineación de columnas a la izquierda, centro o derecha.' },
        { q: '¿Funciona en los comentarios de código?', a: 'Por supuesto — las tablas ASCII de texto plano son perfectas para documentar datos dentro de los comentarios del código, donde no hay renderizado Markdown.' },
      ],
    },
    de: {
      heading: 'Über den ASCII-Tabellen-Generator',
      intro:
        'Verwandeln Sie Zeilen und Spalten in eine saubere Texttabelle für Markdown-Dateien, Codekommentare, CLI-Ausgaben oder Dokumentation. Wählen Sie einen Rahmenstil, legen Sie die Ausrichtung fest und kopieren Sie eine Tabelle, die in jedem Monospace-Kontext perfekt ausgerichtet ist.',
      faq: [
        { q: 'Wie füge ich eine ASCII-Tabelle in Markdown ein?', a: 'Erzeugen Sie die Tabelle, kopieren Sie sie und fügen Sie sie in einen Codeblock (```) ein, damit die Spalten ausgerichtet bleiben. Für eine native Markdown-Tabelle, die als HTML gerendert wird, verwenden Sie die Pipe-Syntax — dieses Tool ist ideal für Monospace-, Codekommentar- und Terminal-Zwecke.' },
        { q: 'Kann ich verschiedene Rahmenstile wählen?', a: 'Ja. Sie können zwischen Stilen wie einfachen Linien, doppelten Linien und abgerundeten Ecken wechseln und die Spaltenausrichtung auf links, zentriert oder rechts setzen.' },
        { q: 'Funktioniert es in Codekommentaren?', a: 'Absolut — reine ASCII-Texttabellen eignen sich perfekt, um Daten in Codekommentaren zu dokumentieren, wo kein Markdown-Rendering verfügbar ist.' },
      ],
    },
    it: {
      heading: 'Informazioni sul Generatore di Tabelle ASCII',
      intro:
        "Trasforma righe e colonne in una tabella di testo semplice e pulita per file Markdown, commenti di codice, output CLI o documentazione. Scegli uno stile di bordo, imposta l'allineamento e copia una tabella perfettamente allineata in qualsiasi contesto a spaziatura fissa.",
      faq: [
        { q: 'Come aggiungo una tabella ASCII in Markdown?', a: 'Genera la tabella, copiala e incollala in un blocco di codice (```) affinché le colonne restino allineate. Per una tabella Markdown nativa resa in HTML, usa la sintassi con le barre verticali — questo strumento è ideale per usi a larghezza fissa, commenti di codice e terminale.' },
        { q: 'Posso scegliere diversi stili di bordo?', a: "Sì. Puoi alternare tra stili come linee singole, linee doppie e angoli arrotondati, e impostare l'allineamento delle colonne a sinistra, al centro o a destra." },
        { q: 'Funziona nei commenti di codice?', a: 'Assolutamente — le tabelle ASCII in testo semplice sono perfette per documentare dati nei commenti del codice, dove il rendering Markdown non è disponibile.' },
      ],
    },
    pt: {
      heading: 'Sobre o Gerador de Tabelas ASCII',
      intro:
        'Transforme linhas e colunas numa tabela de texto simples e limpa para ficheiros Markdown, comentários de código, saída de CLI ou documentação. Escolha um estilo de borda, defina o alinhamento e copie uma tabela perfeitamente alinhada em qualquer contexto monoespaçado.',
      faq: [
        { q: 'Como adiciono uma tabela ASCII ao Markdown?', a: 'Gere a tabela, copie-a e cole-a dentro de um bloco de código (```) para que as colunas fiquem alinhadas. Para uma tabela Markdown nativa renderizada como HTML, use a sintaxe de barras verticais — esta ferramenta é ideal para uso de largura fixa, comentários de código e terminal.' },
        { q: 'Posso escolher diferentes estilos de borda?', a: 'Sim. Pode alternar entre estilos como linhas simples, linhas duplas e cantos arredondados, e definir o alinhamento das colunas à esquerda, ao centro ou à direita.' },
        { q: 'Funciona em comentários de código?', a: 'Sem dúvida — as tabelas ASCII em texto simples são perfeitas para documentar dados dentro dos comentários do código, onde não há renderização Markdown.' },
      ],
    },
    ru: {
      heading: 'О генераторе ASCII-таблиц',
      intro:
        'Превращайте строки и столбцы в аккуратную текстовую таблицу для файлов Markdown, комментариев в коде, вывода CLI или документации. Выберите стиль рамки, задайте выравнивание и скопируйте таблицу, которая идеально выравнивается в любом моноширинном контексте.',
      faq: [
        { q: 'Как добавить ASCII-таблицу в Markdown?', a: 'Сгенерируйте таблицу, скопируйте её и вставьте в блок кода (```), чтобы столбцы оставались выровненными. Для нативной таблицы Markdown, отображаемой как HTML, используйте синтаксис с вертикальными чертами — этот инструмент идеален для моноширинного вывода, комментариев в коде и терминала.' },
        { q: 'Можно ли выбрать разные стили рамок?', a: 'Да. Можно переключаться между стилями — одинарные линии, двойные линии и закруглённые углы — и задавать выравнивание столбцов по левому краю, по центру или по правому краю.' },
        { q: 'Работает ли это в комментариях к коду?', a: 'Безусловно — текстовые ASCII-таблицы идеально подходят для документирования данных в комментариях кода, где рендеринг Markdown недоступен.' },
      ],
    },
    ja: {
      heading: 'ASCIIテーブル生成ツールについて',
      intro:
        '行と列を、Markdownファイルやコードコメント、CLI出力、ドキュメント向けの整ったプレーンテキスト表に変換します。枠線のスタイルを選び、揃えを設定して、等幅環境でぴったり揃う表をコピーできます。',
      faq: [
        { q: 'MarkdownにASCII表を追加するには？', a: '表を生成してコピーし、コードブロック（```）内に貼り付けると列が揃ったまま表示されます。HTMLとしてレンダリングされるネイティブなMarkdown表が必要な場合はパイプ記法を使ってください。本ツールは等幅・コードコメント・ターミナル用途に最適です。' },
        { q: '枠線のスタイルは選べますか？', a: 'はい。単線・二重線・角丸などのスタイルを切り替え、列の揃えを左・中央・右に設定できます。' },
        { q: 'コードコメント内でも使えますか？', a: 'もちろんです。プレーンテキストのASCII表は、Markdownのレンダリングが使えないコードコメント内でデータを記載するのに最適です。' },
      ],
    },
  },
  'banner': {
    en: {
      heading: 'About the ASCII Banner Generator',
      intro:
        'Turn any text into a large ASCII-art banner using FIGlet-style fonts. Great for CLI splash screens, README headers, terminal login messages, and code-comment section dividers. Choose a font, type your text, and copy the result.',
      faq: [
        { q: 'What is FIGlet?', a: 'FIGlet is a classic program that renders text as large letters made up of smaller ASCII characters. This tool generates the same style of text banners directly in your browser.' },
        { q: 'Where can I use ASCII banners?', a: 'They are popular for CLI tool headers, README titles, MOTD/login messages on servers, and as visual dividers inside source code.' },
        { q: 'Can I change the font?', a: 'Yes, you can pick from several FIGlet-style fonts and layouts, then preview and copy the banner instantly.' },
      ],
    },
    fr: {
      heading: 'À propos du générateur de bannière ASCII',
      intro:
        "Transformez n'importe quel texte en une grande bannière ASCII avec des polices façon FIGlet. Idéal pour les écrans d'accueil CLI, les en-têtes de README, les messages de connexion en terminal et les séparateurs de sections dans le code. Choisissez une police, saisissez votre texte et copiez le résultat.",
      faq: [
        { q: "Qu'est-ce que FIGlet ?", a: 'FIGlet est un programme classique qui affiche du texte sous forme de grandes lettres composées de petits caractères ASCII. Cet outil génère le même style de bannières directement dans votre navigateur.' },
        { q: 'Où utiliser des bannières ASCII ?', a: "Elles sont prisées pour les en-têtes d'outils CLI, les titres de README, les messages de connexion (MOTD) sur les serveurs et comme séparateurs visuels dans le code source." },
        { q: 'Puis-je changer la police ?', a: 'Oui, vous pouvez choisir parmi plusieurs polices et dispositions façon FIGlet, puis prévisualiser et copier la bannière instantanément.' },
      ],
    },
    es: {
      heading: 'Acerca del Generador de Banners ASCII',
      intro:
        'Convierte cualquier texto en un gran banner de arte ASCII usando fuentes estilo FIGlet. Ideal para pantallas de inicio de CLI, encabezados de README, mensajes de inicio de sesión en terminal y separadores de secciones en comentarios de código. Elige una fuente, escribe tu texto y copia el resultado.',
      faq: [
        { q: '¿Qué es FIGlet?', a: 'FIGlet es un programa clásico que representa texto como letras grandes formadas por caracteres ASCII más pequeños. Esta herramienta genera el mismo estilo de banners de texto directamente en tu navegador.' },
        { q: '¿Dónde puedo usar los banners ASCII?', a: 'Son populares para encabezados de herramientas CLI, títulos de README, mensajes de inicio de sesión (MOTD) en servidores y como separadores visuales dentro del código fuente.' },
        { q: '¿Puedo cambiar la fuente?', a: 'Sí, puedes elegir entre varias fuentes y disposiciones estilo FIGlet, y luego previsualizar y copiar el banner al instante.' },
      ],
    },
    de: {
      heading: 'Über den ASCII-Banner-Generator',
      intro:
        'Verwandeln Sie beliebigen Text in ein großes ASCII-Art-Banner mit FIGlet-Schriften. Ideal für CLI-Startbildschirme, README-Überschriften, Terminal-Login-Nachrichten und Abschnittstrenner in Codekommentaren. Wählen Sie eine Schrift, geben Sie Ihren Text ein und kopieren Sie das Ergebnis.',
      faq: [
        { q: 'Was ist FIGlet?', a: 'FIGlet ist ein klassisches Programm, das Text als große Buchstaben aus kleineren ASCII-Zeichen darstellt. Dieses Tool erzeugt denselben Banner-Stil direkt in Ihrem Browser.' },
        { q: 'Wo kann ich ASCII-Banner verwenden?', a: 'Sie sind beliebt für Header von CLI-Tools, README-Titel, MOTD-/Login-Nachrichten auf Servern und als visuelle Trenner im Quellcode.' },
        { q: 'Kann ich die Schrift ändern?', a: 'Ja, Sie können aus mehreren FIGlet-Schriften und Layouts wählen und das Banner sofort in der Vorschau ansehen und kopieren.' },
      ],
    },
    it: {
      heading: 'Informazioni sul Generatore di Banner ASCII',
      intro:
        'Trasforma qualsiasi testo in un grande banner in ASCII art usando font in stile FIGlet. Ideale per schermate iniziali della CLI, intestazioni di README, messaggi di login del terminale e separatori di sezione nei commenti di codice. Scegli un font, scrivi il testo e copia il risultato.',
      faq: [
        { q: "Che cos'è FIGlet?", a: 'FIGlet è un programma classico che rappresenta il testo come grandi lettere composte da caratteri ASCII più piccoli. Questo strumento genera lo stesso stile di banner direttamente nel browser.' },
        { q: 'Dove posso usare i banner ASCII?', a: 'Sono molto usati per le intestazioni di strumenti CLI, i titoli dei README, i messaggi di login (MOTD) sui server e come separatori visivi nel codice sorgente.' },
        { q: 'Posso cambiare il font?', a: "Sì, puoi scegliere tra diversi font e layout in stile FIGlet, quindi visualizzare l'anteprima e copiare il banner all'istante." },
      ],
    },
    pt: {
      heading: 'Sobre o Gerador de Banners ASCII',
      intro:
        'Transforme qualquer texto num grande banner de arte ASCII usando fontes estilo FIGlet. Ideal para ecrãs iniciais de CLI, cabeçalhos de README, mensagens de início de sessão no terminal e separadores de secção em comentários de código. Escolha uma fonte, escreva o seu texto e copie o resultado.',
      faq: [
        { q: 'O que é o FIGlet?', a: 'O FIGlet é um programa clássico que representa texto como letras grandes formadas por caracteres ASCII mais pequenos. Esta ferramenta gera o mesmo estilo de banners diretamente no seu navegador.' },
        { q: 'Onde posso usar banners ASCII?', a: 'São populares para cabeçalhos de ferramentas CLI, títulos de README, mensagens de início de sessão (MOTD) em servidores e como separadores visuais no código-fonte.' },
        { q: 'Posso mudar a fonte?', a: 'Sim, pode escolher entre várias fontes e disposições estilo FIGlet e, depois, pré-visualizar e copiar o banner instantaneamente.' },
      ],
    },
    ru: {
      heading: 'О генераторе ASCII-баннеров',
      intro:
        'Превращайте любой текст в крупный баннер в стиле ASCII-арт с помощью шрифтов FIGlet. Идеально для заставок CLI, заголовков README, приветственных сообщений в терминале и разделителей секций в комментариях к коду. Выберите шрифт, введите текст и скопируйте результат.',
      faq: [
        { q: 'Что такое FIGlet?', a: 'FIGlet — это классическая программа, которая отображает текст крупными буквами, составленными из мелких ASCII-символов. Этот инструмент создаёт баннеры того же стиля прямо в браузере.' },
        { q: 'Где можно использовать ASCII-баннеры?', a: 'Они популярны для заголовков CLI-инструментов, названий README, приветственных сообщений (MOTD) на серверах и как визуальные разделители в исходном коде.' },
        { q: 'Можно ли менять шрифт?', a: 'Да, можно выбрать один из нескольких шрифтов и раскладок в стиле FIGlet, затем сразу просмотреть и скопировать баннер.' },
      ],
    },
    ja: {
      heading: 'ASCIIバナー生成ツールについて',
      intro:
        'FIGlet風フォントを使って、任意のテキストを大きなASCIIアートのバナーに変換します。CLIのスプラッシュ画面、READMEの見出し、ターミナルのログインメッセージ、コードコメントのセクション区切りに最適です。フォントを選んでテキストを入力し、結果をコピーできます。',
      faq: [
        { q: 'FIGletとは？', a: 'FIGletは、テキストを小さなASCII文字で構成した大きな文字として描画する定番プログラムです。本ツールは同じスタイルのバナーをブラウザ上で生成します。' },
        { q: 'ASCIIバナーはどこで使えますか？', a: 'CLIツールのヘッダー、READMEのタイトル、サーバーのログイン（MOTD）メッセージ、ソースコード内の視覚的な区切りとしてよく使われます。' },
        { q: 'フォントは変更できますか？', a: 'はい。複数のFIGlet風フォントとレイアウトから選び、その場でプレビューしてバナーをコピーできます。' },
      ],
    },
  },
  'sparkline': {
    en: {
      heading: 'About the ASCII Sparkline Generator',
      intro:
        'Turn a list of numbers into a compact inline sparkline made of text characters (▁▂▃▄▅▆▇█). Perfect for showing trends in READMEs, dashboards, commit messages, and terminal output where a full chart would be overkill.',
      faq: [
        { q: 'What is a sparkline?', a: 'A sparkline is a tiny, word-sized chart that shows the shape of a data series without axes or labels. ASCII sparklines use block characters so they work in plain text anywhere.' },
        { q: 'How do I use it?', a: 'Paste or type your numbers separated by spaces or commas, and the tool renders a sparkline you can copy into any text.' },
        { q: 'Where do ASCII sparklines work?', a: 'Anywhere monospace text is supported — READMEs, CLI output, commit messages, chat, and dashboards.' },
      ],
    },
    fr: {
      heading: 'À propos du générateur de sparkline ASCII',
      intro:
        'Transformez une liste de nombres en un sparkline compact composé de caractères texte (▁▂▃▄▅▆▇█). Parfait pour montrer des tendances dans les README, tableaux de bord, messages de commit et sorties terminal où un vrai graphique serait excessif.',
      faq: [
        { q: "Qu'est-ce qu'un sparkline ?", a: "Un sparkline est un mini-graphique de la taille d'un mot qui montre la forme d'une série de données sans axes ni étiquettes. Les sparklines ASCII utilisent des caractères de bloc pour fonctionner en texte brut partout." },
        { q: "Comment l'utiliser ?", a: "Collez ou saisissez vos nombres séparés par des espaces ou des virgules, et l'outil génère un sparkline à copier dans n'importe quel texte." },
        { q: 'Où fonctionnent les sparklines ASCII ?', a: 'Partout où le texte à chasse fixe est pris en charge — README, sorties CLI, messages de commit, chats et tableaux de bord.' },
      ],
    },
    es: {
      heading: 'Acerca del Generador de Sparklines ASCII',
      intro:
        'Convierte una lista de números en un sparkline en línea compacto hecho de caracteres de texto (▁▂▃▄▅▆▇█). Perfecto para mostrar tendencias en README, paneles, mensajes de commit y salida de terminal donde un gráfico completo sería excesivo.',
      faq: [
        { q: '¿Qué es un sparkline?', a: 'Un sparkline es un gráfico diminuto del tamaño de una palabra que muestra la forma de una serie de datos sin ejes ni etiquetas. Los sparklines ASCII usan caracteres de bloque para funcionar en texto plano en cualquier lugar.' },
        { q: '¿Cómo lo uso?', a: 'Pega o escribe tus números separados por espacios o comas, y la herramienta genera un sparkline que puedes copiar en cualquier texto.' },
        { q: '¿Dónde funcionan los sparklines ASCII?', a: 'En cualquier lugar donde se admita texto monoespaciado — README, salida de CLI, mensajes de commit, chats y paneles.' },
      ],
    },
    de: {
      heading: 'Über den ASCII-Sparkline-Generator',
      intro:
        'Verwandeln Sie eine Zahlenliste in eine kompakte Inline-Sparkline aus Textzeichen (▁▂▃▄▅▆▇█). Ideal, um Trends in READMEs, Dashboards, Commit-Nachrichten und Terminal-Ausgaben zu zeigen, wo ein vollständiges Diagramm übertrieben wäre.',
      faq: [
        { q: 'Was ist eine Sparkline?', a: 'Eine Sparkline ist ein winziges, wortgroßes Diagramm, das die Form einer Datenreihe ohne Achsen oder Beschriftungen zeigt. ASCII-Sparklines verwenden Blockzeichen und funktionieren daher überall im Klartext.' },
        { q: 'Wie verwende ich es?', a: 'Fügen Sie Ihre Zahlen durch Leerzeichen oder Kommas getrennt ein oder tippen Sie sie, und das Tool erzeugt eine Sparkline, die Sie in beliebigen Text kopieren können.' },
        { q: 'Wo funktionieren ASCII-Sparklines?', a: 'Überall dort, wo Monospace-Text unterstützt wird — READMEs, CLI-Ausgaben, Commit-Nachrichten, Chats und Dashboards.' },
      ],
    },
    it: {
      heading: 'Informazioni sul Generatore di Sparkline ASCII',
      intro:
        'Trasforma un elenco di numeri in uno sparkline inline compatto fatto di caratteri di testo (▁▂▃▄▅▆▇█). Perfetto per mostrare tendenze in README, dashboard, messaggi di commit e output del terminale dove un grafico completo sarebbe eccessivo.',
      faq: [
        { q: "Che cos'è uno sparkline?", a: "Uno sparkline è un minuscolo grafico grande quanto una parola che mostra la forma di una serie di dati senza assi né etichette. Gli sparkline ASCII usano caratteri a blocco per funzionare ovunque in testo semplice." },
        { q: 'Come si usa?', a: 'Incolla o digita i tuoi numeri separati da spazi o virgole e lo strumento genera uno sparkline da copiare in qualsiasi testo.' },
        { q: 'Dove funzionano gli sparkline ASCII?', a: 'Ovunque sia supportato il testo a spaziatura fissa — README, output CLI, messaggi di commit, chat e dashboard.' },
      ],
    },
    pt: {
      heading: 'Sobre o Gerador de Sparklines ASCII',
      intro:
        'Transforme uma lista de números num sparkline inline compacto feito de caracteres de texto (▁▂▃▄▅▆▇█). Perfeito para mostrar tendências em READMEs, painéis, mensagens de commit e saída de terminal onde um gráfico completo seria exagerado.',
      faq: [
        { q: 'O que é um sparkline?', a: 'Um sparkline é um gráfico minúsculo do tamanho de uma palavra que mostra a forma de uma série de dados sem eixos nem rótulos. Os sparklines ASCII usam caracteres de bloco para funcionar em texto simples em qualquer lugar.' },
        { q: 'Como o utilizo?', a: 'Cole ou escreva os seus números separados por espaços ou vírgulas, e a ferramenta gera um sparkline que pode copiar para qualquer texto.' },
        { q: 'Onde funcionam os sparklines ASCII?', a: 'Em qualquer lugar onde haja suporte a texto monoespaçado — READMEs, saída de CLI, mensagens de commit, chats e painéis.' },
      ],
    },
    ru: {
      heading: 'О генераторе ASCII-спарклайнов',
      intro:
        'Превращайте список чисел в компактный строчный спарклайн из текстовых символов (▁▂▃▄▅▆▇█). Идеально для отображения трендов в README, дашбордах, сообщениях коммитов и выводе терминала, где полноценный график был бы избыточен.',
      faq: [
        { q: 'Что такое спарклайн?', a: 'Спарклайн — это крошечный график размером со слово, показывающий форму ряда данных без осей и подписей. ASCII-спарклайны используют блочные символы, поэтому работают в обычном тексте где угодно.' },
        { q: 'Как им пользоваться?', a: 'Вставьте или введите числа через пробелы или запятые, и инструмент построит спарклайн, который можно скопировать в любой текст.' },
        { q: 'Где работают ASCII-спарклайны?', a: 'Везде, где поддерживается моноширинный текст — README, вывод CLI, сообщения коммитов, чаты и дашборды.' },
      ],
    },
    ja: {
      heading: 'ASCIIスパークライン生成ツールについて',
      intro:
        '数値のリストを、テキスト文字（▁▂▃▄▅▆▇█）で作るコンパクトなインラインのスパークラインに変換します。フルサイズのグラフでは大げさな場面、README、ダッシュボード、コミットメッセージ、ターミナル出力での傾向表示に最適です。',
      faq: [
        { q: 'スパークラインとは？', a: 'スパークラインは、軸やラベルのない単語サイズの小さなグラフで、データ系列の形状を示します。ASCIIスパークラインはブロック文字を使うため、どこでもプレーンテキストで機能します。' },
        { q: 'どう使いますか？', a: 'スペースまたはカンマ区切りで数値を貼り付けるか入力すると、任意のテキストにコピーできるスパークラインが生成されます。' },
        { q: 'ASCIIスパークラインはどこで使えますか？', a: '等幅テキストが使える場所ならどこでも — README、CLI出力、コミットメッセージ、チャット、ダッシュボードなど。' },
      ],
    },
  },
  'ascii-emoji': {
    en: {
      heading: 'About the ASCII Emoji & Kaomoji Generator',
      intro:
        'Browse and copy hundreds of ASCII emoji and kaomoji — Japanese-style text faces like ¯\\_(ツ)_/¯ and (╯°□°)╯︵ ┻━┻. Built entirely from text characters, they work in chats, commit messages, code comments, and social posts where image emoji do not.',
      faq: [
        { q: 'What is a kaomoji?', a: 'A kaomoji is a Japanese emoticon made from text characters that can be read without tilting your head, such as (＾▽＾). Unlike Western emoticons, they are read upright.' },
        { q: 'How do I use them?', a: 'Click any face to copy it to your clipboard, then paste it wherever you need — chat, code, README, or social media.' },
        { q: 'Do they work everywhere?', a: 'Because they are plain text, kaomoji and ASCII emoji work in almost any text field, including places that do not support image-based emoji.' },
      ],
    },
    fr: {
      heading: "À propos du générateur d'émoji ASCII & kaomoji",
      intro:
        "Parcourez et copiez des centaines d'émojis ASCII et kaomoji — des émoticônes japonaises comme ¯\\_(ツ)_/¯ et (╯°□°)╯︵ ┻━┻. Entièrement composés de caractères texte, ils fonctionnent dans les chats, messages de commit, commentaires de code et publications sociales, là où les émojis images ne passent pas.",
      faq: [
        { q: "Qu'est-ce qu'un kaomoji ?", a: "Un kaomoji est une émoticône japonaise composée de caractères texte qui se lit sans pencher la tête, comme (＾▽＾). Contrairement aux émoticônes occidentales, il se lit à l'endroit." },
        { q: 'Comment les utiliser ?', a: 'Cliquez sur un visage pour le copier dans le presse-papiers, puis collez-le où vous voulez — chat, code, README ou réseaux sociaux.' },
        { q: 'Fonctionnent-ils partout ?', a: 'Comme ils sont en texte brut, les kaomoji et émojis ASCII fonctionnent dans presque tous les champs de texte, y compris là où les émojis images ne sont pas pris en charge.' },
      ],
    },
    es: {
      heading: 'Acerca del Generador de Emojis ASCII y Kaomoji',
      intro:
        'Explora y copia cientos de emojis ASCII y kaomoji — caritas de texto de estilo japonés como ¯\\_(ツ)_/¯ y (╯°□°)╯︵ ┻━┻. Hechos completamente de caracteres de texto, funcionan en chats, mensajes de commit, comentarios de código y publicaciones sociales donde los emojis de imagen no funcionan.',
      faq: [
        { q: '¿Qué es un kaomoji?', a: 'Un kaomoji es un emoticono japonés hecho con caracteres de texto que se puede leer sin inclinar la cabeza, como (＾▽＾). A diferencia de los emoticonos occidentales, se leen en posición vertical.' },
        { q: '¿Cómo los uso?', a: 'Haz clic en cualquier carita para copiarla al portapapeles y luego pégala donde la necesites — chat, código, README o redes sociales.' },
        { q: '¿Funcionan en todas partes?', a: 'Al ser texto plano, los kaomoji y emojis ASCII funcionan en casi cualquier campo de texto, incluidos los lugares que no admiten emojis basados en imágenes.' },
      ],
    },
    de: {
      heading: 'Über den ASCII-Emoji- & Kaomoji-Generator',
      intro:
        'Durchsuchen und kopieren Sie Hunderte von ASCII-Emojis und Kaomoji — japanische Text-Smileys wie ¯\\_(ツ)_/¯ und (╯°□°)╯︵ ┻━┻. Da sie vollständig aus Textzeichen bestehen, funktionieren sie in Chats, Commit-Nachrichten, Codekommentaren und Social-Media-Posts, wo Bild-Emojis nicht funktionieren.',
      faq: [
        { q: 'Was ist ein Kaomoji?', a: 'Ein Kaomoji ist ein japanisches Emoticon aus Textzeichen, das man ohne Kopfneigung lesen kann, z. B. (＾▽＾). Anders als westliche Emoticons werden sie aufrecht gelesen.' },
        { q: 'Wie verwende ich sie?', a: 'Klicken Sie auf ein Gesicht, um es in die Zwischenablage zu kopieren, und fügen Sie es dann ein, wo Sie es brauchen — Chat, Code, README oder Social Media.' },
        { q: 'Funktionieren sie überall?', a: 'Da sie reiner Text sind, funktionieren Kaomoji und ASCII-Emojis in fast jedem Textfeld, auch an Orten, die keine bildbasierten Emojis unterstützen.' },
      ],
    },
    it: {
      heading: 'Informazioni sul Generatore di Emoji ASCII e Kaomoji',
      intro:
        'Sfoglia e copia centinaia di emoji ASCII e kaomoji — faccine di testo in stile giapponese come ¯\\_(ツ)_/¯ e (╯°□°)╯︵ ┻━┻. Composti interamente da caratteri di testo, funzionano in chat, messaggi di commit, commenti di codice e post social dove le emoji a immagine non funzionano.',
      faq: [
        { q: "Che cos'è un kaomoji?", a: "Un kaomoji è un'emoticon giapponese fatta di caratteri di testo che si legge senza inclinare la testa, come (＾▽＾). A differenza delle emoticon occidentali, si leggono in verticale." },
        { q: 'Come si usano?', a: 'Clicca su una faccina per copiarla negli appunti, poi incollala dove ti serve — chat, codice, README o social.' },
        { q: 'Funzionano ovunque?', a: 'Essendo testo semplice, i kaomoji e le emoji ASCII funzionano in quasi tutti i campi di testo, inclusi i luoghi che non supportano le emoji a immagine.' },
      ],
    },
    pt: {
      heading: 'Sobre o Gerador de Emojis ASCII e Kaomoji',
      intro:
        'Navegue e copie centenas de emojis ASCII e kaomoji — carinhas de texto de estilo japonês como ¯\\_(ツ)_/¯ e (╯°□°)╯︵ ┻━┻. Feitos inteiramente de caracteres de texto, funcionam em chats, mensagens de commit, comentários de código e publicações sociais onde os emojis de imagem não funcionam.',
      faq: [
        { q: 'O que é um kaomoji?', a: 'Um kaomoji é um emoticon japonês feito de caracteres de texto que pode ser lido sem inclinar a cabeça, como (＾▽＾). Ao contrário dos emoticons ocidentais, são lidos na vertical.' },
        { q: 'Como os utilizo?', a: 'Clique numa carinha para a copiar para a área de transferência e depois cole-a onde precisar — chat, código, README ou redes sociais.' },
        { q: 'Funcionam em todo o lado?', a: 'Por serem texto simples, os kaomoji e emojis ASCII funcionam em quase qualquer campo de texto, incluindo locais que não suportam emojis de imagem.' },
      ],
    },
    ru: {
      heading: 'О генераторе ASCII-эмодзи и каомодзи',
      intro:
        'Просматривайте и копируйте сотни ASCII-эмодзи и каомодзи — текстовых японских смайлов вроде ¯\\_(ツ)_/¯ и (╯°□°)╯︵ ┻━┻. Полностью состоящие из текстовых символов, они работают в чатах, сообщениях коммитов, комментариях к коду и постах в соцсетях, где не работают графические эмодзи.',
      faq: [
        { q: 'Что такое каомодзи?', a: 'Каомодзи — это японский смайл из текстовых символов, который читается без наклона головы, например (＾▽＾). В отличие от западных смайлов, они читаются вертикально.' },
        { q: 'Как ими пользоваться?', a: 'Нажмите на любой смайл, чтобы скопировать его в буфер обмена, затем вставьте туда, где нужно — в чат, код, README или соцсети.' },
        { q: 'Работают ли они везде?', a: 'Поскольку это обычный текст, каомодзи и ASCII-эмодзи работают почти в любом текстовом поле, включая места, где не поддерживаются графические эмодзи.' },
      ],
    },
    ja: {
      heading: 'ASCII絵文字・顔文字ジェネレーターについて',
      intro:
        '¯\\_(ツ)_/¯ や (╯°□°)╯︵ ┻━┻ のような日本語スタイルのテキスト顔文字（ASCII絵文字・顔文字）を数百種類から探してコピーできます。すべてテキスト文字で構成されているため、画像の絵文字が使えないチャットやコミットメッセージ、コードコメント、SNS投稿でも機能します。',
      faq: [
        { q: '顔文字（かおもじ）とは？', a: '顔文字は、(＾▽＾) のように頭を傾けずに読めるテキスト文字でできた日本の絵文字です。欧米のエモティコンと違い、そのまま正位置で読めます。' },
        { q: 'どう使いますか？', a: '好きな顔文字をクリックするとクリップボードにコピーされます。あとはチャットやコード、README、SNSなど必要な場所に貼り付けるだけです。' },
        { q: 'どこでも使えますか？', a: 'プレーンテキストなので、画像ベースの絵文字に対応していない場所も含め、ほとんどのテキスト入力欄で顔文字・ASCII絵文字が使えます。' },
      ],
    },
  },
  'markdown-editor': {
    en: {
      heading: 'About the Markdown Editor',
      intro:
        'This free online Markdown editor renders your text live as you type, with GitHub Flavored Markdown support (tables, task lists, strikethrough) and syntax highlighting for code blocks. Use the formatting toolbar for bold, italic, headings, lists, links and quotes, then copy the Markdown or the rendered HTML, or download a .md file. Everything runs in your browser — nothing is uploaded.',
      faq: [
        { q: 'Is this Markdown editor free?', a: 'Yes. It is completely free, runs entirely in your browser, and needs no account. Your text is never sent to a server.' },
        { q: 'Does it support GitHub Flavored Markdown?', a: 'Yes. Tables, task lists and strikethrough all render in the live preview, so what you see matches how it will look on GitHub.' },
        { q: 'Can I export my document?', a: 'You can copy the Markdown source, copy the rendered HTML, or download your text as a .md file with one click.' },
        { q: 'Are code blocks highlighted?', a: 'Yes. Fenced code blocks are syntax-highlighted in the preview; add a language name after the opening fence for the best results.' },
      ],
    },
    fr: {
      heading: "À propos de l'éditeur Markdown",
      intro:
        "Cet éditeur Markdown en ligne gratuit affiche votre texte en temps réel pendant la saisie, avec le support du GitHub Flavored Markdown (tableaux, listes de tâches, texte barré) et la coloration syntaxique des blocs de code. Utilisez la barre de formatage pour le gras, l'italique, les titres, les listes, les liens et les citations, puis copiez le Markdown ou le HTML rendu, ou téléchargez un fichier .md. Tout s'exécute dans votre navigateur — rien n'est envoyé sur un serveur.",
      faq: [
        { q: "L'éditeur Markdown est-il gratuit ?", a: 'Oui. Il est entièrement gratuit, fonctionne dans votre navigateur et ne nécessite aucun compte. Votre texte n\'est jamais envoyé sur un serveur.' },
        { q: 'Prend-il en charge le GitHub Flavored Markdown ?', a: "Oui. Les tableaux, listes de tâches et texte barré s'affichent dans l'aperçu live, donc ce que vous voyez correspond au rendu GitHub." },
        { q: 'Puis-je exporter mon document ?', a: 'Vous pouvez copier la source Markdown, copier le HTML rendu, ou télécharger votre texte en fichier .md en un clic.' },
        { q: 'Les blocs de code sont-ils colorés ?', a: "Oui. Les blocs de code sont colorés dans l'aperçu ; ajoutez un nom de langage après la clôture d'ouverture pour un meilleur résultat." },
      ],
    },
    es: {
      heading: 'Acerca del Editor Markdown',
      intro:
        'Este editor Markdown en línea gratuito renderiza tu texto en vivo mientras escribes, con soporte para GitHub Flavored Markdown (tablas, listas de tareas, tachado) y resaltado de sintaxis en los bloques de código. Usa la barra de formato para negrita, cursiva, encabezados, listas, enlaces y citas, y luego copia el Markdown o el HTML renderizado, o descarga un archivo .md. Todo se ejecuta en tu navegador — nada se sube.',
      faq: [
        { q: '¿Es gratuito este editor Markdown?', a: 'Sí. Es completamente gratuito, funciona en tu navegador y no requiere cuenta. Tu texto nunca se envía a un servidor.' },
        { q: '¿Admite GitHub Flavored Markdown?', a: 'Sí. Las tablas, listas de tareas y texto tachado se muestran en la vista previa en vivo, así que lo que ves coincide con GitHub.' },
        { q: '¿Puedo exportar mi documento?', a: 'Puedes copiar el código Markdown, copiar el HTML renderizado o descargar tu texto como archivo .md con un clic.' },
        { q: '¿Se resaltan los bloques de código?', a: 'Sí. Los bloques de código se resaltan en la vista previa; añade un nombre de lenguaje tras la apertura para mejores resultados.' },
      ],
    },
    de: {
      heading: 'Über den Markdown-Editor',
      intro:
        'Dieser kostenlose Online-Markdown-Editor stellt Ihren Text live beim Tippen dar, mit Unterstützung für GitHub Flavored Markdown (Tabellen, Aufgabenlisten, Durchstreichungen) und Syntaxhervorhebung für Codeblöcke. Nutzen Sie die Formatierungsleiste für Fett, Kursiv, Überschriften, Listen, Links und Zitate, kopieren Sie dann das Markdown oder das gerenderte HTML oder laden Sie eine .md-Datei herunter. Alles läuft in Ihrem Browser — nichts wird hochgeladen.',
      faq: [
        { q: 'Ist dieser Markdown-Editor kostenlos?', a: 'Ja. Er ist komplett kostenlos, läuft in Ihrem Browser und erfordert kein Konto. Ihr Text wird nie an einen Server gesendet.' },
        { q: 'Unterstützt er GitHub Flavored Markdown?', a: 'Ja. Tabellen, Aufgabenlisten und Durchstreichungen werden in der Live-Vorschau dargestellt, sodass die Anzeige der Darstellung auf GitHub entspricht.' },
        { q: 'Kann ich mein Dokument exportieren?', a: 'Sie können den Markdown-Quelltext kopieren, das gerenderte HTML kopieren oder Ihren Text mit einem Klick als .md-Datei herunterladen.' },
        { q: 'Werden Codeblöcke hervorgehoben?', a: 'Ja. Codeblöcke werden in der Vorschau syntaxhervorgehoben; fügen Sie nach der öffnenden Zeile einen Sprachnamen hinzu, um beste Ergebnisse zu erzielen.' },
      ],
    },
    it: {
      heading: "Informazioni sull'Editor Markdown",
      intro:
        "Questo editor Markdown online gratuito renderizza il testo in tempo reale mentre scrivi, con supporto per il GitHub Flavored Markdown (tabelle, elenchi di attività, barrato) ed evidenziazione della sintassi nei blocchi di codice. Usa la barra di formattazione per grassetto, corsivo, titoli, elenchi, link e citazioni, poi copia il Markdown o l'HTML renderizzato, oppure scarica un file .md. Tutto viene eseguito nel browser — nulla viene caricato.",
      faq: [
        { q: "L'editor Markdown è gratuito?", a: 'Sì. È completamente gratuito, funziona nel browser e non richiede alcun account. Il testo non viene mai inviato a un server.' },
        { q: 'Supporta il GitHub Flavored Markdown?', a: "Sì. Tabelle, elenchi di attività e testo barrato compaiono nell'anteprima live, quindi ciò che vedi corrisponde a GitHub." },
        { q: 'Posso esportare il documento?', a: "Puoi copiare il sorgente Markdown, copiare l'HTML renderizzato o scaricare il testo come file .md con un clic." },
        { q: 'I blocchi di codice sono evidenziati?', a: "Sì. I blocchi di codice sono evidenziati nell'anteprima; aggiungi un nome di linguaggio dopo l'apertura per risultati migliori." },
      ],
    },
    pt: {
      heading: 'Sobre o Editor Markdown',
      intro:
        'Este editor Markdown online gratuito renderiza o seu texto ao vivo enquanto escreve, com suporte a GitHub Flavored Markdown (tabelas, listas de tarefas, rasurado) e realce de sintaxe nos blocos de código. Use a barra de formatação para negrito, itálico, títulos, listas, links e citações, depois copie o Markdown ou o HTML renderizado, ou baixe um ficheiro .md. Tudo é executado no seu navegador — nada é enviado.',
      faq: [
        { q: 'Este editor Markdown é gratuito?', a: 'Sim. É totalmente gratuito, funciona no seu navegador e não requer conta. O seu texto nunca é enviado para um servidor.' },
        { q: 'Suporta GitHub Flavored Markdown?', a: 'Sim. Tabelas, listas de tarefas e texto rasurado aparecem na pré-visualização ao vivo, por isso o que vê corresponde ao GitHub.' },
        { q: 'Posso exportar o meu documento?', a: 'Pode copiar o código Markdown, copiar o HTML renderizado ou baixar o seu texto como ficheiro .md com um clique.' },
        { q: 'Os blocos de código são realçados?', a: 'Sim. Os blocos de código são realçados na pré-visualização; adicione um nome de linguagem após a abertura para melhores resultados.' },
      ],
    },
    ru: {
      heading: 'О редакторе Markdown',
      intro:
        'Этот бесплатный онлайн-редактор Markdown отображает ваш текст в реальном времени по мере набора, с поддержкой GitHub Flavored Markdown (таблицы, списки задач, зачёркивание) и подсветкой синтаксиса в блоках кода. Используйте панель форматирования для жирного, курсива, заголовков, списков, ссылок и цитат, затем копируйте Markdown или отрендеренный HTML либо скачивайте файл .md. Всё работает в браузере — ничего не загружается.',
      faq: [
        { q: 'Этот редактор Markdown бесплатный?', a: 'Да. Он полностью бесплатный, работает в браузере и не требует учётной записи. Ваш текст никогда не отправляется на сервер.' },
        { q: 'Поддерживает ли он GitHub Flavored Markdown?', a: 'Да. Таблицы, списки задач и зачёркивание отображаются в предпросмотре, поэтому увиденное соответствует виду на GitHub.' },
        { q: 'Можно ли экспортировать документ?', a: 'Вы можете скопировать исходный Markdown, скопировать отрендеренный HTML или скачать текст в виде файла .md в один клик.' },
        { q: 'Подсвечиваются ли блоки кода?', a: 'Да. Блоки кода подсвечиваются в предпросмотре; для лучшего результата укажите имя языка после открывающей строки.' },
      ],
    },
    ja: {
      heading: 'Markdownエディタについて',
      intro:
        'この無料オンラインMarkdownエディタは、入力しながらリアルタイムでテキストをレンダリングします。GitHub Flavored Markdown（表・タスクリスト・打ち消し線）とコードブロックの構文ハイライトに対応。書式ツールバーで太字・斜体・見出し・リスト・リンク・引用を挿入し、MarkdownやレンダリングされたHTMLをコピー、または.mdファイルとしてダウンロードできます。すべてブラウザ内で動作し、何もアップロードされません。',
      faq: [
        { q: 'このMarkdownエディタは無料ですか？', a: 'はい。完全に無料で、ブラウザ内で動作し、アカウントも不要です。テキストがサーバーに送信されることはありません。' },
        { q: 'GitHub Flavored Markdownに対応していますか？', a: 'はい。表・タスクリスト・打ち消し線がライブプレビューに表示されるため、GitHubでの見え方と一致します。' },
        { q: 'ドキュメントをエクスポートできますか？', a: 'Markdownソースのコピー、レンダリング済みHTMLのコピー、.mdファイルのダウンロードがワンクリックで行えます。' },
        { q: 'コードブロックはハイライトされますか？', a: 'はい。コードブロックはプレビューでハイライトされます。開始行の後に言語名を書くとより良い結果になります。' },
      ],
    },
  },
  'markdown-guide': {
    en: {
      heading: 'About this Markdown Guide',
      intro:
        'A clear, example-driven Markdown cheat sheet covering the syntax you use every day: headings, bold and italic, lists, links, images, tables, code blocks, blockquotes, and more. Each example shows the Markdown source next to its rendered output.',
      faq: [
        { q: 'What is Markdown?', a: 'Markdown is a lightweight markup language that lets you format plain text — headings, lists, links, emphasis — using simple, readable symbols. It is widely used for READMEs, documentation, and notes.' },
        { q: 'How do I write a code block in Markdown?', a: 'Wrap code in triple backticks (```) on their own lines, optionally adding a language name after the opening fence for syntax highlighting.' },
        { q: 'Does Markdown work the same everywhere?', a: 'Core syntax is consistent, but flavors differ. GitHub Flavored Markdown adds tables, task lists, and strikethrough on top of standard Markdown.' },
      ],
    },
    fr: {
      heading: 'À propos de ce guide Markdown',
      intro:
        "Une antisèche Markdown claire et illustrée couvrant la syntaxe du quotidien : titres, gras et italique, listes, liens, images, tableaux, blocs de code, citations et plus. Chaque exemple montre la source Markdown à côté de son rendu.",
      faq: [
        { q: "Qu'est-ce que le Markdown ?", a: 'Le Markdown est un langage de balisage léger qui permet de mettre en forme du texte brut — titres, listes, liens, emphase — avec des symboles simples et lisibles. Il est très utilisé pour les README, la documentation et les notes.' },
        { q: 'Comment écrire un bloc de code en Markdown ?', a: "Encadrez le code par trois accents graves (```) sur leurs propres lignes, en ajoutant éventuellement un nom de langage après la clôture d'ouverture pour la coloration syntaxique." },
        { q: 'Le Markdown fonctionne-t-il pareil partout ?', a: 'La syntaxe de base est cohérente, mais les variantes diffèrent. Le GitHub Flavored Markdown ajoute tableaux, listes de tâches et texte barré au Markdown standard.' },
      ],
    },
    es: {
      heading: 'Acerca de esta Guía de Markdown',
      intro:
        'Una chuleta de Markdown clara y con ejemplos que cubre la sintaxis que usas a diario: encabezados, negrita y cursiva, listas, enlaces, imágenes, tablas, bloques de código, citas y más. Cada ejemplo muestra el código Markdown junto a su resultado renderizado.',
      faq: [
        { q: '¿Qué es Markdown?', a: 'Markdown es un lenguaje de marcado ligero que te permite formatear texto plano — encabezados, listas, enlaces, énfasis — con símbolos simples y legibles. Se usa ampliamente para README, documentación y notas.' },
        { q: '¿Cómo escribo un bloque de código en Markdown?', a: 'Envuelve el código entre tres comillas invertidas (```) en sus propias líneas, añadiendo opcionalmente un nombre de lenguaje tras la apertura para el resaltado de sintaxis.' },
        { q: '¿Markdown funciona igual en todas partes?', a: 'La sintaxis básica es coherente, pero los sabores difieren. GitHub Flavored Markdown añade tablas, listas de tareas y texto tachado sobre el Markdown estándar.' },
      ],
    },
    de: {
      heading: 'Über diesen Markdown-Leitfaden',
      intro:
        'Ein klarer, beispielbasierter Markdown-Spickzettel, der die tägliche Syntax abdeckt: Überschriften, Fett und Kursiv, Listen, Links, Bilder, Tabellen, Codeblöcke, Zitate und mehr. Jedes Beispiel zeigt den Markdown-Quelltext neben seiner gerenderten Ausgabe.',
      faq: [
        { q: 'Was ist Markdown?', a: 'Markdown ist eine leichtgewichtige Auszeichnungssprache, mit der Sie Klartext formatieren können — Überschriften, Listen, Links, Hervorhebungen — mit einfachen, lesbaren Symbolen. Sie wird weithin für READMEs, Dokumentation und Notizen verwendet.' },
        { q: 'Wie schreibe ich einen Codeblock in Markdown?', a: 'Umschließen Sie Code mit drei Backticks (```) auf eigenen Zeilen und fügen Sie optional nach der öffnenden Zeile einen Sprachnamen für die Syntaxhervorhebung hinzu.' },
        { q: 'Funktioniert Markdown überall gleich?', a: 'Die Kernsyntax ist einheitlich, aber die Varianten unterscheiden sich. GitHub Flavored Markdown ergänzt Standard-Markdown um Tabellen, Aufgabenlisten und Durchstreichungen.' },
      ],
    },
    it: {
      heading: 'Informazioni su questa Guida Markdown',
      intro:
        'Un cheat sheet Markdown chiaro e ricco di esempi che copre la sintassi di tutti i giorni: titoli, grassetto e corsivo, elenchi, link, immagini, tabelle, blocchi di codice, citazioni e altro. Ogni esempio mostra il sorgente Markdown accanto al risultato renderizzato.',
      faq: [
        { q: "Che cos'è Markdown?", a: 'Markdown è un linguaggio di markup leggero che consente di formattare testo semplice — titoli, elenchi, link, enfasi — con simboli semplici e leggibili. È molto usato per README, documentazione e note.' },
        { q: 'Come scrivo un blocco di codice in Markdown?', a: "Racchiudi il codice tra tre backtick (```) su righe dedicate, aggiungendo facoltativamente un nome di linguaggio dopo l'apertura per l'evidenziazione della sintassi." },
        { q: 'Markdown funziona allo stesso modo ovunque?', a: 'La sintassi di base è coerente, ma le varianti differiscono. Il GitHub Flavored Markdown aggiunge tabelle, elenchi di attività e testo barrato al Markdown standard.' },
      ],
    },
    pt: {
      heading: 'Sobre este Guia de Markdown',
      intro:
        'Uma folha de consulta de Markdown clara e cheia de exemplos que abrange a sintaxe do dia a dia: títulos, negrito e itálico, listas, links, imagens, tabelas, blocos de código, citações e mais. Cada exemplo mostra o código Markdown ao lado do resultado renderizado.',
      faq: [
        { q: 'O que é Markdown?', a: 'Markdown é uma linguagem de marcação leve que permite formatar texto simples — títulos, listas, links, ênfase — com símbolos simples e legíveis. É amplamente usada para READMEs, documentação e notas.' },
        { q: 'Como escrevo um bloco de código em Markdown?', a: 'Envolva o código entre três crases (```) em linhas próprias, adicionando opcionalmente um nome de linguagem após a abertura para o realce de sintaxe.' },
        { q: 'O Markdown funciona igual em todo o lado?', a: 'A sintaxe básica é consistente, mas os sabores diferem. O GitHub Flavored Markdown acrescenta tabelas, listas de tarefas e texto rasurado ao Markdown padrão.' },
      ],
    },
    ru: {
      heading: 'Об этом руководстве по Markdown',
      intro:
        'Наглядная шпаргалка по Markdown с примерами, охватывающая повседневный синтаксис: заголовки, полужирный и курсив, списки, ссылки, изображения, таблицы, блоки кода, цитаты и другое. Каждый пример показывает исходный Markdown рядом с отрендеренным результатом.',
      faq: [
        { q: 'Что такое Markdown?', a: 'Markdown — это лёгкий язык разметки, позволяющий форматировать обычный текст — заголовки, списки, ссылки, выделение — с помощью простых и читаемых символов. Он широко используется для README, документации и заметок.' },
        { q: 'Как написать блок кода в Markdown?', a: 'Оберните код тремя обратными кавычками (```) на отдельных строках, при желании указав имя языка после открывающей строки для подсветки синтаксиса.' },
        { q: 'Markdown работает одинаково везде?', a: 'Базовый синтаксис единообразен, но диалекты различаются. GitHub Flavored Markdown добавляет к стандартному Markdown таблицы, списки задач и зачёркивание.' },
      ],
    },
    ja: {
      heading: 'このMarkdownガイドについて',
      intro:
        '見出し、太字と斜体、リスト、リンク、画像、表、コードブロック、引用など、日常的に使う記法を網羅した、分かりやすく例が豊富なMarkdownチートシートです。各例では、Markdownのソースとレンダリング結果を並べて表示します。',
      faq: [
        { q: 'Markdownとは？', a: 'Markdownは軽量なマークアップ言語で、シンプルで読みやすい記号を使ってプレーンテキストを整形できます（見出し、リスト、リンク、強調など）。README、ドキュメント、メモなどで広く使われています。' },
        { q: 'Markdownでコードブロックを書くには？', a: 'コードを独立した行のバッククォート3つ（```）で囲み、必要に応じて開始行の後に言語名を書くと構文ハイライトが適用されます。' },
        { q: 'Markdownはどこでも同じように動きますか？', a: '基本的な記法は共通ですが、方言があります。GitHub Flavored Markdownは、標準のMarkdownに表・タスクリスト・打ち消し線を追加します。' },
      ],
    },
  },
};

export function getToolContent(tool: ToolSlug, locale: string): ToolContent {
  const entry = CONTENT[tool];
  return (entry as Record<string, ToolContent | undefined>)[locale] ?? entry.en;
}
