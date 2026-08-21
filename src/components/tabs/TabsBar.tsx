import { RunbookView } from "@/common/enums";
import { PlusIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { BodyText, FileEarmarkCode } from "react-bootstrap-icons";
import { TabItem } from "./TabItem";
import "./TabsBar.css";

export function TabsBar() {
  const t = useTranslation();
  const tabs = useStore((state) => state.tabs);
  const createNewTab = useStore((state) => state.createNewTab);
  const showingSource = useStore(
    (state) => state.runbookView === RunbookView.SOURCE,
  );
  const toggleRunbookView = useStore((state) => state.toggleRunbookView);

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
        <button
          id="runbook-view-btn"
          className="btn btn-icon btn-soft-icon"
          title={showingSource ? t.source.openPreview : t.source.openSource}
          onClick={toggleRunbookView}
        >
          {showingSource ? (
            <BodyText className="icon-md" />
          ) : (
            <FileEarmarkCode className="icon-md" />
          )}
        </button>
      )}
    </div>
  );
}
