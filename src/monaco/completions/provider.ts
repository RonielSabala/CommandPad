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
  if (!completions?.length) {
    return { suggestions: [] };
  }

  // A shell brace block spanning several lines never opens one
  const line = model.getLineContent(position.lineNumber);
  const context = readCompletionContext(line, position.column - 1);
  if (!context) {
    return { suggestions: [] };
  }

  const range = new monaco.Range(
    position.lineNumber,
    context.start + 1,
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
