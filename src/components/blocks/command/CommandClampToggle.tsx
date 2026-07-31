import { EditorToggleChevronIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { classNames } from "@/utils/string";
import "./CommandClampToggle.css";

interface Props {
  expanded: boolean;
  onToggle: () => void;
}

export function CommandClampToggle({ expanded, onToggle }: Props) {
  const t = useTranslation();

  return (
    <button
      className={classNames(
        "command-clamp-toggle",
        "no-user-select",
        expanded && "expanded",
      )}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onToggle}
    >
      <EditorToggleChevronIcon className="command-clamp-toggle-icon icon-md icon-bold" />
      {expanded ? t.command.showFewerLines : t.command.showMoreLines}
    </button>
  );
}
