/** How the editor and preview panes are laid out on screen. */
export type ViewMode = 'split' | 'editor' | 'preview';

export interface MarkdownEditorOptions {
  /** Which pane(s) to show. On mobile the layout falls back to tabs. */
  viewMode: ViewMode;
  /** Render the preview in a boxed "prose" card for readability. */
  boxedPreview: boolean;
}

export const DEFAULT_MARKDOWN_OPTIONS: MarkdownEditorOptions = {
  viewMode: 'split',
  boxedPreview: true,
};

/** Sample document shown on first load, exercising the main GFM features. */
export const DEFAULT_MARKDOWN = `# Markdown Editor

Write **Markdown** on the left and see it rendered *live* on the right.

## Features

- Live preview with [GitHub Flavored Markdown](https://github.github.com/gfm/)
- Formatting toolbar
- Syntax highlighting for code blocks
- Copy Markdown / HTML and download as \`.md\`

### Task list

- [x] Type some Markdown
- [ ] Copy the result
- [ ] Paste it in your README

### Table

| Tool      | Output        |
| --------- | ------------- |
| Tree      | Folder tree   |
| Table     | ASCII table   |
| Sparkline | Inline chart  |

### Code

\`\`\`js
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

> Tip: everything runs in your browser — nothing is uploaded.
`;
