import { Key } from "@/common/constants/events";
import { AppRoute } from "@/common/constants/routes";
import { AppMode, Theme } from "@/common/enums";
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
import { getActiveTab, useStore } from "@/store/store";
import { ArrowCounterclockwise } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import "./Header.css";
import { LanguageSelect } from "./LanguageSelect";

export function Header() {
  const t = useTranslation();
  const isRead = useStore((state) => state.mode === AppMode.READ);
  const isLight = useStore((state) => state.theme === Theme.LIGHT);
  const toggleTheme = useStore((state) => state.toggleTheme);
  const toggleAppMode = useStore((state) => state.toggleAppMode);
  const clearAllData = useStore((state) => state.clearAllData);
  const openExportModal = useStore((state) => state.openExportModal);
  const toggleAllCommandEditors = useStore(
    (state) => state.toggleAllCommandEditors,
  );
  const isEmpty = useStore(
    (state) => !(getActiveTab(state)?.blocks.length ?? 0),
  );

  return (
    <header id="app-header">
      <span
        className="logo no-user-select"
        role="button"
        tabIndex={0}
        title={t.header.reloadTitle}
        onClick={() => location.reload()}
        onKeyDown={(event) => {
          if (event.key === Key.ENTER) {
            location.reload();
          }
        }}
      >
        <span className="logo-word">Command</span>
        <span className="logo-pad">{"{Pad}"}</span>
      </span>

      <div className="header-spacer" />

      <div className="header-actions">
        <button
          className="btn btn-lg btn-flat-icon"
          onClick={toggleAppMode}
          title={isRead ? t.header.switchToEdit : t.header.switchToRead}
        >
          {isRead ? (
            <PencilIcon className="icon icon-bold" />
          ) : (
            <PadlockIcon className="icon icon-bold" />
          )}
        </button>
        <div className="vertical-divider" />
        <button
          className="btn btn-lg"
          disabled={isEmpty || isRead}
          onClick={toggleAllCommandEditors}
          title={t.header.toggleEditorsTitle}
        >
          <ChevronsRightIcon className="icon icon-bold" />
          {t.header.collapseAll}
        </button>
      </div>

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

        <Link
          to={AppRoute.DOCS}
          className="btn btn-lg btn-flat-icon"
          title={t.docs.meta.openDocs}
        >
          <BookIcon className="icon icon-bold" />
        </Link>

        <div className="vertical-divider" />

        <button
          className="btn btn-lg btn-danger"
          onClick={clearAllData}
          title={t.header.resetWorkspaceTitle}
        >
          <ArrowCounterclockwise
            id="reset-workspace-icon"
            className="icon icon-semibold"
          />
        </button>

        <div className="vertical-divider" />

        <button
          className="btn btn-lg btn-primary"
          disabled={isEmpty}
          onClick={openExportModal}
          title={t.header.exportTitle}
        >
          <ExportIcon className="icon icon-bold" />
          {t.header.export}
        </button>
      </div>
    </header>
  );
}
