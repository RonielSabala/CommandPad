import { tooltip } from "@/components/common/tooltip/tooltip";
import { EditorToggleChevronIcon } from "@/components/icons";
import { classNames } from "@/utils/string";

import "./EditorToggle.css";

interface Props {
  collapsed: boolean;
  label: string;
  onToggle: () => void;
}

/** The chevron that folds a block's body away. */
export function EditorToggle({ collapsed, label, onToggle }: Props) {
  return (
    <button
      className={classNames(
        "btn",
        "toggle-editor-btn",
        collapsed && "editor-collapsed",
      )}
      onClick={onToggle}
      aria-label={label}
      {...tooltip(label)}
    >
      <EditorToggleChevronIcon className="toggle-editor-icon icon-md icon-bold" />
    </button>
  );
}
