import {
  bindingLabel,
  getKeybindingsVersion,
  subscribeKeybindings,
  type KeyBinding,
} from "@/common/keybindings";
import { useSyncExternalStore } from "react";

/** `bindingLabel`, re-rendered whenever the user changes a binding. */
export function useBindingLabel(id: KeyBinding, joiner?: string): string {
  useSyncExternalStore(subscribeKeybindings, getKeybindingsVersion);
  return bindingLabel(id, joiner);
}
