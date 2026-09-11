import { MonacoCursorSource, RevealScrollConfig } from "@/common/editorConfig";
import type { editor } from "monaco-editor";

import { findScrollParent, scrollParentBox } from "./scrollParent";

export function bindRevealScrolling(
  instance: editor.IStandaloneCodeEditor,
): void {
  const node = instance.getDomNode();
  if (!node) {
    return;
  }

  instance.onDidChangeCursorPosition((event) => {
    if (event.source === MonacoCursorSource.MOUSE) {
      return;
    }

    if (!node.contains(document.activeElement)) {
      return;
    }

    const visible = instance.getScrolledVisiblePosition(event.position);
    if (!visible) {
      return;
    }

    const scroller = findScrollParent(node);
    const { top, bottom } = scrollParentBox(scroller);

    const margin = Math.min(
      RevealScrollConfig.MARGIN_PX,
      (bottom - top) / RevealScrollConfig.MAX_MARGIN_FRACTION,
    );

    const caretTop = node.getBoundingClientRect().top + visible.top;
    const below = caretTop + visible.height - (bottom - margin);
    const above = top + margin - caretTop;

    if (below > 0) {
      scroller.scrollTop += below;
    } else if (above > 0) {
      scroller.scrollTop -= above;
    }
  });
}
