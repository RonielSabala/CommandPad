import type { KeyBinding } from "@/common/keybindings";
import { useBindingLabel } from "@/hooks/useBindingLabel";

import "./Kbd.css";

/** A shortcut drawn as a key cap. */
export function Kbd({ binding }: { binding: KeyBinding }) {
  const label = useBindingLabel(binding);
  return label ? <kbd className="kbd">{label}</kbd> : null;
}
