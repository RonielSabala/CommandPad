import { DEBOUNCE_SAVE_MS } from "@/common/config";
import { EventType } from "@/common/constants/events";
import { useStore } from "@/store/store";
import { debounce } from "@/utils/id";
import { useEffect, type RefObject } from "react";

export function useScrollPersistence(ref: RefObject<HTMLElement | null>): void {
  const initialized = useStore((state) => state.initialized);

  useEffect(() => {
    if (!initialized || !ref.current) {
      return;
    }

    const element = ref.current;
    requestAnimationFrame(() => {
      element.scrollTop = useStore.getState().scrollTop;
    });
  }, [initialized, ref]);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const persist = debounce(
      () => useStore.getState().setScrollTop(element.scrollTop),
      DEBOUNCE_SAVE_MS,
    );

    element.addEventListener(EventType.SCROLL, persist);
    return () => element.removeEventListener(EventType.SCROLL, persist);
  }, [ref]);
}
