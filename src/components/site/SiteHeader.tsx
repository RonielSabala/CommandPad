import { AppRoute } from "@/common/constants/routes";
import { Theme } from "@/common/enums";
import "@/components/docs/DocsHeader.css";
import "@/components/header/Header.css";
import { LanguageSelect } from "@/components/header/LanguageSelect";
import { BookIcon, MoonIcon, SunIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { markHomeVisited } from "@/utils/session";
import { BoxArrowInRight } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import "./SiteHeader.css";

interface Props {
  /** Optional label shown next to the logo (like the docs header title). */
  title?: string;
  /** Show the documentation shortcut in the actions row. */
  showDocsLink?: boolean;
}

export function SiteHeader({ title, showDocsLink }: Props) {
  const t = useTranslation();
  const isLight = useStore((state) => state.theme === Theme.LIGHT);
  const toggleTheme = useStore((state) => state.toggleTheme);

  return (
    <header className="header-bar">
      <Link to={AppRoute.HOME} id="site-logo" className="logo no-user-select">
        <span className="logo-word">Command</span>
        <span className="logo-pad">{"{Pad}"}</span>
      </Link>

      {title && (
        <span id="docs-header-title" className="no-user-select">
          {title}
        </span>
      )}

      <div className="header-spacer" />

      <div className="header-actions">
        <button
          className="btn btn-lg btn-flat-icon"
          onClick={toggleTheme}
          title={isLight ? t.header.switchToDark : t.header.switchToLight}
        >
          {isLight ? (
            <MoonIcon className="icon icon-bold" />
          ) : (
            <SunIcon className="icon icon-bold" />
          )}
        </button>

        <div className="vertical-divider" />

        <LanguageSelect />

        {showDocsLink && (
          <>
            <div className="vertical-divider" />
            <Link
              to={AppRoute.DOCS}
              className="btn btn-lg btn-flat-icon"
              title={t.docs.meta.openDocs}
            >
              <BookIcon className="icon icon-bold" />
            </Link>
          </>
        )}

        <div className="vertical-divider" />

        <Link
          to={AppRoute.WORKSPACE}
          className="btn btn-lg btn-primary"
          onClick={markHomeVisited}
        >
          <BoxArrowInRight className="icon" />
          {t.home.meta.openApp}
        </Link>
      </div>
    </header>
  );
}
