/*
 * Easy Wikilink — Obsidian Plugin
 * Works like Ctrl+K but for internal wikilinks. Select text, pick a page, generates [[page|selected text]]
 */

const { Plugin, SuggestModal } = require("obsidian");

class NoteSuggestModal extends SuggestModal {
  constructor(app, selectedText, editor) {
    super(app);
    this.selectedText = selectedText;
    this.editor = editor;
    this.setPlaceholder("Chercher une page du vault...");
  }

  getSuggestions(query) {
    const files = this.app.vault.getMarkdownFiles();
    if (!query) return files.slice(0, 20);
    const q = query.toLowerCase();
    return files.filter(f => f.basename.toLowerCase().includes(q));
  }

  renderSuggestion(file, el) {
    el.createEl("div", { text: file.basename });
    el.createEl("small", { text: file.path, cls: "suggestion-note" });
  }

  onChooseSuggestion(file) {
    const pageName = file.basename;
    const displayText = this.selectedText;
    let linkText;

    if (displayText && displayText !== pageName) {
      linkText = `[[${pageName}|${displayText}]]`;
    } else {
      linkText = `[[${pageName}]]`;
    }

    // Récupère la position du curseur avant remplacement
    const cursor = this.editor.getCursor("from");

    this.editor.replaceSelection(linkText);

    // Repositionne le curseur à la fin du wikilink inséré
    this.editor.setCursor({
      line: cursor.line,
      ch: cursor.ch + linkText.length,
    });
  }
}

class InternalLinkPickerPlugin extends Plugin {
  async onload() {
    this.addCommand({
      id: "insert-internal-link",
      name: "Insérer un lien interne (avec texte affiché)",
      editorCallback: (editor) => {
        const selectedText = editor.getSelection();
        new NoteSuggestModal(this.app, selectedText, editor).open();
      },
    });
  }
}

module.exports = InternalLinkPickerPlugin;
