import { CssClass } from "@/common/constants/css";
import { AppRoute } from "@/common/constants/routes";
import { LanguageSelect } from "@/components/common/LanguageSelect";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { VerticalDivider } from "@/components/common/VerticalDivider";
import { useTranslation } from "@/i18n";
import { classNames } from "@/utils/string";
import { BoxArrowLeft } from "react-bootstrap-icons";
import { Link } from "react-router-dom";

import "../header/Header.css";
import "./DocsHeader.css";

export function DocsHeader() {
  const t = useTranslation();

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
        <ThemeToggle />
        <VerticalDivider />

        <LanguageSelect />

        <VerticalDivider />
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
