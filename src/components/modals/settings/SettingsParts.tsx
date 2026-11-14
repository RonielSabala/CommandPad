import { CssClass } from "@/common/constants/css";
import { AriaRole, InputType } from "@/common/constants/dom";
import { FramedSection } from "@/components/common/FramedSection";
import {
  Select,
  SelectAlign,
  type SelectOption,
} from "@/components/common/Select";
import { classNames } from "@/utils/string";
import { useId, type ReactNode } from "react";

import "./SettingsParts.css";

interface TextProps {
  id?: string;
  title: string;
  description?: string;
}

/** A setting's title above its description. */
function SettingText({ id, title, description }: TextProps) {
  return (
    <>
      <div className="setting-item-title" id={id}>
        {title}
      </div>
      {description && <p className="setting-item-description">{description}</p>}
    </>
  );
}

// Setting items

interface ItemProps extends Omit<TextProps, "id"> {
  children: ReactNode;
}

export function SettingItem({ title, description, children }: ItemProps) {
  const titleId = useId();

  return (
    <div
      className="setting-item"
      role={AriaRole.GROUP}
      aria-labelledby={titleId}
    >
      <SettingText id={titleId} title={title} description={description} />
      <div className="setting-item-control">{children}</div>
    </div>
  );
}

interface CheckboxProps {
  title: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}

export function SettingCheckbox({
  title,
  description,
  checked,
  onToggle,
}: CheckboxProps) {
  return (
    <SettingItem title={title}>
      <label className="setting-checkbox">
        <input
          type={InputType.CHECKBOX}
          checked={checked}
          onChange={onToggle}
        />
        <span
          className={classNames(
            "setting-item-description",
            CssClass.NO_USER_SELECT,
          )}
        >
          {description}
        </span>
      </label>
    </SettingItem>
  );
}

interface RangeProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  valueText: string;
  onChange: (value: number) => void;
  children?: ReactNode;
}

export function SettingRange({
  label,
  value,
  min,
  max,
  step,
  valueText,
  onChange,
  children,
}: RangeProps) {
  return (
    <div className="setting-range">
      <input
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

interface SelectProps<T extends string> {
  value: T;
  options: readonly SelectOption<T>[];
  onChange: (value: T) => void;
}

export function SettingSelect<T extends string>({
  value,
  options,
  onChange,
}: SelectProps<T>) {
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

// Danger zone

interface DangerZoneProps {
  title: string;
  children: ReactNode;
}

export function DangerZone({ title, children }: DangerZoneProps) {
  return (
    <FramedSection className="danger-zone" title={title}>
      {children}
    </FramedSection>
  );
}

interface DangerItemProps extends Omit<TextProps, "id"> {
  action: string;
  onAction: () => void;
}

export function DangerZoneItem({
  title,
  description,
  action,
  onAction,
}: DangerItemProps) {
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
