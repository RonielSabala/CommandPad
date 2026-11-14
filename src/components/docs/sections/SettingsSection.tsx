import { SettingsCategory } from "@/common/enums";
import { bindingLabel, KeyBinding } from "@/common/keybindings";
import { useTranslation } from "@/i18n";

import { Prose } from "../Prose";

export function SettingsDocs() {
  const t = useTranslation();
  const { categories } = t.settings;

  return (
    <>
      <Prose
        text={t.docs.settings.intro(bindingLabel(KeyBinding.OPEN_SETTINGS))}
      />
      <Prose
        text={t.docs.settings.categories(
          categories[SettingsCategory.APPEARANCE],
          categories[SettingsCategory.EDITOR],
          categories[SettingsCategory.WORKSPACE],
          t.settings.reset.action,
        )}
      />
    </>
  );
}
