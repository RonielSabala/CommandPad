import { Key } from "@/common/constants/events";
import { AppMode, Theme } from "@/common/enums";
import { getActiveTab, useStore } from "@/store/store";
import { CssClass } from "../../common/constants/css";
import "./Header.css";

function ThemeIcon({ light }: { light: boolean }) {
  if (light) {
    return (
      <svg viewBox="0 0 16 16">
        <path
          d="M13.5 9.2A5.5 5.5 0 0 1 6.8 2.5a5.5 5.5 0 1 0 6.7 6.7z"
          fill="currentColor"
          stroke="none"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="8" r="3.25" />
      <line x1="8" y1="1" x2="8" y2="2.5" />
      <line x1="8" y1="13.5" x2="8" y2="15" />
      <line x1="1" y1="8" x2="2.5" y2="8" />
      <line x1="13.5" y1="8" x2="15" y2="8" />
      <line x1="3.05" y1="3.05" x2="4.1" y2="4.1" />
      <line x1="11.9" y1="11.9" x2="12.95" y2="12.95" />
      <line x1="12.95" y1="3.05" x2="11.9" y2="4.1" />
      <line x1="4.1" y1="11.9" x2="3.05" y2="12.95" />
    </svg>
  );
}

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
  const emptyClass = isEmpty ? CssClass.BTN_DISABLED : "";

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
          <svg viewBox="0 0 16 16">
            {isRead ? (
              <path d="M13 1l2 2L5 13l-3 1 1-3L13 1z" />
            ) : (
              <path d="M5 7V5a3 3 0 0 1 6 0v2M3 7h10v7H3zM8 11v-1" />
            )}
          </svg>
        </button>
        <div className="vertical-divider" />
        <button
          id="collapse-all-btn"
          className={`btn btn-lg ${emptyClass}`}
          disabled={isEmpty}
          onClick={toggleAllCommandEditors}
          title="Expand/collapse all command editors"
        >
          <svg viewBox="0 0 16 16">
            <path
              d="M2 4l6 4-6 4M8 4l6 4-6 4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
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
          <ThemeIcon light={isLight} />
        </button>

        <div className="vertical-divider" />

        <button
          id="keybindings-btn"
          className="btn btn-lg btn-flat-icon"
          onClick={openKeybindingsModal}
          title="App keybindings"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01" />
            <path d="M5 14h14" />
          </svg>
        </button>

        <div className="vertical-divider" />

        <button
          className="btn btn-lg btn-danger"
          onClick={clearAllData}
          title="Clear workspace"
        >
          <svg
            viewBox="0 0 16 16"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 4h10M6 4V2h4v2M5 4l.5 9h5l.5-9" />
          </svg>
        </button>

        <div className="vertical-divider" />

        <button
          className={`btn btn-lg btn-primary ${emptyClass}`}
          disabled={isEmpty}
          onClick={openExportModal}
          title="Export runbook"
        >
          <svg viewBox="0 0 16 16">
            <path d="M8 2v8M5 7l3 3 3-3M3 11v2h10v-2" />
          </svg>
          Export
        </button>
      </div>
    </header>
  );
}
