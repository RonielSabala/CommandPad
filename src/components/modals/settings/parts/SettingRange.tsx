import { InputType } from "@/common/constants/dom";
import type { ReactNode } from "react";

import { SettingInput } from "./SettingInput";
import "./SettingRange.css";

interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  valueText: string;
  onChange: (value: number) => void;
  children?: ReactNode;
}

/** A slider with its value spelled out. */
export function SettingRange({
  label,
  value,
  min,
  max,
  step,
  valueText,
  onChange,
  children,
}: Props) {
  return (
    <div className="setting-range">
      <SettingInput
        type={InputType.RANGE}
        className="setting-range-input"
        aria-label={label}
        aria-valuetext={valueText}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(event.currentTarget.valueAsNumber)}
      />
      <span className="setting-range-value">{valueText}</span>
      {children}
    </div>
  );
}
