import { Key } from "@/common/constants/events";
import type { KeyboardEvent, SyntheticEvent } from "react";

/** The props that make an element that can't be a `<button>` act as one. */
export function asButton(activate: (event: SyntheticEvent) => void) {
  return {
    role: "button",
    tabIndex: 0,
    onClick: activate,
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key === Key.ENTER || event.key === Key.SPACE) {
        event.preventDefault();
        activate(event);
      }
    },
  } as const;
}
