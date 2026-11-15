import { SettingsCategory } from "@/common/enums";
import { KeyBinding } from "@/common/keybindings";
import { useTranslation } from "@/i18n";

import { Prose } from "../Prose";
import { useShortcutLabel } from "../useShortcutLabel";

export function SettingsDocs() {
  const t = useTranslation();
  const settingsKey = useShortcutLabel(KeyBinding.OPEN_SETTINGS);
  const { categories } = t.settings;

  return (
    <>
      <Prose text={t.docs.settings.intro(settingsKey)} />
      <Prose
        text={t.docs.settings.categories(
          categories[SettingsCategory.APPEARANCE],
          categories[SettingsCategory.EDITOR],
          categories[SettingsCategory.KEYBOARD],
          categories[SettingsCategory.WORKSPACE],
          t.settings.keyboard.resetAll,
          t.settings.reset.action,
        )}
      />
    </>
  );
}
