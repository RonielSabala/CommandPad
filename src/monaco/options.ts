import { MonacoLayout, MonacoMinimap } from "@/common/editorConfig";
import type { PanelSide } from "@/common/enums";
import type { editor } from "monaco-editor";

import { getOverflowWidgetsRoot } from "./layers";
import { getCodeMetrics } from "./metrics";

type Options = editor.IStandaloneEditorConstructionOptions;

/** Everything every code surface in the app shares. */
export function baseEditorOptions(folding: boolean): Options {
  const metrics = getCodeMetrics();

  return {
    automaticLayout: true,
    contextmenu: true,
    editContext: false,
    accessibilitySupport: "off",

    fontFamily: metrics.fontFamily,
    fontLigatures: false,
    tabSize: metrics.tabSize,
    insertSpaces: false,
    detectIndentation: false,

    // --- chrome off ---
    glyphMargin: false,
    minimap: { enabled: false },
    folding,
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
    smoothScrolling: false,
    padding: { top: 0, bottom: 0 },
    fixedOverflowWidgets: true,
    overflowWidgetsDomNode: getOverflowWidgetsRoot(),

    autoSurround: "languageDefined",
    autoClosingBrackets: "languageDefined",
    autoClosingQuotes: "languageDefined",
    autoClosingDelete: "auto",
    autoClosingOvertype: "auto",
  };
}

export function flowingEditorOptions(folding: boolean): Options {
  const metrics = getCodeMetrics();

  return {
    ...baseEditorOptions(folding),
    fontSize: metrics.fontSizeBase,
    lineHeight: metrics.lineHeightBase,
    scrollbar: {
      vertical: "hidden",
      horizontal: "hidden",
      handleMouseWheel: false,
      alwaysConsumeMouseWheel: false,
    },
    quickSuggestions: true,
    suggestOnTriggerCharacters: true,
    wordBasedSuggestions: "off",
    renderValidationDecorations: "editable",
  };
}

export function boundedEditorOptions(
  folding: boolean,
  minimapSide: PanelSide | null,
): Options {
  const metrics = getCodeMetrics();

  return {
    ...baseEditorOptions(folding),
    fontSize: metrics.fontSizeSmall,
    lineHeight: metrics.lineHeightSmall,
    scrollBeyondLastLine: true,
    minimap: minimapSide
      ? { ...MonacoMinimap, enabled: true, side: minimapSide }
      : { enabled: false },
    scrollbar: {
      vertical: minimapSide ? "hidden" : "auto",
      ...(minimapSide ? { verticalScrollbarSize: 0 } : {}),
      horizontal: "auto",
      useShadows: false,
    },
    quickSuggestions: true,
    wordBasedSuggestions: "off",
  };
}
