import { CssClass } from "@/common/constants/css";
import { CAPTURE, EventType, Key } from "@/common/constants/events";
import {
  bindingConflicts,
  chordFromEvent,
  formatBinding,
  type KeyBinding,
} from "@/common/keybindings";
import { KeyCap, KeyCapPlaceholder } from "@/components/common/Kbd";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { useTranslation } from "@/i18n";
import { classNames } from "@/utils/string";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { CheckLg, XLg } from "react-bootstrap-icons";

import "./ChordRecorder.css";

const ACCEPT_CHORD = Key.ENTER.toLowerCase();
const CANCEL_CHORD = Key.ESCAPE.toLowerCase();

function RecorderButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      className={classNames(
        "chord-recorder-button",
        CssClass.BTN,
        CssClass.BTN_SOFT_ICON,
      )}
      aria-label={label}
      {...tooltip(label)}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

interface Props {
  id: KeyBinding;
  onFinish: (chord: string | null, byKeyboard: boolean) => void;
}

/** Captures the next chord for `id`. */
export function ChordRecorder({ id, onFinish }: Props) {
  const t = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const [chord, setChord] = useState<string | null>(null);

  // What the listeners read
  const chordRef = useRef<string | null>(null);

  // The key whose release ends recording
  const finishKey = useRef<string | null>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const pressed = chordFromEvent(event);
      if (pressed === ACCEPT_CHORD || pressed === CANCEL_CHORD) {
        finishKey.current = pressed;
      } else if (pressed !== null) {
        chordRef.current = pressed;
        finishKey.current = null;
        setChord(pressed);
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const finish = finishKey.current;
      if (finish !== null && event.key.toLowerCase() === finish) {
        onFinish(finish === ACCEPT_CHORD ? chordRef.current : null, true);
      }
    };

    window.addEventListener(EventType.KEY_DOWN, onKeyDown, CAPTURE);
    window.addEventListener(EventType.KEY_UP, onKeyUp, CAPTURE);
    return () => {
      window.removeEventListener(EventType.KEY_DOWN, onKeyDown, CAPTURE);
      window.removeEventListener(EventType.KEY_UP, onKeyUp, CAPTURE);
    };
  }, [onFinish]);

  const keyboard = t.settings.keyboard;
  const [conflict] = chord === null ? [] : bindingConflicts(chord, id);

  return (
    <>
      <div
        ref={ref}
        className={classNames("chord-recorder", CssClass.NO_USER_SELECT)}
        tabIndex={0}
        aria-label={keyboard.recording}
        onBlur={() => onFinish(null, false)}
      >
        {chord === null ? (
          <KeyCapPlaceholder label={keyboard.recording} />
        ) : (
          <>
            <KeyCap label={formatBinding(chord)} />
            <RecorderButton
              label={keyboard.accept}
              onClick={() => onFinish(chord, false)}
            >
              <CheckLg className={CssClass.ICON} />
            </RecorderButton>
          </>
        )}

        <RecorderButton
          label={t.common.cancel}
          onClick={() => onFinish(null, false)}
        >
          <XLg className={CssClass.ICON} />
        </RecorderButton>
      </div>

      <p className={classNames("chord-recorder-note", CssClass.NO_USER_SELECT)}>
        {keyboard.recordingHint(Key.ENTER, Key.ESCAPE)}
        {conflict && (
          <span className="chord-recorder-conflict">
            {keyboard.conflict(t.keybindings[conflict])}
          </span>
        )}
      </p>
    </>
  );
}
