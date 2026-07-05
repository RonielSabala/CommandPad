import { ElementId, InputSelector } from "@/common/constants/dom";
import { EventType, Key } from "@/common/constants/events";
import { MoveDirection } from "@/common/enums";
import { KeyBinding, matchesKeybinding } from "@/common/keybindings";
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
      const altPressed = event.altKey;
      const ctrlPressed = event.ctrlKey || event.metaKey;
      const inEditable = !!document.activeElement?.matches(
        InputSelector.EDITABLE,
      );

      if (!ctrlPressed && !altPressed && !inEditable) {
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
          (key === Key.ARROW_DOWN || key === Key.ARROW_UP)
        ) {
          event.preventDefault();
          state.navigateRunbookList(
            key === Key.ARROW_DOWN ? MoveDirection.DOWN : MoveDirection.UP,
          );
        }

        return;
      }

      if (altPressed && !ctrlPressed) {
        event.preventDefault();
        state.setAltHeld(true);
        return;
      }

      if (!ctrlPressed) {
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
      } else if (matchesKeybinding(event, KeyBinding.IMPORT_RUNBOOK)) {
        openImportDialog();
        hit = true;
      } else if (matchesKeybinding(event, KeyBinding.TOGGLE_EDITORS)) {
        state.toggleAllCommandEditors();
        hit = true;
      } else if (!inEditable) {
        state.setCtrlHeld(true);
      }

      if (hit) {
        event.preventDefault();
        state.setCtrlHeld(false);
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      const key = event.key;
      const state = useStore.getState();

      if (key === Key.CTRL) {
        state.setCtrlHeld(false);
      } else if (key === Key.ALT) {
        state.setAltHeld(false);
      } else if (key === Key.ESCAPE) {
        (document.activeElement as HTMLElement | null)?.blur?.();
        state.clearUserInteraction();
      }
    };

    const onBlur = () => {
      const state = useStore.getState();
      state.setAltHeld(false);
      state.setCtrlHeld(false);
    };

    const onFocus = () => {
      requestAnimationFrame(() => {
        const active = document.activeElement;
        if (!active || active === document.body) {
          document.getElementById(ElementId.APP_SHELL)?.focus();
        }
      });
    };

    document.addEventListener(EventType.KEY_DOWN, onKeyDown);
    document.addEventListener(EventType.KEY_UP, onKeyUp);
    window.addEventListener(EventType.BLUR, onBlur);
    window.addEventListener(EventType.FOCUS, onFocus);
    return () => {
      document.removeEventListener(EventType.KEY_DOWN, onKeyDown);
      document.removeEventListener(EventType.KEY_UP, onKeyUp);
      window.removeEventListener(EventType.BLUR, onBlur);
      window.removeEventListener(EventType.FOCUS, onFocus);
    };
  }, []);
}
