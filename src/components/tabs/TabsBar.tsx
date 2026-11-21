import { CssClass, STANDARD_ICON_CLASS } from "@/common/constants/css";
import { DataAttr, ElementId } from "@/common/constants/dom";
import { RunbookView } from "@/common/enums";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { PlusIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { getRunbookView, useStore } from "@/store/store";
import { classNames } from "@/utils/string";
import { useCallback, useState } from "react";
import { BodyText, Braces, FileEarmarkCode } from "react-bootstrap-icons";

import { TabItem } from "./TabItem";
import "./TabsBar.css";

export function TabsBar() {
  const t = useTranslation();
  const tabs = useStore((state) => state.tabs);
  const createNewTab = useStore((state) => state.createNewTab);
  const runbookView = useStore(getRunbookView);
  const toggleRunbookView = useStore((state) => state.toggleRunbookView);

  const [renamingTabId, setRenamingTabId] = useState<string | null>(null);
  const endRename = useCallback(() => setRenamingTabId(null), []);

  const showingSource = runbookView === RunbookView.SOURCE;
  const showingVariables = runbookView === RunbookView.VARIABLES;

  const toggleVariablesLabel = showingVariables
    ? t.source.openPreview
    : t.variables.openEditorTitle;
  const toggleSourceLabel = showingSource
    ? t.source.openPreview
    : t.source.openSource;

  return (
    <div id={ElementId.TABS_BAR} {...{ [DataAttr.RUNBOOK_VIEW]: runbookView }}>
      <div id="tabs-strip">
        {tabs.map((tab) => (
          <TabItem
            key={tab.id}
            tab={tab}
            renaming={tab.id === renamingTabId}
            onRename={setRenamingTabId}
            onRenameEnd={endRename}
          />
        ))}
      </div>
      <button
        id="add-tab-btn"
        aria-label={t.tabs.newTab}
        {...tooltip(t.tabs.newTab)}
        onClick={() => void createNewTab()}
      >
        <PlusIcon className={STANDARD_ICON_CLASS} />
      </button>

      {tabs.length > 0 && (
        <div id="runbook-view-actions">
          <button
            className={classNames(
              "runbook-view-btn",
              CssClass.BTN,
              CssClass.BTN_ICON,
              CssClass.BTN_SOFT_ICON,
            )}
            aria-label={toggleVariablesLabel}
            {...tooltip(toggleVariablesLabel)}
            onClick={() => toggleRunbookView(RunbookView.VARIABLES)}
          >
            {showingVariables ? (
              <BodyText className={CssClass.ICON_MD} />
            ) : (
              <Braces className={CssClass.ICON_MD} />
            )}
          </button>

          <button
            className={classNames(
              "runbook-view-btn",
              CssClass.BTN,
              CssClass.BTN_ICON,
              CssClass.BTN_SOFT_ICON,
            )}
            aria-label={toggleSourceLabel}
            {...tooltip(toggleSourceLabel)}
            onClick={() => toggleRunbookView(RunbookView.SOURCE)}
          >
            {showingSource ? (
              <BodyText className={CssClass.ICON_MD} />
            ) : (
              <FileEarmarkCode className={CssClass.ICON_MD} />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
