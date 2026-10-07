import { CssClass } from "@/common/constants/css";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { classNames } from "@/utils/string";
import { CheckCircleFill, Circle } from "react-bootstrap-icons";

interface Props {
  selected: boolean;
  title: string;
  onToggle: () => void;
}

export function CloudSelectCircle({ selected, title, onToggle }: Props) {
  return (
    <button
      className={classNames("cloud-browser-row-select", selected && "is-on")}
      role="checkbox"
      aria-checked={selected}
      {...tooltip(title)}
      aria-label={title}
      onClick={onToggle}
    >
      {selected ? (
        <CheckCircleFill className={CssClass.ICON_MD} />
      ) : (
        <Circle className={CssClass.ICON_MD} />
      )}
    </button>
  );
}
