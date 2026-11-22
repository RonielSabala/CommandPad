import { SettingDefault } from "@/common/config";
import { CssClass } from "@/common/constants/css";
import { ThemeSetting } from "@/common/enums";
import { LANGUAGE_OPTIONS } from "@/components/common/LanguageSelect";
import type { SelectOption } from "@/components/common/Select";
import { DisplayIcon, MoonIcon, SunIcon } from "@/components/icons";
import { detectLanguage, useLanguage, useTranslation } from "@/i18n";
import { useStore, useStoreActions } from "@/store/store";
import { classNames } from "@/utils/string";
import { useMemo } from "react";

import { SettingItem, SettingSelect } from "./parts";

const DEFAULT_LANGUAGE = detectLanguage();

const THEME_ICONS: Record<ThemeSetting, typeof SunIcon> = {
  [ThemeSetting.DARK]: MoonIcon,
  [ThemeSetting.LIGHT]: SunIcon,
  [ThemeSetting.SYSTEM]: DisplayIcon,
};

export function AppearanceSettings() {
  const t = useTranslation();
  const language = useLanguage();
  const theme = useStore((state) => state.theme);
  const { setTheme, setLanguage } = useStoreActions();

  const themeOptions = useMemo<SelectOption<ThemeSetting>[]>(
    () =>
      Object.values(ThemeSetting).map((value) => {
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
    <>
      <SettingItem
        title={t.settings.theme.title}
        description={t.settings.theme.description}
      >
        <SettingSelect
          value={theme}
          defaultValue={SettingDefault.THEME}
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
          defaultValue={DEFAULT_LANGUAGE}
          options={LANGUAGE_OPTIONS}
          onChange={setLanguage}
        />
      </SettingItem>
    </>
  );
}
