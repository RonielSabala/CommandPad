import { RunbookView } from "@/common/enums";
import { getActiveTab, useStore } from "@/store/store";
import { TabsBar } from "../tabs/TabsBar";
import "./MainPanel.css";
import { RunbookPreview } from "./RunbookPreview";
import { RunbookSource } from "./RunbookSource";

export function MainPanel() {
  const showSource = useStore(
    (state) =>
      state.runbookView === RunbookView.SOURCE && getActiveTab(state) !== null,
  );

  return (
    <main id="main-panel">
      <TabsBar />
      {showSource ? <RunbookSource /> : <RunbookPreview />}
    </main>
  );
}
