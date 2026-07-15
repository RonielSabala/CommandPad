import { CssClass } from "@/common/constants/css";
import { Anchor, Cursor } from "@/common/constants/dom";
import { EventType } from "@/common/constants/events";
import { isModifierPressed, ModifierAction } from "@/common/keybindings";
import { useStoreApi } from "@/store/store";
import { useEffect } from "react";
import { blockDrag, clearBlockDrag } from "./blockDrag";

export function useDocumentInteractions(): void {
  const store = useStoreApi();

  useEffect(() => {
    let mouseX = 0;
    let mouseY = 0;

    const isOverLink = (x: number, y: number): HTMLAnchorElement | undefined =>
      document
        .elementsFromPoint(x, y)
        .find((element): element is HTMLAnchorElement =>
          element.matches(`.${CssClass.NOTE_LINK}`),
        ) as HTMLAnchorElement | undefined;

    const onMouseMove = (event: MouseEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;

      if (blockDrag.srcId && event.buttons === 0) {
        clearBlockDrag();
      }

      if (!isModifierPressed(event, ModifierAction.OPEN_LINK)) {
        return;
      }

      document.body.style.cursor = isOverLink(mouseX, mouseY)
        ? Cursor.POINTER
        : Cursor.DEFAULT;
    };

    const onClick = (event: MouseEvent) => {
      const state = store.getState();

      if (isModifierPressed(event, ModifierAction.OPEN_LINK)) {
        const link = isOverLink(event.clientX, event.clientY);
        if (!link) {
          return;
        }

        event.preventDefault();
        state.setLinkKeyHeld(false);
        window.open(link.href, Anchor.TARGET_BLANK, Anchor.REL);
        return;
      }

      if (isModifierPressed(event, ModifierAction.SELECT_BLOCKS)) {
        return;
      }

      const target = event.target as Element;
      if (
        state.focusedRunbookId !== null &&
        !target.closest(`.${CssClass.RUNBOOK_ITEM_BTN}`)
      ) {
        state.setRunbookFocus(null);
      }
    };

    document.addEventListener(EventType.MOUSE_MOVE, onMouseMove);
    document.addEventListener(EventType.CLICK, onClick);
    return () => {
      document.removeEventListener(EventType.MOUSE_MOVE, onMouseMove);
      document.removeEventListener(EventType.CLICK, onClick);
    };
  }, [store]);
}
