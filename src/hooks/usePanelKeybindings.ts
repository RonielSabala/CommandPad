import { EventType } from "@/common/constants/events";
import type { PanelId } from "@/common/enums";
import { KeyBinding, matchesKeybinding } from "@/common/keybindings";
import { useStoreApi } from "@/store/store";
import { useEffect } from "react";

export function usePanelKeybindings(panelId: PanelId): void {
  const store = useStoreApi();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const state = store.getState();

      if (matchesKeybinding(event, KeyBinding.MOVE_SIDEBAR)) {
        state.togglePanelSide(panelId);
      } else if (matchesKeybinding(event, KeyBinding.TOGGLE_SIDEBAR)) {
        state.togglePanel(panelId);
      } else {
        return;
      }

      event.preventDefault();
    };

    document.addEventListener(EventType.KEY_DOWN, onKeyDown);
    return () => document.removeEventListener(EventType.KEY_DOWN, onKeyDown);
  }, [panelId, store]);
}
