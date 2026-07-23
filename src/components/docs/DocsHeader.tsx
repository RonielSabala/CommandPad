import { AppRoute } from "@/common/constants/routes";
import { Theme } from "@/common/enums";
import { MoonIcon, SunIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { BoxArrowLeft } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import "../header/Header.css";
import { LanguageSelect } from "../header/LanguageSelect";
import "./DocsHeader.css";

export function DocsHeader() {
  const t = useTranslation();
  const isLight = useStore((state) => state.theme === Theme.LIGHT);
  const toggleTheme = useStore((state) => state.toggleTheme);

  return (
    <header className="header-bar">
      <Link
        to={AppRoute.HOME}
        id="docs-logo"
        className="logo no-user-select"
        title={t.docs.meta.backToApp}
      >
        <span className="logo-word">Command</span>
        <span className="logo-pad">{"{Pad}"}</span>
      </Link>

      <span id="docs-header-title" className="no-user-select">
        {t.docs.meta.title}
      </span>

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

        <div className="vertical-divider" />

        <Link to={AppRoute.WORKSPACE} className="btn btn-lg btn-primary">
          <BoxArrowLeft className="icon" />
          {t.docs.meta.backToApp}
        </Link>
      </div>
    </header>
  );
}
