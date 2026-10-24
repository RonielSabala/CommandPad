import { DEBOUNCE_SAVE_MS } from "@/common/config";
import type { RunbookView } from "@/common/enums";
import type { CodeEditorHandle } from "@/components/common/codeEditor/CodeEditor";
import { getActiveTab, useStore, useStoreApi } from "@/store/store";
import { debounce } from "@/utils/debounce";
import { useEffect, useMemo, type RefObject } from "react";

export function useMonacoScrollPersistence(
  handleRef: RefObject<CodeEditorHandle | null>,
  view: RunbookView,
): { onScrollChange: (scrollTop: number) => void } {
  const store = useStoreApi();
  const initialized = useStore((state) => state.initialized);
  const activeTabId = useStore((state) => state.activeTabId);

  // Restore the active tab's saved scroll position
  useEffect(() => {
    const handle = handleRef.current;
    if (!initialized || !handle) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      handle.setScrollTop(getActiveTab(store.getState())?.scrollTop[view] ?? 0);
    });
    return () => cancelAnimationFrame(frame);
  }, [initialized, activeTabId, handleRef, store, view]);

  // Persist scroll changes onto the active tab
  const onScrollChange = useMemo(
    () =>
      debounce(
        (scrollTop: number) => store.getState().setScrollTop(view, scrollTop),
        DEBOUNCE_SAVE_MS,
      ),
    [store, view],
  );

  return { onScrollChange };
}
