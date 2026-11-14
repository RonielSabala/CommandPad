import { classNames } from "@/utils/string";
import type { ReactNode } from "react";

import "./SettingText.css";

interface DescriptionProps {
  className?: string;
  children: ReactNode;
}

export function SettingDescription({ className, children }: DescriptionProps) {
  return (
    <span className={classNames("setting-description", className)}>
      {children}
    </span>
  );
}

export interface SettingTextProps {
  id?: string;
  title: string;
  description?: string;
}

/** A setting's title above its description. */
export function SettingText({ id, title, description }: SettingTextProps) {
  return (
    <>
      <div className="setting-title" id={id}>
        {title}
      </div>
      {description && <SettingDescription>{description}</SettingDescription>}
    </>
  );
}
