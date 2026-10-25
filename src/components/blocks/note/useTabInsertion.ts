import { Key, TAB_CHARACTER } from "@/common/constants/events";
import { replaceSelection } from "@/utils/dom";
import { useCallback, type KeyboardEvent } from "react";

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
      const nextCaret = textarea.selectionStart + TAB_CHARACTER.length;

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
