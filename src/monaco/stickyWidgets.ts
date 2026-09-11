import { CodeSurfaceSelector, MonacoSelector } from "@/common/constants/dom";
import { EventType, PASSIVE, PASSIVE_CAPTURE } from "@/common/constants/events";
import { CodeEditorProperty } from "@/common/editorConfig";
import type { editor } from "monaco-editor";

import { getFindController } from "./findWidget";
import { findScrollParent, scrollParentBox } from "./scrollParent";

/** Keeps the find/replace widget inside the visible band of a flowing editor. */
export function bindStickyWidgets(
  instance: editor.IStandaloneCodeEditor,
): void {
  const node = instance.getDomNode();
  const find = getFindController(instance);

  if (!node || !find) {
    return;
  }

  const root = node.closest(CodeSurfaceSelector.ROOT);
  const state = find.getState();
  let tracking = false;

  const pin = () => {
    const widget = node.querySelector<HTMLElement>(MonacoSelector.FIND_WIDGET);
    if (!widget) {
      return;
    }

    const box = node.getBoundingClientRect();
    const { top } = scrollParentBox(findScrollParent(node));

    const header = root?.querySelector(CodeSurfaceSelector.HEADER);
    const clear = Math.max(top, header?.getBoundingClientRect().bottom ?? top);

    const travel = Math.max(box.height - widget.offsetHeight, 0);
    const offset = Math.min(Math.max(clear - box.top, 0), travel);

    node.style.setProperty(CodeEditorProperty.WIDGET_OFFSET, `${offset}px`);
  };

  const stop = () => {
    if (!tracking) {
      return;
    }

    tracking = false;
    document.removeEventListener(EventType.SCROLL, pin, PASSIVE_CAPTURE);
    window.removeEventListener(EventType.RESIZE, pin);
    node.style.removeProperty(CodeEditorProperty.WIDGET_OFFSET);
  };

  const start = () => {
    if (!tracking) {
      tracking = true;

      document.addEventListener(EventType.SCROLL, pin, PASSIVE_CAPTURE);
      window.addEventListener(EventType.RESIZE, pin, PASSIVE);
    }

    pin();
  };

  // Every change re-pins
  state.onFindReplaceStateChange(() => (state.isRevealed ? start() : stop()));
  instance.onDidDispose(stop);
}
