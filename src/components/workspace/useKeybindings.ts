import { QuickOpenConfig } from "@/common/config";
import { InputSelector } from "@/common/constants/dom";
import { EventType, Key, Modifier } from "@/common/constants/events";
import { MoveDirection } from "@/common/enums";
import {
  isModifierPressed,
  KeyBinding,
  keybindingFromEvent,
  mapTabKeybindings,
} from "@/common/keybindings";
import {
  COMMAND_ORDER,
  isCommandAvailable,
  PALETTE_COMMANDS,
} from "@/components/modals/quickOpen/paletteCommands";
import { getActiveTab, useStoreApi, type StoreState } from "@/store/store";
import { useEffect } from "react";

/** Runs a shortcut. `false` means it had nothing to act on. */
type KeyAction = (state: StoreState) => boolean | void;

type SelectionAction = (state: StoreState, id: string) => void;

/** Acts on the first selected block, else the first selected variable. */
function onFirstSelected(
  onBlock: SelectionAction,
  onVariable: SelectionAction,
): KeyAction {
  return (state) => {
    const [blockId] = state.selectedBlockIds;
    if (blockId !== undefined) {
      return void onBlock(state, blockId);
    }

    const [variableId] = state.selectedVariableIds;
    if (variableId !== undefined) {
      return void onVariable(state, variableId);
    }

    return false;
  };
}

/** The shortcuts no palette command runs. */
const WORKSPACE_KEY_ACTIONS: Partial<Record<KeyBinding, KeyAction>> = {
  [KeyBinding.SAVE_RUNBOOK]: (state) => void state.saveActiveRunbook(),

  [KeyBinding.CLOSE_TAB]: (state) =>
    state.activeTabId !== null && state.closeTab(state.activeTabId),

  ...mapTabKeybindings(
    (position): KeyAction =>
      (state) => {
        const tab = state.tabs[position - 1];
        return tab !== undefined && void state.switchTab(tab.id);
      },
  ),

  [KeyBinding.QUICK_OPEN]: (state) => state.openQuickOpenModal(),

  [KeyBinding.COMMAND_PALETTE]: (state) =>
    state.openQuickOpenModal(QuickOpenConfig.COMMAND_PREFIX),

  [KeyBinding.EXPORT]: (state) =>
    (getActiveTab(state)?.blocks.length ?? 0) > 0 && state.openExportModal(),

  [KeyBinding.DELETE_ACTIVE_RUNBOOK]: (state) =>
    state.activeRunbookId !== null &&
    void state.removeLibraryRunbook(state.activeRunbookId),

  [KeyBinding.DELETE_RUNBOOK]: (state) => {
    const runbookId = state.focusedRunbookId ?? state.activeRunbookId;
    return runbookId !== null && void state.removeLibraryRunbook(runbookId);
  },

  [KeyBinding.DUPLICATE_BLOCK]: onFirstSelected(
    (state, id) => state.duplicateBlock(id),
    (state, id) => state.duplicateVariable(id),
  ),

  [KeyBinding.DELETE_BLOCK]: onFirstSelected(
    (state, id) => state.removeBlock(id),
    (state, id) => state.removeVariable(id),
  ),

  [KeyBinding.FOCUS_RUNBOOK]: (state) => {
    const runbookId = state.activeRunbookId ?? state.libraryRunbooks[0]?.id;
    if (runbookId === undefined) {
      return false;
    }

    state.setRunbookFocus(runbookId);
    void state.loadLibraryRunbook(runbookId);
  },
};

const KEY_ACTIONS = new Map<KeyBinding, KeyAction>([
  ...COMMAND_ORDER.map((command): [KeyBinding, KeyAction] => {
    const { binding, run } = PALETTE_COMMANDS[command];

    return [
      binding,
      (state) => isCommandAvailable(state, command) && run(state),
    ];
  }),
  ...(Object.entries(WORKSPACE_KEY_ACTIONS) as [KeyBinding, KeyAction][]),
]);

const RUNBOOK_LIST_KEYS: Partial<Record<string, MoveDirection>> = {
  [Key.ARROW_UP]: MoveDirection.UP,
  [Key.ARROW_DOWN]: MoveDirection.DOWN,
};

/** Whether `event` holds Ctrl or Alt. */
function isCommandChord(event: KeyboardEvent): boolean {
  return (
    isModifierPressed(event, Modifier.CTRL) ||
    isModifierPressed(event, Modifier.ALT)
  );
}

export function useKeybindings(): void {
  const store = useStoreApi();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) {
        return;
      }

      const commandChord = isCommandChord(event);
      if (
        !commandChord &&
        document.activeElement?.matches(InputSelector.EDITABLE)
      ) {
        return;
      }

      const state = store.getState();
      const id = keybindingFromEvent(event);
      const action = id && KEY_ACTIONS.get(id);

      if (action) {
        if (action(state) !== false || commandChord) {
          event.preventDefault();
        }

        return;
      }

      const direction = RUNBOOK_LIST_KEYS[event.key];
      if (
        direction &&
        state.focusedRunbookId !== null &&
        !commandChord &&
        !isModifierPressed(event, Modifier.SHIFT)
      ) {
        event.preventDefault();
        state.navigateRunbookList(direction);
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key !== Key.ESCAPE) {
        return;
      }

      const active = document.activeElement as HTMLElement | null;
      if (!active?.matches(InputSelector.CODE)) {
        active?.blur?.();
      }

      store.getState().clearUserInteraction();
    };

    document.addEventListener(EventType.KEY_DOWN, onKeyDown);
    document.addEventListener(EventType.KEY_UP, onKeyUp);
    return () => {
      document.removeEventListener(EventType.KEY_DOWN, onKeyDown);
      document.removeEventListener(EventType.KEY_UP, onKeyUp);
    };
  }, [store]);
}
