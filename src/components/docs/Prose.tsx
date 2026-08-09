import { HtmlTag } from "@/common/constants/dom";
import { NoteNodeType } from "@/common/enums";
import {
  formatBinding,
  KEYBINDINGS,
  type KeyBinding,
} from "@/common/keybindings";
import { NoteNodes } from "@/components/blocks/note/NoteText";
import { parseNoteNodes } from "@/utils/markdown";
import { useMemo } from "react";
import "./Prose.css";

export function Prose({ text }: { text: string }) {
  const nodes = useMemo(() => parseNoteNodes(text), [text]);
  const Tag = nodes.every((node) => node.type === NoteNodeType.TEXT)
    ? HtmlTag.PARAGRAPH
    : HtmlTag.DIV;

  return (
    <Tag className="docs-prose">
      <NoteNodes nodes={nodes} />
    </Tag>
  );
}

export function Kbd({ binding }: { binding: KeyBinding }) {
  return (
    <kbd className="docs-kbd">
      {formatBinding(KEYBINDINGS[binding].binding)}
    </kbd>
  );
}
