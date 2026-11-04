import { CssClass } from "@/common/constants/css";
import { CheckSquare, Square } from "react-bootstrap-icons";

import { ContextMenuItem } from "./ContextMenu";

interface Props {
  selected: boolean;
  onToggle: () => void;
  selectLabel: string;
  deselectLabel: string;
}

export function SelectionToggleItem({
  selected,
  onToggle,
  selectLabel,
  deselectLabel,
}: Props) {
  const Icon = selected ? CheckSquare : Square;

  return (
    <ContextMenuItem
      icon={<Icon className={CssClass.ICON_MD} />}
      onSelect={onToggle}
    >
      {selected ? deselectLabel : selectLabel}
    </ContextMenuItem>
  );
}
