import { SCROLL_IDLE_MS } from "@/common/config";
import { CssClass } from "@/common/constants/css";
import { EventType, PASSIVE } from "@/common/constants/events";
import { useEffect, type RefObject } from "react";

/** Marks a scroller with `is-scrolling` while it moves. */
export function useScrollingClass(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    let timer: ReturnType<typeof setTimeout> | undefined;

    const settle = () => {
      timer = undefined;
      element.classList.remove(CssClass.IS_SCROLLING);
    };
    const onScroll = () => {
      if (timer === undefined) {
        element.classList.add(CssClass.IS_SCROLLING);
      } else {
        clearTimeout(timer);
      }

      timer = setTimeout(settle, SCROLL_IDLE_MS);
    };

    element.addEventListener(EventType.SCROLL, onScroll, PASSIVE);
    return () => {
      element.removeEventListener(EventType.SCROLL, onScroll);
      clearTimeout(timer);

      element.classList.remove(CssClass.IS_SCROLLING);
    };
  }, [ref]);
}
