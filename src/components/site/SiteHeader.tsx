import { CssClass, HEADER_ICON_CLASS } from "@/common/constants/css";
import { Key } from "@/common/constants/events";
import { AppRoute } from "@/common/constants/routes";
import { LanguageSelect } from "@/components/common/LanguageSelect";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { VerticalDivider } from "@/components/common/VerticalDivider";
import "@/components/docs/DocsHeader.css";
import "@/components/header/Header.css";
import { BookIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
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
        <ThemeToggle />
        <VerticalDivider />

        <LanguageSelect />

        {showDocsLink && (
          <>
            <VerticalDivider />
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
              <BookIcon className={HEADER_ICON_CLASS} />
            </Link>
          </>
        )}

        <VerticalDivider />
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
