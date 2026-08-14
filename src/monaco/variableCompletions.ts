import { SECRET_MASK } from "@/common/config";
import { VariableCompletionConfig } from "@/common/editorConfig";
import { CodeLanguage } from "@/common/enums";
import { ESCAPE_CHAR } from "@/common/regex";
import { VariableSyntax } from "@/common/variableSyntax";
import type { VariableMap } from "@/utils/resolution";
import type { editor, languages, Position } from "monaco-editor";
import { monaco } from "./setup";

export interface VariableCompletion {
  key: string;
  detail: string;
}

const byModel = new Map<string, VariableCompletion[]>();

const KEY_CHUNK_END: string[] = [
  VariableSyntax.BRACE_CLOSE,
  VariableSyntax.PARAM_SEPARATOR,
  VariableSyntax.OPERATION_SEPARATOR,
];

/** The key a model path is filed under. */
export function completionModelKey(path: string): string {
  return monaco.Uri.parse(path).toString();
}

export function setModelCompletions(
  key: string,
  completions: VariableCompletion[],
): void {
  byModel.set(key, completions);
}

export function clearModelCompletions(key: string): void {
  byModel.delete(key);
}

export function buildVariableCompletions(
  variableMap: VariableMap,
  secretKeys: Set<string>,
): VariableCompletion[] {
  return Object.keys(variableMap).map((key) => ({
    key,
    detail: secretKeys.has(key) ? SECRET_MASK : variableMap[key],
  }));
}

/**
 * The 1-based column the key chunk of the reference being typed starts at, or
 * `null` when the caret is not inside one. */
function keyChunkStart(line: string, column: number): number | null {
  for (let index = column - 2; index >= 0; index--) {
    const char = line[index];

    if (char === VariableSyntax.BRACE_OPEN) {
      return line[index - 1] === ESCAPE_CHAR ? null : index + 2;
    }

    if (KEY_CHUNK_END.includes(char)) {
      return null;
    }
  }

  return null;
}

function provideCompletionItems(
  model: editor.ITextModel,
  position: Position,
): languages.CompletionList {
  const completions = byModel.get(model.uri.toString());
  if (!completions?.length) {
    return { suggestions: [] };
  }

  const line = model.getLineContent(position.lineNumber);
  const start = keyChunkStart(line, position.column);
  if (start === null) {
    return { suggestions: [] };
  }

  const range = new monaco.Range(
    position.lineNumber,
    start,
    position.lineNumber,
    position.column,
  );

  return {
    suggestions: completions.map((completion, index) => ({
      label: completion.key,
      detail: completion.detail,
      kind: monaco.languages.CompletionItemKind.Variable,
      insertText: completion.key,
      filterText: completion.key,
      sortText: String(index).padStart(
        VariableCompletionConfig.SORT_DIGITS,
        "0",
      ),
      range,
    })),
  };
}

export function registerVariableCompletions(): void {
  monaco.languages.registerCompletionItemProvider(CodeLanguage.PLAIN, {
    triggerCharacters: [VariableSyntax.BRACE_OPEN],
    provideCompletionItems,
  });
}
