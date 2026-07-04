import { DEBOUNCE_SAVE_MS } from "@/common/config";
import { EventType } from "@/common/constants/events";
import { useStore } from "@/store/store";
import { debounce } from "@/utils/id";
import { useEffect, type RefObject } from "react";

export function useScrollPersistence(ref: RefObject<HTMLElement | null>): void {
  const initialized = useStore((s) => s.initialized);

  useEffect(() => {
    if (!initialized || !ref.current) {
      return;
    }
    const el = ref.current;
    requestAnimationFrame(() => {
      el.scrollTop = useStore.getState().scrollTop;
    });
  }, [initialized, ref]);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const persist = debounce(
      () => useStore.getState().setScrollTop(el.scrollTop),
      DEBOUNCE_SAVE_MS,
    );
    el.addEventListener(EventType.SCROLL, persist);
    return () => el.removeEventListener(EventType.SCROLL, persist);
  }, [ref]);
}
