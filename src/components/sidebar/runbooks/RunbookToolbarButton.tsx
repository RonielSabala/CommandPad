import { CssClass } from "@/common/constants/css";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { classNames } from "@/utils/string";
import type { Icon } from "react-bootstrap-icons";

interface Props {
  icon: Icon;
  label: string;
  onClick: () => void;
}

export function RunbookToolbarButton({
  icon: IconComponent,
  label,
  onClick,
}: Props) {
  return (
    <button
      className={classNames(CssClass.BTN, CssClass.BTN_SOFT_ICON)}
      onClick={onClick}
      aria-label={label}
      {...tooltip(label)}
    >
      <IconComponent className={CssClass.ICON_MD} />
    </button>
  );
}
