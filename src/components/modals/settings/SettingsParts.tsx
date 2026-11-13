import { CssClass } from "@/common/constants/css";
import { AriaRole } from "@/common/constants/dom";
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
  description: string;
}

/** A setting's title above its description. */
function SettingText({ id, title, description }: TextProps) {
  return (
    <>
      <div className="setting-item-title" id={id}>
        {title}
      </div>
      <p className="setting-item-description">{description}</p>
    </>
  );
}

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
