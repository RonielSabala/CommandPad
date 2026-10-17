import { VariableCompletionConfig } from "@/common/editorConfig";
import { ReferenceChunk } from "@/common/enums";
import { CallSyntax, VariableSyntax } from "@/common/variableSyntax";
import { getOperationKeywords } from "@/utils/resolution";
import type { languages } from "monaco-editor";
import { monaco } from "../setup";
import type { CompletionContext } from "./context";
import type { VariableCompletion } from "./registry";

export interface Suggestion {
  label: string;
  detail?: string;
  /** The runbook it comes from. */
  origin?: string;
  /** Rows sort by group first. */
  group?: number;
  insertText: string;
  kind: languages.CompletionItemKind;
  snippet?: boolean;
}

type SuggestionBuilder = (
  context: CompletionContext,
  completions: VariableCompletion[],
) => Suggestion[];

const BUILDERS: Record<ReferenceChunk, SuggestionBuilder> = {
  [ReferenceChunk.KEY]: (_context, completions) =>
    completions.map(({ key, detail, origin }) => ({
      label: key,
      detail,
      origin: origin?.name,
      group: origin?.embedded
        ? VariableCompletionConfig.EMBEDDED_GROUP
        : VariableCompletionConfig.HOST_GROUP,
      kind: origin?.embedded
        ? monaco.languages.CompletionItemKind.Module
        : monaco.languages.CompletionItemKind.Variable,
      insertText: key,
    })),

  [ReferenceChunk.PARAM]: (context, completions) => {
    const variable = completions.find(({ key }) => key === context.key);

    return (variable?.params ?? []).map((name) => ({
      label: name,
      kind: monaco.languages.CompletionItemKind.Property,
      insertText: `${name}${VariableSyntax.PARAM_ASSIGNMENT}`,
    }));
  },

  [ReferenceChunk.OPERATION]: () =>
    getOperationKeywords().map(({ keyword, arity }) => ({
      label: keyword,
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: arity
        ? `${keyword}${CallSyntax.ARGUMENT_OPEN}${VariableCompletionConfig.SNIPPET_CARET}${CallSyntax.ARGUMENT_CLOSE}`
        : keyword,
      snippet: arity > 0,
    })),
};

export function buildSuggestions(
  context: CompletionContext,
  completions: VariableCompletion[],
): Suggestion[] {
  return BUILDERS[context.chunk](context, completions);
}
