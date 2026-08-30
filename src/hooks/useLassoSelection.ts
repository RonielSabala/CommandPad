import { InputSelector, ModalSelector } from "@/common/constants/dom";
import { EventType, Key, MouseButton } from "@/common/constants/events";
import { AppMode, LassoMode, type SelectionGroup } from "@/common/enums";
import { isModifierPressed, ModifierAction } from "@/common/keybindings";
import { useStoreApi } from "@/store/store";
import { useEffect } from "react";

import { lasso } from "./lasso";
import { SELECTION_GROUPS } from "./selectionGroups";

export function useLassoSelection(
  root: Document | HTMLElement | null,
  group: SelectionGroup,
): void {
  const store = useStoreApi();

  useEffect(() => {
    if (!root) {
      return;
    }

    const definition = SELECTION_GROUPS[group];
    const drag = lasso[group];

    // Only react while the pointer is over it,
    const scoped = root !== document;
    let pointerInside = !scoped;

    const isEditing = () =>
      !!document.activeElement?.matches(InputSelector.EDITABLE);

    const isModalOpen = () => !!document.querySelector(ModalSelector.OPEN);

    const setSelectMode = (held: boolean) =>
      store.getState().setSelectKeyHeld(held);

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (
        pointerInside &&
        !event.ctrlKey &&
        !isEditing() &&
        !isModalOpen() &&
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
        isEditing() ||
        isModalOpen()
      ) {
        return;
      }

      const itemElement = (event.target as Element).closest(
        `.${definition.itemClass}`,
      );

      if (itemElement) {
        const itemId = itemElement.getAttribute(definition.idAttr);
        if (itemId) {
          drag.mode = definition.getSelected(state).has(itemId)
            ? LassoMode.DESELECT
            : LassoMode.SELECT;

          definition.setSelected(state, itemId, drag.mode === LassoMode.SELECT);
        }
      } else {
        drag.mode = LassoMode.SELECT;
      }

      drag.active = true;
    };

    const onMouseUp = () => {
      drag.active = false;
    };

    const onClick = (event: MouseEvent) => {
      const state = store.getState();
      if (isModifierPressed(event, ModifierAction.SELECT_BLOCKS)) {
        return;
      }

      const target = event.target as Element;
      if (
        definition.getSelected(state).size > 0 &&
        !target.closest(definition.keepSelectionSelector)
      ) {
        definition.clearSelection(state);
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
  }, [store, root, group]);
}
