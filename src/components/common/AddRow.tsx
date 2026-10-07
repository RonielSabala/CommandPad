import { CssClass } from "@/common/constants/css";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { classNames } from "@/utils/string";
import type { ComponentType, SVGProps } from "react";

import "./AddRow.css";

export interface AddRowItem {
  key: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  title: string;
  onAdd: () => void;
}

interface Props {
  label: string;
  items: AddRowItem[];
}

export function AddRow({ label, items }: Props) {
  return (
    <div className="add-row">
      <p
        className={classNames(
          "add-row-label",
          CssClass.SECTION_TITLE,
          CssClass.NO_USER_SELECT,
        )}
      >
        {label}
      </p>

      {items.map(({ key, icon: Icon, label, title, onAdd }) => (
        <button
          key={key}
          className={CssClass.BTN}
          onClick={onAdd}
          {...tooltip(title)}
        >
          <Icon className={classNames(CssClass.ICON_MD, CssClass.ICON_BOLD)} />
          {label}
        </button>
      ))}
    </div>
  );
}
