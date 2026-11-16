import { SettingRangeConfig } from "@/common/config";
import { InputType } from "@/common/constants/dom";
import { useRef, type CSSProperties } from "react";

import { SettingInput } from "./SettingInput";
import "./SettingRange.css";

interface Props {
  label: string;
  value: number;
  defaultValue: number;
  min: number;
  max: number;
  step: number;
  valueText: string;
  onChange: (value: number) => void;
}

/** A slider with its value spelled out. */
export function SettingRange({
  label,
  value,
  defaultValue,
  min,
  max,
  step,
  valueText,
  onChange,
}: Props) {
  const pointerDriven = useRef(false);
  const span = max - min;
  const snapDistance = span * SettingRangeConfig.SNAP_FRACTION;

  return (
    <div className="setting-range">
      <span
        className="setting-range-track"
        style={
          {
            "--setting-range-fill": (value - min) / span,
            "--setting-range-default": (defaultValue - min) / span,
          } as CSSProperties
        }
      >
        <SettingInput
          type={InputType.RANGE}
          className="setting-range-input"
          aria-label={label}
          aria-valuetext={valueText}
          value={value}
          min={min}
          max={max}
          step={step}
          onPointerDown={() => {
            pointerDriven.current = true;
          }}
          onKeyDown={() => {
            pointerDriven.current = false;
          }}
          onChange={(event) => {
            const next = event.currentTarget.valueAsNumber;
            onChange(
              pointerDriven.current &&
                Math.abs(next - defaultValue) <= snapDistance
                ? defaultValue
                : next,
            );
          }}
        />

        {value !== defaultValue && <span className="setting-range-default" />}
      </span>

      <span className="setting-range-value">{valueText}</span>
    </div>
  );
}
