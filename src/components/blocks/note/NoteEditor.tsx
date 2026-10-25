import { CssClass } from "@/common/constants/css";
import { EventType, Key, PASSIVE } from "@/common/constants/events";
import { AppMode } from "@/common/enums";
import { useStore } from "@/store/store";
import { getNoteCaretAtPoint } from "@/utils/dom";
import type { NoteRange } from "@/utils/markdown";
import { classNames, classSelector } from "@/utils/string";
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";

import "./NoteEditor.css";
import { NoteFormatToolbar } from "./NoteFormatToolbar";
import { NotePreview } from "./NotePreview";
import { useNoteFormatting } from "./useNoteFormatting";
import { useTabInsertion } from "./useTabInsertion";

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
  const [selection, setSelection] = useState<NoteRange | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const pressedRange = useRef<NoteRange | null>(null);

  const handleTabKey = useTabInsertion(onChange);
  const handleFormatKey = useNoteFormatting(onChange);

  const placesCaret = (event: MouseEvent) =>
    !focused &&
    !readMode &&
    previewRef.current !== null &&
    event.currentTarget.contains(event.target as Node) &&
    !(event.target as Element | null)?.closest(
      classSelector(CssClass.NOTE_LINK),
    );

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

  const readSelection = ({
    selectionStart: from,
    selectionEnd: to,
  }: HTMLTextAreaElement) =>
    setSelection((current) =>
      current?.from === from && current.to === to ? current : { from, to },
    );

  // A click inside the selection collapses it only after the click
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const handleChange = () => {
      const { selectionStart: from, selectionEnd: to } = textarea;
      if (from === to) {
        setSelection(null);
        return;
      }

      setSelection((current) =>
        !current || (current.from === from && current.to === to)
          ? current
          : { from, to },
      );
    };

    textarea.addEventListener(
      EventType.SELECTION_CHANGE,
      handleChange,
      PASSIVE,
    );
    return () =>
      textarea.removeEventListener(EventType.SELECTION_CHANGE, handleChange);
  }, []);

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
          onSelect={(event) => readSelection(event.currentTarget)}
          onMouseDown={({ currentTarget }) => {
            pressedRange.current = {
              from: currentTarget.selectionStart,
              to: currentTarget.selectionEnd,
            };

            setSelection(null);
          }}
          onMouseUp={({ currentTarget }) => {
            const { from, to } = pressedRange.current ?? {};
            const { selectionStart, selectionEnd } = currentTarget;

            if (from !== to && from === selectionStart && to === selectionEnd) {
              return;
            }

            readSelection(currentTarget);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            setSelection(null);
          }}
        />
        <NotePreview
          ref={previewRef}
          text={value}
          placeholder={placeholder}
          styleClass={styleClass}
          requiresLinkModifier
        />
      </label>

      {focused && !readMode && selection && selection.from !== selection.to && (
        <NoteFormatToolbar
          textareaRef={textareaRef}
          value={value}
          selection={selection}
          onChange={onChange}
        />
      )}
    </div>
  );
}
