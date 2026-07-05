import { useEffect } from "react";

import { InputSelector } from "@/common/constants/dom";
import { EventType, Key } from "@/common/constants/events";
import { AppMode, MoveDirection } from "@/common/enums";
import { KeyBinding, matchesKeybinding } from "@/common/keybindings";
import { getActiveTab, useStore } from "@/store/store";
import { openImportDialog } from "@/utils/importTrigger";

// Global keyboard shortcuts

export function useKeybindings(): void {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const s = useStore.getState();

      if (matchesKeybinding(e, KeyBinding.NEW_TAB)) {
        e.preventDefault();
        void s.createNewTab();
        return;
      }

      if (matchesKeybinding(e, KeyBinding.CLOSE_TAB)) {
        e.preventDefault();
        if (s.activeTabId) {
          s.closeTab(s.activeTabId);
        }
        return;
      }

      const key = e.key;
      const altPressed = e.altKey;
      const ctrlPressed = e.ctrlKey || e.metaKey;
      const inEditable = !!document.activeElement?.matches(
        InputSelector.EDITABLE,
      );
      const isReadMode = s.mode === AppMode.READ;

      if (!ctrlPressed && !altPressed && !inEditable) {
        if (
          matchesKeybinding(e, KeyBinding.DELETE_BLOCK) &&
          s.selectedBlockIds.size > 0
        ) {
          e.preventDefault();
          s.removeBlock([...s.selectedBlockIds][0]);
        } else if (
          matchesKeybinding(e, KeyBinding.FOCUS_RUNBOOK) &&
          s.runbookLibrary.length > 0
        ) {
          e.preventDefault();
          const runbookId = s.activeRunbookId ?? s.runbookLibrary[0].id;
          s.setRunbookFocus(runbookId);
          void s.loadRunbookFromLibrary(runbookId);
        } else if (
          s.focusedRunbookId !== null &&
          (key === Key.ARROW_DOWN || key === Key.ARROW_UP)
        ) {
          e.preventDefault();
          s.navigateRunbookList(
            key === Key.ARROW_DOWN ? MoveDirection.DOWN : MoveDirection.UP,
          );
        }
        return;
      }

      if (altPressed && !ctrlPressed) {
        e.preventDefault();
        s.setAltHeld(true);
        return;
      }

      if (!ctrlPressed) {
        return;
      }

      if (matchesKeybinding(e, KeyBinding.TOGGLE_MODE)) {
        e.preventDefault();
        s.setCtrlHeld(false);
        s.toggleAppMode();
      } else if (matchesKeybinding(e, KeyBinding.EXPORT)) {
        e.preventDefault();
        s.setCtrlHeld(false);
        if ((getActiveTab(s)?.blocks.length ?? 0) > 0) {
          s.openExportModal();
        }
      } else if (matchesKeybinding(e, KeyBinding.CLEAR_WORKSPACE)) {
        e.preventDefault();
        s.setCtrlHeld(false);
        void s.clearAllData();
      } else if (matchesKeybinding(e, KeyBinding.DUPLICATE_BLOCK)) {
        e.preventDefault();
        s.setCtrlHeld(false);
        if (s.selectedBlockIds.size > 0) {
          s.duplicateBlock([...s.selectedBlockIds][0]);
        }
      } else if (matchesKeybinding(e, KeyBinding.DELETE_RUNBOOK)) {
        e.preventDefault();
        s.setCtrlHeld(false);
        const deleteId = s.focusedRunbookId ?? s.activeRunbookId;
        if (deleteId && !isReadMode) {
          void s.removeRunbookFromLibrary(deleteId);
        }
      } else if (matchesKeybinding(e, KeyBinding.MOVE_SIDEBAR)) {
        e.preventDefault();
        s.setCtrlHeld(false);
        s.toggleSidebarPosition();
      } else if (matchesKeybinding(e, KeyBinding.TOGGLE_SIDEBAR)) {
        e.preventDefault();
        s.setCtrlHeld(false);
        s.toggleSidebar();
      } else if (
        matchesKeybinding(e, KeyBinding.IMPORT_RUNBOOK) &&
        !isReadMode
      ) {
        e.preventDefault();
        s.setCtrlHeld(false);
        openImportDialog();
      } else if (matchesKeybinding(e, KeyBinding.TOGGLE_EDITORS)) {
        e.preventDefault();
        s.setCtrlHeld(false);
        s.toggleAllCommandEditors();
      } else if (!inEditable) {
        s.setCtrlHeld(true);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const s = useStore.getState();
      if (e.key === Key.CTRL) {
        s.setCtrlHeld(false);
      } else if (e.key === Key.ALT) {
        s.setAltHeld(false);
      } else if (e.key === Key.ESCAPE) {
        (document.activeElement as HTMLElement | null)?.blur?.();
        s.clearUserInteraction();
      }
    };

    const onBlur = () => {
      const state = useStore.getState();
      state.setCtrlHeld(false);
      state.setAltHeld(false);
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
