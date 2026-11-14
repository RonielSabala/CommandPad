import { CssClass } from "@/common/constants/css";
import {
  Select,
  SelectAlign,
  type SelectOption,
} from "@/components/common/Select";
import { classNames } from "@/utils/string";

import "./SettingSelect.css";

interface Props<T extends string> {
  value: T;
  options: readonly SelectOption<T>[];
  onChange: (value: T) => void;
}

export function SettingSelect<T extends string>({
  value,
  options,
  onChange,
}: Props<T>) {
  return (
    <Select
      className="setting-select"
      triggerClassName={classNames(CssClass.BTN, "setting-select-trigger")}
      align={SelectAlign.START}
      portal
      value={value}
      options={options}
      onChange={onChange}
    >
      <span className="setting-select-label">
        {options.find((option) => option.value === value)?.label}
      </span>
    </Select>
  );
}
