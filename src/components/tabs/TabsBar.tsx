import { useStore } from "@/store/store";
import { TabItem } from "./TabItem";
import "./TabsBar.css";

export function TabsBar() {
  const tabs = useStore((state) => state.tabs);
  const createNewTab = useStore((state) => state.createNewTab);

  return (
    <div id="tabs-bar">
      {tabs.map((tab) => (
        <TabItem key={tab.id} tab={tab} />
      ))}
      <button
        id="add-tab-btn"
        title="New tab"
        onClick={() => void createNewTab()}
      >
        <svg viewBox="0 0 16 16">
          <path d="M8 3v10M3 8h10" />
        </svg>
      </button>
    </div>
  );
}
