import { EditorActionId, EditorActionOrder } from "@/common/editorConfig";
import { VariableField } from "@/common/enums";
import { useTranslation } from "@/i18n";
import type { EditorAction } from "@/monaco/actions";
import { useStore } from "@/store/store";
import { braceToken, braceTokenKeyRange } from "@/utils/resolution";
import { useMemo } from "react";

export function useExtractVariableAction(): EditorAction[] {
  const t = useTranslation();
  const extractVariable = useStore((state) => state.extractVariable);
  const updateVariable = useStore((state) => state.updateVariable);

  return useMemo(
    () => [
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
    ],
    [t, extractVariable, updateVariable],
  );
}
