import { DEBOUNCE_SAVE_MS } from "@/common/config";
import { EventType } from "@/common/constants/events";
import type { RunbookView } from "@/common/enums";
import { useViewScope } from "@/components/tabs/tabScope";
import { getTabById, useStore, useStoreApi } from "@/store/store";
import { debounce } from "@/utils/debounce";
import { useEffect, type RefObject } from "react";

export function useScrollPersistence(
  ref: RefObject<HTMLElement | null>,
  view: RunbookView,
): void {
  const store = useStoreApi();
  const initialized = useStore((state) => state.initialized);
  const { tabId, shown } = useViewScope();

  // Restore the saved scroll position of the tab the view shows
  useEffect(() => {
    const element = ref.current;
    if (!initialized || !element || tabId === null) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      element.scrollTop =
        getTabById(store.getState(), tabId)?.scrollTop[view] ?? 0;
    });

    return () => cancelAnimationFrame(frame);
  }, [initialized, tabId, ref, store, view]);

  // Persist scroll changes onto that tab, while the view shows
  useEffect(() => {
    const element = ref.current;
    if (!element || !shown || tabId === null) {
      return;
    }

    const persist = debounce(
      (scrollTop: number) =>
        store.getState().setScrollTop(tabId, view, scrollTop),
      DEBOUNCE_SAVE_MS,
    );
    const onScroll = () => persist(element.scrollTop);

    element.addEventListener(EventType.SCROLL, onScroll);
    return () => element.removeEventListener(EventType.SCROLL, onScroll);
  }, [ref, store, view, shown, tabId]);
}
