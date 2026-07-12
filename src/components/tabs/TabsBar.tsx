import { PlusIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { TabItem } from "./TabItem";
import "./TabsBar.css";

export function TabsBar() {
  const t = useTranslation();
  const tabs = useStore((state) => state.tabs);
  const createNewTab = useStore((state) => state.createNewTab);

  return (
    <div id="tabs-bar">
      {tabs.map((tab) => (
        <TabItem key={tab.id} tab={tab} />
      ))}
      <button
        id="add-tab-btn"
        title={t.tabs.newTab}
        onClick={() => void createNewTab()}
      >
        <PlusIcon className="icon-md icon-bold" />
      </button>
    </div>
  );
}
