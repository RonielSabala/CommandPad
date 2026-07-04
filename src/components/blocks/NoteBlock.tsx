import "./NoteBlock.css";

import { useEffect, useRef, useState } from "react";

import { CssClass } from "@/common/constants/css";
import { NoteStyle } from "@/common/enums";
import type { NoteBlock as NoteBlockData } from "@/common/types";
import { useStore } from "@/store/store";
import { formatNoteText } from "@/utils/markdown";

const NOTE_STYLES: NoteStyle[] = [
  NoteStyle.HEADING,
  NoteStyle.SUBHEADING,
  NoteStyle.BODY,
];

export function NoteBlock({ block }: { block: NoteBlockData }) {
  const updateBlockText = useStore((s) => s.updateBlockText);
  const updateBlockStyle = useStore((s) => s.updateBlockStyle);
  const pendingFocus = useStore((s) => s.pendingFocusBlockId === block.id);
  const consumeBlockFocus = useStore((s) => s.consumeBlockFocus);
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const style = block.style || NoteStyle.BODY;
  const placeholder = `Section ${style}...`;
  const previewHtml = block.text
    ? formatNoteText(block.text)
    : `<span class="note-preview-placeholder">${placeholder}</span>`;

  useEffect(() => {
    if (pendingFocus) {
      textareaRef.current?.focus();
      consumeBlockFocus();
    }
  }, [pendingFocus, consumeBlockFocus]);

  return (
    <div className={`note-block${focused ? ` ${CssClass.IS_FOCUSED}` : ""}`}>
      <div className="note-style-row">
        {NOTE_STYLES.map((s) => (
          <button
            key={s}
            className={`note-style-btn${style === s ? ` ${CssClass.ACTIVE}` : ""}`}
            onClick={() => updateBlockStyle(block.id, s)}
          >
            {s}
          </button>
        ))}
      </div>
      <label
        className={`note-auto-width style-${style}`}
        data-value={block.text || placeholder}
      >
        <textarea
          ref={textareaRef}
          className={`note-textarea style-${style}`}
          placeholder={placeholder}
          spellCheck={false}
          rows={1}
          value={block.text}
          onChange={(e) => updateBlockText(block.id, e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <div
          className={`note-preview style-${style}`}
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      </label>
    </div>
  );
}
