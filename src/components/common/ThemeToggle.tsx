import { CssClass, HEADER_ICON_CLASS } from "@/common/constants/css";
import { Theme } from "@/common/enums";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { MoonIcon, SunIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { getAppliedTheme, useStore, useStoreActions } from "@/store/store";
import { classNames } from "@/utils/string";

/** The header button that flips the theme being shown. */
export function ThemeToggle() {
  const t = useTranslation();
  const isLight = useStore((state) => getAppliedTheme(state) === Theme.LIGHT);
  const { toggleTheme } = useStoreActions();
  const label = isLight ? t.header.switchToDark : t.header.switchToLight;
  const Icon = isLight ? MoonIcon : SunIcon;

  return (
    <button
      className={classNames(
        CssClass.BTN,
        CssClass.BTN_LG,
        CssClass.BTN_FLAT_ICON,
      )}
      onClick={toggleTheme}
      aria-label={label}
      {...tooltip(label)}
    >
      <Icon className={HEADER_ICON_CLASS} />
    </button>
  );
}
