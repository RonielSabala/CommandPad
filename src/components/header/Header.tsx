import { CssClass } from "@/common/constants/css";
import { AppRoute } from "@/common/constants/routes";
import { AppMode, RunbookView, Theme } from "@/common/enums";
import { asButton } from "@/components/common/asButton";
import { tooltip } from "@/components/common/tooltip/tooltip";
import {
  BookIcon,
  ChevronsRightIcon,
  ExportIcon,
  MoonIcon,
  PadlockIcon,
  PencilIcon,
  SunIcon,
} from "@/components/icons";
import { useTranslation } from "@/i18n";
import { getActiveTab, getRunbookView, useStore } from "@/store/store";
import { classNames } from "@/utils/string";
import { ArrowCounterclockwise } from "react-bootstrap-icons";
import { Link, useNavigate } from "react-router-dom";

import "./Header.css";
import { LanguageSelect } from "./LanguageSelect";

export function Header() {
  const t = useTranslation();
  const navigate = useNavigate();

  const isRead = useStore((state) => state.mode === AppMode.READ);
  const isLight = useStore((state) => state.theme === Theme.LIGHT);

  const toggleTheme = useStore((state) => state.toggleTheme);
  const toggleAppMode = useStore((state) => state.toggleAppMode);
  const clearAllData = useStore((state) => state.clearAllData);
  const openExportModal = useStore((state) => state.openExportModal);
  const toggleCollapseAll = useStore((state) => state.toggleCollapseAll);

  const isEmpty = useStore(
    (state) => !(getActiveTab(state)?.blocks.length ?? 0),
  );
  const inVariables = useStore(
    (state) => getRunbookView(state) === RunbookView.VARIABLES,
  );
  const hasSections = useStore(
    (state) => !!getActiveTab(state)?.variableSections.length,
  );

  const canCollapse = inVariables ? hasSections : !isEmpty && !isRead;

  const toggleModeLabel = isRead
    ? t.header.switchToEdit
    : t.header.switchToRead;

  const toggleThemeLabel = isLight
    ? t.header.switchToDark
    : t.header.switchToLight;

  return (
    <header className="header-bar">
      <span
        className={classNames("logo", CssClass.NO_USER_SELECT)}
        {...tooltip(t.header.reloadTitle)}
        {...asButton(() => location.reload())}
      >
        <span className="logo-word">Command</span>
        <span className="logo-pad">{"{Pad}"}</span>
      </span>

      <div className="header-spacer" />

      <div className="header-actions">
        <button
          className={classNames(
            CssClass.BTN,
            CssClass.BTN_LG,
            CssClass.BTN_FLAT_ICON,
          )}
          onClick={toggleAppMode}
          aria-label={toggleModeLabel}
          {...tooltip(toggleModeLabel)}
        >
          {isRead ? (
            <PencilIcon
              className={classNames(CssClass.ICON, CssClass.ICON_BOLD)}
            />
          ) : (
            <PadlockIcon
              className={classNames(CssClass.ICON, CssClass.ICON_BOLD)}
            />
          )}
        </button>

        <div className="vertical-divider" />

        <button
          className={classNames(CssClass.BTN, CssClass.BTN_LG)}
          disabled={!canCollapse}
          onClick={toggleCollapseAll}
          {...tooltip(
            inVariables
              ? t.header.toggleSectionsTitle
              : t.header.toggleEditorsTitle,
          )}
        >
          <ChevronsRightIcon
            className={classNames(CssClass.ICON, CssClass.ICON_BOLD)}
          />
          {t.header.collapseAll}
        </button>
      </div>

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
          <BookIcon className={classNames(CssClass.ICON, CssClass.ICON_BOLD)} />
        </Link>

        <div className="vertical-divider" />

        <button
          className={classNames(
            CssClass.BTN,
            CssClass.BTN_LG,
            CssClass.BTN_DANGER,
          )}
          onClick={async () => {
            if (await clearAllData()) {
              navigate(AppRoute.HOME);
            }
          }}
          aria-label={t.header.resetWorkspaceTitle}
          {...tooltip(t.header.resetWorkspaceTitle)}
        >
          <ArrowCounterclockwise
            id="reset-workspace-icon"
            className={classNames(CssClass.ICON, CssClass.ICON_SEMIBOLD)}
          />
        </button>

        <div className="vertical-divider" />

        <button
          className={classNames(
            CssClass.BTN,
            CssClass.BTN_LG,
            CssClass.BTN_PRIMARY,
          )}
          disabled={isEmpty}
          onClick={openExportModal}
          {...tooltip(t.header.exportTitle)}
        >
          <ExportIcon
            className={classNames(CssClass.ICON, CssClass.ICON_BOLD)}
          />
          {t.header.export}
        </button>
      </div>
    </header>
  );
}
