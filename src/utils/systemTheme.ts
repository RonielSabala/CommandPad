import { MediaQuery } from "@/common/constants/dom";
import { EventType } from "@/common/constants/events";
import { Theme } from "@/common/enums";

const prefersDark = globalThis.matchMedia?.(MediaQuery.PREFERS_DARK);

export function readSystemTheme(): Theme {
  return prefersDark?.matches ? Theme.DARK : Theme.LIGHT;
}

/** Call `onChange` whenever the system theme flips. */
export function subscribeSystemTheme(onChange: () => void): () => void {
  prefersDark?.addEventListener(EventType.CHANGE, onChange);
  return () => prefersDark?.removeEventListener(EventType.CHANGE, onChange);
}
