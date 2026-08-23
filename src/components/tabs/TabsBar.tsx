import { RunbookView } from "@/common/enums";
import { PlusIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { BodyText, Braces, FileEarmarkCode } from "react-bootstrap-icons";

import { TabItem } from "./TabItem";
import "./TabsBar.css";

export function TabsBar() {
  const t = useTranslation();
  const tabs = useStore((state) => state.tabs);
  const createNewTab = useStore((state) => state.createNewTab);
  const runbookView = useStore((state) => state.runbookView);
  const toggleRunbookView = useStore((state) => state.toggleRunbookView);

  const showingSource = runbookView === RunbookView.SOURCE;
  const showingVariables = runbookView === RunbookView.VARIABLES;

  return (
    <div id="tabs-bar">
      <div id="tabs-strip">
        {tabs.map((tab) => (
          <TabItem key={tab.id} tab={tab} />
        ))}
      </div>
      <button
        id="add-tab-btn"
        title={t.tabs.newTab}
        onClick={() => void createNewTab()}
      >
        <PlusIcon className="icon-md icon-bold" />
      </button>

      {tabs.length > 0 && (
        <div id="runbook-view-actions">
          <button
            className="btn btn-icon btn-soft-icon runbook-view-btn"
            title={
              showingVariables
                ? t.source.openPreview
                : t.variables.openEditorTitle
            }
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
            title={showingSource ? t.source.openPreview : t.source.openSource}
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
    </div>
  );
}
