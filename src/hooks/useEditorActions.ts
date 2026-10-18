import { EditorActionId, EditorActionOrder } from "@/common/editorConfig";
import { VariableField } from "@/common/enums";
import type { Variable } from "@/common/types";
import { useTranslation } from "@/i18n";
import type { EditorAction } from "@/monaco/actions";
import { getActiveTab, useStore, useStoreApi } from "@/store/store";
import {
  braceToken,
  braceTokenKeyRange,
  dropBraceEscapes,
  escapableReferenceAt,
  escapeBraces,
  inlineReferences,
} from "@/utils/resolution";
import { useMemo } from "react";

const NO_VARIABLES: Variable[] = [];

export function useEditorActions(): EditorAction[] {
  const t = useTranslation();
  const store = useStoreApi();
  const extractVariable = useStore((state) => state.extractVariable);
  const updateVariable = useStore((state) => state.updateVariable);

  return useMemo(() => {
    const inlineVariables = (text: string) =>
      inlineReferences(
        text,
        getActiveTab(store.getState())?.variables ?? NO_VARIABLES,
      );

    return [
      {
        id: EditorActionId.EXTRACT_VARIABLE,
        label: t.command.extractVariable,
        order: EditorActionOrder.EXTRACT_VARIABLE,
        run: ({ text, rename }) => {
          const extracted = extractVariable(text);
          if (!extracted) {
            return;
          }

          const { id, key } = extracted;
          rename(braceToken(key), braceTokenKeyRange(key), (newKey) =>
            updateVariable(id, VariableField.KEY, newKey),
          );
        },
      },
      {
        id: EditorActionId.INLINE_VARIABLE,
        label: t.command.inlineVariable,
        order: EditorActionOrder.INLINE_VARIABLE,
        caretRange: escapableReferenceAt,
        isAvailable: (text) => inlineVariables(text) !== text,
        run: ({ text, replace }) => {
          const inlined = inlineVariables(text);
          if (inlined !== text) {
            replace(inlined);
          }
        },
      },
      {
        id: EditorActionId.ESCAPE_VARIABLE,
        label: t.command.escapeVariable,
        order: EditorActionOrder.ESCAPE_VARIABLE,
        caretRange: escapableReferenceAt,
        isAvailable: (text) => escapeBraces(text) !== text,
        run: ({ text, replace }) => {
          const escaped = escapeBraces(text);
          if (escaped !== text) {
            replace(escaped);
          }
        },
      },
      {
        id: EditorActionId.UNESCAPE_VARIABLE,
        label: t.command.unescapeVariable,
        order: EditorActionOrder.UNESCAPE_VARIABLE,
        caretRange: escapableReferenceAt,
        isAvailable: (text) => dropBraceEscapes(text) !== text,
        run: ({ text, replace }) => {
          const unescaped = dropBraceEscapes(text);
          if (unescaped !== text) {
            replace(unescaped);
          }
        },
      },
    ];
  }, [t, store, extractVariable, updateVariable]);
}
