import { CssClass } from "@/common/constants/css";
import { InputType } from "@/common/constants/dom";

import "./SettingCheckbox.css";
import { SettingInput } from "./SettingInput";
import { SettingItem } from "./SettingItem";
import { SettingDescription } from "./SettingText";

interface Props {
  title: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}

/** An on/off setting. */
export function SettingCheckbox({
  title,
  description,
  checked,
  onToggle,
}: Props) {
  return (
    <SettingItem title={title}>
      <label className="setting-checkbox">
        <SettingInput
          type={InputType.CHECKBOX}
          className="setting-checkbox-input"
          checked={checked}
          onChange={onToggle}
        />
        <SettingDescription className={CssClass.NO_USER_SELECT}>
          {description}
        </SettingDescription>
      </label>
    </SettingItem>
  );
}
