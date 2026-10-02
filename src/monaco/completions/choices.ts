import { EditorLanguage, MonacoLayout } from "@/common/editorConfig";
import { ANY, oneOrMore } from "@/common/regex";
import type { editor, languages, Position } from "monaco-editor";
import { monaco } from "../setup";

export interface EditorChoice {
  label: string;
  value: string;
}

const ChoiceWordRegex = new RegExp(oneOrMore(ANY));

/** What each choice editor offers, keyed by its model. */
export const modelChoices = new Map<string, EditorChoice[]>();

function provideCompletionItems(
  model: editor.ITextModel,
  position: Position,
): languages.CompletionList {
  const choices = modelChoices.get(model.uri.toString());
  if (!choices) {
    return { suggestions: [] };
  }

  const lineNumber = position.lineNumber;
  const range = new monaco.Range(
    lineNumber,
    MonacoLayout.FIRST_COLUMN,
    lineNumber,
    model.getLineMaxColumn(lineNumber),
  );

  return {
    suggestions: choices.map((choice) => ({
      label: choice.label,
      kind: monaco.languages.CompletionItemKind.File,
      insertText: choice.value,
      filterText: choice.value,
      sortText: choice.label,
      range,
    })),
  };
}

export function registerChoiceCompletions(): void {
  monaco.languages.register({ id: EditorLanguage.CHOICE });
  monaco.languages.setLanguageConfiguration(EditorLanguage.CHOICE, {
    wordPattern: ChoiceWordRegex,
  });

  monaco.languages.registerCompletionItemProvider(EditorLanguage.CHOICE, {
    provideCompletionItems,
  });
}
