import { MonacoSelector } from "@/common/constants/dom";
import type { ScrollTarget } from "@/components/common/scrollTarget";
import type { editor } from "monaco-editor";

export function monacoScrollTarget(
  instance: editor.IStandaloneCodeEditor,
): ScrollTarget {
  const viewLines = instance
    .getDomNode()
    ?.querySelector<HTMLElement>(MonacoSelector.VIEW_LINES);

  return {
    getScrollLeft: () => instance.getScrollLeft(),
    setScrollLeft: (value) => instance.setScrollLeft(value),
    getScrollWidth: () =>
      Math.max(instance.getScrollWidth(), viewLines?.scrollWidth ?? 0),
    getClientWidth: () => instance.getLayoutInfo().contentWidth,

    onScroll: (listener) => {
      const subscription = instance.onDidScrollChange((event) => {
        if (event.scrollLeftChanged) {
          listener();
        }
      });
      return () => subscription.dispose();
    },

    onResize: (listener) => {
      const subscription = instance.onDidLayoutChange(listener);
      return () => subscription.dispose();
    },
  };
}
