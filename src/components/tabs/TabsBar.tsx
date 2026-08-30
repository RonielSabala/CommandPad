import { RunbookView } from "@/common/enums";
import type { ContextMenuAnchor } from "@/components/common/contextMenu/ContextMenu";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { PlusIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { useCallback, useState, type MouseEvent } from "react";
import { BodyText, Braces, FileEarmarkCode } from "react-bootstrap-icons";

import { TabContextMenu } from "./TabContextMenu";
import { TabItem } from "./TabItem";
import "./TabsBar.css";

export function TabsBar() {
  const t = useTranslation();
  const tabs = useStore((state) => state.tabs);
  const createNewTab = useStore((state) => state.createNewTab);
  const runbookView = useStore((state) => state.runbookView);
  const toggleRunbookView = useStore((state) => state.toggleRunbookView);

  const [menu, setMenu] = useState<{
    tabId: string;
    anchor: ContextMenuAnchor;
  } | null>(null);

  const closeMenu = useCallback(() => setMenu(null), []);
  const onOpenMenu = useCallback((event: MouseEvent, tabId: string) => {
    event.preventDefault();
    setMenu({ tabId, anchor: { x: event.clientX, y: event.clientY } });
  }, []);

  const showingSource = runbookView === RunbookView.SOURCE;
  const showingVariables = runbookView === RunbookView.VARIABLES;

  return (
    <div id="tabs-bar">
      <div id="tabs-strip">
        {tabs.map((tab) => (
          <TabItem key={tab.id} tab={tab} onOpenMenu={onOpenMenu} />
        ))}
      </div>
      <button
        id="add-tab-btn"
        aria-label={t.tabs.newTab}
        {...tooltip(t.tabs.newTab)}
        onClick={() => void createNewTab()}
      >
        <PlusIcon className="icon-md icon-bold" />
      </button>

      {tabs.length > 0 && (
        <div id="runbook-view-actions">
          <button
            className="btn btn-icon btn-soft-icon runbook-view-btn"
            aria-label={
              showingVariables
                ? t.source.openPreview
                : t.variables.openEditorTitle
            }
            {...tooltip(
              showingVariables
                ? t.source.openPreview
                : t.variables.openEditorTitle,
            )}
            onClick={() => toggleRunbookView(RunbookView.VARIABLES)}
          >
            {showingVariables ? (
              <BodyText className="icon-md" />
            ) : (
              <Braces className="icon-md" />
            )}
          </button>

          <button
            className="btn btn-icon btn-soft-icon runbook-view-btn"
            aria-label={
              showingSource ? t.source.openPreview : t.source.openSource
            }
            {...tooltip(
              showingSource ? t.source.openPreview : t.source.openSource,
            )}
            onClick={() => toggleRunbookView(RunbookView.SOURCE)}
          >
            {showingSource ? (
              <BodyText className="icon-md" />
            ) : (
              <FileEarmarkCode className="icon-md" />
            )}
          </button>
        </div>
      )}

      {menu && (
        <TabContextMenu
          tabId={menu.tabId}
          anchor={menu.anchor}
          onClose={closeMenu}
        />
      )}
    </div>
  );
}
