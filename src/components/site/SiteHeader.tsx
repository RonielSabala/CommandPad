import { CssClass } from "@/common/constants/css";
import { Key } from "@/common/constants/events";
import { AppRoute } from "@/common/constants/routes";
import { Theme } from "@/common/enums";
import { tooltip } from "@/components/common/tooltip/tooltip";
import "@/components/docs/DocsHeader.css";
import "@/components/header/Header.css";
import { LanguageSelect } from "@/components/header/LanguageSelect";
import { BookIcon, MoonIcon, SunIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { markHomeVisited } from "@/utils/session";
import { classNames } from "@/utils/string";
import { BoxArrowInRight } from "react-bootstrap-icons";
import { Link } from "react-router-dom";

import "./SiteHeader.css";

interface Props {
  title?: string;
  showDocsLink?: boolean;
}

export function SiteHeader({ title, showDocsLink }: Props) {
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
        id="site-logo"
        className={classNames("logo", CssClass.NO_USER_SELECT)}
        {...tooltip(t.header.reloadTitle)}
        onKeyDown={(event) => {
          if (event.key === Key.ENTER) {
            location.reload();
          }
        }}
      >
        <span className="logo-word">Command</span>
        <span className="logo-pad">{"{Pad}"}</span>
      </Link>

      {title && (
        <span id="docs-header-title" className={CssClass.NO_USER_SELECT}>
          {title}
        </span>
      )}

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

        <div className="vertical-divider" />

        <LanguageSelect />

        {showDocsLink && (
          <>
            <div className="vertical-divider" />
            <Link
              to={AppRoute.DOCS}
              className={classNames(
                CssClass.BTN,
                CssClass.BTN_LG,
                CssClass.BTN_FLAT_ICON,
              )}
              aria-label={t.docs.meta.openDocs}
              {...tooltip(t.docs.meta.openDocs)}
            >
              <BookIcon
                className={classNames(CssClass.ICON, CssClass.ICON_BOLD)}
              />
            </Link>
          </>
        )}

        <div className="vertical-divider" />

        <Link
          to={AppRoute.WORKSPACE}
          className={classNames(
            CssClass.BTN,
            CssClass.BTN_LG,
            CssClass.BTN_PRIMARY,
          )}
          onClick={markHomeVisited}
        >
          <BoxArrowInRight className={CssClass.ICON} />
          {t.home.meta.openApp}
        </Link>
      </div>
    </header>
  );
}
