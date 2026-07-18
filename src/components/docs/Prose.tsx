import {
  formatBinding,
  KEYBINDINGS,
  type KeyBinding,
} from "@/common/keybindings";
import { NoteText } from "@/components/blocks/note/NoteText";
import "./Prose.css";

export function Prose({ text }: { text: string }) {
  return (
    <p className="docs-prose">
      <NoteText text={text} />
    </p>
  );
}

export function ProseList({ items }: { items: string[] }) {
  return (
    <ul className="docs-prose docs-list">
      {items.map((item, i) => (
        <li key={i}>
          <NoteText text={item} />
        </li>
      ))}
    </ul>
  );
}

export function Kbd({ binding }: { binding: KeyBinding }) {
  return (
    <kbd className="docs-kbd">
      {formatBinding(KEYBINDINGS[binding].binding)}
    </kbd>
  );
}
