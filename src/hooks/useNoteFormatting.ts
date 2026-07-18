import { MarkdownWrap, WrapPairs } from "@/common/config";
import { useCallback, type KeyboardEvent } from "react";

const WRAP_BY_KEY: Record<string, string> = {
  b: MarkdownWrap.BOLD,
  i: MarkdownWrap.ITALIC,
  dead: MarkdownWrap.CODE,
  "`": MarkdownWrap.CODE,
  "´": MarkdownWrap.CODE,
};

function wrapSelection(
  textarea: HTMLTextAreaElement,
  open: string,
  close: string,
  onChange: (value: string) => void,
): void {
  const { selectionStart, selectionEnd, value } = textarea;
  const selected = value.slice(selectionStart, selectionEnd);

  const nextValue =
    value.slice(0, selectionStart) +
    open +
    selected +
    close +
    value.slice(selectionEnd);

  const nextStart = selectionStart + open.length;
  const nextEnd = nextStart + selected.length;

  onChange(nextValue);
  queueMicrotask(() => {
    textarea.selectionStart = nextStart;
    textarea.selectionEnd = nextEnd;
  });
}

export function useNoteFormatting(
  onChange: (value: string) => void,
): (event: KeyboardEvent<HTMLTextAreaElement>) => void {
  return useCallback(
    (event) => {
      if (event.altKey) {
        return;
      }

      const textarea = event.currentTarget;
      const ctrl = event.ctrlKey || event.metaKey;

      // bold / italic / code
      if (ctrl) {
        const wrap = WRAP_BY_KEY[event.key.toLowerCase()];
        if (wrap) {
          event.preventDefault();
          wrapSelection(textarea, wrap, wrap, onChange);
        }

        return;
      }

      // Bracket / quote wrapping
      if (textarea.selectionStart === textarea.selectionEnd) {
        return;
      }

      const close = WrapPairs[event.key as keyof typeof WrapPairs];
      if (close) {
        event.preventDefault();
        wrapSelection(textarea, event.key, close, onChange);
      }
    },
    [onChange],
  );
}
