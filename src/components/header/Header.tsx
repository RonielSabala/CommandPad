import { Key } from "@/common/constants/events";
import { AppMode, Theme } from "@/common/enums";
import {
  ChevronsRightIcon,
  ExportIcon,
  KeyboardIcon,
  MoonIcon,
  PadlockIcon,
  PencilIcon,
  SunIcon,
  TrashIcon,
} from "@/components/icons";
import { LANGUAGE_LABELS, LANGUAGE_ORDER, useTranslation } from "@/i18n";
import { getActiveTab, useStore } from "@/store/store";
import { Translate } from "react-bootstrap-icons";
import "./Header.css";

export function Header() {
  const t = useTranslation();
  const isRead = useStore((state) => state.mode === AppMode.READ);
  const isLight = useStore((state) => state.theme === Theme.LIGHT);
  const language = useStore((state) => state.language);
  const setLanguage = useStore((state) => state.setLanguage);
  const toggleTheme = useStore((state) => state.toggleTheme);
  const toggleAppMode = useStore((state) => state.toggleAppMode);
  const openKeybindingsModal = useStore((state) => state.openKeybindingsModal);
  const clearAllData = useStore((state) => state.clearAllData);
  const openExportModal = useStore((state) => state.openExportModal);
  const toggleAllCommandEditors = useStore(
    (state) => state.toggleAllCommandEditors,
  );
  const isEmpty = useStore(
    (state) => !(getActiveTab(state)?.blocks.length ?? 0),
  );

  const cycleLanguage = () => {
    const index = LANGUAGE_ORDER.indexOf(language);
    setLanguage(LANGUAGE_ORDER[(index + 1) % LANGUAGE_ORDER.length]);
  };

  return (
    <header id="app-header">
      <span
        id="app-name"
        className="no-user-select"
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
        CommandPad
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

        <button
          className="btn"
          onClick={cycleLanguage}
          title={t.header.changeLanguage}
        >
          {LANGUAGE_LABELS[language]}
          <Translate className="icon" />
        </button>

        <div className="vertical-divider" />

        <button
          id="keybindings-btn"
          className="btn btn-lg btn-flat-icon"
          onClick={openKeybindingsModal}
          title={t.header.keybindingsTitle}
        >
          <KeyboardIcon id="keybindings-icon" className="icon icon-bold" />
        </button>

        <div className="vertical-divider" />

        <button
          className="btn btn-lg btn-danger"
          onClick={clearAllData}
          title={t.header.clearWorkspaceTitle}
        >
          <TrashIcon className="icon icon-bold" />
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
