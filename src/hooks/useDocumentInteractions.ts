import { CssClass } from "@/common/constants/css";
import { EventType } from "@/common/constants/events";
import { isModifierPressed, ModifierAction } from "@/common/keybindings";
import { useStoreApi } from "@/store/store";
import { useEffect } from "react";
import { blockDrag, clearBlockDrag } from "./blockDrag";

export function useDocumentInteractions(): void {
  const store = useStoreApi();

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      if (blockDrag.srcId && event.buttons === 0) {
        clearBlockDrag();
      }
    };

    const onClick = (event: MouseEvent) => {
      if (
        isModifierPressed(event, ModifierAction.OPEN_LINK) ||
        isModifierPressed(event, ModifierAction.SELECT_BLOCKS)
      ) {
        return;
      }

      const state = store.getState();
      const target = event.target as Element;
      if (
        state.focusedRunbookId !== null &&
        !target.closest(`.${CssClass.RUNBOOK_ITEM_BTN}`)
      ) {
        state.setRunbookFocus(null);
      }
    };

    const onDragStart = () => {
      document.body.classList.add(CssClass.ROW_DRAGGING);
    };

    const onDragEnd = () => {
      document.body.classList.remove(CssClass.ROW_DRAGGING);
    };

    document.addEventListener(EventType.MOUSE_MOVE, onMouseMove);
    document.addEventListener(EventType.CLICK, onClick);
    document.addEventListener(EventType.DRAG_START, onDragStart);
    document.addEventListener(EventType.DRAG_END, onDragEnd);
    return () => {
      document.removeEventListener(EventType.MOUSE_MOVE, onMouseMove);
      document.removeEventListener(EventType.CLICK, onClick);
      document.removeEventListener(EventType.DRAG_START, onDragStart);
      document.removeEventListener(EventType.DRAG_END, onDragEnd);
      document.body.classList.remove(CssClass.ROW_DRAGGING);
    };
  }, [store]);
}
