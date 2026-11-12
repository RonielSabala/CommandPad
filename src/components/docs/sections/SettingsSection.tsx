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
          categories[SettingsCategory.WORKSPACE],
          t.settings.reset.action,
        )}
      />
    </>
  );
}

export function LanguageDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose
        text={t.docs.language.intro(
          t.settings.categories[SettingsCategory.APPEARANCE],
          t.settings.language.title,
        )}
      />
      <Prose text={t.docs.language.detection} />
    </>
  );
}
