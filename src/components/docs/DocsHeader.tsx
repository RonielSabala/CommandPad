import { CssClass } from "@/common/constants/css";
import { AppRoute } from "@/common/constants/routes";
import { Theme } from "@/common/enums";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { MoonIcon, SunIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { classNames } from "@/utils/string";
import { BoxArrowLeft } from "react-bootstrap-icons";
import { Link } from "react-router-dom";

import "../header/Header.css";
import { LanguageSelect } from "../header/LanguageSelect";
import "./DocsHeader.css";

export function DocsHeader() {
  const t = useTranslation();
  const isLight = useStore((state) => state.theme === Theme.LIGHT);
  const toggleTheme = useStore((state) => state.toggleTheme);
  const toggleThemeLabel = isLight
    ? t.header.switchToDark
    : t.header.switchToLight;

  return (
    <header className="header-bar">
      <Link
        to={AppRoute.HOME}
        id="docs-logo"
        className={classNames("logo", CssClass.NO_USER_SELECT)}
        {...tooltip(t.docs.meta.backToApp)}
      >
        <span className="logo-word">Command</span>
        <span className="logo-pad">{"{Pad}"}</span>
      </Link>

      <span id="docs-header-title" className={CssClass.NO_USER_SELECT}>
        {t.docs.meta.title}
      </span>

      <div className="header-spacer" />

      <div className="header-actions">
        <button
          className={classNames(
            CssClass.BTN,
            CssClass.BTN_LG,
            CssClass.BTN_FLAT_ICON,
          )}
          onClick={toggleTheme}
          aria-label={toggleThemeLabel}
          {...tooltip(toggleThemeLabel)}
        >
          {isLight ? (
            <MoonIcon
              className={classNames(CssClass.ICON, CssClass.ICON_BOLD)}
            />
          ) : (
            <SunIcon
              className={classNames(CssClass.ICON, CssClass.ICON_BOLD)}
            />
          )}
        </button>

        <div className={CssClass.VERTICAL_DIVIDER} />

        <LanguageSelect />

        <div className={CssClass.VERTICAL_DIVIDER} />

        <Link
          to={AppRoute.HOME}
          className={classNames(
            CssClass.BTN,
            CssClass.BTN_LG,
            CssClass.BTN_PRIMARY,
          )}
        >
          <BoxArrowLeft className={CssClass.ICON} />
          {t.docs.meta.backToApp}
        </Link>
      </div>
    </header>
  );
}
