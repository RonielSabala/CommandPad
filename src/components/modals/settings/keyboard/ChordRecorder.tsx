import { CssClass } from "@/common/constants/css";
import { CAPTURE, EventType, Key } from "@/common/constants/events";
import {
  bindingConflicts,
  chordFromEvent,
  formatBinding,
  type KeyBinding,
} from "@/common/keybindings";
import { KeyCap } from "@/components/common/Kbd";
import { useTranslation } from "@/i18n";
import { classNames } from "@/utils/string";
import { useEffect, useRef, useState } from "react";

import "./ChordRecorder.css";

const ACCEPT_CHORD = Key.ENTER.toLowerCase();
const CANCEL_CHORD = Key.ESCAPE.toLowerCase();

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
          <span className="chord-recorder-placeholder">
            {keyboard.recording}
          </span>
        ) : (
          <KeyCap label={formatBinding(chord)} />
        )}
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
