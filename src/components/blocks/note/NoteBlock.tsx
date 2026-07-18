import { CssClass } from "@/common/constants/css";
import { Key } from "@/common/constants/events";
import { NoteStyle } from "@/common/enums";
import type { NoteBlock as NoteBlockData } from "@/common/types";
import { useNoteFormatting } from "@/hooks/useNoteFormatting";
import { useTabInsertion } from "@/hooks/useTabInsertion";
import { useTranslation } from "@/i18n";
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
  const t = useTranslation();
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

  const blockStyle = block.style || NoteStyle.BODY;
  const placeholder = t.note.stylePlaceholder[blockStyle];
  const applyText = (value: string) => updateBlockText(blockId, value);
  const handleTabKey = useTabInsertion(applyText);
  const handleFormatKey = useNoteFormatting(applyText);

  useEffect(() => {
    if (pendingFocus) {
      textareaRef.current?.focus({ preventScroll: true });
      consumeBlockFocus();
    }
  }, [pendingFocus, consumeBlockFocus]);

  return (
    <div className={`note-block${focused ? " is-focused" : ""}`}>
      <div className="note-style-row">
        {NOTE_STYLES.map((style) => (
          <button
            key={style}
            className={`note-style-btn${blockStyle === style ? ` ${CssClass.ACTIVE}` : ""}`}
            onClick={() => updateBlockStyle(blockId, style)}
          >
            {t.note.styleLabel[style]}
          </button>
        ))}
      </div>
      <label
        className={`note-auto-width style-${blockStyle}`}
        data-value={blockText || placeholder}
      >
        <textarea
          ref={textareaRef}
          className={`note-textarea style-${blockStyle}`}
          placeholder={placeholder}
          spellCheck={false}
          rows={1}
          value={blockText}
          onChange={(event) => updateBlockText(blockId, event.target.value)}
          onKeyDown={(event) => {
            if (event.key === Key.ESCAPE) {
              event.currentTarget.blur();
              return;
            }

            handleFormatKey(event);
            handleTabKey(event);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <div className={`note-preview style-${blockStyle}`}>
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
