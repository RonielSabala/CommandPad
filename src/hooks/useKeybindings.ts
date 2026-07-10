import { InputSelector } from "@/common/constants/dom";
import {
  EventType,
  Key,
  Modifier,
  ModifierKeyName,
} from "@/common/constants/events";
import { MoveDirection } from "@/common/enums";
import {
  isModifierPressed,
  KeyBinding,
  matchesKeybinding,
  ModifierAction,
} from "@/common/keybindings";
import { getActiveTab, useStore } from "@/store/store";
import { openImportDialog } from "@/utils/importTrigger";
import { useEffect } from "react";

export function useKeybindings(): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const state = useStore.getState();

      if (matchesKeybinding(event, KeyBinding.NEW_TAB)) {
        event.preventDefault();
        void state.createNewTab();
        return;
      }

      if (matchesKeybinding(event, KeyBinding.CLOSE_TAB)) {
        event.preventDefault();
        if (state.activeTabId) {
          state.closeTab(state.activeTabId);
        }

        return;
      }

      const key = event.key;
      const ctrlPressed = isModifierPressed(event, Modifier.CTRL);
      const linkKeyPressed = isModifierPressed(event, ModifierAction.OPEN_LINK);
      const selectKeyPressed = isModifierPressed(
        event,
        ModifierAction.SELECT_BLOCKS,
      );
      const inEditable = !!document.activeElement?.matches(
        InputSelector.EDITABLE,
      );

      if (!ctrlPressed && !linkKeyPressed && !selectKeyPressed && !inEditable) {
        if (
          matchesKeybinding(event, KeyBinding.DELETE_BLOCK) &&
          state.selectedBlockIds.size > 0
        ) {
          event.preventDefault();
          state.removeBlock([...state.selectedBlockIds][0]);
        } else if (
          matchesKeybinding(event, KeyBinding.FOCUS_RUNBOOK) &&
          state.runbookLibrary.length > 0
        ) {
          event.preventDefault();

          const runbookId = state.activeRunbookId ?? state.runbookLibrary[0].id;
          state.setRunbookFocus(runbookId);
          void state.loadRunbookFromLibrary(runbookId);
        } else if (
          state.focusedRunbookId !== null &&
          (key === Key.ARROW_UP || key === Key.ARROW_DOWN)
        ) {
          event.preventDefault();
          state.navigateRunbookList(
            key === Key.ARROW_DOWN ? MoveDirection.DOWN : MoveDirection.UP,
          );
        }

        return;
      }

      if (linkKeyPressed && !ctrlPressed) {
        event.preventDefault();
        state.setLinkKeyHeld(true);
        return;
      }

      if (!ctrlPressed) {
        if (selectKeyPressed && !inEditable) {
          state.setSelectKeyHeld(true);
        }

        return;
      }

      let hit = false;

      if (matchesKeybinding(event, KeyBinding.TOGGLE_MODE)) {
        state.toggleAppMode();
        hit = true;
      } else if (matchesKeybinding(event, KeyBinding.EXPORT)) {
        if ((getActiveTab(state)?.blocks.length ?? 0) > 0) {
          state.openExportModal();
        }

        hit = true;
      } else if (matchesKeybinding(event, KeyBinding.CLEAR_WORKSPACE)) {
        void state.clearAllData();
        hit = true;
      } else if (matchesKeybinding(event, KeyBinding.DUPLICATE_BLOCK)) {
        if (state.selectedBlockIds.size > 0) {
          state.duplicateBlock([...state.selectedBlockIds][0]);
        }

        hit = true;
      } else if (matchesKeybinding(event, KeyBinding.DELETE_RUNBOOK)) {
        const deleteId = state.focusedRunbookId ?? state.activeRunbookId;
        if (deleteId) {
          void state.removeRunbookFromLibrary(deleteId);
        }

        hit = true;
      } else if (matchesKeybinding(event, KeyBinding.MOVE_SIDEBAR)) {
        state.toggleSidebarPosition();
        hit = true;
      } else if (matchesKeybinding(event, KeyBinding.TOGGLE_SIDEBAR)) {
        state.toggleSidebar();
        hit = true;
      } else if (
        !inEditable &&
        matchesKeybinding(event, KeyBinding.IMPORT_RUNBOOK)
      ) {
        openImportDialog();
        hit = true;
      } else if (matchesKeybinding(event, KeyBinding.TOGGLE_EDITORS)) {
        state.toggleAllCommandEditors();
        hit = true;
      } else {
        if (selectKeyPressed && !inEditable) {
          state.setSelectKeyHeld(true);
        }

        if (linkKeyPressed) {
          state.setLinkKeyHeld(true);
        }
      }

      if (hit) {
        event.preventDefault();
        state.setSelectKeyHeld(false);
        state.setLinkKeyHeld(false);
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      const key = event.key;
      const state = useStore.getState();

      if (key === ModifierKeyName[ModifierAction.SELECT_BLOCKS]) {
        state.setSelectKeyHeld(false);
      } else if (key === ModifierKeyName[ModifierAction.OPEN_LINK]) {
        state.setLinkKeyHeld(false);
      } else if (key === Key.ESCAPE) {
        (document.activeElement as HTMLElement | null)?.blur?.();
        state.clearUserInteraction();
      }
    };

    const onBlur = () => {
      const state = useStore.getState();
      state.setLinkKeyHeld(false);
      state.setSelectKeyHeld(false);
    };

    document.addEventListener(EventType.KEY_DOWN, onKeyDown);
    document.addEventListener(EventType.KEY_UP, onKeyUp);
    window.addEventListener(EventType.BLUR, onBlur);
    return () => {
      document.removeEventListener(EventType.KEY_DOWN, onKeyDown);
      document.removeEventListener(EventType.KEY_UP, onKeyUp);
      window.removeEventListener(EventType.BLUR, onBlur);
    };
  }, []);
}
