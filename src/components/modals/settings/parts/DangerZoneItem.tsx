import { CssClass } from "@/common/constants/css";
import { classNames } from "@/utils/string";

import "./DangerZoneItem.css";
import { SettingText, type SettingTextProps } from "./SettingText";

interface Props extends Omit<SettingTextProps, "id"> {
  action: string;
  onAction: () => void;
}

/** One irreversible action. */
export function DangerZoneItem({
  title,
  description,
  action,
  onAction,
}: Props) {
  return (
    <div className={classNames("danger-zone-item", CssClass.FRAMED_ROW)}>
      <div className="danger-zone-text">
        <SettingText title={title} description={description} />
      </div>

      <button
        className={classNames("danger-zone-button", CssClass.BTN)}
        onClick={onAction}
      >
        {action}
      </button>
    </div>
  );
}
