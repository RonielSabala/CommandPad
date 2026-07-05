import { Anchor, Cursor, DataAttr, Selector } from "@/common/constants/dom";
import { EventType, MouseButton } from "@/common/constants/events";
import { AppMode, LassoMode } from "@/common/enums";
import { useStore } from "@/store/store";
import { useEffect } from "react";
import { lasso } from "./lasso";

export function useDocumentInteractions(): void {
  useEffect(() => {
    let mouseX = 0;
    let mouseY = 0;

    const isOverLink = (x: number, y: number): HTMLAnchorElement | undefined =>
      document
        .elementsFromPoint(x, y)
        .find((element): element is HTMLAnchorElement =>
          element.matches(Selector.NOTE_LINK),
        ) as HTMLAnchorElement | undefined;

    const onMouseMove = (event: MouseEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;

      if (!event.altKey) {
        return;
      }

      document.body.style.cursor = isOverLink(mouseX, mouseY)
        ? Cursor.POINTER
        : Cursor.DEFAULT;
    };

    const onMouseDown = (event: MouseEvent) => {
      const state = useStore.getState();
      if (
        !(event.ctrlKey || event.metaKey) ||
        event.button !== MouseButton.LEFT ||
        state.mode === AppMode.READ
      ) {
        return;
      }

      const blockElement = (event.target as Element).closest(
        Selector.BLOCK_ITEM,
      );

      if (blockElement) {
        const blockId = blockElement.getAttribute(DataAttr.BLOCK_ID);
        if (blockId) {
          lasso.mode = state.selectedBlockIds.has(blockId)
            ? LassoMode.DESELECT
            : LassoMode.SELECT;
          state.setBlockSelected(blockId, lasso.mode === LassoMode.SELECT);
        }
      } else {
        lasso.mode = LassoMode.SELECT;
      }

      lasso.active = true;
    };

    const onMouseUp = () => {
      lasso.active = false;
    };

    const onClick = (event: MouseEvent) => {
      const state = useStore.getState();

      if (event.altKey) {
        const link = isOverLink(event.clientX, event.clientY);
        if (!link) {
          return;
        }

        event.preventDefault();
        state.setAltHeld(false);
        window.open(link.href, Anchor.TARGET_BLANK, Anchor.REL);
        return;
      }

      if (event.ctrlKey || event.metaKey) {
        return;
      }

      const target = event.target as Element;
      if (
        state.focusedRunbookId !== null &&
        !target.closest(Selector.RUNBOOK_ITEM_BTN)
      ) {
        state.setRunbookFocus(null);
      }

      if (
        state.selectedBlockIds.size > 0 &&
        !target.closest(
          `${Selector.BLOCK_CONTROLS}, ${Selector.BLOCK_DRAG_HANDLE}`,
        )
      ) {
        state.clearBlockSelection();
      }
    };

    document.addEventListener(EventType.MOUSE_MOVE, onMouseMove);
    document.addEventListener(EventType.MOUSE_DOWN, onMouseDown);
    document.addEventListener(EventType.MOUSE_UP, onMouseUp);
    document.addEventListener(EventType.CLICK, onClick);
    return () => {
      document.removeEventListener(EventType.MOUSE_MOVE, onMouseMove);
      document.removeEventListener(EventType.MOUSE_DOWN, onMouseDown);
      document.removeEventListener(EventType.MOUSE_UP, onMouseUp);
      document.removeEventListener(EventType.CLICK, onClick);
    };
  }, []);
}
