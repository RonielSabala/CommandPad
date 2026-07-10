import { CssClass } from "@/common/constants/css";
import { Anchor, Cursor, DataAttr } from "@/common/constants/dom";
import { EventType, MouseButton } from "@/common/constants/events";
import { AppMode, LassoMode } from "@/common/enums";
import { isModifierPressed, ModifierAction } from "@/common/keybindings";
import { useStore } from "@/store/store";
import { useEffect } from "react";
import { blockDrag, clearBlockDrag } from "./blockDrag";
import { lasso } from "./lasso";

export function useDocumentInteractions(): void {
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

    const onMouseDown = (event: MouseEvent) => {
      const state = useStore.getState();
      if (
        !isModifierPressed(event, ModifierAction.SELECT_BLOCKS) ||
        event.button !== MouseButton.LEFT ||
        state.mode === AppMode.READ
      ) {
        return;
      }

      const blockElement = (event.target as Element).closest(
        `.${CssClass.BLOCK_ITEM}`,
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

      if (
        state.selectedBlockIds.size > 0 &&
        !target.closest(
          `.${CssClass.BLOCK_CONTROLS}, .${CssClass.BLOCK_DRAG_HANDLE}`,
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
