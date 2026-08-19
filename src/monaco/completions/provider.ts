import { MonacoLayout, VariableCompletionConfig } from "@/common/editorConfig";
import { CodeLanguage } from "@/common/enums";
import { VariableSyntax } from "@/common/variableSyntax";
import type { editor, languages, Position } from "monaco-editor";
import { monaco } from "../setup";
import { readCompletionContext } from "./context";
import { getModelCompletions } from "./registry";
import { buildSuggestions } from "./suggestions";

function provideCompletionItems(
  model: editor.ITextModel,
  position: Position,
): languages.CompletionList {
  const completions = getModelCompletions(model.uri.toString());
  if (!completions) {
    return { suggestions: [] };
  }

  // A reference may be laid out over several lines
  const firstLine = Math.max(
    MonacoLayout.FIRST_LINE,
    position.lineNumber - VariableCompletionConfig.MAX_REFERENCE_LINES,
  );
  const text = model.getValueInRange(
    new monaco.Range(
      firstLine,
      MonacoLayout.FIRST_COLUMN,
      position.lineNumber,
      position.column,
    ),
  );

  const lineStart = text.length - (position.column - 1);
  const context = readCompletionContext(text, text.length, lineStart);
  if (!context) {
    return { suggestions: [] };
  }

  const range = new monaco.Range(
    position.lineNumber,
    context.start - lineStart + 1,
    position.lineNumber,
    position.column,
  );

  return {
    suggestions: buildSuggestions(context, completions).map((suggestion) => ({
      label: suggestion.label,
      detail: suggestion.detail,
      kind: suggestion.kind,
      insertText: suggestion.insertText,
      insertTextRules: suggestion.snippet
        ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
        : undefined,
      filterText: suggestion.label,
      sortText: suggestion.label,
      range,
    })),
  };
}

export function registerVariableCompletions(): void {
  monaco.languages.registerCompletionItemProvider(CodeLanguage.PLAIN, {
    triggerCharacters: [
      VariableSyntax.BRACE_OPEN,
      VariableSyntax.PARAM_SEPARATOR,
      VariableSyntax.OPERATION_SEPARATOR,
    ],
    provideCompletionItems,
  });
}
