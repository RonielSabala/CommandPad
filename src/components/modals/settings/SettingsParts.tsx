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

interface PageProps {
  title: string;
  children: ReactNode;
}

/** One category's page: its heading, then its settings. */
export function SettingsPage({ title, children }: PageProps) {
  return (
    <section className="settings-page">
      <h2 className="settings-page-title">{title}</h2>
      {children}
    </section>
  );
}

interface ItemProps {
  title: string;
  description: string;
  children: ReactNode;
}

/** A setting: its name, what it does, then its control. */
export function SettingItem({ title, description, children }: ItemProps) {
  const titleId = useId();

  return (
    <div
      className="setting-item"
      role={AriaRole.GROUP}
      aria-labelledby={titleId}
    >
      <div className="setting-item-title" id={titleId}>
        {title}
      </div>
      <p className="setting-item-description">{description}</p>
      <div className="setting-item-control">{children}</div>
    </div>
  );
}

interface SelectProps<T extends string> {
  value: T;
  options: readonly SelectOption<T>[];
  onChange: (value: T) => void;
}

/** A setting's dropdown, showing the chosen option's label. */
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

interface DangerZoneProps {
  title: string;
  children: ReactNode;
}

/** The red box that holds the actions that can't be undone. */
export function DangerZone({ title, children }: DangerZoneProps) {
  return (
    <FramedSection className="danger-zone" title={title}>
      {children}
    </FramedSection>
  );
}

interface DangerItemProps {
  title: string;
  description: string;
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
    <div className={classNames(CssClass.FRAMED_ROW, "danger-zone-item")}>
      <div className="danger-zone-text">
        <div className="setting-item-title">{title}</div>
        <p className="setting-item-description">{description}</p>
      </div>

      <button
        className={classNames(CssClass.BTN, "danger-zone-button")}
        onClick={onAction}
      >
        {action}
      </button>
    </div>
  );
}
