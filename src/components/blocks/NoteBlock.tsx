import { CssClass } from "@/common/constants/css";
import { NoteStyle } from "@/common/enums";
import type { NoteBlock as NoteBlockData } from "@/common/types";
import { useStore } from "@/store/store";
import { useEffect, useRef, useState } from "react";
import "./NoteBlock.css";
import { NoteText } from "./NoteText";

const NOTE_STYLES: NoteStyle[] = [
  NoteStyle.HEADING,
  NoteStyle.SUBHEADING,
  NoteStyle.BODY,
];

interface Props {
  block: NoteBlockData;
}

export function NoteBlock({ block }: Props) {
  const blockId = block.id;
  const blockText = block.text;

  const updateBlockText = useStore((state) => state.updateBlockText);
  const updateBlockStyle = useStore((state) => state.updateBlockStyle);
  const consumeBlockFocus = useStore((state) => state.consumeBlockFocus);
  const pendingFocus = useStore(
    (state) => state.pendingFocusBlockId === blockId,
  );

  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const style = block.style || NoteStyle.BODY;
  const placeholder = `Section ${style}...`;

  useEffect(() => {
    if (pendingFocus) {
      textareaRef.current?.focus();
      consumeBlockFocus();
    }
  }, [pendingFocus, consumeBlockFocus]);

  return (
    <div className={`note-block${focused ? " is-focused" : ""}`}>
      <div className="note-style-row">
        {NOTE_STYLES.map((noteStyle) => (
          <button
            key={noteStyle}
            className={`note-style-btn${style === noteStyle ? ` ${CssClass.ACTIVE}` : ""}`}
            onClick={() => updateBlockStyle(blockId, noteStyle)}
          >
            {noteStyle}
          </button>
        ))}
      </div>
      <label
        className={`note-auto-width style-${style}`}
        data-value={blockText || placeholder}
      >
        <textarea
          ref={textareaRef}
          className={`note-textarea style-${style}`}
          placeholder={placeholder}
          spellCheck={false}
          rows={1}
          value={blockText}
          onChange={(event) => updateBlockText(blockId, event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <div className={`note-preview style-${style}`}>
          {blockText ? (
            <NoteText text={blockText} />
          ) : (
            <span className="note-preview-placeholder">{placeholder}</span>
          )}
        </div>
      </label>
    </div>
  );
}
