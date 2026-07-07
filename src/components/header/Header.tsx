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
import { getActiveTab, useStore } from "@/store/store";
import "./Header.css";

export function Header() {
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
        title="Reload CommandPad"
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
          title={`Switch to ${isRead ? "Edit" : "Read"} mode`}
        >
          {isRead ? <PencilIcon /> : <PadlockIcon />}
        </button>
        <div className="vertical-divider" />
        <button
          className="btn btn-lg"
          disabled={isEmpty || isRead}
          onClick={toggleAllCommandEditors}
          title="Expand/collapse all command editors"
        >
          <ChevronsRightIcon />
          Collapse All
        </button>
      </div>

      <div className="header-spacer" />

      <div className="header-actions">
        <button
          className="btn btn-lg btn-flat-icon"
          onClick={toggleTheme}
          title={`Switch to ${isLight ? Theme.DARK : Theme.LIGHT} mode`}
        >
          {isLight ? <MoonIcon /> : <SunIcon />}
        </button>

        <div className="vertical-divider" />

        <button
          id="keybindings-btn"
          className="btn btn-lg btn-flat-icon"
          onClick={openKeybindingsModal}
          title="App keybindings"
        >
          <KeyboardIcon />
        </button>

        <div className="vertical-divider" />

        <button
          className="btn btn-lg btn-danger"
          onClick={clearAllData}
          title="Clear workspace"
        >
          <TrashIcon />
        </button>

        <div className="vertical-divider" />

        <button
          className="btn btn-lg btn-primary"
          disabled={isEmpty}
          onClick={openExportModal}
          title="Export runbook"
        >
          <ExportIcon />
          Export
        </button>
      </div>
    </header>
  );
}
