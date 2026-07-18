import { WrapPairs } from "@/common/config";
import { EditCommand } from "@/common/constants/dom";
import { useCallback, type KeyboardEvent } from "react";

type WrappableElement = HTMLTextAreaElement | HTMLInputElement;

export function wrapSelection(
  element: WrappableElement,
  open: string,
  close: string,
  onChange: (value: string) => void,
): void {
  const { selectionStart, selectionEnd, value } = element;
  if (selectionStart === null || selectionEnd === null) {
    return;
  }

  const selected = value.slice(selectionStart, selectionEnd);

  if (
    !document.execCommand(
      EditCommand.INSERT_TEXT,
      false,
      open + selected + close,
    )
  ) {
    onChange(
      value.slice(0, selectionStart) +
        open +
        selected +
        close +
        value.slice(selectionEnd),
    );
  }

  const nextStart = selectionStart + open.length;
  queueMicrotask(() => {
    element.setSelectionRange(nextStart, nextStart + selected.length);
  });
}

export function usePairWrapping(
  onChange: (value: string) => void,
): (event: KeyboardEvent<WrappableElement>) => void {
  return useCallback(
    (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      const element = event.currentTarget;
      if (element.selectionStart === element.selectionEnd) {
        return;
      }

      const close = WrapPairs[event.key as keyof typeof WrapPairs];
      if (close) {
        event.preventDefault();
        wrapSelection(element, event.key, close, onChange);
      }
    },
    [onChange],
  );
}
