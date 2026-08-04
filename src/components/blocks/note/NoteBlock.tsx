import { CssClass } from "@/common/constants/css";
import { Key } from "@/common/constants/events";
import { AppMode, BlockType, NoteStyle } from "@/common/enums";
import type { NoteBlock as NoteBlockData } from "@/common/types";
import { useNoteFormatting } from "@/hooks/useNoteFormatting";
import { useTabInsertion } from "@/hooks/useTabInsertion";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { getNoteCaretAtPoint } from "@/utils/dom";
import { classNames } from "@/utils/string";
import { useEffect, useRef, useState, type MouseEvent } from "react";
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

  const updateBlock = useStore((state) => state.updateBlock);
  const consumeBlockFocus = useStore((state) => state.consumeBlockFocus);
  const readMode = useStore((state) => state.mode === AppMode.READ);
  const pendingFocus = useStore(
    (state) => state.pendingFocusBlockId === blockId,
  );

  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const blockStyle = block.style || NoteStyle.BODY;
  const placeholder = t.note.stylePlaceholder[blockStyle];
  const applyText = (value: string) =>
    updateBlock(blockId, BlockType.NOTE, { text: value });
  const handleTabKey = useTabInsertion(applyText);
  const handleFormatKey = useNoteFormatting(applyText);

  const placesCaret = (event: MouseEvent) =>
    !focused &&
    !readMode &&
    previewRef.current !== null &&
    !(event.target as Element | null)?.closest(`.${CssClass.NOTE_LINK}`);

  const handleMouseDown = (event: MouseEvent) => {
    if (placesCaret(event)) {
      event.preventDefault();
    }
  };

  const handleClick = (event: MouseEvent) => {
    if (!placesCaret(event) || !previewRef.current) {
      return;
    }

    const caret = getNoteCaretAtPoint(
      previewRef.current,
      event.clientX,
      event.clientY,
    );

    const textarea = textareaRef.current;
    textarea?.focus();
    if (caret !== undefined) {
      textarea?.setSelectionRange(caret, caret);
    }
  };

  useEffect(() => {
    if (pendingFocus) {
      textareaRef.current?.focus({ preventScroll: true });
      consumeBlockFocus();
    }
  }, [pendingFocus, consumeBlockFocus]);

  return (
    <div
      className={classNames(
        "note-block",
        CssClass.BLOCK_SURFACE,
        focused && "is-focused",
      )}
    >
      <div className="note-style-row">
        {NOTE_STYLES.map((style) => (
          <button
            key={style}
            className={`note-style-btn${blockStyle === style ? ` ${CssClass.ACTIVE}` : ""}`}
            onClick={() => updateBlock(blockId, BlockType.NOTE, { style })}
          >
            {t.note.styleLabel[style]}
          </button>
        ))}
      </div>
      <label
        className={`note-auto-width style-${blockStyle}`}
        data-value={blockText || placeholder}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
      >
        <textarea
          ref={textareaRef}
          className={`note-textarea style-${blockStyle}`}
          placeholder={placeholder}
          spellCheck={false}
          rows={1}
          value={blockText}
          onChange={(event) => applyText(event.target.value)}
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
        <div ref={previewRef} className={`note-preview style-${blockStyle}`}>
          {blockText ? (
            <NoteText text={blockText} requiresLinkModifier />
          ) : (
            <span className="note-preview-placeholder">{placeholder}</span>
          )}
        </div>
      </label>
    </div>
  );
}
