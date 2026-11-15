import { CssClass } from "@/common/constants/css";
import {
  Select,
  SelectAlign,
  type SelectOption,
} from "@/components/common/Select";
import { classNames } from "@/utils/string";
import { useMemo } from "react";

import { SettingDefaultTag } from "./SettingDefaultTag";
import "./SettingSelect.css";

interface Props<T extends string> {
  value: T;
  defaultValue: T;
  options: readonly SelectOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
}

/** A pick-one setting. */
export function SettingSelect<T extends string>({
  value,
  defaultValue,
  options,
  onChange,
  disabled,
}: Props<T>) {
  const taggedOptions = useMemo(
    () =>
      options.map((option) =>
        option.value === defaultValue
          ? { ...option, hint: <SettingDefaultTag /> }
          : option,
      ),
    [options, defaultValue],
  );

  return (
    <Select
      className="setting-select"
      triggerClassName={classNames(CssClass.BTN, "setting-select-trigger")}
      align={SelectAlign.START}
      disabled={disabled}
      portal
      value={value}
      options={taggedOptions}
      onChange={onChange}
    >
      <span className="setting-select-label">
        {options.find((option) => option.value === value)?.label}
      </span>
    </Select>
  );
}
