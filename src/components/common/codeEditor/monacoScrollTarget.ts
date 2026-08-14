import type { ScrollTarget } from "@/components/common/scrollTarget";
import type { editor } from "monaco-editor";

export function monacoScrollTarget(
  instance: editor.IStandaloneCodeEditor,
): ScrollTarget {
  return {
    getScrollLeft: () => instance.getScrollLeft(),
    setScrollLeft: (value) => instance.setScrollLeft(value),
    getScrollWidth: () => instance.getScrollWidth(),
    getClientWidth: () => instance.getLayoutInfo().contentWidth,

    onScroll: (listener) => {
      const subscription = instance.onDidScrollChange(listener);
      return () => subscription.dispose();
    },

    onResize: (listener) => {
      const subscription = instance.onDidLayoutChange(listener);
      return () => subscription.dispose();
    },
  };
}
