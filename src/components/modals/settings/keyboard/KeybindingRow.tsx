import { CssClass, STANDARD_ICON_CLASS } from "@/common/constants/css";
import { defaultBindingLabel, type KeyBinding } from "@/common/keybindings";
import { KeyCap } from "@/components/common/Kbd";
import { ActionsMenu } from "@/components/common/contextMenu/ActionsMenu";
import {
  ContextMenuAlign,
  ContextMenuItem,
} from "@/components/common/contextMenu/ContextMenu";
import { DeleteMenuItem } from "@/components/common/contextMenu/DeleteMenuItem";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { PencilIcon } from "@/components/icons";
import { useBindingLabel } from "@/hooks/useBindingLabel";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { classNames } from "@/utils/string";
import { memo, useCallback, useEffect, useRef } from "react";
import { ArrowCounterclockwise } from "react-bootstrap-icons";

import { ChordRecorder } from "./ChordRecorder";
import "./KeybindingRow.css";

/** Marks a changed shortcut. */
function ModifiedDot({ id }: { id: KeyBinding }) {
  const keyboard = useTranslation().settings.keyboard;
  const defaultLabel = defaultBindingLabel(id);
  const text = defaultLabel
    ? keyboard.modified(defaultLabel)
    : keyboard.modifiedFromUnbound;

  return (
    <span
      className="keybinding-modified"
      aria-label={text}
      {...tooltip(text)}
    />
  );
}

interface Props {
  id: KeyBinding;
  modified: boolean;
  recording: boolean;
  onRecording: (id: KeyBinding | null) => void;
}

export const KeybindingRow = memo(function KeybindingRow({
  id,
  modified,
  recording,
  onRecording,
}: Props) {
  const t = useTranslation();
  const label = useBindingLabel(id);
  const setKeybinding = useStore((state) => state.setKeybinding);
  const resetKeybinding = useStore((state) => state.resetKeybinding);

  const refocus = useRef(false);
  const chordRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!recording && refocus.current) {
      refocus.current = false;
      chordRef.current?.focus();
    }
  }, [recording]);

  const finish = useCallback(
    (chord: string | null, byKeyboard: boolean) => {
      if (chord !== null) {
        setKeybinding(id, chord);
      }

      refocus.current = byKeyboard;
      onRecording(null);
    },
    [id, onRecording, setKeybinding],
  );

  const keyboard = t.settings.keyboard;
  const record = () => onRecording(id);

  return (
    <div
      className={classNames(
        "keybinding-row",
        recording && "is-recording",
        CssClass.FRAMED_ROW,
      )}
    >
      <span className="keybinding-name">
        {t.keybindings[id]}
        {modified && <ModifiedDot id={id} />}
      </span>

      {recording ? (
        <ChordRecorder id={id} onFinish={finish} />
      ) : (
        <button
          ref={chordRef}
          className="keybinding-chord"
          onClick={record}
          {...tooltip(keyboard.change)}
        >
          {label ? (
            <KeyCap label={label} />
          ) : (
            <span className="keybinding-unbound">{keyboard.unbound}</span>
          )}
        </button>
      )}

      <ActionsMenu title={keyboard.actions} align={ContextMenuAlign.END}>
        <ContextMenuItem
          icon={<PencilIcon className={STANDARD_ICON_CLASS} />}
          onSelect={record}
        >
          {keyboard.change}
        </ContextMenuItem>

        <ContextMenuItem
          icon={<ArrowCounterclockwise className={CssClass.ICON} />}
          disabled={!modified}
          onSelect={() => resetKeybinding(id)}
        >
          {keyboard.reset}
        </ContextMenuItem>

        <DeleteMenuItem
          disabled={!label}
          onSelect={() => setKeybinding(id, null)}
        >
          {keyboard.remove}
        </DeleteMenuItem>
      </ActionsMenu>
    </div>
  );
});
