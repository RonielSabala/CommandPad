import { WrapPairs } from "@/common/config";
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
    element.selectionStart = nextStart;
    element.selectionEnd = nextEnd;
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
