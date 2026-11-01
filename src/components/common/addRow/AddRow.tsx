import { CssClass } from "@/common/constants/css";
import { classNames } from "@/utils/string";

import "./AddRow.css";
import { AddRowButton, type AddRowItem } from "./AddRowButton";

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

      {items.map((item) => (
        <AddRowButton {...item} key={item.key} />
      ))}
    </div>
  );
}
