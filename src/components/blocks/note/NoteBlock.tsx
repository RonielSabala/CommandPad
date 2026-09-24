import { CssClass } from "@/common/constants/css";
import { BlockType, NoteStyle } from "@/common/enums";
import type { NoteBlock as NoteBlockData } from "@/common/types";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { useCallback } from "react";

import { NoteEditor } from "./NoteEditor";

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

  const updateBlock = useStore((state) => state.updateBlock);
  const consumeBlockFocus = useStore((state) => state.consumeBlockFocus);
  const pendingFocus = useStore(
    (state) => state.pendingFocusBlockId === blockId,
  );

  const blockStyle = block.style || NoteStyle.BODY;
  const applyText = useCallback(
    (value: string) => updateBlock(blockId, BlockType.NOTE, { text: value }),
    [updateBlock, blockId],
  );

  return (
    <NoteEditor
      value={block.text}
      onChange={applyText}
      placeholder={t.note.stylePlaceholder[blockStyle]}
      styleClass={`style-${blockStyle}`}
      className={CssClass.BLOCK_SURFACE}
      focusRequested={pendingFocus}
      onFocusHandled={consumeBlockFocus}
      header={
        <div className={`note-style-row ${CssClass.SELECT_KEY_HIDDEN}`}>
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
      }
    />
  );
}
