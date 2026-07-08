import { MarkdownWrap } from "@/common/config";
import { useCallback, type KeyboardEvent } from "react";

const WRAP_BY_KEY: Record<string, string> = {
  b: MarkdownWrap.BOLD,
  i: MarkdownWrap.ITALIC,
  dead: MarkdownWrap.CODE,
  "`": MarkdownWrap.CODE,
  "´": MarkdownWrap.CODE,
};

export function useNoteFormatting(
  onChange: (value: string) => void,
): (event: KeyboardEvent<HTMLTextAreaElement>) => void {
  return useCallback(
    (event) => {
      const ctrl = event.ctrlKey || event.metaKey;
      if (!ctrl || event.altKey) {
        return;
      }

      const wrap = WRAP_BY_KEY[event.key.toLowerCase()];
      if (!wrap) {
        return;
      }

      event.preventDefault();

      const textarea = event.currentTarget;
      const { selectionStart, selectionEnd, value } = textarea;
      const selected = value.slice(selectionStart, selectionEnd);

      const nextValue =
        value.slice(0, selectionStart) +
        wrap +
        selected +
        wrap +
        value.slice(selectionEnd);

      // Keep the original text selected
      const nextStart = selectionStart + wrap.length;
      const nextEnd = nextStart + selected.length;

      onChange(nextValue);
      queueMicrotask(() => {
        textarea.selectionStart = nextStart;
        textarea.selectionEnd = nextEnd;
      });
    },
    [onChange],
  );
}
