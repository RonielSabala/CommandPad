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
import { useTranslation } from "@/i18n";
import { getActiveTab, useStore } from "@/store/store";
import "./Header.css";
import { LanguageSelect } from "./LanguageSelect";

export function Header() {
  const t = useTranslation();
  const isRead = useStore((state) => state.mode === AppMode.READ);
  const isLight = useStore((state) => state.theme === Theme.LIGHT);
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
