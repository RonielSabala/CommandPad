import { Key, TAB_CHARACTER } from "@/common/constants/events";
import { replaceSelection } from "@/utils/dom";
import { indentNoteLines } from "@/utils/markdown";
import { useCallback, type KeyboardEvent } from "react";

import { applyNoteEdit } from "./useNoteFormatting";

export function useTabInsertion(
  onChange: (value: string) => void,
): (event: KeyboardEvent<HTMLTextAreaElement>) => void {
  return useCallback(
    (event) => {
      if (event.key !== Key.TAB || event.shiftKey) {
        return;
      }

      event.preventDefault();

      const textarea = event.currentTarget;
      const { value, selectionStart, selectionEnd } = textarea;
      const edit = indentNoteLines(
        value,
        { from: selectionStart, to: selectionEnd },
        TAB_CHARACTER,
      );

      if (edit) {
        applyNoteEdit(textarea, edit, onChange);
        return;
      }

      const nextCaret = selectionStart + TAB_CHARACTER.length;
      if (replaceSelection(textarea, TAB_CHARACTER, onChange)) {
        return;
      }

      queueMicrotask(() => {
        textarea.selectionStart = textarea.selectionEnd = nextCaret;
      });
    },
    [onChange],
  );
}
