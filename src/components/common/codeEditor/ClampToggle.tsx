import { CssClass } from "@/common/constants/css";
import { EditorToggleChevronIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { classNames } from "@/utils/string";
import "./ClampToggle.css";

interface Props {
  expanded: boolean;
  onToggle: () => void;
}

export function ClampToggle({ expanded, onToggle }: Props) {
  const t = useTranslation();

  return (
    <button
      className={classNames(
        "clamp-toggle",
        "no-user-select",
        CssClass.SELECT_KEY_INERT,
        expanded && "expanded",
      )}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onToggle}
    >
      <EditorToggleChevronIcon className="clamp-toggle-icon icon-md icon-bold" />
      {expanded ? t.command.showFewerLines : t.command.showMoreLines}
    </button>
  );
}
