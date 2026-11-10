import {
  formatBinding,
  KEYBINDINGS,
  type KeyBinding,
} from "@/common/keybindings";
import "./Kbd.css";

/** A shortcut drawn as a key cap. */
export function Kbd({ binding }: { binding: KeyBinding }) {
  return (
    <kbd className="kbd">{formatBinding(KEYBINDINGS[binding].binding)}</kbd>
  );
}
