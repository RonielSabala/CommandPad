import {
  applyKeybindingOverrides,
  KEYBINDINGS,
  withKeybinding,
  type KeybindingOverrides,
} from "@/common/keybindings";

import type { StoreKit } from "@/store/kit";
import type { StoreState } from "@/store/types";

type KeybindingActions = Pick<
  StoreState,
  "setKeybinding" | "resetKeybinding" | "resetAllKeybindings"
>;

export function createKeybindingsSlice(kit: StoreKit): KeybindingActions {
  const { set, get, isDemo, persist } = kit;

  const commit = (keybindingOverrides: KeybindingOverrides) => {
    set({ keybindingOverrides });
    persist.saveKeybindings(keybindingOverrides);

    if (!isDemo) {
      applyKeybindingOverrides(keybindingOverrides);
    }
  };

  return {
    setKeybinding: (id, chord) =>
      commit(withKeybinding(get().keybindingOverrides, id, chord)),

    resetKeybinding: (id) =>
      commit(
        withKeybinding(get().keybindingOverrides, id, KEYBINDINGS[id].binding),
      ),

    resetAllKeybindings: () => commit({}),
  };
}
