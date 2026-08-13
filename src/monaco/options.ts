import { MonacoLayout } from "@/common/editorConfig";
import type { editor } from "monaco-editor";
import { getCodeMetrics } from "./metrics";

type Options = editor.IStandaloneEditorConstructionOptions;

/** Everything every code surface in the app shares. */
export function baseEditorOptions(): Options {
  const metrics = getCodeMetrics();

  return {
    automaticLayout: true,
    contextmenu: false,
    editContext: false,

    fontFamily: metrics.fontFamily,
    fontLigatures: false,
    tabSize: metrics.tabSize,
    insertSpaces: false,
    detectIndentation: false,

    // --- chrome off ---
    glyphMargin: false,
    minimap: { enabled: false },
    lineDecorationsWidth: metrics.gutterGapBefore + metrics.gutterGapAfter,
    lineNumbersMinChars: MonacoLayout.LINE_NUMBER_MIN_CHARS,
    overviewRulerLanes: 0,
    overviewRulerBorder: false,
    hideCursorInOverviewRuler: true,
    renderLineHighlight: "none",
    stickyScroll: { enabled: false },
    guides: {
      indentation: true,
      bracketPairs: true,
      highlightActiveIndentation: true,
    },
    bracketPairColorization: { enabled: true },
    colorDecorators: false,
    codeLens: false,
    links: false,
    dragAndDrop: false,
    roundedSelection: false,
    matchBrackets: "near",
    unicodeHighlight: {
      ambiguousCharacters: false,
      invisibleCharacters: false,
      nonBasicASCII: false,
    },

    // --- layout ---
    wordWrap: "off",
    scrollBeyondLastLine: false,
    scrollBeyondLastColumn: 0,
    smoothScrolling: true,
    padding: { top: 0, bottom: 0 },
    fixedOverflowWidgets: true,

    autoSurround: "languageDefined",
    autoClosingBrackets: "never",
    autoClosingQuotes: "never",
  };
}

export function flowingEditorOptions(): Options {
  const metrics = getCodeMetrics();

  return {
    ...baseEditorOptions(),
    fontSize: metrics.fontSizeBase,
    lineHeight: metrics.lineHeightBase,
    scrollbar: {
      vertical: "hidden",
      horizontal: "hidden",
      handleMouseWheel: false,
      alwaysConsumeMouseWheel: false,
    },
    quickSuggestions: true,
    suggestOnTriggerCharacters: false,
    wordBasedSuggestions: "off",
    renderValidationDecorations: "off",
  };
}

export function boundedEditorOptions(): Options {
  const metrics = getCodeMetrics();

  return {
    ...baseEditorOptions(),
    fontSize: metrics.fontSizeSmall,
    lineHeight: metrics.lineHeightSmall,
    scrollbar: { vertical: "auto", horizontal: "auto", useShadows: false },
    quickSuggestions: true,
    wordBasedSuggestions: "off",
  };
}
