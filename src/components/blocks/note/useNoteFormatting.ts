import { EditCommand } from "@/common/constants/dom";
import { NoteFormat } from "@/common/enums";
import { KeyBinding } from "@/common/keybindings";
import { MarkdownDelimiter } from "@/common/markdownSyntax";
import { usePairWrapping } from "@/hooks/usePairWrapping";
import { planNoteFormats, type NoteEdit } from "@/utils/markdown";
import { useCallback, type KeyboardEvent } from "react";

export const NOTE_FORMAT_BINDINGS: Record<NoteFormat, KeyBinding> = {
  [NoteFormat.BOLD]: KeyBinding.NOTE_BOLD,
  [NoteFormat.ITALIC]: KeyBinding.NOTE_ITALIC,
  [NoteFormat.STRIKETHROUGH]: KeyBinding.NOTE_STRIKETHROUGH,
  [NoteFormat.CODE]: KeyBinding.NOTE_CODE,
  [NoteFormat.NUMBERED_LIST]: KeyBinding.NOTE_NUMBERED_LIST,
  [NoteFormat.BULLETED_LIST]: KeyBinding.NOTE_BULLETED_LIST,
};

const FORMAT_BY_KEY: Record<string, NoteFormat> = {
  b: NoteFormat.BOLD,
  i: NoteFormat.ITALIC,
  dead: NoteFormat.CODE,
  [MarkdownDelimiter.CODE]: NoteFormat.CODE,
  [MarkdownDelimiter.CODE_ALT]: NoteFormat.CODE,
};

const SHIFTED_FORMAT_BY_CODE: Record<string, NoteFormat> = {
  KeyX: NoteFormat.STRIKETHROUGH,
  Digit7: NoteFormat.NUMBERED_LIST,
  Digit8: NoteFormat.BULLETED_LIST,
};

function applyNoteEdit(
  textarea: HTMLTextAreaElement,
  edit: NoteEdit,
  onChange: (value: string) => void,
): void {
  const { value } = textarea;
  textarea.setSelectionRange(edit.from, edit.to);

  if (!document.execCommand(EditCommand.INSERT_TEXT, false, edit.text)) {
    onChange(value.slice(0, edit.from) + edit.text + value.slice(edit.to));
  }

  queueMicrotask(() => {
    textarea.setSelectionRange(edit.selection.from, edit.selection.to);
  });
}

/** Toggles `format` on the textarea's selection. */
export function formatNoteSelection(
  textarea: HTMLTextAreaElement,
  format: NoteFormat,
  onChange: (value: string) => void,
): void {
  const { value, selectionStart, selectionEnd } = textarea;
  const edit = planNoteFormats(value, {
    from: selectionStart,
    to: selectionEnd,
  })[format].apply();

  if (edit) {
    applyNoteEdit(textarea, edit, onChange);
  }
}

export function useNoteFormatting(
  onChange: (value: string) => void,
): (event: KeyboardEvent<HTMLTextAreaElement>) => void {
  const handlePairWrap = usePairWrapping(onChange);

  return useCallback(
    (event) => {
      if (event.altKey) {
        return;
      }

      if (event.ctrlKey || event.metaKey) {
        const format =
          (event.shiftKey && SHIFTED_FORMAT_BY_CODE[event.code]) ||
          FORMAT_BY_KEY[event.key.toLowerCase()];

        if (format) {
          event.preventDefault();
          formatNoteSelection(event.currentTarget, format, onChange);
        }

        return;
      }

      handlePairWrap(event);
    },
    [onChange, handlePairWrap],
  );
}
