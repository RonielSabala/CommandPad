import { AriaRole } from "@/common/constants/dom";
import { useId, type ReactNode } from "react";

import "./SettingItem.css";
import { SettingText, type SettingTextProps } from "./SettingText";

interface Props extends Omit<SettingTextProps, "id"> {
  children: ReactNode;
}

export function SettingItem({ title, description, children }: Props) {
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
