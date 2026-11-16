import {
  withDefaultKeybinding,
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
  const { set, get, persist } = kit;
  const commit = (keybindingOverrides: KeybindingOverrides) => {
    set({ keybindingOverrides });
    persist.saveKeybindings(keybindingOverrides);
  };

  return {
    setKeybinding: (id, chord) =>
      commit(withKeybinding(get().keybindingOverrides, id, chord)),

    resetKeybinding: (id) =>
      commit(withDefaultKeybinding(get().keybindingOverrides, id)),

    resetAllKeybindings: () => commit({}),
  };
}
