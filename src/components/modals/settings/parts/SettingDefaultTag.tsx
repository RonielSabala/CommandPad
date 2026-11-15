import { useTranslation } from "@/i18n";

import "./SettingDefaultTag.css";

/** Marks the value a setting starts at. */
export function SettingDefaultTag() {
  const t = useTranslation();
  return <span className="setting-default-tag">{t.settings.defaultTag}</span>;
}
