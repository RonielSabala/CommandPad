import { EditCommand } from "@/common/constants/dom";
import { Key, TAB_CHARACTER } from "@/common/constants/events";
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
      const { selectionStart, selectionEnd, value } = textarea;

      if (document.execCommand(EditCommand.INSERT_TEXT, false, TAB_CHARACTER)) {
        return;
      }

      const nextValue =
        value.slice(0, selectionStart) +
        TAB_CHARACTER +
        value.slice(selectionEnd);

      const nextCaret = selectionStart + TAB_CHARACTER.length;

      onChange(nextValue);
      queueMicrotask(() => {
        textarea.selectionStart = textarea.selectionEnd = nextCaret;
      });
    },
    [onChange],
  );
}
