import { tooltip } from "@/components/common/tooltip/tooltip";
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
      <p className="add-row-label section-title no-user-select">{label}</p>

      {items.map(({ key, icon: Icon, label, title, onAdd }) => (
        <button key={key} className="btn" onClick={onAdd} {...tooltip(title)}>
          <Icon className="icon-md icon-bold" />
          {label}
        </button>
      ))}
    </div>
  );
}
