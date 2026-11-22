import { DEBOUNCE_SAVE_MS } from "@/common/config";
import type { RunbookView } from "@/common/enums";
import type { CodeEditorHandle } from "@/components/common/codeEditor/CodeEditor";
import { useViewScope } from "@/components/tabs/tabScope";
import { getTabById, useStore, useStoreApi } from "@/store/store";
import { debounce } from "@/utils/debounce";
import { useEffect, useMemo, type RefObject } from "react";

export function useMonacoScrollPersistence(
  handleRef: RefObject<CodeEditorHandle | null>,
  view: RunbookView,
): { onScrollChange: (scrollTop: number) => void } {
  const store = useStoreApi();
  const initialized = useStore((state) => state.initialized);
  const { tabId, shown } = useViewScope();

  // Restore the saved scroll position of the tab the view shows
  useEffect(() => {
    const handle = handleRef.current;
    if (!initialized || !handle || tabId === null) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      handle.setScrollTop(
        getTabById(store.getState(), tabId)?.scrollTop[view] ?? 0,
      );
    });

    return () => cancelAnimationFrame(frame);
  }, [initialized, tabId, handleRef, store, view]);

  // Persist scroll changes onto that tab, while the view shows
  const onScrollChange = useMemo(
    () =>
      shown && tabId !== null
        ? debounce(
            (scrollTop: number) =>
              store.getState().setScrollTop(tabId, view, scrollTop),
            DEBOUNCE_SAVE_MS,
          )
        : () => {},
    [store, view, shown, tabId],
  );

  return { onScrollChange };
}
