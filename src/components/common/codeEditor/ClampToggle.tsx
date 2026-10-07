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
        expanded && "expanded",
        CssClass.NO_USER_SELECT,
        CssClass.SELECT_KEY_INERT,
      )}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onToggle}
    >
      <EditorToggleChevronIcon
        className={classNames(
          "clamp-toggle-icon",
          CssClass.ICON_MD,
          CssClass.ICON_BOLD,
        )}
      />
      {expanded ? t.command.showFewerLines : t.command.showMoreLines}
    </button>
  );
}
