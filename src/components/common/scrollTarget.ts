import { EventType } from "@/common/constants/events";
import { useMemo, type RefObject } from "react";

/** A horizontally scrollable thing, whatever owns the scrolling. */
export interface ScrollTarget {
  getScrollLeft(): number;
  setScrollLeft(value: number): void;
  getScrollWidth(): number;
  getClientWidth(): number;
  onScroll(listener: () => void): () => void;
  onResize(listener: () => void): () => void;
}

const NO_SUBSCRIPTION = () => {};

/** An element that scrolls itself. */
export function useDomScrollTarget(
  ref: RefObject<HTMLElement | null>,
): ScrollTarget {
  return useMemo(
    () => ({
      getScrollLeft: () => ref.current?.scrollLeft ?? 0,
      setScrollLeft: (value) => {
        if (ref.current) {
          ref.current.scrollLeft = value;
        }
      },
      getScrollWidth: () => ref.current?.scrollWidth ?? 0,
      getClientWidth: () => ref.current?.clientWidth ?? 0,

      onScroll: (listener) => {
        const element = ref.current;
        if (!element) {
          return NO_SUBSCRIPTION;
        }

        element.addEventListener(EventType.SCROLL, listener, { passive: true });
        return () => element.removeEventListener(EventType.SCROLL, listener);
      },

      onResize: (listener) => {
        const element = ref.current;
        if (!element) {
          return NO_SUBSCRIPTION;
        }

        const observer = new ResizeObserver(listener);
        observer.observe(element);
        return () => observer.disconnect();
      },
    }),
    [ref],
  );
}
