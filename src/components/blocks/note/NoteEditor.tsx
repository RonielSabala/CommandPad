import { CssClass } from "@/common/constants/css";
import { SelectionDirection } from "@/common/constants/dom";
import {
  ClickCount,
  EventType,
  Key,
  MouseButton,
  PASSIVE,
} from "@/common/constants/events";
import { AppMode } from "@/common/enums";
import { useStore } from "@/store/store";
import {
  getNoteCaretAtPoint,
  locateTextareaCarets,
  textareaRangeContains,
  type CaretLocator,
} from "@/utils/dom";
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

/** Extends the selection from `anchor` until the button is released. */
function selectOnDrag(
  textarea: HTMLTextAreaElement,
  anchor: number,
  onEnd: () => void,
  caretAt?: CaretLocator,
): void {
  let focus = anchor;

  const onMove = ({ clientX, clientY }: globalThis.MouseEvent) => {
    // Measured on the first move
    caretAt ??= locateTextareaCarets(textarea);
    const caret = caretAt(clientX, clientY);
    if (caret === undefined || caret === focus) {
      return;
    }

    focus = caret;
    textarea.setSelectionRange(
      Math.min(anchor, caret),
      Math.max(anchor, caret),
      caret < anchor ? SelectionDirection.BACKWARD : SelectionDirection.FORWARD,
    );
  };

  const onUp = () => {
    window.removeEventListener(EventType.MOUSE_MOVE, onMove);
    window.removeEventListener(EventType.MOUSE_UP, onUp);
    onEnd();
  };

  window.addEventListener(EventType.MOUSE_MOVE, onMove, PASSIVE);
  window.addEventListener(EventType.MOUSE_UP, onUp);
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

  // The press places the caret where the preview shows it
  const handleMouseDown = (event: MouseEvent) => {
    if (!placesCaret(event)) {
      return;
    }

    event.preventDefault();

    const textarea = textareaRef.current;
    if (event.button !== MouseButton.LEFT || !previewRef.current || !textarea) {
      return;
    }

    const caret = getNoteCaretAtPoint(
      previewRef.current,
      event.clientX,
      event.clientY,
    );

    textarea.focus();
    if (caret !== undefined) {
      textarea.setSelectionRange(caret, caret);
      selectOnDrag(textarea, caret, () => readSelection(textarea));
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
          onMouseDown={(event) => {
            const { currentTarget: textarea } = event;
            const { selectionStart: from, selectionEnd: to } = textarea;
            pressedRange.current = { from, to };
            setSelection(null);

            if (
              from === to ||
              event.button !== MouseButton.LEFT ||
              event.detail !== ClickCount.SINGLE ||
              event.shiftKey ||
              !textareaRangeContains(
                textarea,
                from,
                to,
                event.clientX,
                event.clientY,
              )
            ) {
              return;
            }

            const caretAt = locateTextareaCarets(textarea);
            const caret = caretAt(event.clientX, event.clientY);
            if (caret === undefined) {
              return;
            }

            event.preventDefault();
            pressedRange.current = null;
            textarea.setSelectionRange(caret, caret);
            selectOnDrag(
              textarea,
              caret,
              () => readSelection(textarea),
              caretAt,
            );
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
