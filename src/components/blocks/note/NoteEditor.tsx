import { CssClass } from "@/common/constants/css";
import { Key } from "@/common/constants/events";
import { AppMode } from "@/common/enums";
import { useNoteFormatting } from "@/hooks/useNoteFormatting";
import { useTabInsertion } from "@/hooks/useTabInsertion";
import { useStore } from "@/store/store";
import { getNoteCaretAtPoint } from "@/utils/dom";
import { classNames } from "@/utils/string";
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";

import "./NoteEditor.css";
import { NoteText } from "./NoteText";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  styleClass?: string;
  className?: string;
  header?: ReactNode;
  focusRequested?: boolean;
  onFocusHandled?: () => void;
}

/** Markdown text edited in place. */
export function NoteEditor({
  value,
  onChange,
  placeholder,
  styleClass,
  className,
  header,
  focusRequested,
  onFocusHandled,
}: Props) {
  const readMode = useStore((state) => state.mode === AppMode.READ);
  const language = useStore((state) => state.language);
  const spellcheck = useStore((state) => state.spellcheckEnabled);

  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleTabKey = useTabInsertion(onChange);
  const handleFormatKey = useNoteFormatting(onChange);

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
    if (focusRequested) {
      textareaRef.current?.focus({ preventScroll: true });
      onFocusHandled?.();
    }
  }, [focusRequested, onFocusHandled]);

  return (
    <div
      className={classNames(
        CssClass.NOTE_EDITOR,
        focused && "is-focused",
        className,
      )}
    >
      {header}
      <label
        className={classNames(
          "note-auto-width",
          styleClass,
          CssClass.SELECT_KEY_INERT,
        )}
        data-value={value || placeholder}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
      >
        <textarea
          ref={textareaRef}
          className={classNames(
            "note-textarea",
            styleClass,
            CssClass.SELECT_KEY_INERT,
          )}
          placeholder={placeholder}
          spellCheck={spellcheck}
          lang={language}
          rows={1}
          value={value}
          onChange={(event) => onChange(event.target.value)}
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
        <div
          ref={previewRef}
          className={classNames("note-preview", styleClass)}
        >
          {value ? (
            <NoteText text={value} requiresLinkModifier />
          ) : (
            <span className="note-preview-placeholder">{placeholder}</span>
          )}
        </div>
      </label>
    </div>
  );
}
