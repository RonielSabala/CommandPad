import { DataAttr } from "@/common/constants/dom";
import { useId, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";

export interface RichTooltipControls {
  /** Kept open until dismissed. */
  pinned: boolean;
  anchor: HTMLElement;
  hide: () => void;
  pin: () => void;
}

interface RichTooltipSlot extends RichTooltipControls {
  id: string;
  element: HTMLElement;
}

let slot: RichTooltipSlot | null = null;
const listeners = new Set<() => void>();

/** Called whenever the bubble's content element changes hands. */
export function publishRichTooltipSlot(next: RichTooltipSlot | null): void {
  if (
    slot?.id === next?.id &&
    slot?.element === next?.element &&
    slot?.anchor === next?.anchor &&
    slot?.hide === next?.hide &&
    slot?.pinned === next?.pinned &&
    slot?.pin === next?.pin
  ) {
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
  const shown = useSyncExternalStore(subscribe, () =>
    slot?.id === id ? slot : null,
  );

  return {
    props: { [DataAttr.TOOLTIP_RICH]: id },
    pinned: shown?.pinned ?? false,
    render: (content: (tip: RichTooltipControls) => ReactNode) =>
      shown ? createPortal(content(shown), shown.element) : null,
  };
}
