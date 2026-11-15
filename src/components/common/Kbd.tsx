import type { KeyBinding } from "@/common/keybindings";
import { useBindingLabel } from "@/hooks/useBindingLabel";

import "./Kbd.css";

export function KeyCap({ label }: { label: string }) {
  return <kbd className="kbd">{label}</kbd>;
}

/** A shortcut drawn as a key cap. */
export function Kbd({ binding }: { binding: KeyBinding }) {
  const label = useBindingLabel(binding);
  return label ? <KeyCap label={label} /> : null;
}
