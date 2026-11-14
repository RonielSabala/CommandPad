import { classNames } from "@/utils/string";
import type { InputHTMLAttributes } from "react";

import "./SettingInput.css";

/** A native input wearing the accent. */
export function SettingInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input className={classNames("setting-input", className)} {...props} />
  );
}
