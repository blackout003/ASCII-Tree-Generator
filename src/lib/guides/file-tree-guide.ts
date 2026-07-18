// Content for the "How to make a file tree for a GitHub README" guide.
// Authored in en (required, fallback) and fr. Code samples are language-neutral.
import type { FaqItem } from '@/lib/tool-seo-content';

export const GUIDE_SLUG = 'file-tree-for-github-readme';

export const CODE = {
  treeUnix: "tree -I 'node_modules|.git|dist'",
  treeWin: 'tree /F /A',
  exampleTree: `my-project
├── src
│   ├── index.ts
│   └── utils.ts
├── tests
│   └── index.test.ts
├── package.json
└── README.md`,
  fencedBlock: '```\nmy-project\n├── src\n│   └── index.ts\n└── README.md\n```',
};

export type GuideSection = { h2: string; body: string[]; code?: { caption?: string; text: string } };
export type Guide = {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  lead: string;
  ctaTitle: string;
  ctaBody: string;
  ctaButton: string;
  sections: GuideSection[];
  faqHeading: string;
  faq: FaqItem[];
};

const en: Guide = {
  metaTitle: 'How to Make a File Tree for a GitHub README | Step-by-Step Guide',
  metaDescription:
    'Three easy ways to create a folder-structure file tree for your GitHub README: the tree command, a free online ASCII tree generator, and a VS Code extension — with copy-paste examples.',
  h1: 'How to Make a File Tree for a GitHub README',
  lead:
    "A file tree — the small ASCII diagram of your project's folders and files — makes a README instantly easier to scan. This guide shows three reliable ways to create one, and how to paste it so the branches line up correctly on GitHub.",
  ctaTitle: 'The fastest way: an online ASCII tree generator',
  ctaBody:
    'No command line, no install. Build your folder structure visually, switch between Unicode and plain-ASCII connectors, and copy a clean diagram in one click.',
  ctaButton: 'Open the ASCII Tree Generator',
  sections: [
    {
      h2: 'Method 1 — The tree command',
      body: [
        'Every major operating system ships with (or can install) a tree command that prints a directory structure as text.',
        'On macOS or Linux, install it if needed (brew install tree or sudo apt install tree), then run it in your project folder. Use -I to ignore noisy folders:',
        'On Windows, the command is built in. Run it in the folder you want to document:',
        'Copy the output from your terminal and move on to the "Make it render on GitHub" section below.',
      ],
      code: { caption: 'macOS / Linux', text: CODE.treeUnix },
    },
    {
      h2: 'Method 2 — An online ASCII tree generator',
      body: [
        'If you do not want to touch the command line, or you are documenting a structure that does not exist on disk yet, an online generator is the simplest option.',
        'You add folders and files in a visual editor, rearrange them by drag-and-drop, choose Unicode (├──) or plain-ASCII (|--) connectors, and copy the result. Nothing is uploaded — it all runs in your browser.',
      ],
    },
    {
      h2: 'Method 3 — A VS Code extension',
      body: [
        'Several VS Code extensions (search for "file tree to text") add a right-click "Generate file tree" action on any folder, with Markdown output.',
        'This is handy when you live inside the editor, though you have less control over which folders to exclude than with the tree command or a dedicated generator.',
      ],
    },
    {
      h2: 'Make it render on GitHub',
      body: [
        'However you generate the tree, GitHub will only keep the branches aligned if it uses a monospace font. Wrap the tree in a fenced code block — three backticks on their own line, before and after:',
        'Without the code fences, GitHub renders the text with a proportional font and the │ and ├── characters drift out of alignment.',
      ],
      code: { caption: 'In your README.md', text: CODE.fencedBlock },
    },
    {
      h2: 'Unicode vs ASCII connectors',
      body: [
        'Unicode connectors (├──, │, └──) look cleaner and render natively on GitHub and in modern editors — use them by default.',
        'Plain-ASCII connectors (|--, |, \\--) use only basic characters. Choose them for older terminals, plain-text emails, or environments that do not display Unicode reliably.',
      ],
      code: { caption: 'Example output', text: CODE.exampleTree },
    },
  ],
  faqHeading: 'Frequently asked questions',
  faq: [
    {
      q: 'How do I exclude node_modules from the tree?',
      a: 'With the tree command, pass -I to ignore patterns, e.g. tree -I "node_modules|.git|dist". In an online generator, simply do not add those folders.',
    },
    {
      q: 'Why is my file tree misaligned on GitHub?',
      a: 'It is almost always because the tree is not inside a fenced code block. Wrap it in triple backticks so GitHub uses a monospace font.',
    },
    {
      q: 'Can I create a file tree without installing anything?',
      a: 'Yes — use a free online ASCII tree generator that runs entirely in your browser. You build the structure visually and copy the result.',
    },
  ],
};

const fr: Guide = {
  metaTitle: 'Comment créer une arborescence de fichiers pour un README GitHub | Guide',
  metaDescription:
    "Trois méthodes simples pour créer une arborescence de fichiers dans votre README GitHub : la commande tree, un générateur d'arbre ASCII en ligne gratuit et une extension VS Code — avec des exemples à copier-coller.",
  h1: 'Comment créer une arborescence de fichiers pour un README GitHub',
  lead:
    "Une arborescence de fichiers — le petit diagramme ASCII des dossiers et fichiers de votre projet — rend un README bien plus lisible. Ce guide présente trois méthodes fiables pour en créer une, et comment la coller pour que les branches restent alignées sur GitHub.",
  ctaTitle: "La méthode la plus rapide : un générateur d'arbre ASCII en ligne",
  ctaBody:
    "Sans ligne de commande ni installation. Construisez votre structure de dossiers visuellement, basculez entre connecteurs Unicode et ASCII simple, et copiez un diagramme propre en un clic.",
  ctaButton: "Ouvrir le générateur d'arbre ASCII",
  sections: [
    {
      h2: 'Méthode 1 — La commande tree',
      body: [
        "Tous les principaux systèmes d'exploitation disposent (ou peuvent installer) d'une commande tree qui affiche une structure de dossiers sous forme de texte.",
        'Sur macOS ou Linux, installez-la si besoin (brew install tree ou sudo apt install tree), puis lancez-la dans le dossier de votre projet. Utilisez -I pour ignorer les dossiers superflus :',
        'Sur Windows, la commande est intégrée. Lancez-la dans le dossier à documenter :',
        'Copiez la sortie de votre terminal et passez à la section « Faire en sorte que ça s\'affiche sur GitHub » ci-dessous.',
      ],
      code: { caption: 'macOS / Linux', text: CODE.treeUnix },
    },
    {
      h2: 'Méthode 2 — Un générateur d\'arbre ASCII en ligne',
      body: [
        "Si vous ne voulez pas toucher à la ligne de commande, ou si vous documentez une structure qui n'existe pas encore sur le disque, un générateur en ligne est l'option la plus simple.",
        "Vous ajoutez dossiers et fichiers dans un éditeur visuel, les réorganisez en glisser-déposer, choisissez des connecteurs Unicode (├──) ou ASCII simple (|--), et copiez le résultat. Rien n'est envoyé — tout se passe dans votre navigateur.",
      ],
    },
    {
      h2: 'Méthode 3 — Une extension VS Code',
      body: [
        'Plusieurs extensions VS Code (cherchez « file tree to text ») ajoutent une action « Générer l\'arborescence » au clic droit sur un dossier, avec une sortie Markdown.',
        "Pratique quand vous vivez dans l'éditeur, même si vous contrôlez moins les dossiers à exclure qu'avec la commande tree ou un générateur dédié.",
      ],
    },
    {
      h2: "Faire en sorte que ça s'affiche sur GitHub",
      body: [
        'Quelle que soit la méthode, GitHub ne gardera les branches alignées que s\'il utilise une police à chasse fixe. Encadrez l\'arbre dans un bloc de code — trois accents graves sur leur propre ligne, avant et après :',
        'Sans les accents graves, GitHub affiche le texte avec une police proportionnelle et les caractères │ et ├── se désalignent.',
      ],
      code: { caption: 'Dans votre README.md', text: CODE.fencedBlock },
    },
    {
      h2: 'Connecteurs Unicode vs ASCII',
      body: [
        'Les connecteurs Unicode (├──, │, └──) sont plus nets et s\'affichent nativement sur GitHub et dans les éditeurs modernes — utilisez-les par défaut.',
        'Les connecteurs ASCII simple (|--, |, \\--) n\'utilisent que des caractères de base. Choisissez-les pour les vieux terminaux, les e-mails en texte brut ou les environnements sans support Unicode fiable.',
      ],
      code: { caption: 'Exemple de sortie', text: CODE.exampleTree },
    },
  ],
  faqHeading: 'Questions fréquentes',
  faq: [
    {
      q: 'Comment exclure node_modules de l\'arborescence ?',
      a: 'Avec la commande tree, passez -I pour ignorer des motifs, ex. tree -I "node_modules|.git|dist". Dans un générateur en ligne, il suffit de ne pas ajouter ces dossiers.',
    },
    {
      q: 'Pourquoi mon arborescence est-elle désalignée sur GitHub ?',
      a: "C'est presque toujours parce que l'arbre n'est pas dans un bloc de code. Encadrez-le de trois accents graves pour que GitHub utilise une police à chasse fixe.",
    },
    {
      q: 'Puis-je créer une arborescence sans rien installer ?',
      a: "Oui — utilisez un générateur d'arbre ASCII en ligne gratuit qui fonctionne entièrement dans votre navigateur. Vous construisez la structure visuellement et copiez le résultat.",
    },
  ],
};

const es: Guide = {
  metaTitle: 'Cómo crear un árbol de archivos para un README de GitHub | Guía paso a paso',
  metaDescription:
    'Tres formas fáciles de crear un árbol de estructura de carpetas para tu README de GitHub: el comando tree, un generador de árbol ASCII en línea gratuito y una extensión de VS Code — con ejemplos para copiar y pegar.',
  h1: 'Cómo crear un árbol de archivos para un README de GitHub',
  lead:
    'Un árbol de archivos — el pequeño diagrama ASCII de las carpetas y archivos de tu proyecto — hace que un README sea mucho más fácil de leer. Esta guía muestra tres formas fiables de crear uno y cómo pegarlo para que las ramas queden alineadas correctamente en GitHub.',
  ctaTitle: 'La forma más rápida: un generador de árbol ASCII en línea',
  ctaBody:
    'Sin línea de comandos ni instalación. Construye tu estructura de carpetas visualmente, alterna entre conectores Unicode y ASCII simple, y copia un diagrama limpio con un clic.',
  ctaButton: 'Abrir el Generador de Árbol ASCII',
  sections: [
    {
      h2: 'Método 1 — El comando tree',
      body: [
        'Todos los sistemas operativos principales incluyen (o pueden instalar) un comando tree que imprime la estructura de un directorio como texto.',
        'En macOS o Linux, instálalo si es necesario (brew install tree o sudo apt install tree) y luego ejecútalo en la carpeta de tu proyecto. Usa -I para ignorar carpetas innecesarias:',
        'En Windows, el comando está integrado. Ejecútalo en la carpeta que quieras documentar:',
        'Copia la salida de tu terminal y pasa a la sección «Haz que se muestre en GitHub» más abajo.',
      ],
      code: { caption: 'macOS / Linux', text: CODE.treeUnix },
    },
    {
      h2: 'Método 2 — Un generador de árbol ASCII en línea',
      body: [
        'Si no quieres tocar la línea de comandos, o estás documentando una estructura que aún no existe en el disco, un generador en línea es la opción más sencilla.',
        'Añades carpetas y archivos en un editor visual, los reorganizas arrastrando y soltando, eliges conectores Unicode (├──) o ASCII simple (|--), y copias el resultado. Nada se sube — todo se ejecuta en tu navegador.',
      ],
    },
    {
      h2: 'Método 3 — Una extensión de VS Code',
      body: [
        'Varias extensiones de VS Code (busca «file tree to text») añaden una acción «Generar árbol de archivos» con clic derecho en cualquier carpeta, con salida en Markdown.',
        'Es práctico cuando vives dentro del editor, aunque tienes menos control sobre qué carpetas excluir que con el comando tree o un generador dedicado.',
      ],
    },
    {
      h2: 'Haz que se muestre en GitHub',
      body: [
        'Sea cual sea la forma en que generes el árbol, GitHub solo mantendrá las ramas alineadas si usa una fuente monoespaciada. Envuelve el árbol en un bloque de código — tres comillas invertidas en su propia línea, antes y después:',
        'Sin las comillas de código, GitHub renderiza el texto con una fuente proporcional y los caracteres │ y ├── se desalinean.',
      ],
      code: { caption: 'En tu README.md', text: CODE.fencedBlock },
    },
    {
      h2: 'Conectores Unicode vs ASCII',
      body: [
        'Los conectores Unicode (├──, │, └──) se ven más limpios y se muestran de forma nativa en GitHub y en editores modernos — úsalos por defecto.',
        'Los conectores ASCII simple (|--, |, \\--) usan solo caracteres básicos. Elígelos para terminales antiguas, correos de texto plano o entornos que no muestran Unicode de forma fiable.',
      ],
      code: { caption: 'Ejemplo de salida', text: CODE.exampleTree },
    },
  ],
  faqHeading: 'Preguntas frecuentes',
  faq: [
    { q: '¿Cómo excluyo node_modules del árbol?', a: 'Con el comando tree, pasa -I para ignorar patrones, p. ej. tree -I "node_modules|.git|dist". En un generador en línea, simplemente no añadas esas carpetas.' },
    { q: '¿Por qué está desalineado mi árbol de archivos en GitHub?', a: 'Casi siempre es porque el árbol no está dentro de un bloque de código. Envuélvelo en tres comillas invertidas para que GitHub use una fuente monoespaciada.' },
    { q: '¿Puedo crear un árbol de archivos sin instalar nada?', a: 'Sí — usa un generador de árbol ASCII en línea gratuito que se ejecuta completamente en tu navegador. Construyes la estructura visualmente y copias el resultado.' },
  ],
};

const de: Guide = {
  metaTitle: 'Dateibaum für eine GitHub-README erstellen | Schritt-für-Schritt-Anleitung',
  metaDescription:
    'Drei einfache Wege, einen Ordnerstruktur-Dateibaum für Ihre GitHub-README zu erstellen: der tree-Befehl, ein kostenloser Online-ASCII-Baum-Generator und eine VS-Code-Erweiterung — mit Copy-and-paste-Beispielen.',
  h1: 'Einen Dateibaum für eine GitHub-README erstellen',
  lead:
    'Ein Dateibaum — das kleine ASCII-Diagramm der Ordner und Dateien Ihres Projekts — macht eine README sofort übersichtlicher. Diese Anleitung zeigt drei zuverlässige Wege, einen zu erstellen, und wie Sie ihn einfügen, damit die Verzweigungen auf GitHub korrekt ausgerichtet sind.',
  ctaTitle: 'Der schnellste Weg: ein Online-ASCII-Baum-Generator',
  ctaBody:
    'Keine Kommandozeile, keine Installation. Bauen Sie Ihre Ordnerstruktur visuell auf, wechseln Sie zwischen Unicode- und reinen ASCII-Verbindern und kopieren Sie ein sauberes Diagramm mit einem Klick.',
  ctaButton: 'ASCII-Baum-Generator öffnen',
  sections: [
    {
      h2: 'Methode 1 — Der tree-Befehl',
      body: [
        'Jedes große Betriebssystem bringt einen tree-Befehl mit (oder kann ihn installieren), der eine Verzeichnisstruktur als Text ausgibt.',
        'Installieren Sie ihn unter macOS oder Linux bei Bedarf (brew install tree oder sudo apt install tree) und führen Sie ihn dann im Projektordner aus. Verwenden Sie -I, um störende Ordner zu ignorieren:',
        'Unter Windows ist der Befehl integriert. Führen Sie ihn in dem Ordner aus, den Sie dokumentieren möchten:',
        'Kopieren Sie die Ausgabe aus Ihrem Terminal und fahren Sie mit dem Abschnitt „Damit es auf GitHub angezeigt wird“ weiter unten fort.',
      ],
      code: { caption: 'macOS / Linux', text: CODE.treeUnix },
    },
    {
      h2: 'Methode 2 — Ein Online-ASCII-Baum-Generator',
      body: [
        'Wenn Sie die Kommandozeile nicht anfassen möchten oder eine Struktur dokumentieren, die noch nicht auf der Festplatte existiert, ist ein Online-Generator die einfachste Option.',
        'Sie fügen Ordner und Dateien in einem visuellen Editor hinzu, ordnen sie per Drag-and-drop an, wählen Unicode- (├──) oder reine ASCII-Verbinder (|--) und kopieren das Ergebnis. Nichts wird hochgeladen — alles läuft in Ihrem Browser.',
      ],
    },
    {
      h2: 'Methode 3 — Eine VS-Code-Erweiterung',
      body: [
        'Mehrere VS-Code-Erweiterungen (suchen Sie nach „file tree to text“) fügen per Rechtsklick auf einen Ordner eine Aktion „Dateibaum erzeugen“ mit Markdown-Ausgabe hinzu.',
        'Das ist praktisch, wenn Sie im Editor arbeiten, auch wenn Sie weniger Kontrolle darüber haben, welche Ordner ausgeschlossen werden, als mit dem tree-Befehl oder einem dedizierten Generator.',
      ],
    },
    {
      h2: 'Damit es auf GitHub angezeigt wird',
      body: [
        'Egal wie Sie den Baum erzeugen: GitHub hält die Verzweigungen nur ausgerichtet, wenn eine Monospace-Schrift verwendet wird. Umschließen Sie den Baum mit einem Codeblock — drei Backticks in einer eigenen Zeile, davor und danach:',
        'Ohne die Code-Zäune rendert GitHub den Text mit einer proportionalen Schrift, und die Zeichen │ und ├── geraten aus der Ausrichtung.',
      ],
      code: { caption: 'In Ihrer README.md', text: CODE.fencedBlock },
    },
    {
      h2: 'Unicode- vs. ASCII-Verbinder',
      body: [
        'Unicode-Verbinder (├──, │, └──) sehen sauberer aus und werden auf GitHub und in modernen Editoren nativ dargestellt — verwenden Sie sie standardmäßig.',
        'Reine ASCII-Verbinder (|--, |, \\--) verwenden nur einfache Zeichen. Wählen Sie sie für ältere Terminals, Klartext-E-Mails oder Umgebungen, die Unicode nicht zuverlässig anzeigen.',
      ],
      code: { caption: 'Beispielausgabe', text: CODE.exampleTree },
    },
  ],
  faqHeading: 'Häufig gestellte Fragen',
  faq: [
    { q: 'Wie schließe ich node_modules aus dem Baum aus?', a: 'Übergeben Sie beim tree-Befehl -I, um Muster zu ignorieren, z. B. tree -I "node_modules|.git|dist". In einem Online-Generator fügen Sie diese Ordner einfach nicht hinzu.' },
    { q: 'Warum ist mein Dateibaum auf GitHub falsch ausgerichtet?', a: 'Das liegt fast immer daran, dass der Baum nicht in einem Codeblock steht. Umschließen Sie ihn mit drei Backticks, damit GitHub eine Monospace-Schrift verwendet.' },
    { q: 'Kann ich einen Dateibaum erstellen, ohne etwas zu installieren?', a: 'Ja — verwenden Sie einen kostenlosen Online-ASCII-Baum-Generator, der vollständig in Ihrem Browser läuft. Sie bauen die Struktur visuell auf und kopieren das Ergebnis.' },
  ],
};

const it: Guide = {
  metaTitle: 'Come creare un albero dei file per un README di GitHub | Guida passo passo',
  metaDescription:
    "Tre modi semplici per creare un albero della struttura delle cartelle per il tuo README di GitHub: il comando tree, un generatore di albero ASCII online gratuito e un'estensione di VS Code — con esempi da copiare e incollare.",
  h1: 'Come creare un albero dei file per un README di GitHub',
  lead:
    'Un albero dei file — il piccolo diagramma ASCII delle cartelle e dei file del tuo progetto — rende un README molto più leggibile. Questa guida mostra tre modi affidabili per crearne uno e come incollarlo affinché i rami restino allineati correttamente su GitHub.',
  ctaTitle: 'Il modo più rapido: un generatore di albero ASCII online',
  ctaBody:
    'Senza riga di comando né installazione. Costruisci la struttura delle cartelle visivamente, alterna tra connettori Unicode e ASCII semplice e copia un diagramma pulito con un clic.',
  ctaButton: 'Apri il Generatore di Albero ASCII',
  sections: [
    {
      h2: 'Metodo 1 — Il comando tree',
      body: [
        'Ogni sistema operativo principale include (o può installare) un comando tree che stampa la struttura di una directory come testo.',
        'Su macOS o Linux, installalo se necessario (brew install tree o sudo apt install tree), quindi eseguilo nella cartella del progetto. Usa -I per ignorare le cartelle superflue:',
        'Su Windows il comando è integrato. Eseguilo nella cartella che vuoi documentare:',
        "Copia l'output dal terminale e passa alla sezione «Fai in modo che si veda su GitHub» qui sotto.",
      ],
      code: { caption: 'macOS / Linux', text: CODE.treeUnix },
    },
    {
      h2: 'Metodo 2 — Un generatore di albero ASCII online',
      body: [
        "Se non vuoi toccare la riga di comando, o stai documentando una struttura che non esiste ancora su disco, un generatore online è l'opzione più semplice.",
        'Aggiungi cartelle e file in un editor visivo, li riorganizzi con il drag-and-drop, scegli connettori Unicode (├──) o ASCII semplice (|--) e copi il risultato. Nulla viene caricato — tutto avviene nel browser.',
      ],
    },
    {
      h2: "Metodo 3 — Un'estensione di VS Code",
      body: [
        "Diverse estensioni di VS Code (cerca «file tree to text») aggiungono un'azione «Genera albero dei file» con il clic destro su qualsiasi cartella, con output in Markdown.",
        "È comodo quando vivi nell'editor, anche se hai meno controllo su quali cartelle escludere rispetto al comando tree o a un generatore dedicato.",
      ],
    },
    {
      h2: 'Fai in modo che si veda su GitHub',
      body: [
        "Comunque tu generi l'albero, GitHub manterrà i rami allineati solo se usa un font a spaziatura fissa. Racchiudi l'albero in un blocco di codice — tre backtick su una riga a sé, prima e dopo:",
        'Senza i delimitatori di codice, GitHub rende il testo con un font proporzionale e i caratteri │ e ├── si disallineano.',
      ],
      code: { caption: 'Nel tuo README.md', text: CODE.fencedBlock },
    },
    {
      h2: 'Connettori Unicode vs ASCII',
      body: [
        'I connettori Unicode (├──, │, └──) sono più puliti e si visualizzano nativamente su GitHub e negli editor moderni — usali per impostazione predefinita.',
        'I connettori ASCII semplice (|--, |, \\--) usano solo caratteri di base. Scegli questi per terminali datati, email in testo semplice o ambienti che non visualizzano Unicode in modo affidabile.',
      ],
      code: { caption: 'Esempio di output', text: CODE.exampleTree },
    },
  ],
  faqHeading: 'Domande frequenti',
  faq: [
    { q: 'Come escludo node_modules dall\'albero?', a: 'Con il comando tree, passa -I per ignorare i pattern, ad es. tree -I "node_modules|.git|dist". In un generatore online, semplicemente non aggiungere quelle cartelle.' },
    { q: 'Perché il mio albero dei file è disallineato su GitHub?', a: "È quasi sempre perché l'albero non è dentro un blocco di codice. Racchiudilo tra tre backtick affinché GitHub usi un font a spaziatura fissa." },
    { q: 'Posso creare un albero dei file senza installare nulla?', a: 'Sì — usa un generatore di albero ASCII online gratuito che funziona interamente nel browser. Costruisci la struttura visivamente e copi il risultato.' },
  ],
};

const pt: Guide = {
  metaTitle: 'Como criar uma árvore de ficheiros para um README do GitHub | Guia passo a passo',
  metaDescription:
    'Três formas fáceis de criar uma árvore de estrutura de pastas para o seu README do GitHub: o comando tree, um gerador de árvore ASCII online gratuito e uma extensão do VS Code — com exemplos para copiar e colar.',
  h1: 'Como criar uma árvore de ficheiros para um README do GitHub',
  lead:
    'Uma árvore de ficheiros — o pequeno diagrama ASCII das pastas e ficheiros do seu projeto — torna um README muito mais fácil de ler. Este guia mostra três formas fiáveis de criar uma e como colá-la para que os ramos fiquem alinhados corretamente no GitHub.',
  ctaTitle: 'A forma mais rápida: um gerador de árvore ASCII online',
  ctaBody:
    'Sem linha de comandos nem instalação. Construa a sua estrutura de pastas visualmente, alterne entre conectores Unicode e ASCII simples e copie um diagrama limpo com um clique.',
  ctaButton: 'Abrir o Gerador de Árvore ASCII',
  sections: [
    {
      h2: 'Método 1 — O comando tree',
      body: [
        'Todos os principais sistemas operativos incluem (ou podem instalar) um comando tree que imprime a estrutura de um diretório como texto.',
        'No macOS ou Linux, instale-o se necessário (brew install tree ou sudo apt install tree) e execute-o na pasta do seu projeto. Use -I para ignorar pastas desnecessárias:',
        'No Windows, o comando está integrado. Execute-o na pasta que quer documentar:',
        'Copie a saída do seu terminal e passe para a secção «Faça aparecer no GitHub» mais abaixo.',
      ],
      code: { caption: 'macOS / Linux', text: CODE.treeUnix },
    },
    {
      h2: 'Método 2 — Um gerador de árvore ASCII online',
      body: [
        'Se não quiser mexer na linha de comandos, ou estiver a documentar uma estrutura que ainda não existe no disco, um gerador online é a opção mais simples.',
        'Adiciona pastas e ficheiros num editor visual, reorganiza-os com arrastar e soltar, escolhe conectores Unicode (├──) ou ASCII simples (|--) e copia o resultado. Nada é enviado — tudo corre no seu navegador.',
      ],
    },
    {
      h2: 'Método 3 — Uma extensão do VS Code',
      body: [
        'Várias extensões do VS Code (procure «file tree to text») adicionam uma ação «Gerar árvore de ficheiros» ao clicar com o botão direito em qualquer pasta, com saída em Markdown.',
        'É prático quando vive dentro do editor, embora tenha menos controlo sobre quais pastas excluir do que com o comando tree ou um gerador dedicado.',
      ],
    },
    {
      h2: 'Faça aparecer no GitHub',
      body: [
        'Seja qual for a forma como gera a árvore, o GitHub só mantém os ramos alinhados se usar uma fonte monoespaçada. Envolva a árvore num bloco de código — três crases numa linha própria, antes e depois:',
        'Sem as crases de código, o GitHub renderiza o texto com uma fonte proporcional e os caracteres │ e ├── ficam desalinhados.',
      ],
      code: { caption: 'No seu README.md', text: CODE.fencedBlock },
    },
    {
      h2: 'Conectores Unicode vs ASCII',
      body: [
        'Os conectores Unicode (├──, │, └──) ficam mais limpos e aparecem nativamente no GitHub e em editores modernos — use-os por predefinição.',
        'Os conectores ASCII simples (|--, |, \\--) usam apenas caracteres básicos. Escolha-os para terminais antigos, e-mails em texto simples ou ambientes que não mostram Unicode de forma fiável.',
      ],
      code: { caption: 'Exemplo de saída', text: CODE.exampleTree },
    },
  ],
  faqHeading: 'Perguntas frequentes',
  faq: [
    { q: 'Como excluo node_modules da árvore?', a: 'Com o comando tree, passe -I para ignorar padrões, por ex. tree -I "node_modules|.git|dist". Num gerador online, basta não adicionar essas pastas.' },
    { q: 'Porque é que a minha árvore de ficheiros está desalinhada no GitHub?', a: 'É quase sempre porque a árvore não está dentro de um bloco de código. Envolva-a em três crases para que o GitHub use uma fonte monoespaçada.' },
    { q: 'Posso criar uma árvore de ficheiros sem instalar nada?', a: 'Sim — use um gerador de árvore ASCII online gratuito que funciona inteiramente no seu navegador. Constrói a estrutura visualmente e copia o resultado.' },
  ],
};

const ru: Guide = {
  metaTitle: 'Как создать дерево файлов для README на GitHub | Пошаговое руководство',
  metaDescription:
    'Три простых способа создать дерево структуры папок для вашего README на GitHub: команда tree, бесплатный онлайн-генератор ASCII-дерева и расширение VS Code — с примерами для копирования.',
  h1: 'Как создать дерево файлов для README на GitHub',
  lead:
    'Дерево файлов — небольшая ASCII-схема папок и файлов вашего проекта — делает README гораздо удобнее для чтения. В этом руководстве показаны три надёжных способа его создать и как вставить его, чтобы ветви правильно выравнивались на GitHub.',
  ctaTitle: 'Самый быстрый способ: онлайн-генератор ASCII-дерева',
  ctaBody:
    'Без командной строки и установки. Постройте структуру папок визуально, переключайтесь между коннекторами Unicode и простыми ASCII и копируйте аккуратную схему в один клик.',
  ctaButton: 'Открыть генератор ASCII-дерева',
  sections: [
    {
      h2: 'Способ 1 — Команда tree',
      body: [
        'В каждой крупной операционной системе есть (или можно установить) команда tree, которая выводит структуру каталога в виде текста.',
        'В macOS или Linux установите её при необходимости (brew install tree или sudo apt install tree) и запустите в папке проекта. Используйте -I, чтобы игнорировать лишние папки:',
        'В Windows команда встроена. Запустите её в папке, которую хотите задокументировать:',
        'Скопируйте вывод из терминала и перейдите к разделу «Чтобы всё отображалось на GitHub» ниже.',
      ],
      code: { caption: 'macOS / Linux', text: CODE.treeUnix },
    },
    {
      h2: 'Способ 2 — Онлайн-генератор ASCII-дерева',
      body: [
        'Если вы не хотите работать с командной строкой или документируете структуру, которой ещё нет на диске, онлайн-генератор — самый простой вариант.',
        'Вы добавляете папки и файлы в визуальном редакторе, меняете их порядок перетаскиванием, выбираете коннекторы Unicode (├──) или простые ASCII (|--) и копируете результат. Ничего не загружается — всё работает в браузере.',
      ],
    },
    {
      h2: 'Способ 3 — Расширение VS Code',
      body: [
        'Несколько расширений VS Code (ищите «file tree to text») добавляют по правому клику на папке действие «Сгенерировать дерево файлов» с выводом в Markdown.',
        'Это удобно, когда вы работаете в редакторе, хотя контроля над тем, какие папки исключать, меньше, чем у команды tree или специализированного генератора.',
      ],
    },
    {
      h2: 'Чтобы всё отображалось на GitHub',
      body: [
        'Как бы вы ни создали дерево, GitHub сохранит выравнивание ветвей только при использовании моноширинного шрифта. Оберните дерево в блок кода — три обратные кавычки на отдельной строке до и после:',
        'Без ограждений кода GitHub отрисовывает текст пропорциональным шрифтом, и символы │ и ├── сбиваются с выравнивания.',
      ],
      code: { caption: 'В вашем README.md', text: CODE.fencedBlock },
    },
    {
      h2: 'Коннекторы Unicode и ASCII',
      body: [
        'Коннекторы Unicode (├──, │, └──) выглядят аккуратнее и отображаются на GitHub и в современных редакторах нативно — используйте их по умолчанию.',
        'Простые ASCII-коннекторы (|--, |, \\--) используют только базовые символы. Выбирайте их для старых терминалов, писем в виде обычного текста или сред без надёжной поддержки Unicode.',
      ],
      code: { caption: 'Пример вывода', text: CODE.exampleTree },
    },
  ],
  faqHeading: 'Часто задаваемые вопросы',
  faq: [
    { q: 'Как исключить node_modules из дерева?', a: 'В команде tree передайте -I для игнорирования шаблонов, например tree -I "node_modules|.git|dist". В онлайн-генераторе просто не добавляйте эти папки.' },
    { q: 'Почему моё дерево файлов сбито на GitHub?', a: 'Почти всегда это потому, что дерево не находится внутри блока кода. Оберните его в три обратные кавычки, чтобы GitHub использовал моноширинный шрифт.' },
    { q: 'Можно ли создать дерево файлов, ничего не устанавливая?', a: 'Да — используйте бесплатный онлайн-генератор ASCII-дерева, работающий полностью в браузере. Вы строите структуру визуально и копируете результат.' },
  ],
};

const ja: Guide = {
  metaTitle: 'GitHubのREADME用にファイルツリーを作る方法｜手順ガイド',
  metaDescription:
    'GitHubのREADME用にフォルダ構成のファイルツリーを作る3つの簡単な方法：treeコマンド、無料のオンラインASCIIツリー生成ツール、VS Code拡張機能。コピペで使える例付き。',
  h1: 'GitHubのREADME用にファイルツリーを作る方法',
  lead:
    'ファイルツリー（プロジェクトのフォルダとファイルを示す小さなASCII図）があると、READMEは一気に読みやすくなります。このガイドでは、作成する信頼できる3つの方法と、GitHub上で枝が正しく揃うように貼り付ける方法を紹介します。',
  ctaTitle: '最速の方法：オンラインASCIIツリー生成ツール',
  ctaBody:
    'コマンドラインもインストールも不要。フォルダ構成を視覚的に作成し、UnicodeとプレーンASCIIのコネクタを切り替え、整った図をワンクリックでコピーできます。',
  ctaButton: 'ASCIIツリー生成ツールを開く',
  sections: [
    {
      h2: '方法1 — treeコマンド',
      body: [
        '主要なOSには、ディレクトリ構成をテキストで出力するtreeコマンドが標準搭載されている（またはインストールできる）。',
        'macOSやLinuxでは必要に応じてインストールし（brew install tree または sudo apt install tree）、プロジェクトのフォルダで実行します。不要なフォルダを除外するには -I を使います：',
        'Windowsではコマンドが標準搭載されています。ドキュメント化したいフォルダで実行してください：',
        'ターミナルの出力をコピーし、下の「GitHubで正しく表示させる」セクションに進んでください。',
      ],
      code: { caption: 'macOS / Linux', text: CODE.treeUnix },
    },
    {
      h2: '方法2 — オンラインASCIIツリー生成ツール',
      body: [
        'コマンドラインを使いたくない場合や、まだディスク上に存在しない構成をドキュメント化する場合は、オンライン生成ツールが最も簡単です。',
        'ビジュアルエディタでフォルダやファイルを追加し、ドラッグ＆ドロップで並べ替え、Unicode（├──）またはプレーンASCII（|--）のコネクタを選んで結果をコピーします。何もアップロードされず、すべてブラウザ内で完結します。',
      ],
    },
    {
      h2: '方法3 — VS Code拡張機能',
      body: [
        'いくつかのVS Code拡張機能（「file tree to text」で検索）は、任意のフォルダを右クリックして「ファイルツリーを生成」するアクションを追加し、Markdownで出力します。',
        'エディタ内で作業する人には便利ですが、除外するフォルダの指定は、treeコマンドや専用の生成ツールほど細かく制御できません。',
      ],
    },
    {
      h2: 'GitHubで正しく表示させる',
      body: [
        'どの方法でツリーを作っても、GitHubは等幅フォントを使うときだけ枝を揃えて表示します。ツリーをコードブロックで囲みましょう。前後にそれぞれ独立した行でバッククォート3つを置きます：',
        'コードフェンスがないと、GitHubはプロポーショナルフォントでテキストを表示し、│ や ├── の文字がずれてしまいます。',
      ],
      code: { caption: 'README.md 内で', text: CODE.fencedBlock },
    },
    {
      h2: 'UnicodeとASCIIのコネクタ',
      body: [
        'Unicodeコネクタ（├──、│、└──）は見た目がきれいで、GitHubや最近のエディタでそのまま表示されます。基本的にはこちらを使いましょう。',
        'プレーンASCIIコネクタ（|--、|、\\--）は基本文字のみを使います。古い端末やプレーンテキストのメール、Unicodeを確実に表示できない環境ではこちらを選びます。',
      ],
      code: { caption: '出力例', text: CODE.exampleTree },
    },
  ],
  faqHeading: 'よくある質問',
  faq: [
    { q: 'ツリーからnode_modulesを除外するには？', a: 'treeコマンドでは -I でパターンを無視します。例：tree -I "node_modules|.git|dist"。オンライン生成ツールでは、単にそれらのフォルダを追加しなければOKです。' },
    { q: 'GitHubでファイルツリーがずれるのはなぜ？', a: 'ほとんどの場合、ツリーがコードブロック内に入っていないためです。バッククォート3つで囲み、GitHubに等幅フォントを使わせましょう。' },
    { q: '何もインストールせずにファイルツリーを作れますか？', a: 'はい。ブラウザだけで動く無料のオンラインASCIIツリー生成ツールを使えば、構成を視覚的に作って結果をコピーできます。' },
  ],
};

const GUIDES: Record<string, Guide> = { en, fr, es, de, it, pt, ru, ja };

export function getFileTreeGuide(locale: string): Guide {
  return GUIDES[locale] ?? GUIDES.en;
}
