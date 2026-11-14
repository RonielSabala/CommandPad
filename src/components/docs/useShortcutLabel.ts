import { defaultBindingLabel, type KeyBinding } from "@/common/keybindings";
import { useBindingLabel } from "@/hooks/useBindingLabel";

export function useShortcutLabel(id: KeyBinding): string {
  return useBindingLabel(id) || defaultBindingLabel(id);
}
