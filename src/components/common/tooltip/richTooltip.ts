import { DataAttr } from "@/common/constants/dom";
import { useId, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface RichTooltipSlot {
  id: string;
  element: HTMLElement;
}

let slot: RichTooltipSlot | null = null;
const listeners = new Set<() => void>();

/** Called whenever the bubble's content element changes hands. */
export function publishRichTooltipSlot(next: RichTooltipSlot | null): void {
  if (slot?.id === next?.id && slot?.element === next?.element) {
    return;
  }

  slot = next;
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** A tooltip whose content is any React tree, and that the pointer can enter. */
export function useRichTooltip() {
  const id = useId();
  const element = useSyncExternalStore(subscribe, () =>
    slot?.id === id ? slot.element : null,
  );

  return {
    props: { [DataAttr.TOOLTIP_RICH]: id },
    render: (content: () => ReactNode) =>
      element ? createPortal(content(), element) : null,
  };
}
