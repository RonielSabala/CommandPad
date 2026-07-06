import { DEBOUNCE_SAVE_MS } from "@/common/config";
import { EventType } from "@/common/constants/events";
import { getActiveTab, useStore } from "@/store/store";
import { debounce } from "@/utils/debounce";
import { useEffect, type RefObject } from "react";

export function useScrollPersistence(ref: RefObject<HTMLElement | null>): void {
  const initialized = useStore((state) => state.initialized);
  const activeTabId = useStore((state) => state.activeTabId);

  // Restore the active tab's saved scroll position
  useEffect(() => {
    const element = ref.current;
    if (!initialized || !element) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      element.scrollTop = getActiveTab(useStore.getState())?.scrollTop ?? 0;
    });
    return () => cancelAnimationFrame(frame);
  }, [initialized, activeTabId, ref]);

  // Persist scroll changes onto the active tab
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
