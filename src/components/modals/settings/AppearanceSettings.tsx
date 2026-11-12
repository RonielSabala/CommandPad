import { CssClass } from "@/common/constants/css";
import { SettingsCategory, Theme } from "@/common/enums";
import { LANGUAGE_OPTIONS } from "@/components/common/LanguageSelect";
import type { SelectOption } from "@/components/common/Select";
import { MoonIcon, SunIcon } from "@/components/icons";
import { useLanguage, useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { classNames } from "@/utils/string";
import { useMemo } from "react";

import { SettingItem, SettingSelect, SettingsPage } from "./SettingsParts";

const THEME_ICONS: Record<Theme, typeof SunIcon> = {
  [Theme.DARK]: MoonIcon,
  [Theme.LIGHT]: SunIcon,
};

export function AppearanceSettings() {
  const t = useTranslation();
  const language = useLanguage();
  const theme = useStore((state) => state.theme);
  const setTheme = useStore((state) => state.setTheme);
  const setLanguage = useStore((state) => state.setLanguage);

  const themeOptions = useMemo<SelectOption<Theme>[]>(
    () =>
      Object.values(Theme).map((value) => {
        const Icon = THEME_ICONS[value];
        return {
          value,
          label: (
            <>
              <Icon className={classNames(CssClass.ICON, CssClass.ICON_BOLD)} />
              {t.settings.theme.options[value]}
            </>
          ),
        };
      }),
    [t],
  );

  return (
    <SettingsPage title={t.settings.categories[SettingsCategory.APPEARANCE]}>
      <SettingItem
        title={t.settings.theme.title}
        description={t.settings.theme.description}
      >
        <SettingSelect
          value={theme}
          options={themeOptions}
          onChange={setTheme}
        />
      </SettingItem>

      <SettingItem
        title={t.settings.language.title}
        description={t.settings.language.description}
      >
        <SettingSelect
          value={language}
          options={LANGUAGE_OPTIONS}
          onChange={setLanguage}
        />
      </SettingItem>
    </SettingsPage>
  );
}
