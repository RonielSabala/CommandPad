import { CssClass } from "@/common/constants/css";
import { DataAttr, InputSelector } from "@/common/constants/dom";
import { EventType, Key, MouseButton } from "@/common/constants/events";
import { AppMode, LassoMode } from "@/common/enums";
import { isModifierPressed, ModifierAction } from "@/common/keybindings";
import { useStoreApi } from "@/store/store";
import { useEffect } from "react";
import { lasso } from "./lasso";

export function useBlockSelection(root: Document | HTMLElement | null): void {
  const store = useStoreApi();

  useEffect(() => {
    if (!root) {
      return;
    }

    // Only react while the pointer is over it,
    const scoped = root !== document;
    let pointerInside = !scoped;

    const isEditing = () =>
      !!document.activeElement?.matches(InputSelector.EDITABLE);

    const setSelectMode = (held: boolean) =>
      store.getState().setSelectKeyHeld(held);

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (
        pointerInside &&
        !event.ctrlKey &&
        !isEditing() &&
        isModifierPressed(event, ModifierAction.SELECT_BLOCKS) &&
        store.getState().mode !== AppMode.READ
      ) {
        setSelectMode(true);
      }
    };

    const onKeyUp = (event: globalThis.KeyboardEvent) => {
      if (event.key === Key.SHIFT) {
        setSelectMode(false);
      }
    };

    const onWindowBlur = () => setSelectMode(false);

    const onPointerEnter = () => {
      pointerInside = true;
    };

    const onPointerLeave = () => {
      pointerInside = false;
      setSelectMode(false);
    };

    const onMouseDown = (event: MouseEvent) => {
      const state = store.getState();
      if (
        state.mode === AppMode.READ ||
        event.button !== MouseButton.LEFT ||
        !isModifierPressed(event, ModifierAction.SELECT_BLOCKS) ||
        isEditing()
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
      const state = store.getState();
      if (isModifierPressed(event, ModifierAction.SELECT_BLOCKS)) {
        return;
      }

      const target = event.target as Element;
      if (
        state.selectedBlockIds.size > 0 &&
        !target.closest(
          `.${CssClass.BLOCK_CONTROLS}, .${CssClass.BLOCK_DRAG_HANDLE}`,
        )
      ) {
        state.clearBlockSelection();
      }
    };

    document.addEventListener(EventType.KEY_DOWN, onKeyDown);
    document.addEventListener(EventType.KEY_UP, onKeyUp);
    document.addEventListener(EventType.MOUSE_UP, onMouseUp);
    window.addEventListener(EventType.BLUR, onWindowBlur);
    root.addEventListener(EventType.MOUSE_DOWN, onMouseDown as EventListener);
    root.addEventListener(EventType.CLICK, onClick as EventListener);
    if (scoped) {
      root.addEventListener(EventType.MOUSE_ENTER, onPointerEnter);
      root.addEventListener(EventType.MOUSE_LEAVE, onPointerLeave);
    }

    return () => {
      document.removeEventListener(EventType.KEY_DOWN, onKeyDown);
      document.removeEventListener(EventType.KEY_UP, onKeyUp);
      document.removeEventListener(EventType.MOUSE_UP, onMouseUp);
      window.removeEventListener(EventType.BLUR, onWindowBlur);
      root.removeEventListener(
        EventType.MOUSE_DOWN,
        onMouseDown as EventListener,
      );
      root.removeEventListener(EventType.CLICK, onClick as EventListener);
      if (scoped) {
        root.removeEventListener(EventType.MOUSE_ENTER, onPointerEnter);
        root.removeEventListener(EventType.MOUSE_LEAVE, onPointerLeave);
      }
      setSelectMode(false);
    };
  }, [store, root]);
}
