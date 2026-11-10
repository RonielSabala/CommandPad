import { CssClass } from "@/common/constants/css";
import { AutoComplete } from "@/common/constants/dom";
import { Key } from "@/common/constants/events";
import { classNames } from "@/utils/string";
import { useRef, useState, type SyntheticEvent } from "react";

import "./RenameInput.css";

interface Props {
  value: string;
  maxLength?: number;
  className?: string;
  onCommit: (name: string) => void;
  onCancel: () => void;
}

const stopPropagation = (event: SyntheticEvent) => event.stopPropagation();

/** An inline name field that opens selected and commits on Enter, Escape or a blur. */
export function RenameInput({
  value,
  maxLength,
  className,
  onCommit,
  onCancel,
}: Props) {
  const [draft, setDraft] = useState(value);
  const settled = useRef(false);

  const settle = () => {
    if (settled.current) {
      return;
    }

    settled.current = true;
    const name = draft.trim();

    if (name && name !== value) {
      onCommit(name);
    } else {
      onCancel();
    }
  };

  return (
    <input
      className={classNames("rename-input", CssClass.NO_LIGATURES, className)}
      value={draft}
      maxLength={maxLength}
      spellCheck={false}
      autoComplete={AutoComplete.OFF}
      autoFocus
      onFocus={(event) => event.currentTarget.select()}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={settle}
      onKeyDown={(event) => {
        if (event.key === Key.ENTER || event.key === Key.ESCAPE) {
          event.preventDefault();
          event.stopPropagation();
          settle();
        }
      }}
      onClick={stopPropagation}
      onDoubleClick={stopPropagation}
      onMouseUp={stopPropagation}
      onContextMenu={stopPropagation}
    />
  );
}
