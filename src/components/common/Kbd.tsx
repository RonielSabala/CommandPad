import type { KeyBinding } from "@/common/keybindings";
import { useBindingLabel } from "@/hooks/useBindingLabel";

import "./Kbd.css";

export function KeyCap({ label }: { label: string }) {
  return <kbd className="kbd">{label}</kbd>;
}

/** Text standing where a key cap will go. */
export function KeyCapPlaceholder({ label }: { label: string }) {
  return <span className="kbd kbd-placeholder">{label}</span>;
}

/** A shortcut drawn as a key cap. */
export function Kbd({ binding }: { binding: KeyBinding }) {
  const label = useBindingLabel(binding);
  return label ? <KeyCap label={label} /> : null;
}
