import { SECRET_MASK } from "@/common/config";
import { VariableCompletionConfig } from "@/common/editorConfig";
import { CodeLanguage, ReferenceChunk } from "@/common/enums";
import { ESCAPE_CHAR } from "@/common/regex";
import {
  CallSyntax,
  VariableParamPlaceholderRegex,
  VariableSyntax,
} from "@/common/variableSyntax";
import {
  getOperationKeywords,
  type OperationKeyword,
  type VariableMap,
} from "@/utils/resolution";
import type { editor, languages, Position } from "monaco-editor";
import { monaco } from "./setup";

export interface VariableCompletion {
  key: string;
  detail: string;
  params: string[];
}

const byModel = new Map<string, VariableCompletion[]>();

const CHUNK_SEPARATORS: Record<string, ReferenceChunk | undefined> = {
  [VariableSyntax.PARAM_SEPARATOR]: ReferenceChunk.PARAM,
  [VariableSyntax.OPERATION_SEPARATOR]: ReferenceChunk.OPERATION,
};

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

function readParams(value: string): string[] {
  const names = new Set<string>();

  for (const [, name] of value.matchAll(VariableParamPlaceholderRegex)) {
    names.add(name.trim());
  }

  return [...names];
}

export function buildVariableCompletions(
  variableMap: VariableMap,
  secretKeys: Set<string>,
): VariableCompletion[] {
  return Object.keys(variableMap).map((key) => ({
    key,
    detail: secretKeys.has(key) ? SECRET_MASK : variableMap[key],
    params: readParams(variableMap[key]),
  }));
}

interface ChunkContext {
  chunk: ReferenceChunk;
  key: string;
  start: number;
}

function skipSpaces(line: string, index: number): number {
  let at = index;
  while (line[at] === " ") {
    at++;
  }

  return at;
}

function readKey(line: string, braceIndex: number): string {
  for (let index = braceIndex + 1; index < line.length; index++) {
    const char = line[index];

    if (char === VariableSyntax.BRACE_CLOSE || char in CHUNK_SEPARATORS) {
      return line.slice(braceIndex + 1, index).trim();
    }
  }

  return line.slice(braceIndex + 1).trim();
}

/**
 * The chunk of the reference being typed at `column`, or `null` when the caret
 * is not in one an editor can complete.
 */
function readChunkContext(line: string, column: number): ChunkContext | null {
  let chunk: ReferenceChunk = ReferenceChunk.KEY;
  let separatorIndex = -1;
  let assigned = false;
  let depth = 0;

  for (let index = column - 2; index >= 0; index--) {
    const char = line[index];
    if (char === CallSyntax.ARGUMENT_CLOSE) {
      depth++;
      continue;
    }

    if (char === CallSyntax.ARGUMENT_OPEN) {
      // An unclosed one means the caret is in the arguments
      if (depth === 0) {
        return null;
      }

      depth--;
      continue;
    }

    if (depth > 0) {
      continue;
    }

    if (char === VariableSyntax.BRACE_CLOSE) {
      return null;
    }

    if (char === VariableSyntax.BRACE_OPEN) {
      // An escaped brace renders literally, so it opens nothing
      if (line[index - 1] === ESCAPE_CHAR) {
        return null;
      }

      if (assigned && chunk === ReferenceChunk.PARAM) {
        return null;
      }

      const start = separatorIndex === -1 ? index : separatorIndex;
      return {
        chunk,
        key: readKey(line, index),
        start: skipSpaces(line, start + 1) + 1,
      };
    }

    if (separatorIndex !== -1) {
      continue;
    }

    const separated = CHUNK_SEPARATORS[char];
    if (separated) {
      chunk = separated;
      separatorIndex = index;
    } else if (char === VariableSyntax.PARAM_ASSIGNMENT) {
      assigned = true;
    }
  }

  return null;
}

interface Suggestion {
  label: string;
  detail?: string;
  insertText: string;
  kind: languages.CompletionItemKind;
  snippet?: boolean;
}

function variableSuggestions(completions: VariableCompletion[]): Suggestion[] {
  return completions.map((completion) => ({
    label: completion.key,
    detail: completion.detail,
    kind: monaco.languages.CompletionItemKind.Variable,
    insertText: completion.key,
  }));
}

function paramSuggestions(
  completions: VariableCompletion[],
  key: string,
): Suggestion[] {
  const variable = completions.find((completion) => completion.key === key);

  return (variable?.params ?? []).map((name) => ({
    label: name,
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: `${name}${VariableSyntax.PARAM_ASSIGNMENT}`,
  }));
}

function operationSuggestions(
  keywords: readonly OperationKeyword[],
): Suggestion[] {
  return keywords.map(({ keyword, arity }) => ({
    label: keyword,
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: arity
      ? `${keyword}${CallSyntax.ARGUMENT_OPEN}${VariableCompletionConfig.SNIPPET_CARET}${CallSyntax.ARGUMENT_CLOSE}`
      : keyword,
    snippet: arity > 0,
  }));
}

function readSuggestions(
  context: ChunkContext,
  completions: VariableCompletion[],
): Suggestion[] {
  switch (context.chunk) {
    case ReferenceChunk.KEY:
      return variableSuggestions(completions);
    case ReferenceChunk.PARAM:
      return paramSuggestions(completions, context.key);
    case ReferenceChunk.OPERATION:
      return operationSuggestions(getOperationKeywords());
  }
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
  const context = readChunkContext(line, position.column);
  if (!context) {
    return { suggestions: [] };
  }

  const range = new monaco.Range(
    position.lineNumber,
    context.start,
    position.lineNumber,
    position.column,
  );

  return {
    suggestions: readSuggestions(context, completions).map((suggestion) => ({
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
