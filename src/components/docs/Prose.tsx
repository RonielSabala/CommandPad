import {
  formatBinding,
  KEYBINDINGS,
  type KeyBinding,
} from "@/common/keybindings";
import { NoteText } from "@/components/blocks/note/NoteText";

// Docs paragraph: translated strings may carry inline note-markdown
// (**bold**, _italic_, `code`, [label](url)), rendered with the same
// parser as note blocks.
export function Prose({ text }: { text: string }) {
  return (
    <p className="docs-prose">
      <NoteText text={text} />
    </p>
  );
}

// Bullet list whose items come from a locale string[]
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

// Keyboard chip for a real app binding, e.g. <Kbd binding={KeyBinding.TOGGLE_SIDEBAR} />
export function Kbd({ binding }: { binding: KeyBinding }) {
  return (
    <kbd className="docs-kbd">
      {formatBinding(KEYBINDINGS[binding].binding)}
    </kbd>
  );
}
