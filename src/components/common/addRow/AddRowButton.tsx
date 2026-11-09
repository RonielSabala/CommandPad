import { CssClass, STANDARD_ICON_CLASS } from "@/common/constants/css";
import { useRichTooltip } from "@/components/common/tooltip/richTooltip";
import { useTranslation } from "@/i18n";
import { classNames } from "@/utils/string";
import { useState, type ComponentType, type SVGProps } from "react";
import { InfoCircle, InfoCircleFill } from "react-bootstrap-icons";

import "./AddRowButton.css";

export interface AddRowItem {
  key: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  title: string;
  info: string;
  onAdd: () => void;
}

function AddRowTip({ title, info }: Pick<AddRowItem, "title" | "info">) {
  const t = useTranslation();
  const [open, setOpen] = useState(false);
  const label = open ? t.common.hideDescription : t.common.showDescription;
  const ToggleIcon = open ? InfoCircleFill : InfoCircle;

  return (
    <div className={classNames("add-row-tip", open && "is-open")}>
      <div className="add-row-tip-header">
        <span className="add-row-tip-title">{title}</span>

        <button
          type="button"
          className="add-row-tip-toggle"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={label}
          title={label}
        >
          <ToggleIcon className={CssClass.ICON_MD} />
        </button>
      </div>

      {open && <p className="add-row-tip-info">{info}</p>}
    </div>
  );
}

export function AddRowButton({
  icon: Icon,
  label,
  title,
  info,
  onAdd,
}: AddRowItem) {
  const tip = useRichTooltip();

  return (
    <>
      <button className={CssClass.BTN} onClick={() => onAdd()} {...tip.props}>
        <Icon className={STANDARD_ICON_CLASS} />
        {label}
      </button>

      {tip.render(() => (
        <AddRowTip title={title} info={info} />
      ))}
    </>
  );
}
